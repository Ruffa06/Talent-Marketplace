# Version 1.0 — Growth: HC Talent Marketplace

**Status:** design prototype, pilot-ready
**Release commit:** `07e848e`
**Branch:** `claude/cool-cray-9oq1pt` (repository default)
**Date:** 18 August 2026

---

## How to retrieve this exact version

| What | Where |
|---|---|
| Live prototype | https://ruffa06.github.io/Talent-Marketplace/ |
| Direct file URL | https://ruffa06.github.io/Talent-Marketplace/prototype/talent-marketplace-prototype.html |
| Repository | https://github.com/Ruffa06/Talent-Marketplace |
| This exact commit | https://github.com/Ruffa06/Talent-Marketplace/commit/07e848e |
| Browse the tree at v1 | https://github.com/Ruffa06/Talent-Marketplace/tree/07e848e |
| Download v1 as a zip | https://github.com/Ruffa06/Talent-Marketplace/archive/07e848e.zip |

Clone and check out exactly this version:

```bash
git clone https://github.com/Ruffa06/Talent-Marketplace.git
cd Talent-Marketplace
git checkout 07e848e
open prototype/talent-marketplace-prototype.html
```

### Tagging this release

The session that produced v1 could not push git tags (the git proxy returns
403 on `refs/tags/*`; branch pushes are unaffected). To create the tag
yourself, either:

```bash
git tag -a v1.0.0 07e848e -m "Version 1.0"
git push origin v1.0.0
```

or on GitHub: **Releases → Draft a new release → Choose a tag → `v1.0.0` →
Target `07e848e` → Publish**.

---

## What v1 contains

| File | Purpose |
|---|---|
| `prototype/talent-marketplace-prototype.html` | The whole prototype. 253 KB, 3,620 lines, one self-contained file: no build step, no dependencies, no external network calls except the shared-state database. |
| `prototype/supabase-schema.sql` | Creates the two shared tables and their pilot access policies. Re-runnable. |
| `prototype/README.md` | How to run it, the roles, the four opportunity types. |
| `index.html` | Root redirect so GitHub Pages serves the prototype at the site root. |
| `backend/`, `frontend/` | An earlier React + FastAPI implementation. **Not** what the prototype runs on — see `docs/ARCHITECTURE.md`. |

### Capabilities

- **Four roles** — Recruiter (Oprah Winfrey), Manager (Taylor Swift), Employee
  (Cristiano Ronaldo, reporting to Taylor Swift), Administrator (Beyoncé
  Knowles). Switchable without reload.
- **Four opportunity types** — Gig, Vacancy, Developmental Job Immersion
  (Policy 211_2021), and Service Offer, the one that runs in reverse.
- **Shared live state** — posting, approving, applying and deciding write to a
  hosted database and are visible to everyone on the link.
- **AI matching explained** — weighting and banding rubrics, and an explicit
  statement of where the model gets it wrong.
- **Per-opportunity fit** — the skills you bring, the ones the post needs, and
  how to build the ones you lack.
- **Responsive** — off-canvas drawer below 768 px; verified 0 px horizontal
  overflow at 375, 390, 820 and 1440 px.
- **7-day escalation** — computed from real application dates, showing the
  reminder that would go to the post owner. No mail is actually sent.

---

## Commit history

| Commit | Date | Change |
|---|---|---|
| `07e848e` | 2026-08-17 | Fix line breaking; clarify skill-gap wording |
| `58f3214` | 2026-08-17 | Rebrand to Home Credit PH; 13-point revision batch |
| `0721fed` | 2026-07-31 | Shared live state via Supabase |
| `4192f29` | 2026-07-29 | Employee persona reports to manager persona |
| `7315731` | 2026-07-29 | Responsive layout for phones |
| `d034019` | 2026-07-29 | Root redirect for GitHub Pages |
| `5e56420` | 2026-07-29 | Show the login screen on load |
| `359bc76` | 2026-07-30 | Remove the mis-uploaded file |
| `00c4b47` | 2026-07-30 | First prototype upload |

19 commits total on the branch.

---

## Known limitations carried into v1

1. **No authentication.** Anyone with the link can act as any role, including
   Administrator, and can read or change all pilot data. Acceptable for a
   feedback pilot; not acceptable beyond it.
2. **Only five panels are live.** Everything else — surveys, nominations,
   dashboards, the seeded personas — is demo content that resets on reload.
3. **No email is sent.** The 7-day rule computes correctly and shows the exact
   message; delivery needs a mail service behind a backend.
4. **AI matching is not wired in the prototype.** Scores are seeded. The
   scoring endpoint exists in `backend/routers/matches.py` but the prototype
   does not call it.
5. **Not verified on Safari/iOS.** All automated testing ran in Chromium.
