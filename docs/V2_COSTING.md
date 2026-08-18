# Costing — v2 against v1, 637-employee pilot

**Compares:** v1.0 (`07e848e`, live) against the v2 exploration on
`claude/talent-marketplace-v2-explore-kps8k8`
**Population:** 637 employees · **Horizon:** 3 years · **Prepared:** 18 August 2026

Every figure here is derived by [`docs/v2-costing-model.py`](v2-costing-model.py) — run it to
re-derive them or to test a changed assumption.

> **Superseded recommendation.** This document costs v2 **as originally scoped**,
> at ₱1,542,136 over three years — 39% above v1. [`docs/V2_CBA.md`](V2_CBA.md)
> costs the **lean** configuration at **₱1,050,375**, which is 6% *below* v1, and
> adds the benefit side. The analysis below is still the reference for where v2's
> money goes and why; take the lean figures and the recommendation from the CBA.

Companion to [`docs/COSTING.md`](COSTING.md), which costs v1 on its own and
carries the full build-vs-buy comparison. This document only prices the
difference and re-tests the conclusions against it. Every v1 figure below is
reproduced from that document's own assumptions, not re-estimated.

---

## Read this first

**The headline is counterintuitive and it is not a mistake: v2 costs more than
v1, not less.** Removing a service made the system more expensive.

The reason is structural. v1 owned the whole vacancy funnel, so measuring it was
free — the data was already in the database. v2 gives that funnel to Careers and
keeps only the top of it, which means the outcome now sits in someone else's
system and has to be *tracked, handed off, self-reported and reconciled* to be
claimable at all. **The referral machinery costs more to build than the vacancy
flow it replaced.**

That is the honest trade, and it is worth stating plainly to whoever signs this
off: v2 is not a cost optimisation. It is what the marketplace has to look like
when a separate system already owns internal recruitment, and the extra
₱429,716 over three years is what it costs to still be able to prove the
marketplace did anything for vacancies.

**Firm / not firm** is unchanged from v1: the Claude API and cloud figures are
list prices against stated assumptions; the build effort and the reconciliation
labour are planning estimates at Philippine market rates. **FX: ₱58 = US$1.**

---

## 1. Side by side — the whole picture

| | **v1** | **v2** (phased) | Δ |
|---|---:|---:|---:|
| Build, year 1 | ₱930,000 | ₱1,209,000 | +₱279,000 |
| Build, year 2 (ATS feed) | — | ₱108,000 | +₱108,000 |
| Annual run | ₱60,807 | ₱82,545 → ₱71,295 | +₱10,488 to +₱21,738 |
| **Year 1 total** | **₱990,807** | **₱1,291,545** | **+₱300,738** |
| **3-year TCO** | **₱1,112,420** | **₱1,542,136** | **+₱429,716** |
| 3-year TCO (US$) | $19,180 | $26,589 | +$7,409 |
| Per employee, 3 years | ₱1,746 | ₱2,421 | +₱675 |
| Per employee, per year | ₱582 | ₱807 | +₱225 |

v2 is **+39%** over three years. It remains **7×–18× cheaper** than the external
platform bands in `COSTING.md` (US$175,000–480,000), so the build-vs-buy
conclusion is unchanged and not close.

---

## 2. Claude API — the matching workload *grows*

The second counterintuitive result. Dropping vacancies from the marketplace does
not reduce the scoring workload, it increases it — because the promoted board
carries **every open requisition in Careers**, and that is more roles than were
ever posted in the marketplace by hand.

| Driver | v1 | v2 | Why |
|---|---:|---:|---|
| Employees | 637 | 637 | — |
| Live opportunities scored | 40 | **52** | 27 in-app + 25 promoted requisitions |
| — of which posted in-app | 40 | 27 | Vacancies were ~32% of the v1 board mix |
| — of which promoted from Careers | — | 25 | The ATS holds reqs nobody bothered to cross-post |
| New / changed per month | 15 | 22 | 10 in-app + 12 requisitions; reqs turn over faster |
| Profile updates per month | 100 | 100 | — |
| Pre-filter retention | 40% | 40% | — |
| Tokens per call | 1,500 in / 250 out | same | — |
| **Backfill pairs** | **10,192** | **13,250** | +30% |
| **Pairs per month** | **5,422** | **7,686** | **+42%** |

