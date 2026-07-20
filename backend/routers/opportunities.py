import json
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from typing import Optional
from datetime import date

router = APIRouter()

def _opp_out(o):
    return {
        "id": o.id, "posted_by": o.posted_by, "type": o.type,
        "title": o.title, "department": o.department, "description": o.description,
        "skills_needed": o.get_skills_needed(),
        "duration_from": o.duration_from.isoformat() if o.duration_from else None,
        "duration_to": o.duration_to.isoformat() if o.duration_to else None,
        "bandwidth": o.bandwidth, "slots": o.slots, "slots_remaining": o.slots_remaining,
        "status": o.status, "created_at": o.created_at.isoformat(),
        "poster_name": o.poster.name if o.poster else "",
    }

@router.get("/opportunities")
def list_opportunities(
    type: Optional[str] = None,
    department: Optional[str] = None,
    skills: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Opportunity)
    if type and type != "all":
        query = query.filter(models.Opportunity.type == type)
    if department and department != "all":
        query = query.filter(models.Opportunity.department == department)
    if status:
        statuses = status.split(",")
        query = query.filter(models.Opportunity.status.in_(statuses))
    else:
        query = query.filter(models.Opportunity.status == "live")
    opps = query.all()
    if skills:
        kw = skills.lower()
        opps = [o for o in opps if kw in o.title.lower() or any(kw in s.lower() for s in o.get_skills_needed())]
    return [_opp_out(o) for o in opps]

@router.post("/opportunities")
def create_opportunity(data: schemas.OpportunityCreate, request: Request, db: Session = Depends(get_db)):
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    dur_from = date.fromisoformat(data.duration_from) if data.duration_from else None
    dur_to = date.fromisoformat(data.duration_to) if data.duration_to else None
    opp = models.Opportunity(
        posted_by=int(user_id),
        type=data.type, title=data.title, department=data.department,
        description=data.description, skills_needed=json.dumps(data.skills_needed),
        duration_from=dur_from, duration_to=dur_to,
        bandwidth=data.bandwidth, slots=data.slots or 1,
        slots_remaining=data.slots or 1, status="pending_review"
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)
    # notify HR admins
    admins = db.query(models.User).filter(models.User.role == "hr_admin").all()
    for admin in admins:
        n = models.Notification(
            user_id=admin.id, title="New opportunity pending approval",
            message=f'"{opp.title}" submitted by {opp.poster.name} is awaiting your review.',
            type="action"
        )
        db.add(n)
    db.commit()
    return _opp_out(opp)

@router.get("/opportunities/{opp_id}")
def get_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Not found")
    return _opp_out(opp)

@router.put("/opportunities/{opp_id}/approve")
def approve_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Not found")
    opp.status = "live"
    db.commit()
    # notify poster
    n = models.Notification(
        user_id=opp.posted_by, title="Your opportunity is now live!",
        message=f'"{opp.title}" has been approved by HR and is now visible to employees.',
        type="success"
    )
    db.add(n)
    db.commit()
    return {"status": "live"}

@router.put("/opportunities/{opp_id}/reject")
def reject_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Not found")
    opp.status = "closed"
    db.commit()
    n = models.Notification(
        user_id=opp.posted_by, title="Opportunity not approved",
        message=f'"{opp.title}" was not approved. Please reach out to HR for details.',
        type="warning"
    )
    db.add(n)
    db.commit()
    return {"status": "closed"}

@router.get("/opportunities/{opp_id}/applicants")
def get_applicants(opp_id: int, db: Session = Depends(get_db)):
    matches = db.query(models.Match).filter(
        models.Match.opp_id == opp_id,
        models.Match.status.in_(["interested", "pending_approval", "accepted", "declined"])
    ).all()
    result = []
    for m in matches:
        profile = m.profile
        user = profile.user if profile else None
        result.append({
            "match_id": m.id, "status": m.status, "match_score": m.match_score,
            "essay_response": m.essay_response,
            "applicant_name": user.name if user else "",
            "applicant_department": user.department if user else "",
            "current_skills": profile.get_current_skills() if profile else [],
            "skills_to_develop": profile.get_skills_to_develop() if profile else [],
            "aspiration": profile.aspiration_text if profile else "",
            "user_id": user.id if user else None,
        })
    return result
