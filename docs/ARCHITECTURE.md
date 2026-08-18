# Architecture — as built (v1) and as proposed (production)

**Version:** v1.0 (`07e848e`) · **Prepared:** 18 August 2026

This supersedes `TECH_BLUEPRINT.md` at the repository root for anything
describing the prototype. The root document remains a useful statement of the
*target* production design; where the two disagree about what exists today,
this one is correct.

---

## 1. Two codebases, one repository

A point of confusion worth stating plainly: **the repository contains two
separate implementations, and the live prototype is not the React app.**

| | `prototype/` — **what is live** | `backend/` + `frontend/` — **earlier work** |
|---|---|---|
| Stack | One self-contained HTML file, vanilla JS | FastAPI + SQLAlchemy + React/Vite/Tailwind |
| Size | 3,620 lines, 253 KB | 888 lines Python, 1,748 lines JSX |
| Hosting | GitHub Pages (static) | Not deployed |
| Persistence | Supabase (2 tables) | SQLite via SQLAlchemy |
| Roles | 4 — Recruiter, Manager, Employee, Admin | 3 — Employee, Manager, HR Admin |
| Covers | Gigs, Vacancies, DJI, Service Offers, nominations, surveys | Gigs, Vacancies, Immersions |
| AI matching | Not wired — scores are seeded | Implemented (`routers/matches.py`) |
| Brand | Home Credit PH / Growth | Home Credit Philippines (older copy) |

**Neither is production-ready, for different reasons.** The prototype has the
right product but no authentication and only partial persistence. The React app
has real persistence and working AI matching but a thinner product and no
deployment.

The production build should take the **prototype's product design** and the
**backend's data model and matching logic**, not choose one wholesale.

---

## 2. v1 as built

```
Browser (any device)
   │
   ├── GitHub Pages ─────── talent-marketplace-prototype.html
   │                         (HTML + CSS + JS, no build step, no dependencies)
   │
   └── HTTPS/REST ───────── Supabase (PostgREST + Postgres)
                             ├── opportunities
                             └── applications
```

### Design decisions and why

**One file, no build step.** The prototype is edited and deployed by copying a
single file. No npm install, no bundler, no CI. This is why it survived being
uploaded through a phone browser, and why a non-engineer can host it anywhere.
The cost is that it will not scale as a codebase past roughly this size.

**Static hosting plus a hosted database.** GitHub Pages cannot run server code.
Rather than deploy a server, the page calls Supabase's REST interface directly.
This keeps hosting free and deployment trivial, at the cost of putting access
control entirely in the database's hands.

**Partial persistence, deliberately.** Only five panels are shared: live
opportunities, my applications, the manager inbox, team activity, and the admin
approval queue. Everything else is seeded content. Making it all live would
mean an empty system on day one, which reads as broken. The seeded content
carries the product vision; the live panels prove the mechanism.

### Shared data model

```sql
opportunities(id, title, type, department, description,
              posted_by, posted_role, status, created_at)
  status: pending | live | rejected

applications(id, opp_title, opp_type, applicant, applicant_role,
             essay, status, created_at)
  status: applied | accepted | declined
```

Deliberately denormalised — `applications` stores the opportunity title rather
than a foreign key — so that an application survives its opportunity being
edited or removed during a pilot. This is right for a prototype and wrong for
production, where a real foreign key with a retention policy is correct.

### Client architecture

| Concern | Implementation |
|---|---|
| Routing | `navigate(pageId)` toggles `.page.active`. No router, no URLs. |
| Roles | `ROLES` object drives nav rendering; `setRole()` swaps identity, nav, profile. |
| Live layer | `LIVE` object holds config and cache; `liveRefresh()` polls every 8s with a sequence guard so a slow failed request cannot overwrite a newer good one. |
| Identity | Display name in `localStorage`, prompted on first action. No authentication. |
| Degradation | Any fetch failure flips to an explicit "Offline" state; seeded content still works. |
| Matching explanation | `SKILL_DEFS`, `SKILL_DEV`, `MY_SKILLS` drive per-card fit breakdowns client-side. |
| SLA | `daysOld()` / `isOverdue()` compute the 7-day escalation from real timestamps. |

### Known architectural weaknesses