### Cost by model — list price, Anthropic first-party API

| Model | $/1M in | $/1M out | Backfill v1 | Backfill v2 | **Annual v1** | **Annual v2** | Δ/yr |
|---|---:|---:|---:|---:|---:|---:|---:|
| Claude Haiku 4.5 | $1 | $5 | $28 | $36 | **$89** | **$127** | +$37 |
| Claude Sonnet 5 | $3 | $15 | $84 | $109 | **$268** | **$380** | +$112 |
| Claude Opus 5 | $5 | $25 | $140 | $182 | **$447** | **$634** | +$187 |

Annual figures use the Batch API (50% of list). Matching is not
latency-sensitive — a score that appears within the hour is fine — so batching
is the default and roughly halves the bill.

**Finding, unchanged from v1: AI cost is immaterial.** A 42% workload increase
moves the annual bill by US$112 on Sonnet 5. Even Opus 5 unbatched stays near
US$1,300 a year for the whole pilot. Choose the model on match quality; the
three-year spread across all three models is under US$1,600.

> **Sonnet 5 pricing note.** Sonnet 5 currently carries introductory pricing of
> $2/$10 per MTok through 31 August 2026, thirteen days from this document's
> date. Everything above uses the standard $3/$15, which is the right basis for
> a three-year horizon — do not budget on the intro rate.

Prompt caching on the system prompt is still not modelled and would reduce all
of these further.

---

## 3. Build — line by line

### v1 (from `COSTING.md`)

| Item | ₱ |
|---|---:|
| Full-stack developer, 3 months @ ₱150k | 450,000 |
| Designer, 2 months at 50% @ ₱110k | 110,000 |
| PM/BA, 3 months at 30% @ ₱150k | 135,000 |
| Security review + Data Privacy Act assessment | 80,000 |
| Contingency (20%) | 155,000 |
| **Total** | **₱930,000** (US$16,034) |

### v2 phase 1 — the marketplace plus referral attribution, no ATS integration

| Item | ₱ | Change from v1 |
|---|---:|---|
| Full-stack developer, 3.8 months @ ₱150k | 570,000 | +0.8 months net |
| Designer, 2.5 months at 50% @ ₱110k | 137,500 | +0.5 months — three new surfaces |
| PM/BA, 4 months at 30% @ ₱150k | 180,000 | +1 month — recruitment-side coordination |
| Security review + DPA assessment + referral-log DPIA | 120,000 | +₱40,000 |
| Contingency (20%) | 201,500 | |
| **Total** | **₱1,209,000** (US$20,845) | **+₱279,000** |

The developer line nets out as follows:

| Scope | Months | ₱ |
|---|---:|---:|
| *Removed* — vacancy posting, vacancy applications, applicant screening, vacancy decisions, Recruiter role and its authorisation | −0.4 | −60,000 |
| Vacancy board + promoted-requisition curation | +0.3 | +45,000 |
| Referral engine — codes, click log, view log, self-report, dedup, 30-day attribution window | +0.5 | +75,000 |
| Attribution reporting, CSV export, reconciliation join | +0.4 | +60,000 |
| **Net** | **+0.8** | **+₱120,000** |

**This table is the whole argument.** Deleting the vacancy flow saves 0.4
developer-months. Building the machinery that lets you count what you gave away
costs 1.2. The DPIA increment is separate and non-negotiable: `v2_vacancy_referrals`
records which employee looked at which internal role, which is materially more
sensitive processing than anything v1 held.

### v2 phase 2 — automate the join (deferrable)

