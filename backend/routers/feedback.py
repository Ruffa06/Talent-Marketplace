from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter()

@router.post("/feedback", response_model=schemas.FeedbackOut)
def submit_feedback(data: schemas.FeedbackCreate, request: Request, db: Session = Depends(get_db)):
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    fb = models.Feedback(
        match_id=data.match_id,
        submitted_by=int(user_id),
        role=user.role if user else "employee",
        rating=data.rating,
        comments=data.comments,
        tag=data.tag
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb

@router.get("/feedback")
def list_feedback(db: Session = Depends(get_db)):
    feedbacks = db.query(models.Feedback).order_by(models.Feedback.submitted_at.desc()).all()
    result = []
    for fb in feedbacks:
        match = fb.match
        opp_title = ""
        if match and match.opportunity:
            opp_title = match.opportunity.title
        submitter_name = fb.submitter.name if fb.submitter else ""
        result.append({
            "id": fb.id, "match_id": fb.match_id, "submitted_by": fb.submitted_by,
            "submitter_name": submitter_name, "opportunity_title": opp_title,
            "role": fb.role, "rating": fb.rating, "comments": fb.comments,
            "tag": fb.tag, "submitted_at": fb.submitted_at.isoformat()
        })
    return result
