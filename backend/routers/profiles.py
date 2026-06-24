import json
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from datetime import datetime

router = APIRouter()

def get_current_user(request: Request, db: Session):
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return None
    return db.query(models.User).filter(models.User.id == int(user_id)).first()

@router.get("/profiles/{user_id}", response_model=schemas.ProfileOut)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.current_skills = profile.get_current_skills()
    profile.skills_to_develop = profile.get_skills_to_develop()
    return profile

@router.put("/profiles/{user_id}", response_model=schemas.ProfileOut)
def update_profile(user_id: int, data: schemas.ProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not profile:
        profile = models.Profile(user_id=user_id)
        db.add(profile)
    profile.aspiration_text = data.aspiration_text
    profile.current_skills = json.dumps(data.current_skills)
    profile.skills_to_develop = json.dumps(data.skills_to_develop)
    profile.career_direction = data.career_direction
    profile.is_open_to_opportunities = data.is_open_to_opportunities
    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    profile.current_skills = profile.get_current_skills()
    profile.skills_to_develop = profile.get_skills_to_develop()
    return profile
