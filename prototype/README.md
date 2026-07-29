# Talent Marketplace — clickable prototype

`talent-marketplace-prototype.html` is a single self-contained HTML file: no build
step, no dependencies, no network calls. Open it in any browser and it runs.

This is a **design prototype**, not the product. It exists to settle questions of
flow, wording, and incentive design before they get built. The React app under
`frontend/` is the real implementation and does not read from this file.

## Running it

Double-click the file, or:

```
open prototype/talent-marketplace-prototype.html      # macOS
xdg-open prototype/talent-marketplace-prototype.html  # Linux
```

## Roles

The login screen switches between four roles. Each gets its own navigation and
its own pages:

| Role | Persona | What it demonstrates |
|---|---|---|
| Recruiter | Ada Lovelace | Posting, screening applicants, own matches |
| Manager | Taylor Swift | Team activity, nominations, hosting, the host-side survey |
| Employee | Cristiano Ronaldo | Applying, service offers, nominations, the participant survey |
| Administrator | Beyoncé Knowles | Approvals, stale posts, the nomination dashboard |

Use the role switcher in the top bar to move between them without reloading.

## The four opportunity types

- **Gig** — short piece of work alongside your existing role.
- **Vacancy** — a permanent internal role.
- **DJI** — Developmental Job Immersion, a fixed-term secondment under Policy
  211_2021. Headcount and salary stay with the home department.
- **Service Offer** — the only type that runs in reverse. An employee publishes
  what they will help with; teams request their time.

## Things worth clicking

- **Introduction** — the reasons to apply, what PCD commits to in return, and
  the reasons to post. Each block ends in a call to action.
- **All Opportunities** — every filter is live (type, department, match score,
  free-text search), with a Clear button and an empty state. There is
  deliberately no default score cut-off; stretch roles are the point.
- **My Applications → Rate this gig** — the post-activity survey from the
  participant's side.
- **My Openings → Complete survey** (as Manager) — the same survey from the host
  manager's side, with different questions.
- **Dashboard → Message Poster** (as Administrator) — templated messages to the
  owner of a stale post, rather than a bare nudge.
- **Nomination Dashboard** (as Administrator) — the leaderboard is ranked by
  *selected* nominations, not volume.

## Known scope limits

State is in-memory only. Reloading the page resets everything, and nothing
persists between roles — submitting feedback as the employee does not change
what the manager sees. That is fine for walking someone through the flows and
wrong for anything else.