1. **No authentication or authorisation.** The role selector is a costume. RLS
   policies permit any holder of the publishable key to read and write
   everything. This is the blocking issue for anything beyond a pilot.
2. **Polling, not subscriptions.** Eight-second polling is fine for 637 users
   and wasteful at scale. Supabase Realtime would remove it.
3. **No server-side validation.** The client is the only thing enforcing
   shape and rules; the database accepts whatever it is sent.
4. **Denormalised joins.** Applications reference opportunities by title.
5. **No audit trail on mutation.** The admin History page reconstructs history
   from current state plus seeded rows; it is not an append-only log.

---

## 3. Production architecture (proposed)

```
   Employees ──── SSO (Azure AD / Okta) ──┐
                                          ▼
                              ┌───────────────────────┐
   React SPA  ───────────────▶│  FastAPI              │
   (frontend/, extended to    │  - authn/authz         │
    the prototype's design)   │  - opportunities       │
                              │  - applications        │
                              │  - matching            │◀── Claude API
                              │  - notifications       │    (Haiku 4.5 or
                              └───────────┬───────────┘     Sonnet 5, batched)
                                          │
                              ┌───────────▼───────────┐
                              │ Postgres              │
                              │ + audit log           │
                              └───────────────────────┘
                                          ▲
                    HRIS (Workday/SAP) ───┘  nightly profile import
                    LMS (Disprz) ─────────┘  certification → verified skills
                    Email (SES/SendGrid) ◀── 7-day escalation, decisions
```

### Changes required against what exists

| Area | Change |
|---|---|
| **AuthN/AuthZ** | Replace the role switcher with SSO. Roles from HRIS, not a dropdown. Server-side authorisation on every endpoint. |
| **Data model** | Real foreign keys; add `nominations`, `feedback`, `service_offers`, `notifications`, `audit_log`. Extend `Match` with the rubric factors so scores are explainable after the fact. |
| **Matching** | Wire the existing `matches.py` to the front end. Move to the Batch API. Switch to `claude-haiku-4-5` if it benchmarks acceptably against `claude-sonnet-5` — see `docs/COSTING.md`. Persist the rubric breakdown, not just the score. |
| **Notifications** | Real email for decisions and the 7-day escalation. A scheduled job evaluates the SLA nightly. |
| **Persistence** | Everything currently seeded becomes real: surveys, nominations, service offers, dashboards. |
| **Audit** | Append-only log of every state transition, for the History & Audit view and for DPA accountability. |
| **Database** | SQLite → Postgres. SQLite on ephemeral hosting loses data on redeploy. |

### Model selection

The current code pins `claude-sonnet-4-6`. Scoring a profile against a post is
a constrained, rubric-driven task. **Benchmark `claude-haiku-4-5` against
`claude-sonnet-5` on 50 real pairs and pick on quality** — the three-year cost
difference is under US$600, so cost should not drive this decision. Use the
Batch API in either case; matching is not latency-sensitive.

---

## 4. Environment configuration

Prototype (v1) — values are embedded in the HTML by design, since a static page
has nowhere else to put them:

```
Supabase project URL      https://<project>.supabase.co
Supabase publishable key  sb_publishable_...   (safe to expose; RLS is the control)
```

Production — server-side only, never in client code:

```
DATABASE_URL              postgresql://...
ANTHROPIC_API_KEY         sk-ant-...
SSO_CLIENT_ID / SECRET    from Azure AD or Okta
HRIS_API_URL / TOKEN
SMTP_* or SENDGRID_API_KEY
```

---

## 5. Testing performed on v1

Automated, in Chromium via Playwright:

- Every navigation item, in all four roles, at 375 / 390 / 820 / 1440 px —
  **0 px horizontal overflow, zero JavaScript errors**.
- Multi-user flow across two independent browser contexts: recruiter posts →
  admin approves → second browser sees it and applies → manager accepts →
  applicant sees the decision.
- Offline degradation when the database is unreachable.
- Line-break sweep across every page at 390 px and 1440 px for orphaned words.

**Not tested:** Safari or iOS (all testing was Chromium); the live Supabase
project (blocked by the build environment's egress policy — verified against a
PostgREST-shaped mock instead); load or concurrency; accessibility beyond
keyboard focus on tooltips.