| Item | ₱ |
|---|---:|
| Full-stack developer, 0.6 months — nightly requisition feed + `application.created` webhook | 90,000 |
| Contingency (20%) | 18,000 |
| **Total** | **₱108,000** (US$1,862) |

Phase 2 replaces the hand-curated board with a feed, and the monthly manual
reconciliation with automatic confirmation. It is worth building **only once
referral volume proves it** — see §6.

---

## 4. Annual run

| Item | v1 ₱/yr | v2 phase 1 ₱/yr | v2 phase 2 ₱/yr |
|---|---:|---:|---:|
| Supabase Pro (US$25/mo) | 17,400 | 17,400 | 17,400 |
| API hosting (US$20/mo) | 13,920 | 13,920 | 13,920 |
| Claude API — Sonnet 5, batched | 15,567 | 22,065 | 22,065 |
| Transactional email | 6,960 | 8,700 | 8,700 |
| Monitoring and logging | 6,960 | 6,960 | 6,960 |
| **Monthly reconciliation — PCD analyst** | — | **13,500** | **2,250** |
| **Total** | **₱60,807** | **₱82,545** | **₱71,295** |
| US$ | $1,048 | $1,423 | $1,229 |

Two lines move and one is new.

**Email** rises because v2 adds the "did you apply?" nudge — the one-tap
follow-up that converts a referral click into a self-reported application. It is
the cheapest line in this document and it is load-bearing: without it the funnel
stops at "we sent them" and the self-reported tier disappears.

**Reconciliation labour is the genuinely new operating cost, and the one most
likely to be forgotten.** Three hours a month of a PCD analyst — pull the
referral export, pull the Careers export, join on referral code, mark the
matches — at ₱375/hour fully loaded (₱60,000/month ÷ 160 hours). Phase 2 cuts it
to a half-hour spot-check.

**Storage is not a concern.** The view log is throttled to one row per person,
per requisition, per day. At 30% monthly active on the vacancy board, two visits
a month and eight roles visible, that is roughly 3,000 rows a month — about
36,000 a year. Supabase Pro absorbs it without a tier change, and it is worth
saying so explicitly because "you're logging every page view" is the first
objection this design attracts.

---

## 5. Three-year TCO — four scenarios

| | Year 1 | Year 2 | Year 3 | **3-year** | US$ | Per employee |
|---|---:|---:|---:|---:|---:|---:|
| **v1** | 990,807 | 60,807 | 60,807 | **₱1,112,420** | $19,180 | ₱1,746 |
| **v2 — phase 1 only** | 1,291,545 | 82,545 | 82,545 | **₱1,456,636** | $25,114 | ₱2,287 |
| **v2 — phased** (recommended) | 1,291,545 | 179,295 | 71,295 | **₱1,542,136** | $26,589 | ₱2,421 |
| **v2 — both phases up front** | 1,388,295 | 71,295 | 71,295 | **₱1,530,886** | $26,395 | ₱2,403 |

### Why phased, when it costs ₱11,250 more

Building both phases now is 0.7% cheaper over three years than deferring the
feed. **Pay the ₱11,250.** It buys a year of evidence and the right to cancel
phase 2 outright — which saves ₱85,500 if referral volume turns out not to
justify automating the join. A 0.7% premium for a real option on a ₱108,000
decision is a good trade, and it is the same logic that made running the v1
pilot before an RFP the right call.

---

## 6. What v2 has to deliver to pay for itself

At ₱350,000 avoided agency fee per internally-filled permanent role — the
assumption already used in the v1 business case:

| | 3-year TCO | Attributed hires to break even | Per year |
|---|---:|---:|---:|
| v1 | ₱1,112,420 | 3.2 | 1.1 |
| v2 (phased) | ₱1,542,136 | **4.4** | **1.5** |

Roughly one and a half attributed vacancy hires a year. That is a low bar, and
the funnel shape in the prototype clears it comfortably — but note the word
**attributed**. It is doing all the work in that sentence.

