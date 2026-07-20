import json
from database import engine, SessionLocal
import models
from datetime import datetime, timedelta, date

models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

users_data = [
    {"name": "Ana Reyes", "email": "ana.reyes@homecredit.ph", "role": "employee", "department": "Operations"},
    {"name": "Mark Torres", "email": "mark.torres@homecredit.ph", "role": "manager", "department": "Risk"},
    {"name": "Cris Valdez", "email": "cris.valdez@homecredit.ph", "role": "employee", "department": "Finance"},
    {"name": "Jamie Santos", "email": "jamie.santos@homecredit.ph", "role": "employee", "department": "Digital Products"},
    {"name": "Lea Cruz", "email": "lea.cruz@homecredit.ph", "role": "hr_admin", "department": "HR"},
    {"name": "Rico Mendoza", "email": "rico.mendoza@homecredit.ph", "role": "employee", "department": "Marketing"},
    {"name": "Sofia Lim", "email": "sofia.lim@homecredit.ph", "role": "manager", "department": "Digital Products"},
    {"name": "Ben Ramos", "email": "ben.ramos@homecredit.ph", "role": "employee", "department": "Risk"},
    {"name": "Mia Garcia", "email": "mia.garcia@homecredit.ph", "role": "employee", "department": "Operations"},
    {"name": "Dan Ocampo", "email": "dan.ocampo@homecredit.ph", "role": "manager", "department": "Finance"},
    {"name": "Pat Navarro", "email": "pat.navarro@homecredit.ph", "role": "employee", "department": "HR"},
    {"name": "Kim Dela Rosa", "email": "kim.delarosa@homecredit.ph", "role": "hr_admin", "department": "HR"},
]

users = []
for u in users_data:
    user = models.User(**u, date_joined=datetime.utcnow() - timedelta(days=200))
    db.add(user)
    users.append(user)
db.commit()
for u in users:
    db.refresh(u)

profiles_data = [
    {"user_idx": 0, "aspiration": "I want to move into data and digital roles, applying my operations knowledge to build better systems.", "current": ["process improvement", "operations", "documentation", "project management"], "develop": ["data visualization", "python", "power bi"]},
    {"user_idx": 1, "aspiration": "I want to build a high-performing risk team and mentor the next generation of analysts.", "current": ["credit risk", "statistical modeling", "stakeholder management", "excel"], "develop": ["people analytics", "strategic planning"]},
    {"user_idx": 2, "aspiration": "I want to become a finance business partner and develop cross-functional relationships.", "current": ["financial modeling", "budgeting", "excel", "business partnering"], "develop": ["data analysis", "stakeholder management"]},
    {"user_idx": 3, "aspiration": "I want to grow in product and UX, building digital experiences that matter.", "current": ["customer experience", "journey mapping", "ux research"], "develop": ["data visualization", "facilitation"]},
    {"user_idx": 4, "aspiration": "Build a best-in-class HR function powered by people analytics.", "current": ["people analytics", "hris", "stakeholder management"], "develop": ["data science", "excel"]},
    {"user_idx": 5, "aspiration": "Grow into a brand strategy role with more campaign ownership.", "current": ["campaign planning", "brand strategy", "consumer insights", "copywriting"], "develop": ["content creation", "storytelling"]},
    {"user_idx": 6, "aspiration": "Lead digital product development at scale.", "current": ["ux research", "journey mapping", "facilitation", "stakeholder management"], "develop": ["data science", "python"]},
    {"user_idx": 7, "aspiration": "Deepen my credit risk expertise and expand into Python-based modeling.", "current": ["credit risk", "excel", "statistical modeling"], "develop": ["python", "data visualization"]},
    {"user_idx": 8, "aspiration": "Explore people-facing and event coordination roles.", "current": ["operations", "documentation", "project management"], "develop": ["facilitation", "public speaking", "event planning"]},
    {"user_idx": 9, "aspiration": "Build strategic finance partnerships across the business.", "current": ["financial modeling", "budgeting", "business partnering", "excel"], "develop": ["stakeholder management", "people analytics"]},
    {"user_idx": 10, "aspiration": "Contribute to HR communications and internal engagement.", "current": ["internal comms", "copywriting", "content creation"], "develop": ["people analytics", "storytelling"]},
    {"user_idx": 11, "aspiration": "Drive data-informed HR strategies across the organization.", "current": ["people analytics", "hris", "data analysis", "excel"], "develop": ["statistical modeling", "stakeholder management"]},
]

profiles = []
for pd in profiles_data:
    p = models.Profile(
        user_id=users[pd["user_idx"]].id,
        aspiration_text=pd["aspiration"],
        current_skills=json.dumps(pd["current"]),
        skills_to_develop=json.dumps(pd["develop"]),
        is_open_to_opportunities=True,
        updated_at=datetime.utcnow()
    )
    db.add(p)
    profiles.append(p)
db.commit()
for p in profiles:
    db.refresh(p)

