import json
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from typing import Optional

router = APIRouter()

@router.get("/opportunities", response_model=list[schemas.OpportunityOut])
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
    result = []
    for o in opps:
        o.skills_needed = o.get_skills_needed()
        result.append(o)
    return result

@router.post("/opportunities", response_model=schemas.OpportunityOut)
def create_opportunity(data: schemas.OpportunityCreate, request: Request, db: Session = Depends(get_db)):
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    opp = models.Opportunity(
        posted_by=int(user_id),
        type=data.type,
        title=data.title,
        department=data.department,
        description=data.description,
        skills_needed=json.dumps(data.skills_needed),
        duration_days=data.duration_days,
        bandwidth=data.bandwidth,
        slots=data.slots or 1,
        status="pending_review"
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)
    opp.skills_needed = opp.get_skills_needed()
    return opp

@router.get("/opportunities/{opp_id}", response_model=schemas.OpportunityOut)
def get_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Not found")
    opp.skills_needed = opp.get_skills_needed()
    return opp

@router.put("/opportunities/{opp_id}/approve")
def approve_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Not found")
    opp.status = "live"
    db.commit()
    return {"status": "live"}
