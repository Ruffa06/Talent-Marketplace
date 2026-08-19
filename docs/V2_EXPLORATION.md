# v2 exploration — dropping Internal Vacancy and the Recruiter role

**Branch:** `claude/talent-marketplace-v2-explore-kps8k8` · **Prototype:** `prototype/talent-marketplace-v2.html`
**Schema:** `prototype/v2-supabase-schema.sql` (all tables `v2_`-prefixed) · **Prepared:** 18 August 2026
**Costing:** [`docs/V2_COSTING.md`](V2_COSTING.md) — v2 against v1, side by side
**Business case:** [`docs/V2_CBA.md`](V2_CBA.md) — the lean build, competitive comparison, CBA

v1 is untouched. It stays live at ruffa06.github.io/Talent-Marketplace from
`claude/cool-cray-9oq1pt`, on its own `opportunities` / `applications` tables.
This exploration is a second HTML file and five new `v2_` tables; deleting them
removes the experiment without touching the pilot.

---

## 1. The problem this answers

> *"If I deploy, I can't use facilitate vacancies — there's a separate system
> already doing that. But how can I still promote it here, lead there, and count
> how many applied because of this app?"*

The constraint is real and it is not a limitation of the marketplace. Internal
recruitment already has a system of record — call it **HC Connect Internal Job Posting** — that owns the
requisition, the CV, the screening and the offer. Running a second application
queue here would not add a channel; it would split one process across two
systems and lose people in the seam.

So v2 gives up the part it was never going to win, and keeps the part HC Connect
cannot do:

| | HC Connect owns | Growth owns |
|---|---|---|
| The requisition | ✓ | |
| The application, screening, offer | ✓ | |
| Knowing what an employee can already do | | ✓ |
| Scoring fit against every open role | | ✓ |
| Telling someone a role exists that they were never going to search for | | ✓ |

**Growth becomes the top of the vacancy funnel and proves it. HC Connect keeps the
bottom.** The whole design question is the join between them.

---

## 2. What was removed

**Internal Vacancy, as a service.** You can no longer post a vacancy, apply to
one, or have applications to one land in an inbox here. The type is gone from the
post form (and blocked by a `check` constraint in the schema, so a stray API call
cannot reintroduce it), gone from All Opportunities, and gone from the
approval queue. "Four ways to grow" is now three.

**The Recruiter role.** With vacancies out, the recruiter persona had nothing
left to do here — posting a vacancy and screening its applicants *was* the role.
Three roles remain: Manager, Employee, Administrator.

That leaves one real gap, and it has to be named: **somebody still has to decide
which vacancies get promoted.** In v2 that is the Administrator (People &
Culture), through a new *Promoted Vacancies* page. This is explicitly a stopgap
— a hand-kept board goes stale, and a stale board that sends someone to a closed
requisition is worse than no board at all. In production it is replaced by a
nightly read from the HC Connect requisition feed.

---

## 3. What replaced it: promote → hand off → confirm → reconcile

```
  HC Connect (system of record)
     │  requisition exists
     ▼
  ┌──────────────────────────────────────────────┐
  │  Growth · Internal Vacancies board            │
  │  · match score, skills, fit breakdown         │   ← the value HC Connect cannot add
  │  · "View & apply in HC Connect ↗"                │
  └──────────────────┬───────────────────────────┘
                     │  generates GRW-K7P2QX, writes v2_vacancy_referrals
                     │  opens  …/job/REQ-2481?src=growth&gref=GRW-K7P2QX
                     ▼
  ┌──────────────────────────────────────────────┐
  │  HC Connect · the application actually happens   │
  │  employee pastes the code into "how did you   │
  │  hear about this role?"                        │
  └──────────────────┬───────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
  Growth asks:              Monthly: join the HC Connect
  "did you apply?"          export on referral_code
  (self-reported)           (confirmed)
```

Four things get recorded, and the design point is that **each one is a different
grade of evidence.** The UI labels every number with which grade it is, because
the fastest way to lose this argument is to quote a soft number as a hard one.

