import json, os
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
import models
from datetime import datetime

router = APIRouter()

system_prompt = """You are a talent matching assistant for an internal career marketplace.
Given an employee profile and an internal opportunity, assess fit and return ONLY valid JSON:
{"score": <0-100>, "reasoning": "<2-3 sentence plain English explanation>", "gaps": ["<skill>", ...]}
Do not include code fences or any text outside the JSON."""

def call_claude(profile, opp, use_skills_to_develop=False):
    try:
        import anthropic
        client = anthropic.Anthropic()
        skills_label = "Skills to Develop" if use_skills_to_develop else "Current Skills"
        skills_value = profile.get_skills_to_develop() if use_skills_to_develop else profile.get_current_skills()
        user_msg = (
            f"Employee Profile:\nAspiration: {profile.aspiration_text}\n"
            f"{skills_label}: {', '.join(skills_value)}\n\n"
            f"Opportunity:\nTitle: {opp.title}\nType: {opp.type}\nDepartment: {opp.department}\n"
            f"Skills Needed: {', '.join(opp.get_skills_needed())}\nDescription: {opp.description}\n\n"
            f"Assess the fit. Return JSON only."
        )
        import anthropic as anth
        msg = anth.Anthropic().messages.create(
            model="claude-sonnet-4-6", max_tokens=512, system=system_prompt,
            messages=[{"role": "user", "content": user_msg}]
        )
        raw = msg.content[0].text.strip().replace("```json","").replace("```","").strip()
        return json.loads(raw)
    except Exception:
        return {"score": 50, "reasoning": "Match could not be computed.", "gaps": []}

@router.post("/matches/run")
def run_matching(request: Request, db: Session = Depends(get_db)):
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    profile = db.query(models.Profile).filter(models.Profile.user_id == int(user_id)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    opps = db.query(models.Opportunity).filter(models.Opportunity.status == "live").all()
    created = 0
    for opp in opps:
        existing = db.query(models.Match).filter(
            models.Match.profile_id == profile.id, models.Match.opp_id == opp.id
        ).first()
        if existing:
            continue
        # Choose matching basis: immersion → skills_to_develop, gig/vacancy → current_skills
        use_develop = opp.type == "immersion"
        emp_skills = set(s.lower() for s in (
            profile.get_skills_to_develop() if use_develop else profile.get_current_skills()
        ))
        opp_skills = set(s.lower() for s in opp.get_skills_needed())
        if emp_skills and opp_skills and not emp_skills.intersection(opp_skills):
            continue
        result = call_claude(profile, opp, use_skills_to_develop=use_develop)
        if result.get("score", 0) < 70:
            continue
        match = models.Match(
            profile_id=profile.id, opp_id=opp.id,
            match_score=result.get("score", 50),
            reasoning_text=result.get("reasoning", ""),
            gaps=json.dumps(result.get("gaps", [])), status="pending"
        )
        db.add(match)
        created += 1
    db.commit()
    return {"matches_created": created}

@router.get("/matches")
def get_matches(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not profile:
        return []
    matches = db.query(models.Match).filter(
        models.Match.profile_id == profile.id,
        models.Match.match_score >= 70
    ).order_by(models.Match.match_score.desc()).all()
    result = []
    for m in matches:
        opp = m.opportunity
        if not opp:
            continue
        result.append({
            "id": m.id, "profile_id": m.profile_id, "opp_id": m.opp_id,
            "match_score": m.match_score, "reasoning_text": m.reasoning_text,
            "gaps": m.get_gaps(), "status": m.status, "essay_response": m.essay_response,
            "created_at": m.created_at.isoformat(),
            "opportunity": {
                "id": opp.id, "title": opp.title, "type": opp.type,
                "department": opp.department, "description": opp.description,
                "skills_needed": opp.get_skills_needed(),
                "duration_from": opp.duration_from.isoformat() if opp.duration_from else None,
                "duration_to": opp.duration_to.isoformat() if opp.duration_to else None,
                "bandwidth": opp.bandwidth, "slots": opp.slots, "status": opp.status,
                "posted_by": opp.posted_by, "created_at": opp.created_at.isoformat(),
            }
        })
    return result

@router.put("/matches/{match_id}/interest")
def express_interest(match_id: int, body: dict, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Not found")
    essay = body.get("essay", "").strip()
    if not essay:
        raise HTTPException(status_code=400, detail="Essay response is required")
    match.essay_response = essay
    opp = match.opportunity
    match.status = "pending_approval" if opp and opp.type == "immersion" else "interested"
    db.commit()
    # notify opportunity poster (manager)
    if opp and opp.posted_by:
        applicant = match.profile.user if match.profile else None
        n = models.Notification(
            user_id=opp.posted_by,
            title="New application received",
            message=f'{applicant.name if applicant else "An employee"} applied for "{opp.title}". Review their application.',
            type="action"
        )
        db.add(n)
        db.commit()
    return {"status": match.status}

@router.put("/matches/{match_id}/decide")
def decide_match(match_id: int, body: dict, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Not found")
    decision = body.get("decision")  # "accepted" or "declined"
    if decision not in ("accepted", "declined"):
        raise HTTPException(status_code=400, detail="Invalid decision")
    match.status = decision
    if decision == "accepted":
        match.accepted_at = datetime.utcnow()
        opp = match.opportunity
        if opp and opp.slots_remaining > 0:
            opp.slots_remaining -= 1
            if opp.slots_remaining == 0:
                opp.status = "filled"
    db.commit()
    # notify applicant
    applicant = match.profile.user if match.profile else None
    opp = match.opportunity
    if applicant:
        if decision == "accepted":
            msg = f'Congratulations! Your application for "{opp.title if opp else "an opportunity"}" has been accepted.'
            ntype = "success"
        else:
            msg = f'Your application for "{opp.title if opp else "an opportunity"}" was not selected this time. Keep exploring!'
            ntype = "info"
        n = models.Notification(user_id=applicant.id, title=f"Application {decision}", message=msg, type=ntype)
        db.add(n)
        db.commit()
    return {"status": decision}
