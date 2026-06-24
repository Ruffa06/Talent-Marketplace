import json
from database import engine, SessionLocal
import models
from datetime import datetime, timedelta

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
    {"user_idx": 0, "aspiration": "I want to move into data and digital roles, applying my operations knowledge to build better systems.", "current": ["process improvement", "operations", "documentation", "project management"], "develop": ["data visualization", "python", "power bi"], "direction": "Cross-functional"},
    {"user_idx": 1, "aspiration": "I want to build a high-performing risk team and mentor the next generation of analysts.", "current": ["credit risk", "statistical modeling", "stakeholder management", "excel"], "develop": ["people analytics", "strategic planning"], "direction": "Manager track"},
    {"user_idx": 2, "aspiration": "I want to become a finance business partner and develop cross-functional relationships.", "current": ["financial modeling", "budgeting", "excel", "business partnering"], "develop": ["data analysis", "stakeholder management"], "direction": "Expert track"},
    {"user_idx": 3, "aspiration": "I want to grow in product and UX, building digital experiences that matter.", "current": ["customer experience", "journey mapping", "ux research"], "develop": ["data visualization", "facilitation"], "direction": "Expert track"},
    {"user_idx": 4, "aspiration": "Build a best-in-class HR function powered by people analytics.", "current": ["people analytics", "hris", "stakeholder management"], "develop": ["data science", "excel"], "direction": "Manager track"},
    {"user_idx": 5, "aspiration": "Grow into a brand strategy role with more campaign ownership.", "current": ["campaign planning", "brand strategy", "consumer insights", "copywriting"], "develop": ["content creation", "storytelling"], "direction": "Expert track"},
    {"user_idx": 6, "aspiration": "Lead digital product development at scale.", "current": ["ux research", "journey mapping", "facilitation", "stakeholder management"], "develop": ["data science", "python"], "direction": "Manager track"},
    {"user_idx": 7, "aspiration": "Deepen my credit risk expertise and expand into Python-based modeling.", "current": ["credit risk", "excel", "statistical modeling"], "develop": ["python", "data visualization"], "direction": "Expert track"},
    {"user_idx": 8, "aspiration": "Explore people-facing and event coordination roles.", "current": ["operations", "documentation", "project management"], "develop": ["facilitation", "public speaking", "event planning"], "direction": "Cross-functional"},
    {"user_idx": 9, "aspiration": "Build strategic finance partnerships across the business.", "current": ["financial modeling", "budgeting", "business partnering", "excel"], "develop": ["stakeholder management", "people analytics"], "direction": "Manager track"},
    {"user_idx": 10, "aspiration": "Contribute to HR communications and internal engagement.", "current": ["internal comms", "copywriting", "content creation"], "develop": ["people analytics", "storytelling"], "direction": "Cross-functional"},
    {"user_idx": 11, "aspiration": "Drive data-informed HR strategies across the organization.", "current": ["people analytics", "hris", "data analysis", "excel"], "develop": ["statistical modeling", "stakeholder management"], "direction": "Manager track"},
]

profiles = []
for pd in profiles_data:
    p = models.Profile(
        user_id=users[pd["user_idx"]].id,
        aspiration_text=pd["aspiration"],
        current_skills=json.dumps(pd["current"]),
        skills_to_develop=json.dumps(pd["develop"]),
        career_direction=pd["direction"],
        is_open_to_opportunities=True,
        updated_at=datetime.utcnow()
    )
    db.add(p)
    profiles.append(p)
db.commit()
for p in profiles:
    db.refresh(p)

