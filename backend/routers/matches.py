import json
import os
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

system_prompt = """You are a talent matching assistant for an internal career marketplace.
Given an employee profile and an internal opportunity, assess fit and return ONLY valid JSON:
{"score": <0-100>, "reasoning": "<2-3 sentence plain English explanation>", "gaps": ["<skill>", ...]}
Do not include code fences or any text outside the JSON."""

def call_claude(profile, opp):
    try:
        import anthropic
        client = anthropic.Anthropic()
        user_msg = f"""Employee Profile:
Aspiration: {profile.aspiration_text}
Current Skills: {', '.join(profile.get_current_skills())}
Skills to Develop: {', '.join(profile.get_skills_to_develop())}
Career Direction: {profile.career_direction}

Opportunity:
Title: {opp.title}
Type: {opp.type}
Department: {opp.department}
Skills Needed: {', '.join(opp.get_skills_needed())}
Description: {opp.description}

Assess the fit. Return JSON only."""
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": user_msg}],
            system=system_prompt
        )
        raw = message.content[0].text.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
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
    created = []
    for opp in opps:
        existing = db.query(models.Match).filter(
            models.Match.profile_id == profile.id,
            models.Match.opp_id == opp.id
        ).first()
        if existing:
            continue
        emp_skills = set(s.lower() for s in profile.get_current_skills() + profile.get_skills_to_develop())
        opp_skills = set(s.lower() for s in opp.get_skills_needed())
        if not emp_skills.intersection(opp_skills) and emp_skills and opp_skills:
            continue
        result = call_claude(profile, opp)
        match = models.Match(
            profile_id=profile.id,
            opp_id=opp.id,
            match_score=result.get("score", 50),
            reasoning_text=result.get("reasoning", ""),
            gaps=json.dumps(result.get("gaps", [])),
            status="pending"
        )
        db.add(match)
        created.append(match)
    db.commit()
    return {"matches_created": len(created)}

@router.get("/matches")
def get_matches(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not profile:
        return []
    matches = db.query(models.Match).filter(models.Match.profile_id == profile.id).order_by(models.Match.match_score.desc()).all()
    result = []
    for m in matches:
        opp = m.opportunity
        opp_data = None
        if opp:
            opp_data = {
                "id": opp.id, "type": opp.type, "title": opp.title,
                "department": opp.department, "description": opp.description,
                "skills_needed": opp.get_skills_needed(), "duration_days": opp.duration_days,
                "bandwidth": opp.bandwidth, "slots": opp.slots, "status": opp.status,
                "posted_by": opp.posted_by, "created_at": opp.created_at.isoformat()
            }
        result.append({
            "id": m.id, "profile_id": m.profile_id, "opp_id": m.opp_id,
            "match_score": m.match_score, "reasoning_text": m.reasoning_text,
            "gaps": m.get_gaps(), "status": m.status,
            "created_at": m.created_at.isoformat(), "opportunity": opp_data
        })
    return result

@router.put("/matches/{match_id}/interest")
def express_interest(match_id: int, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Not found")
    opp = match.opportunity
    if opp and opp.type == "immersion":
        match.status = "pending_approval"
    else:
        match.status = "interested"
    db.commit()
    return {"status": match.status}

@router.put("/matches/{match_id}/approve")
def approve_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Not found")
    match.status = "accepted"
    db.commit()
    return {"status": match.status}