| Tier | What it is | Where it comes from | What it is worth |
|---|---|---|---|
| **Measured here** | views, referral clicks | this app's own database | Exact. Undisputable. This is genuinely ours. |
| **Self-reported** | "yes, I applied" | one tap from the employee | Free, and biased upward — people who applied are likelier to answer. Quote it as self-reported or not at all. |
| **From HC Connect** | confirmed applications, hires | the monthly export join | The only figures fit for a board paper. |

---

## 4. The metrics, defined

Shown on **Referrals & Attribution** (admin) and in compressed form on the
dashboard.

| Metric | Definition | Tier |
|---|---|---|
| Vacancies promoted | `v2_vacancies` where `status = 'live'` | measured |
| People who saw one | `v2_vacancy_views` — one row per viewer / requisition / day | measured |
| Referrals to HC Connect | `v2_vacancy_referrals` — one row per handoff click | measured |
| Click-through rate | referrals ÷ views | measured |
| Said they applied | referrals where `outcome = 'applied'` | self-reported |
| Confirmed in HC Connect | referrals where `verified = true` | from HC Connect |
| Confirmed rate | confirmed ÷ referrals — *the honesty ratio, see §7* | from HC Connect |
| Hires attributed | confirmed applications that became offers | from HC Connect / HR |

**The one sentence to quote when someone asks what the app did:**
"It put *N* people in front of a permanent role they weren't looking at, and
*M* of those applications are confirmed in HC Connect."

### The attribution rule

> A vacancy application is credited to Growth when a referral click from this app
> precedes it by **no more than 30 days**, last touch.

Write this down before the first number is reported, not after someone disputes
it. Anything outside the window is dropped even when the person genuinely first
saw the role here. **Undercounting is the intended failure mode** — one inflated
figure gets the entire report disbelieved, and there is no recovering from that.

---

## 5. What the employee is actually asked to do

Attribution across a system boundary always ends up resting on a human doing a
small thing, so the design makes that thing as small as possible and says plainly
why it matters:

1. **Open the role from Growth.** Recorded automatically. Nothing asked.
2. **Paste `GRW-K7P2QX` into "how did you hear about this role?" in HC Connect.**
   Five seconds. This is the whole ballgame.
3. **Tap "Yes, I applied" back in Growth.** One tap, and the board asks unprompted.

The code alphabet excludes I, O, 0 and 1, because it gets read aloud and retyped
by hand. It is carried on the URL *and* shown in full to the employee —
belt and braces, since an ATS that strips unknown query parameters would
otherwise break the whole chain silently.

The handoff modal also states the limits, because a tracking code that appears
without explanation reads worse than it is: Growth passes the code and the
requisition, not the CV, not the match score, and it cannot see what happens
inside HC Connect. **That is precisely why it has to ask.**

---

## 6. The reconciliation runbook (monthly)

1. **Export referrals** from the admin page — one row per handoff: code,
   requisition, employee, date, self-report, confirmation status.
2. **Get the HC Connect export** of internal applications for the same period,
   including the source field and the free-text "how did you hear" answer.
3. **Join on `referral_code`.** Where there is no code, fall back to matching on
   employee + requisition, and count it only if the referral precedes the
   application inside the 30-day window. The SQL is at the bottom of
   `prototype/v2-supabase-schema.sql`.
4. **Rows that join are confirmed. Rows that don't are not evidence of anything**
   — the person may have applied without pasting the code, or may never have
   applied. Leave them out. Do not estimate them upward.
5. **Quarterly**, ask HR for hire outcomes on the confirmed applications. That is
   the only attributable hire number.

### The one thing to ask recruitment for

Ask them to add a source value **`Growth Marketplace`** to the HC Connect
application form, plus one optional free-text field for the referral code.

That is a configuration change on a form — not an integration, no engineering
effort on their side — and it turns step 3 from a fuzzy name-matching exercise
into a join on a key. It is by far the highest-leverage ask in this document.
Everything else in v2 degrades gracefully without it; this is the thing worth
spending political capital on.