opps_data = [
    {"posted_by_idx": 6, "type": "gig", "title": "ExCo Priority: Financial-Inclusion Dashboard", "department": "Digital Products", "description": "High-visibility ExCo priority project to build a financial-inclusion data visualization dashboard. This dashboard will be presented to the Executive Committee and requires strong data storytelling skills.", "skills": ["data visualization", "power bi", "python", "stakeholder reporting"], "duration": 60, "bandwidth": "Part-time", "slots": 2, "status": "live"},
    {"posted_by_idx": 4, "type": "gig", "title": "Company Anniversary Event Host", "department": "HR", "description": "Host the company anniversary celebration for Home Credit Philippines. You'll emcee the event, coordinate with teams, and create an engaging experience for all employees.", "skills": ["facilitation", "event planning", "public speaking", "emcee"], "duration": 5, "bandwidth": "Full-time", "slots": 1, "status": "live"},
    {"posted_by_idx": 5, "type": "immersion", "title": "Marketing Campaign Immersion", "department": "Marketing", "description": "Developmental exposure to end-to-end marketing campaign planning. Shadow and contribute to live campaigns, learn brand strategy, and develop consumer insights skills.", "skills": ["campaign planning", "brand strategy", "consumer insights", "copywriting"], "duration": 30, "bandwidth": "Part-time", "slots": 2, "status": "live"},
    {"posted_by_idx": 4, "type": "vacancy", "title": "People Analytics Specialist", "department": "HR", "description": "Open internal role for a People Analytics Specialist. You'll build workforce dashboards, analyze retention trends, and partner with HR business partners to drive data-informed decisions.", "skills": ["people analytics", "hris", "data analysis", "excel", "stakeholder management"], "duration": None, "bandwidth": "Full-time", "slots": 1, "status": "live"},
    {"posted_by_idx": 1, "type": "gig", "title": "Credit Risk Model Review", "department": "Risk", "description": "Review and validate the credit risk scoring model. Requires strong statistical modeling background and experience with Python-based analysis.", "skills": ["credit risk", "python", "statistical modeling", "excel"], "duration": 45, "bandwidth": "Part-time", "slots": 1, "status": "live"},
    {"posted_by_idx": 6, "type": "gig", "title": "Customer Journey Mapping", "department": "Digital Products", "description": "Map the end-to-end customer journey for our digital lending product. Conduct UX research, run workshops, and produce journey maps that inform product improvements.", "skills": ["ux research", "customer experience", "journey mapping", "facilitation"], "duration": 20, "bandwidth": "Part-time", "slots": 2, "status": "live"},
    {"posted_by_idx": 0, "type": "immersion", "title": "Operations Process Improvement", "department": "Operations", "description": "Join the Operations team for a structured immersion in lean process improvement. Contribute to real process reviews and help document improvements.", "skills": ["lean process", "project management", "operations", "documentation"], "duration": 21, "bandwidth": "Part-time", "slots": 3, "status": "live"},
    {"posted_by_idx": 9, "type": "immersion", "title": "Finance Business Partner Immersion", "department": "Finance", "description": "Shadow Finance Business Partners to understand how finance supports business units. Contribute to budgeting reviews and stakeholder presentations.", "skills": ["financial modeling", "business partnering", "budgeting", "excel"], "duration": 14, "bandwidth": "Part-time", "slots": 2, "status": "live"},
    {"posted_by_idx": 4, "type": "gig", "title": "Internal Communications Gig", "department": "HR", "description": "Create internal communications content for company-wide initiatives. Write newsletters, intranet posts, and storytelling content that engages employees.", "skills": ["copywriting", "internal comms", "content creation", "storytelling"], "duration": 15, "bandwidth": "Part-time", "slots": 2, "status": "live"},
    {"posted_by_idx": 6, "type": "gig", "title": "Data Science Bootcamp Mentor", "department": "Digital Products", "description": "Mentor employees participating in the internal data science bootcamp. Guide learners through Python basics, statistical concepts, and practical projects.", "skills": ["data science", "python", "mentoring", "teaching"], "duration": 10, "bandwidth": "Part-time", "slots": 3, "status": "pending_review"},
]

opps = []
for od in opps_data:
    o = models.Opportunity(
        posted_by=users[od["posted_by_idx"]].id,
        type=od["type"],
        title=od["title"],
        department=od["department"],
        description=od["description"],
        skills_needed=json.dumps(od["skills"]),
        duration_days=od["duration"],
        bandwidth=od["bandwidth"],
        slots=od["slots"],
        status=od["status"],
        created_at=datetime.utcnow() - timedelta(days=10)
    )
    db.add(o)
    opps.append(o)
