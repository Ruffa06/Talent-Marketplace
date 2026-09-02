# v2-lean — costing and cost-benefit analysis

**Population:** 637 employees · **Horizon:** 3 years · **FX:** ₱58 = US$1 · **Discount rate:** 10%
**Recruitment system:** HC Connect Internal Job Posting (“HC Connect” throughout)
**Prepared:** 18 August 2026 · **Revised:** 2 September 2026 with IT's costed build
**Model:** [`docs/v2-cba-model.py`](v2-cba-model.py)
**Working spreadsheet:** [`docs/Growth-v2-CBA.xlsx`](Growth-v2-CBA.xlsx) — every figure below as a
live model, with the vendor comparison. Change an assumption and the case recalculates.

Supersedes the recommendation in [`docs/V2_COSTING.md`](V2_COSTING.md), which costed
v2 as originally scoped at ₱1,542,136 over three years. This document costs the
**lean** configuration and adds the benefit side.

> **Build cost, revised.** IT has now costed the man-hours at **₱1,785,500** for the
> whole build. That supersedes the ₱873,000 bottom-up planning estimate in §2, which
> is kept below only to show what moved. Every figure downstream — TCO, BCR, NPV,
> payback, the vendor multiples and the break-even — has been recalculated on IT's
> number. The build is phased ₱1,454,200 in year 1 and ₱331,300 in year 2, following
> the ship-promotion-first plan (lever A).

---

## 1. What changed, and what deliberately did not

v2 as first costed came out 39% above v1 — removing a service made the system
more expensive, because the attribution machinery cost more than the vacancy
flow it replaced. Five changes remove ₱491,761 of that without touching what
drives internal growth.

| | Change | Saves | Touches promotion? |
|---|---|---:|---|
| **B** | **Supabase-native.** Auth + RLS + Edge Functions cover SSO, authorisation and scheduled jobs. Drop the separate FastAPI service — the prototype already talks to Supabase directly. | ₱270,000 build<br>₱13,920/yr run | No |
| **C** | **Reuse the v1 design system.** All three new v2 surfaces are already designed in the prototype. Designer 2.5 → 1.5 months. | ₱66,000 | No |
| **A** | **Ship promotion in Q1, the referral engine in Q2.** Launch with the board, match scores, JD reader and a tagged outbound link; measure Q1 from the ATS source field alone. | ₱162,000 out of year 1 | No |
| **D** | **No phase 2.** Do not automate the ATS join unless referral volume justifies it. | ₱108,000 | No |
| **F** | **Reconcile quarterly, not monthly.** | ₱7,500/yr | No |
| *E* | *Claude Haiku 4.5 instead of Sonnet 5 — **held.*** Match quality **is** promotion efficiency. Worth ₱14,674/yr, but only after benchmarking on 50 real pairs. | *(excluded)* | Possibly |

### Not cut, on purpose

These are where promotion efficiency actually lives, and each is cheap:

- **Match scores on promoted requisitions** — the entire reason the board beats a
  plain HC Connect listing. Without it you have built a duplicate job board.
- **The job description on the card** — what people decide on before clicking through.
- **The "did you apply?" nudge email** (₱1,740/yr) — cheapest line in the model,
  and the thing that converts a click into a countable application.
- **The referral-log DPIA** — a legal gate, not a documentation task.
- **Recruitment's `Growth Marketplace` source field** — free to them, and the
  reason lever A is safe: it carries Q1 attribution while the engine is deferred.

---

## 2. Cost breakdown

### Year 1 build

| Item | ₱ |
|---|---:|
| Full-stack developer, 1.4 months @ ₱150k — board, matching, JD reader, handoff | 210,000 |
| Designer, 1.5 months at 50% @ ₱110k — reuses the v1 design system | 82,500 |
| PM/BA, 4 months at 30% @ ₱150k — includes recruitment-side coordination | 180,000 |
| Security review + DPA assessment + referral-log DPIA | 120,000 |
| Contingency (20%) | 118,500 |
| **Planning estimate, year 1** *(superseded)* | **₱711,000** |

### Year 2 build — the deferred referral engine

| Item | ₱ |
|---|---:|
| Full-stack developer, 0.9 months @ ₱150k — referral engine + attribution reporting | 135,000 |
| Contingency (20%) | 27,000 |
| **Planning estimate, year 2** *(superseded)* | **₱162,000** |

### Build, as costed by IT