today = date.today()
opps_data = [
    {"posted_by_idx": 6, "type": "gig", "title": "ExCo Priority: Financial-Inclusion Dashboard", "department": "Digital Products", "description": "High-visibility ExCo priority project to build a financial-inclusion data visualization dashboard.", "skills": ["data visualization", "power bi", "python", "stakeholder reporting"], "dfrom": today + timedelta(days=7), "dto": today + timedelta(days=67), "bandwidth": "Part-time", "slots": 2, "status": "live"},
    {"posted_by_idx": 4, "type": "gig", "title": "Company Anniversary Event Host", "department": "HR", "description": "Host the company anniversary celebration for Home Credit Philippines.", "skills": ["facilitation", "event planning", "public speaking", "emcee"], "dfrom": today + timedelta(days=14), "dto": today + timedelta(days=19), "bandwidth": "Full-time", "slots": 1, "status": "live"},
    {"posted_by_idx": 5, "type": "immersion", "title": "Marketing Campaign Immersion", "department": "Marketing", "description": "Developmental exposure to end-to-end marketing campaign planning.", "skills": ["campaign planning", "brand strategy", "consumer insights", "copywriting"], "dfrom": today + timedelta(days=10), "dto": today + timedelta(days=40), "bandwidth": "Part-time", "slots": 2, "status": "live"},
    {"posted_by_idx": 4, "type": "vacancy", "title": "People Analytics Specialist", "department": "HR", "description": "Open internal role for a People Analytics Specialist.", "skills": ["people analytics", "hris", "data analysis", "excel", "stakeholder management"], "dfrom": today + timedelta(days=30), "dto": None, "bandwidth": "Full-time", "slots": 1, "status": "live"},
    {"posted_by_idx": 1, "type": "gig", "title": "Credit Risk Model Review", "department": "Risk", "description": "Review and validate the credit risk scoring model.", "skills": ["credit risk", "python", "statistical modeling", "excel"], "dfrom": today + timedelta(days=5), "dto": today + timedelta(days=50), "bandwidth": "Part-time", "slots": 1, "status": "live"},
    {"posted_by_idx": 6, "type": "gig", "title": "Customer Journey Mapping", "department": "Digital Products", "description": "Map the end-to-end customer journey for our digital lending product.", "skills": ["ux research", "customer experience", "journey mapping", "facilitation"], "dfrom": today + timedelta(days=3), "dto": today + timedelta(days=23), "bandwidth": "Part-time", "slots": 2, "status": "live"},
    {"posted_by_idx": 0, "type": "immersion", "title": "Operations Process Improvement", "department": "Operations", "description": "Join the Operations team for a structured immersion in lean process improvement.", "skills": ["lean process", "project management", "operations", "documentation"], "dfrom": today + timedelta(days=7), "dto": today + timedelta(days=28), "bandwidth": "Part-time", "slots": 3, "status": "live"},
    {"posted_by_idx": 9, "type": "immersion", "title": "Finance Business Partner Immersion", "department": "Finance", "description": "Shadow Finance Business Partners to understand how finance supports business units.", "skills": ["financial modeling", "business partnering", "budgeting", "excel"], "dfrom": today + timedelta(days=21), "dto": today + timedelta(days=35), "bandwidth": "Part-time", "slots": 2, "status": "live"},
    {"posted_by_idx": 4, "type": "gig", "title": "Internal Communications Gig", "department": "HR", "description": "Create internal communications content for company-wide initiatives.", "skills": ["copywriting", "internal comms", "content creation", "storytelling"], "dfrom": today + timedelta(days=2), "dto": today + timedelta(days=17), "bandwidth": "Part-time", "slots": 2, "status": "live"},
    {"posted_by_idx": 6, "type": "gig", "title": "Data Science Bootcamp Mentor", "department": "Digital Products", "description": "Mentor employees participating in the internal data science bootcamp.", "skills": ["data science", "python", "mentoring", "teaching"], "dfrom": today + timedelta(days=10), "dto": today + timedelta(days=20), "bandwidth": "Part-time", "slots": 3, "status": "pending_review"},
]

opps = []
for od in opps_data:
    o = models.Opportunity(
        posted_by=users[od["posted_by_idx"]].id, type=od["type"], title=od["title"],
        department=od["department"], description=od["description"],
        skills_needed=json.dumps(od["skills"]),
        duration_from=od["dfrom"], duration_to=od["dto"],
        bandwidth=od["bandwidth"], slots=od["slots"], slots_remaining=od["slots"],
        status=od["status"], created_at=datetime.utcnow() - timedelta(days=10)
    )
    db.add(o)
    opps.append(o)
db.commit()
for o in opps:
    db.refresh(o)

