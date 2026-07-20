from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: str
    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    aspiration_text: Optional[str] = ""
    current_skills: Optional[List[str]] = []
    skills_to_develop: Optional[List[str]] = []
    is_open_to_opportunities: Optional[bool] = True

class ProfileOut(BaseModel):
    id: int
    user_id: int
    aspiration_text: str
    current_skills: List[str]
    skills_to_develop: List[str]
    is_open_to_opportunities: bool
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True

class OpportunityCreate(BaseModel):
    type: str
    title: str
    department: str
    description: str
    skills_needed: List[str]
    duration_from: Optional[str] = None
    duration_to: Optional[str] = None
    bandwidth: Optional[str] = None
    slots: Optional[int] = 1

class FeedbackCreate(BaseModel):
    match_id: int
    rating: int
    comments: str
    tag: str

class FeedbackOut(BaseModel):
    id: int
    match_id: int
    submitted_by: int
    role: str
    rating: int
    comments: str
    tag: str
    submitted_at: datetime
    class Config:
        from_attributes = True