**This is the case for the ₱429,716.** Under v2, an internal hire that the
marketplace surfaced is invisible in your own data by default: the application,
the screening and the offer all happen in Careers, and nothing there says the
person came from here. Spend the money on the marketplace and skip the
attribution machinery, and you get the benefit without any way to demonstrate
it — which, at the next budget review, is indistinguishable from not getting it.

The corollary is uncomfortable and should be said out loud: **v2's claimable
benefit is smaller than v1's, even as its cost is higher.** v1's business case
claimed 12 internal placements and ₱4.2M avoided. Under v2 most of that belongs
to Careers. What Growth can claim is the gig, DJI and service-offer activity it
owns end to end, plus a *confirmed referral share* of vacancy outcomes. Re-run
the benefit side of `BUSINESS_CASE.md` on that basis before this goes anywhere
near a decision forum — do not carry v1's benefit numbers into a v2 paper.

---

## 7. Sensitivities

| Change | Effect on v2 3-year TCO | Read |
|---|---:|---|
| **Recruitment refuses to add the source field** (reconciliation by name-matching, 8 hrs/mo) | ₱1,609,636 (+₱67,500) | The cost is the smaller half of the damage. Name-matching also collapses the confirmed rate, which is the only tier fit for a board paper. **This is the single highest-leverage ask in the whole programme, and it is a form configuration change, not an integration.** |
| **Cancel phase 2** (never automate) | ₱1,456,636 (−₱85,500) | Correct call if referrals stay under ~50/quarter. Decide on year-1 data. |
| FX moves to ₱65/US$ | ₱1,728,256 (+12%) | Vendor bands move proportionally. Conclusion unchanged. |
| 0.25 FTE internal ownership from year 2 | ₱1,992,136 (+₱450,000) | Still 5×–14× cheaper than the vendor bands. Same under-estimated line as in v1 — include it before comparing. |
| Build effort doubles | ≈ ₱2.85M (US$49k) | Still 4×–10× cheaper than buying. |
| Population grows to 5,000 | Matching ≈ 8× (still under US$3k/yr) | Reconciliation labour scales with *referral volume*, not headcount — but it does scale, and at this size phase 2 stops being optional. Revisit vendor economics too. |

---

## 8. Reducing the cost

Five changes take v2 from ₱1,542,136 to **₱1,050,375** over three years without
altering what drives internal growth — the board, the match scores and the job
descriptions are untouched. They are set out with the benefit case in
[`docs/V2_CBA.md`](V2_CBA.md): Supabase-native instead of a separate API service
(₱270,000), reusing the v1 design system (₱66,000), deferring the referral engine
to Q2 (₱162,000 out of year 1), cancelling phase 2 (₱108,000), and quarterly
rather than monthly reconciliation (₱7,500/yr).

---

## 9. What must be validated before this goes to a decision forum

Carrying forward from `COSTING.md` — the developer rate card, the maintenance
FTE, real vendor quotes, and whether your HRIS already bundles a marketplace
module all still apply. v2 adds four:

1. **Whether recruitment will add a `Growth Marketplace` source value and a
   referral-code field to the Careers application form.** Everything in §6
   depends on it. Get the answer before committing to the build, not after —
   if it is no, the attribution tier you can actually defend is much weaker and
   the ₱429,716 needs re-justifying.
2. **How many internal requisitions are open at a time.** The whole §2 workload
   rests on 25 promoted roles. Ask recruitment for the actual figure; it is a
   number they already have, and it moves the only line here that scales.
3. **Who owns the monthly reconciliation, and whether three hours a month exists
   in their week.** An unowned reconciliation silently becomes a zero — and a
   zero here means the funnel stops at self-reported, permanently.
4. **The Data Privacy Act position on the referral log specifically.** v1's
   assessment does not cover it. `v2_vacancy_referrals` records which employee
   viewed and clicked through to which internal role — career-relevant personal
   information about identifiable staff. Retention period, access control and
   lawful basis all need a DPO position before a single real employee touches
   it, and that is a gating item, not a documentation task.