**Later, if volume justifies it:** a HC Connect webhook posting `application.created`
with the `gref` back to a Growth endpoint flips `verified` automatically and
removes the monthly join entirely. Not worth building until the pilot proves the
volume is there.

---

## 7. The honest limit: attribution is not causation

A confirmed referral proves the marketplace was the **last thing the person
touched** before applying. It does not prove they would not have applied anyway —
some of them read the same role in the internal jobs newsletter that morning.

If the number is challenged, there is exactly one clean answer, and it is worth
planning for now:

> **Run a holdout.** For one quarter, promote a random half of open requisitions
> on the marketplace and leave the other half listed only in HC Connect. Compare
> internal applications per requisition across the two groups.

The difference is the marketplace's causal effect, and it is the only version of
this number that survives a hostile reading. It costs nothing but the discipline
to leave half the requisitions alone for three months.

Two cheap triangulations in the meantime: the confirmed rate (confirmed ÷
referrals) tells you how much of the funnel is leaking, and the free-text "how
did you hear" answers will name the marketplace unprompted or they won't.

Until the holdout runs, report the funnel as it is labelled — referrals are ours,
applications are HC Connect', and the word **"because"** belongs to neither of us yet.

---

## 8. What is built vs. what is still demo content

**Live** (writes to `v2_` tables, shared across everyone on the link):
promoting a requisition · the handoff and its referral code · the self-report ·
the view log · marking a referral confirmed · the CSV export · the full funnel ·
**batch skills upload**.

### Batch skills upload

Matching only sees what is written down, so an empty profile is worth nothing to
its owner and nothing to the marketplace — and asking 637 people to author their
own skills *before* the product has done anything for them is the wrong order of
events. **Skills Upload** (admin) takes a CSV of what HR already holds — the HRIS
competency table, LMS completions, the last capability assessment — validates it
row by row, previews exactly what would be written, and pre-fills Current Skills
across the population. People then *correct* a list rather than author one.

Uploaded skills carry their own provenance, `pre-filled`, ranked between
`verified` and `self` and labelled as such wherever they appear. An upload only
inserts: it never deletes a skill and never overwrites one the employee edited.
Coverage is reported against the full 637 — *"627 people have no skills on file"*
is the number to drive to zero before launch, ahead of sign-ups or posts.

The same privacy caveat as the referral log applies, and harder: a skills table
read the other way is a record of what people **cannot** do.

**Seeded** (resets on reload, so the pages are not empty before there is
traffic): six requisitions on the board, eight historical referrals, the 214
impressions and 2 attributed hires in the funnel, and every part of the app v1
already seeded.

**Not real, and labelled as such in the UI:** no requisition feed from HC Connect —
the board is hand-curated. Live-promoted requisitions carry no match score,
because matching is still not wired (v1's limitation, carried forward). "Confirm
from export" is a button standing in for the monthly join. No email; the digest
that would drive `source = digest` referrals does not exist yet.

**Carried over from v1 unchanged:** no authentication — the role switcher is
still a costume, and referral rows are attributed by a display name the person
types themselves.

---

## 9. Open questions worth deciding before this goes further

1. **Privacy.** Referral rows record *which employee looked at which internal
   role*. That is meaningfully more sensitive than v1's data — an employee
   browsing roles outside their department is career-relevant information about
   them. v1's "anyone with the link sees everything" posture is not acceptable
   for this table. At minimum the referral report should be admin-only behind
   real authentication before any real employee touches it, and the retention
   period should be stated up front.
2. **Who curates the board**, and what the service-level expectation is for
   taking down a closed requisition. Until the feed exists, a stale board is the
   most likely way this loses trust.
3. **Whether managers should see their own team's referrals.** *My Team Activity*
   currently shows them. That is either a useful retention signal or a chilling
   one, and it is a policy call, not a design call.
4. **What happens to the DJI "for job consideration" path** under Policy
   211_2021, which exists precisely when an open requisition exists. That is the
   one place where the marketplace and HC Connect genuinely overlap, and v2 does not
   resolve it.
