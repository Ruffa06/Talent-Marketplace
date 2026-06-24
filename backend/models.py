import json
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)  # employee/manager/hr_admin
    department = Column(String, nullable=False)
    date_joined = Column(DateTime, default=datetime.utcnow)
    profile = relationship("Profile", back_populates="user", uselist=False)

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    aspiration_text = Column(Text, default="")
    current_skills = Column(Text, default="[]")  # JSON
    skills_to_develop = Column(Text, default="[]")  # JSON
    career_direction = Column(String, default="")
    is_open_to_opportunities = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="profile")
    matches = relationship("Match", back_populates="profile")

    def get_current_skills(self):
        return json.loads(self.current_skills or "[]")

    def get_skills_to_develop(self):
        return json.loads(self.skills_to_develop or "[]")

class Opportunity(Base):
    __tablename__ = "opportunities"
    id = Column(Integer, primary_key=True, index=True)
    posted_by = Column(Integer, ForeignKey("users.id"))
    type = Column(String, nullable=False)  # vacancy/gig/immersion
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    description = Column(Text, default="")
    skills_needed = Column(Text, default="[]")  # JSON
    duration_days = Column(Integer, nullable=True)
    bandwidth = Column(String, nullable=True)
    slots = Column(Integer, default=1)
    status = Column(String, default="draft")  # draft/pending_review/live/filled/closed
    created_at = Column(DateTime, default=datetime.utcnow)
    poster = relationship("User", foreign_keys=[posted_by])
    matches = relationship("Match", back_populates="opportunity")

    def get_skills_needed(self):
        return json.loads(self.skills_needed or "[]")

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"))
    opp_id = Column(Integer, ForeignKey("opportunities.id"))
    match_score = Column(Float, default=0)
    reasoning_text = Column(Text, default="")
    gaps = Column(Text, default="[]")  # JSON
    status = Column(String, default="pending")  # pending/interested/invited/accepted/declined/pending_approval/completed
    created_at = Column(DateTime, default=datetime.utcnow)
    profile = relationship("Profile", back_populates="matches")
    opportunity = relationship("Opportunity", back_populates="matches")
    feedbacks = relationship("Feedback", back_populates="match")

    def get_gaps(self):
        return json.loads(self.gaps or "[]")

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    submitted_by = Column(Integer, ForeignKey("users.id"))
    role = Column(String)  # employee/manager
    rating = Column(Integer)
    comments = Column(Text, default="")
    tag = Column(String, default="")
    submitted_at = Column(DateTime, default=datetime.utcnow)
    match = relationship("Match", back_populates="feedbacks")
    submitter = relationship("User", foreign_keys=[submitted_by])

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_type = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