matches_data = [
    {"profile_idx": 0, "opp_idx": 0, "score": 82, "reasoning": "Ana's Operations background and data skills align well with this ExCo priority project. Her aspiration to move into digital roles makes this a strong developmental match. The main gap is Python proficiency, which she can build on the job.", "gaps": ["python", "power bi"], "status": "pending", "essay": ""},
    {"profile_idx": 2, "opp_idx": 7, "score": 88, "reasoning": "Cris brings direct Finance experience and strong modeling skills. This immersion offers cross-functional exposure that matches her stated growth direction.", "gaps": [], "status": "completed", "essay": "I want to deepen my business partnering skills and this immersion offers the perfect structured exposure."},
    {"profile_idx": 7, "opp_idx": 4, "score": 79, "reasoning": "Ben's Risk background directly maps to this gig's requirements. His credit modeling experience is a strong fit.", "gaps": ["stakeholder reporting"], "status": "interested", "essay": "I've been working on risk models for 2 years and want to apply my skills on a high-visibility review."},
    {"profile_idx": 3, "opp_idx": 5, "score": 75, "reasoning": "Jamie's digital product experience is a natural fit for customer journey work. Formal facilitation training would strengthen the match.", "gaps": ["facilitation"], "status": "completed", "essay": "Customer journey mapping is directly aligned with my UX research work and I'm eager to contribute."},
    {"profile_idx": 5, "opp_idx": 2, "score": 91, "reasoning": "Rico's marketing skills and brand experience make this an excellent fit. The immersion offers structured exposure that matches his aspiration precisely.", "gaps": [], "status": "accepted", "essay": "This immersion aligns perfectly with my goal to lead campaigns. I bring 3 years of brand strategy experience."},
    {"profile_idx": 8, "opp_idx": 1, "score": 68, "reasoning": "Mia's operations role has given her coordination skills transferable to event hosting.", "gaps": ["emcee", "public speaking"], "status": "pending", "essay": ""},
    {"profile_idx": 10, "opp_idx": 8, "score": 85, "reasoning": "Pat's communications background is an excellent fit for internal comms work.", "gaps": [], "status": "completed", "essay": "I've been writing internal newsletters for 2 years and would love to apply this at scale."},
    {"profile_idx": 0, "opp_idx": 6, "score": 72, "reasoning": "Ana's operations background is directly applicable to this process improvement immersion.", "gaps": ["lean process"], "status": "pending", "essay": ""},
]

matches = []
for md in matches_data:
    m = models.Match(
        profile_id=profiles[md["profile_idx"]].id, opp_id=opps[md["opp_idx"]].id,
        match_score=md["score"], reasoning_text=md["reasoning"],
        gaps=json.dumps(md["gaps"]), status=md["status"],
        essay_response=md["essay"],
        accepted_at=datetime.utcnow() - timedelta(days=2) if md["status"] == "accepted" else None,
        created_at=datetime.utcnow() - timedelta(days=5)
    )
    db.add(m)
    matches.append(m)
db.commit()
for m in matches:
    db.refresh(m)

completed_matches = [m for m in matches if m.status == "completed"]
feedbacks_data = [
    {"match_idx": 0, "user_idx": 2, "rating": 5, "comments": "Incredible experience — learned more in 2 months than in a year in my regular role.", "tag": "Recommends the platform"},
    {"match_idx": 1, "user_idx": 3, "rating": 4, "comments": "Great match. The AI reasoning was spot-on.", "tag": "Would do again"},
    {"match_idx": 2, "user_idx": 1, "rating": 5, "comments": "Found exactly the internal talent we needed. Cut our usual hiring timeline by 6 weeks.", "tag": "Recommends the platform"},
    {"match_idx": 3, "user_idx": 5, "rating": 4, "comments": "Good experience overall. Some admin friction but the outcome was worth it.", "tag": "Would do again"},
    {"match_idx": 4, "user_idx": 10, "rating": 3, "comments": "The match score was accurate but the transition support could be better.", "tag": "Needs improvement"},
]
for i, fd in enumerate(feedbacks_data):
    cm_idx = fd["match_idx"] % len(completed_matches)
    fb = models.Feedback(
        match_id=completed_matches[cm_idx].id, submitted_by=users[fd["user_idx"]].id,
        role=users[fd["user_idx"]].role, rating=fd["rating"],
        comments=fd["comments"], tag=fd["tag"],
        submitted_at=datetime.utcnow() - timedelta(days=i)
    )
    db.add(fb)
db.commit()

# Seed some notifications
notif_data = [
    {"user_idx": 1, "title": "New application received", "message": "Rico Mendoza applied for \"Marketing Campaign Immersion\". Review their application.", "type": "action"},
    {"user_idx": 1, "title": "New application received", "message": "Ben Ramos applied for \"Credit Risk Model Review\". Review their application.", "type": "action"},
    {"user_idx": 4, "title": "New opportunity pending approval", "message": "\"Data Science Bootcamp Mentor\" submitted by Sofia Lim is awaiting your review.", "type": "action"},
    {"user_idx": 5, "title": "Application accepted", "message": "Congratulations! Your application for \"Marketing Campaign Immersion\" has been accepted.", "type": "success"},
    {"user_idx": 7, "title": "Application accepted", "message": "Your application for \"Credit Risk Model Review\" has been accepted.", "type": "success"},
]
for nd in notif_data:
    n = models.Notification(
        user_id=users[nd["user_idx"]].id, title=nd["title"],
        message=nd["message"], type=nd["type"]
    )
    db.add(n)
db.commit()
db.close()
print("Seed data created successfully!")