| | ₱ |
|---|---:|
| Year 1 — promotion, matching, JD reader, handoff | 1,454,200 |
| Year 2 — the deferred referral engine | 331,300 |
| **Total build, costed by IT** | **₱1,785,500** (US$30,784) |

### Annual run

| Item | ₱/yr |
|---|---:|
| Supabase Pro + Auth (US$25/mo) | 17,400 |
| Claude API — Sonnet 5, batched | 22,065 |
| Transactional email, including the nudge | 8,700 |
| Monitoring and logging | 6,960 |
| Reconciliation — 4 hrs/quarter, PCD analyst *(year 2 onward)* | 6,000 |
| **Run** | **₱55,125** (Y1) · **₱61,125** (Y2+) |

### Totals

| | Year 1 | Year 2 | Year 3 | **3-year** | US$ | Per employee |
|---|---:|---:|---:|---:|---:|---:|
| **v2-lean, on IT's costed build** | 1,509,325 | 392,425 | 61,125 | **₱1,962,875** | $33,843 | ₱3,081 |
| *v2-lean, on our planning estimate* | *766,125* | *223,125* | *61,125* | *₱1,050,375* | *$18,110* | *₱1,649* |
| v2 as first costed | 1,291,545 | 179,295 | 71,295 | ₱1,542,136 | $26,589 | ₱2,421 |
| v1 | 990,807 | 60,807 | 60,807 | ₱1,112,420 | $19,180 | ₱1,746 |

**₱1,027 per employee per year.** On IT's costed build the lean configuration is
**27% above** v2 as first costed and **76% above** v1 — the lever savings are real,
but the build itself is roughly twice what we estimated from the outside. The case
still clears comfortably; it no longer clears on price alone.

---

## 3. Against the competition

| | 3-year | US$ | Per employee |
|---|---:|---:|---:|
| **v2-lean** | **₱1,962,875** | $33,843 | ₱3,081 |
| External platform — Gloat, Fuel50, Eightfold, Workday | ₱10.15M – ₱27.84M | $175,000 – 480,000 | ₱15,934 – ₱43,705 |

**5× – 14× cheaper.** The framing that lands in a decision forum is not the
multiple, it is the break-even: **a vendor at the low band needs 29 attributed
internal hires over three years just to cover its own licence. v2-lean needs 6.**

Vendor pricing remains a planning band derived from how enterprise HR SaaS is
structured, **not a quote** — none of these vendors publish per-seat pricing, and
at 637 seats the binding constraint is their minimum contract value rather than
the rate. Issue an RFP with the seat count stated up front and ask specifically
for minimum ACV; replace this table with real numbers before deciding.

---

## 4. Benefits

| Assumption | Value | Source |
|---|---:|---|
| Avoided agency fee per internal permanent fill | ₱350,000 | v1 business case |
| Loaded annual salary, population average | ₱480,000 | planning assumption |
| Full replacement cost (recruitment + ramp + lost output) | ₱360,000 | 75% of salary |
| Vacancy days saved per internal fill | 37 | 21 days internal vs 58 external |
| Gig / DJI / service-offer participants per year | 120 | 19% of population |
| Retention lift among participants | **3 points** | **see below** |

Two streams, and they are **not** equally defensible:

**Attributed** — avoided agency fees and vacancy days on permanent roles. These
exist *only because of the tracking spend*: without a confirmed referral the
hire is invisible in your data and belongs, as far as anyone can tell, to HC Connect.

| Scenario | Attributed hires/yr | Agency fees | Vacancy days | Total |
|---|---:|---:|---:|---:|
| Conservative | 2 | ₱700,000 | ₱136,615 | ₱836,615 |
| Base | 4 | ₱1,400,000 | ₱273,231 | ₱1,673,231 |
| Optimistic | 7 | ₱2,450,000 | ₱478,154 | ₱2,928,154 |

**Owned** — retention among gig, DJI and service-offer participants. Needs no
attribution at all, because the marketplace runs those end to end.
120 participants × 3pt × ₱360,000 = **₱1,296,000/yr**.

> **On the retention lift — read this before quoting the number.** The v1
> dashboard shows 94% retention among participants against an 81% company
> average. That 13-point gap is almost certainly **selection bias**: engaged
> people who were never going to leave are the ones who volunteer for a gig.
> The 3 points used here is a heavily discounted judgement, not a measurement.
> It is the single softest input in this document, which is why §5 reports the
> whole analysis with it excluded.