db.commit()
for o in opps:
    db.refresh(o)

matches_data = [
    {"profile_idx": 0, "opp_idx": 0, "score": 82, "reasoning": "Ana's Operations background and data skills align well with this ExCo priority project. Her aspiration to move into digital roles makes this a strong developmental match. The main gap is Python proficiency, which she can build on the job.", "gaps": ["python", "power bi"], "status": "pending"},
    {"profile_idx": 2, "opp_idx": 7, "score": 88, "reasoning": "Cris brings direct Finance experience and strong modeling skills. This immersion offers cross-functional exposure that matches her stated growth direction. Minimal skill gaps identified.", "gaps": [], "status": "completed"},
    {"profile_idx": 7, "opp_idx": 4, "score": 79, "reasoning": "Ben's Risk background directly maps to this gig's requirements. His Python skills and credit modeling experience are strong fits. Stakeholder reporting is an area for development.", "gaps": ["stakeholder reporting"], "status": "interested"},
    {"profile_idx": 3, "opp_idx": 5, "score": 75, "reasoning": "Jamie's digital product experience is a natural fit for customer journey work. UX research exposure aligns with their growth goals. Formal facilitation training would strengthen the match.", "gaps": ["facilitation"], "status": "completed"},
    {"profile_idx": 5, "opp_idx": 2, "score": 91, "reasoning": "Rico's marketing skills and brand experience make this an excellent fit. The immersion offers structured exposure to campaign planning that matches his aspiration precisely. No significant gaps.", "gaps": [], "status": "completed"},
    {"profile_idx": 8, "opp_idx": 1, "score": 68, "reasoning": "Mia's operations role has given her coordination and logistics skills transferable to event hosting. Her interest in people-facing work makes this a good stretch opportunity. Emcee and public speaking skills are the primary gaps.", "gaps": ["emcee", "public speaking"], "status": "pending"},
    {"profile_idx": 10, "opp_idx": 8, "score": 85, "reasoning": "Pat's communications background is an excellent fit for internal comms work. Their storytelling and content creation skills directly match the gig requirements. Strong match overall.", "gaps": [], "status": "completed"},
    {"profile_idx": 0, "opp_idx": 6, "score": 72, "reasoning": "Ana's operations background is directly applicable to this process improvement immersion. She can contribute meaningfully while developing her lean process skills.", "gaps": ["lean process"], "status": "pending"},
]

matches = []
for md in matches_data:
    m = models.Match(
        profile_id=profiles[md["profile_idx"]].id,
        opp_id=opps[md["opp_idx"]].id,
        match_score=md["score"],
        reasoning_text=md["reasoning"],
        gaps=json.dumps(md["gaps"]),
        status=md["status"],
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
    {"match_idx": 1, "user_idx": 3, "rating": 4, "comments": "Great match. The AI reasoning was spot-on. Would appreciate more structured onboarding.", "tag": "Would do again"},
    {"match_idx": 2, "user_idx": 1, "rating": 5, "comments": "Found exactly the internal talent we needed. Cut our usual hiring timeline by 6 weeks.", "tag": "Recommends the platform"},
    {"match_idx": 3, "user_idx": 5, "rating": 4, "comments": "Good experience overall. Some admin friction but the outcome was worth it.", "tag": "Would do again"},
    {"match_idx": 4, "user_idx": 10, "rating": 3, "comments": "The match score was accurate but the transition support could be better.", "tag": "Needs improvement"},
]

for i, fd in enumerate(feedbacks_data):
    cm_idx = fd["match_idx"] % len(completed_matches)
    user = users[fd["user_idx"]]
    fb = models.Feedback(
        match_id=completed_matches[cm_idx].id,
        submitted_by=user.id,
        role=user.role,
        rating=fd["rating"],
        comments=fd["comments"],
        tag=fd["tag"],
        submitted_at=datetime.utcnow() - timedelta(days=i)
    )
    db.add(fb)
db.commit()
db.close()
print("Seed data created successfully!")
