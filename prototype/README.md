# Growth: HC Talent Marketplace — clickable prototype

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

## Shared live state

Posting, approving, applying and deciding write to a Supabase project, so what
one person on the link does is visible to everyone else. Run
`supabase-schema.sql` once in the Supabase SQL Editor to create the tables. The
badge in the top bar reads **Live** when connected and **Offline** otherwise.

There is no login: anyone with the link can act as any role, including
administrator, and can read or change all pilot data.

## Known scope limits

Everything outside those shared panels is seeded demo content that resets on
reload — the surveys, nominations, dashboards and the seeded personas. The
7-day escalation computes real ageing and shows the exact message that would
go out, but no email is actually sent; delivery needs a mail service behind a
backend.