**Deliberately excluded:** the value of gig output itself (work delivered that
would otherwise need a contractor), skills built, and cross-functional network
effects. All real, none reliably measurable, none needed to make the case.

---

## 5. Cost-benefit analysis

Year 1 benefit is ramped to 40% for the build period and adoption curve. Payback
assumes build spend lands in months 1–3 with no benefit until month 4.

| Scenario | 3-yr benefit | 3-yr cost | Net | BCR | NPV @10% | Payback |
|---|---:|---:|---:|---:|---:|---:|
| Conservative — 2 hires/yr | ₱5,118,277 | ₱1,962,875 | ₱3,155,402 | 2.6 | ₱2,397,898 | 18 mo |
| **Base — 4 hires/yr** | **₱7,126,154** | **₱1,962,875** | **₱5,163,279** | **3.6** | **₱4,022,101** | **15 mo** |
| Optimistic — 7 hires/yr | ₱10,137,969 | ₱1,962,875 | ₱8,175,094 | 5.2 | ₱6,458,406 | 12 mo |
| *Base, retention excluded entirely* | ₱4,015,754 | ₱1,962,875 | ₱2,052,879 | 2.0 | ₱1,506,050 | 21 mo |
| *Retention only, zero vacancy hires* | ₱3,110,400 | ₱1,962,875 | ₱1,147,525 | 1.6 | ₱773,695 | 25 mo |

**The case survives the removal of either benefit stream.** Strip retention out
entirely — the softest input — and it is still BCR 2.0, payback 21 months. Strip
out every vacancy hire instead and retention alone repays the three-year TCO in
1.5 years. Both halves would have to be wrong simultaneously for this to fail.

**Break-even is 1.9 attributed hires per year** — roughly two internal fills out
of the ~60 internal requisitions opened annually, or a 3.1% hit rate.

---

## 6. Risks to the case

| Risk | Effect | Mitigation |
|---|---|---|
| **Recruitment declines the `Growth Marketplace` source field** | Every attributed peso becomes unprovable, and lever A's Q1 measurement disappears. BCR falls to the retention-only row (1.6). | Secure it **before** committing to the build. It is a form configuration change, not an integration — the single highest-leverage ask in the programme. |
| **Retention lift is zero** | Benefits fall to the attributed rows. Still BCR 2.0. | Already modelled. Run the holdout in `V2_EXPLORATION.md` §7 to measure it properly. |
| **Adoption below 120 participants/yr** | Retention benefit scales linearly — 60 participants halves it to ₱648,000/yr. | Case still clears at BCR ~5 in the base scenario. |
| **DPO blocks the referral log** | The whole attribution tier is unavailable. | Gating item — get the position before build, not after. Retention benefits are unaffected. |
| **Build overruns by half** | 3-yr TCO ≈ ₱2.86M. BCR base falls to 2.5. | Still clears; still 3.5×–10× under the vendor bands. |
| **FX to ₱65/US$** | Run costs rise slightly; the build is peso-denominated. Vendor bands move proportionally. | Conclusion unchanged. |

**Excluded and material, as in v1:** ongoing internal ownership from year 2.
Budget 0.2–0.3 FTE (₱360k–₱540k/yr fully loaded) before comparing against a
vendor whose support SLA is contractual. At 0.25 FTE the three-year cost is ₱3.31M and the
base-case BCR falls from 3.6 to roughly 2.2 — still a clear yes, but it is the
most under-estimated line in any build-vs-buy and should not be left out of the paper.

---

## 7. Recommendation

1. **Build v2-lean.** ₱1,509,325 in year 1 and ₱1,962,875 over three years on IT's
   costed build, base-case BCR 3.6 with a 15-month payback. The case clears every
   stress scenario in §5, including the one that deletes the retention benefit outright.
2. **Get the source field committed first.** It is free, it carries Q1
   attribution on its own, and without it the attributed half of the case
   evaporates. Do not start the build until recruitment has agreed.
3. **Ship promotion in Q1, the referral engine in Q2.** If a budget review falls
   inside Q1, build the engine up front instead — ₱162,000 is cheap next to
   arriving with nothing to show.
4. **Decide phase 2 on year-1 data.** Automate the ATS join only if referral
   volume justifies ₱108,000. Assume it does not until it does.
5. **Re-run the benefit side once real data exists.** Everything in §4 is a
   planning assumption. The pilot replaces them with measurements within two
   quarters, and the holdout replaces the causal claim within three.
