from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/notifications")
def get_notifications(request: Request, db: Session = Depends(get_db)):
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    notifs = db.query(models.Notification).filter(
        models.Notification.user_id == int(user_id)
    ).order_by(models.Notification.created_at.desc()).limit(50).all()
    return [{"id": n.id, "title": n.title, "message": n.message,
             "type": n.type, "is_read": n.is_read,
             "created_at": n.created_at.isoformat()} for n in notifs]

@router.put("/notifications/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db)):
    n = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"ok": True}

@router.put("/notifications/read-all")
def mark_all_read(request: Request, db: Session = Depends(get_db)):
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    db.query(models.Notification).filter(
        models.Notification.user_id == int(user_id),
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"ok": True}
