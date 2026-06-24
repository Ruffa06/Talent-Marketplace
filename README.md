# Talent Marketplace — Home Credit Philippines (Prototype)

An internal AI-powered career and opportunity platform that reframes career growth as multi-directional. Connects employees to internal vacancies, short-term gigs, and developmental job immersions, with AI-powered matching via Claude.

## Prerequisites

- Node.js 18+
- Python 3.11+
- An Anthropic API key (`ANTHROPIC_API_KEY`)

## Setup & Run

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# Seed the database (drops & recreates)
python seed.py

# Start the API server
uvicorn main:app --reload --port 8000
```

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:3000
```

## Using the App

- Open `http://localhost:3000`
- Use the **Role Switcher** (bottom of left sidebar) to switch between users:
  - **Employees** (Ana Reyes, Cris Valdez, Jamie Santos, Rico Mendoza, Ben Ramos, Mia Garcia, Pat Navarro) — browse opportunities, view matches, build profile
  - **Managers** (Mark Torres, Sofia Lim, Dan Ocampo) — post gigs and immersions, see candidate lists
  - **HR Admins** (Lea Cruz, Kim Dela Rosa) — full access including dashboard and moderation queue

## Running AI Matching

1. Switch to an employee user
2. Go to **My Matches**
3. Click **Run AI Matching** — this calls Claude (`claude-sonnet-4-6`) to score the employee against all live opportunities
4. Scores, reasoning, and skill gaps appear on the match cards

## Seed Data

Re-run seeding anytime to reset to a clean state:
```bash
cd backend && python seed.py
```

This loads: 12 users · 12 profiles · 10 opportunities (9 live, 1 pending review) · 8 pre-computed matches · 5 feedback entries

## Project Structure

```
backend/
  main.py              FastAPI app + CORS
  database.py          SQLite via SQLAlchemy
  models.py            DB models
  schemas.py           Pydantic schemas
  seed.py              Seed script
  requirements.txt
  routers/
    auth.py            User list + role-switch
    profiles.py        GET/PUT employee profiles
    opportunities.py   CRUD + HR moderation
    matches.py         AI matching via Claude
    feedback.py        Post-experience feedback
    dashboard.py       HR analytics summary

frontend/src/
  App.jsx              Route definitions
  api.js               Axios client (X-User-Id header)
  context/UserContext  Global user state + toast system
  components/
    Shell              Top bar + sidebar navigation
    SkillChip          Hover tooltips with skill definitions
    TypeBadge          Gig / Vacancy / Immersion badges
    OpportunityCard    Browsable opportunity card
    MatchScoreCircle   SVG score ring
  pages/
    Home               Mindset landing page (Module 1)
    Opportunities      Board with filters + moderation (Module 2)
    Profile            Employee profile builder (Module 3)
    MyMatches          AI match results + express interest (Module 4)
    Dashboard          HR analytics (Module 5)
    Feedback           Post-experience feedback (Module 6)
    FAQ                Accordion policy Q&A
```

## Future Work (Out of Scope for Prototype)

- **Real SSO / RBAC** — replace role switcher with company SSO (e.g. Okta, Azure AD)
- **Disprz taxonomy integration** — Phase 2: normalize skills against Disprz taxonomy
- **Production email service** — replace simulated toasts with real email notifications (SendGrid, SES)
- **HRIS integration** — auto-populate profiles from Workday / SAP SuccessFactors
- **Mobile native app** — extend to iOS/Android
- **Vector-based semantic matching** — upgrade from keyword pre-filter to embeddings + pgvector

## Environment Variables

Create `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```
