# v2-lean — costing and cost-benefit analysis

**Population:** 1,113 employees — the 637-person pilot in IT, Operations and HR, plus
476 in mass operations · **Horizon:** 3 years · **FX:** ₱61 = US$1 · **Discount rate:** 10%
**Recruitment system:** HC Connect Internal Job Posting (“HC Connect” throughout)
**Prepared:** 18 August 2026 · **Revised:** 8 September 2026 — costed at 1,113, FX ₱61
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
> the ship-promotion-first plan (lever A). It is peso labour: it does not move with
> the exchange rate, and it does not move with the population either.
>
> **Scope and rate, revised.** The case is now made at **1,113 people** — the pilot plus
> mass operations, which joins in wave two inside year one — and at **₱61 = US$1**.
> Four of the five run lines are bought in dollars, so the weaker peso raises the cost
> of running this; §7 gives the totals at every population under consideration.

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

At 1,113 people. Everything but the analyst is bought in dollars.

| Item | Basis | ₱/yr |
|---|---|---:|
| Supabase Pro + Auth | US$25/mo | 18,300 |
| Claude API — Sonnet 5, batched | US$380/yr at 637, scales with headcount | 40,544 |
| Transactional email, including the nudge | US$150/yr at 637, scales with headcount | 15,987 |
| Monitoring and logging | US$120/yr | 7,320 |
| Reconciliation — 6 hrs/quarter, HR analyst *(year 2 onward)* | ₱375/hr | 9,000 |
| **Run** | | **₱82,151** (Y1) · **₱91,151** (Y2+) |

### Totals

| | Year 1 | Year 2 | Year 3 | **3-year** | US$ | Per employee/yr |
|---|---:|---:|---:|---:|---:|---:|
| **v2-lean at 1,113 — the costed case** | 1,536,351 | 422,451 | 91,151 | **₱2,049,953** | $33,606 | **₱614** |
| v2-lean at 637 — pilot only | 1,512,174 | 395,274 | 63,974 | ₱1,971,422 | $32,318 | ₱1,032 |
| *v2-lean at 637, on our planning estimate* | *768,974* | *225,974* | *63,974* | *₱1,058,922* | *$17,359* | *₱554* |
| v2 as first costed, at 637 | — | — | — | ₱1,542,136 | $25,281 | ₱807 |
| v1, at 637 | — | — | — | ₱1,112,420 | $18,236 | ₱582 |

**₱614 per employee per year.** Adding mass operations costs **₱78,531** over three
years — 4% more money for 75% more people, because the build does not move. Compared
like for like at 637, the lean configuration on IT's costed build is **28% above** v2
as first costed and **77% above** v1: the lever savings are real, but the build itself
is roughly twice what we estimated from the outside. The case still clears
comfortably; it no longer clears on price alone.

---

## 3. Against the competition

| | 3-year | US$ | Per employee |
|---|---:|---:|---:|
| **v2-lean at 1,113** | **₱2,049,953** | $33,606 | ₱1,842 |
| External platform — Gloat, Fuel50, Eightfold, Workday | ₱10.68M – ₱29.28M | $175,000 – 480,000 | ₱9,591 – ₱26,307 |

**5× – 14× cheaper.** The vendor bands are quoted in dollars, so they rose with the
exchange rate exactly as our run lines did; the multiple is unchanged. The framing
that lands in a decision forum is not the multiple, it is the break-even: **a vendor
at the low band needs 30 attributed internal hires over three years just to cover its
own licence. v2-lean needs 6.**

Vendor pricing remains a planning band derived from how enterprise HR SaaS is
structured, **not a quote** — none of these vendors publish per-seat pricing, and
at 1,113 seats the binding constraint is their minimum contract value rather than
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
| Gig / DJI / service-offer participants per year | 120 non-mass + 54 mass ops | 19% of non-mass, 11% of mass ops |
| Retention lift among participants | **3 points** | **see below** |
| Loaded annual salary, mass operations | ₱260,000 | **assumption — confirm with HR** |
| Mass-operations participation, relative to non-mass | 60% | **assumption — shift roles** |

Two streams, and they are **not** equally defensible:

**Attributed** — avoided agency fees and vacancy days on permanent roles. These
exist *only because of the tracking spend*: without a confirmed referral the
hire is invisible in your data and belongs, as far as anyone can tell, to HC Connect.

| Scenario | Attributed hires/yr | Agency fees | Vacancy days | Total |
|---|---:|---:|---:|---:|
| Conservative | 2 | ₱700,000 | ₱136,615 | ₱836,615 |
| Base | 4 | ₱1,400,000 | ₱273,231 | ₱1,673,231 |
| Optimistic | 7 | ₱2,450,000 | ₱478,154 | ₱2,928,154 |

Attributed hires are **not** scaled up for mass operations. Those roles are hired in
volume without an agency, so claiming an avoided agency fee on them would not survive
a challenge. The 2 / 4 / 7 scenarios stay anchored on the 637 non-mass population.

**Owned** — retention among gig, DJI and service-offer participants. Needs no
attribution at all, because the marketplace runs those end to end.

| | Participants | Replacement cost | Retention benefit |
|---|---:|---:|---:|
| Non-mass | 120 | ₱360,000 | ₱1,296,000/yr |
| Mass operations | 54 | ₱195,000 | ₱314,743/yr |
| **Total at 1,113** | **174** | | **₱1,610,743/yr** |

> **The two mass-operations assumptions.** A ₱260,000 loaded salary and a 60%
> relative participation rate are both judgements, not HR figures. They are worth
> ₱314,743 a year between them. §5 reports the case with mass-operations benefit
> removed entirely — BCR 3.5 — so nothing in the recommendation rests on either.

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
| Conservative — 2 hires/yr | ₱5,873,660 | ₱2,049,953 | ₱3,823,707 | 2.9 | ₱2,936,996 | 17 mo |
| **Base — 4 hires/yr** | **₱7,881,537** | **₱2,049,953** | **₱5,831,584** | **3.8** | **₱4,561,199** | **14 mo** |
| Optimistic — 7 hires/yr | ₱10,893,352 | ₱2,049,953 | ₱8,843,399 | 5.3 | ₱6,997,504 | 11 mo |
| *Base, retention excluded entirely* | ₱4,015,754 | ₱2,049,953 | ₱1,965,801 | 2.0 | ₱1,434,107 | 22 mo |
| *Retention only, zero vacancy hires* | ₱3,865,783 | ₱2,049,953 | ₱1,815,830 | 1.9 | ₱1,312,793 | 22 mo |
| *Base, mass-operations benefit excluded* | ₱7,126,154 | ₱2,049,953 | ₱5,076,201 | 3.5 | ₱3,950,158 | 15 mo |

**The case survives the removal of either benefit stream.** Strip retention out
entirely — the softest input — and it is still BCR 2.0, payback 22 months. Strip
out every vacancy hire instead and retention alone repays the three-year TCO in
1.3 years. Delete every peso claimed for mass operations while still paying to
cover them and it is 3.5. Both halves would have to be wrong simultaneously for
this to fail.

**Break-even is 2.0 attributed hires per year** — roughly two internal fills out
of the ~60 internal requisitions opened annually, or a 3.3% hit rate. The 60 is a
planning assumption from the BRD, scoped to the pilot; if requisitions scale with the
larger population the denominator grows and the required hit rate falls further.

---

## 6. Risks to the case

| Risk | Effect | Mitigation |
|---|---|---|
| **Recruitment declines the `Growth Marketplace` source field** | Every attributed peso becomes unprovable, and lever A's Q1 measurement disappears. BCR falls to the retention-only row (1.6). | Secure it **before** committing to the build. It is a form configuration change, not an integration — the single highest-leverage ask in the programme. |
| **Retention lift is zero** | Benefits fall to the attributed rows. Still BCR 2.0. | Already modelled. Run the holdout in `V2_EXPLORATION.md` §7 to measure it properly. |
| **Adoption below 174 participants/yr** | Retention benefit scales linearly — halving participation costs ₱805,000/yr. | Case still clears at BCR ~2.9 in the base scenario. |
| **DPO blocks the referral log** | The whole attribution tier is unavailable. | Gating item — get the position before build, not after. Retention benefits are unaffected. |
| **Build overruns by half** | 3-yr TCO ≈ ₱2.94M. BCR base falls to 2.7. | Still clears; still 3.6×–10× under the vendor bands. |
| **FX to ₱68/US$** | Four of five run lines are bought in dollars: run rises ~11%, about ₱10,000/yr. The build is peso labour and does not move, and the vendor bands rise with it. | Conclusion unchanged. |
| **The two mass-operations assumptions are wrong** | Retention benefit falls ₱314,743/yr. BCR 3.5. | Already modelled as a row in §5. Ask HR for mass-ops loaded salary and shift-participation data before wave two. |

**Excluded and material, as in v1:** ongoing internal ownership from year 2.
Budget 0.2–0.3 FTE (₱360k–₱540k/yr fully loaded) before comparing against a
vendor whose support SLA is contractual. At 0.25 FTE the three-year cost is ₱3.40M and the
base-case BCR falls from 3.8 to roughly 2.3 — still a clear yes, but it is the
most under-estimated line in any build-vs-buy and should not be left out of the paper.

---

## 7. Every population under consideration

The build is bought once. It does not change with headcount, so each larger scope
adds run cost only — and the run lines scale by what actually drives them: Claude
and email by headcount, Supabase by tier, monitoring by log volume, reconciliation
by referral volume rather than by people.

| Scope | People | Year 1 | Year 2 | Year 3 | **3-year total** | US$ | Per employee/yr | BCR |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Pilot — IT, Operations, HR | 637 | 1,512,174 | 395,274 | 63,974 | ₱1,971,422 | $32,318 | ₱1,032 | 3.6 |
| **Pilot + mass operations** | **1,113** | **1,536,351** | **422,451** | **91,151** | **₱2,049,953** | **$33,606** | **₱614** | **3.8** |
| All non-mass | 1,991 | 1,580,946 | 470,046 | 138,746 | ₱2,189,738 | $35,897 | ₱367 | 10.4 |
| Full organisation | 20,587 | 2,576,712 | 1,513,812 | 1,182,512 | ₱5,273,036 | $86,443 | ₱85 | 9.9 |

**₱1,785,500 of build is 91% of the pilot's three-year cost and 34% of the full
organisation's.** Going from 1,113 to all 1,991 non-mass people adds ₱139,785 over
three years — **₱53 per extra employee per year**. That is the argument for approving
the build on a pilot: the asset is bought once and every wave after it is nearly free.

Two cautions on the wider scopes, before anyone quotes them:

- **The ratio jump at 1,991 is the least tested number here.** It assumes attributed
  hires scale linearly with the non-mass population while the build does not move at
  all. The direction is right; the magnitude is untested, which is why the
  recommendation is made at 1,113.
- **The full-organisation column is software cost only.** At 20,587 the binding
  constraint stops being infrastructure and becomes rollout, enablement and HR
  capacity, none of which is in that row — and the value case for mass roles needs
  re-testing on its own terms before anyone commits to it.

---

## 8. Recommendation

1. **Build v2-lean.** ₱1,536,351 in year 1 and ₱2,049,953 over three years at 1,113
   people on IT's costed build, base-case BCR 3.8 with a 14-month payback. The case
   clears every stress scenario in §5, including the one that deletes the retention
   benefit outright and the one that deletes every peso claimed for mass operations.
2. **Get the source field committed first.** It is free, it carries Q1
   attribution on its own, and without it the attributed half of the case
   evaporates. Do not start the build until recruitment has agreed.
3. **Ship promotion in Q1, the referral engine in Q2.** If a budget review falls
   inside Q1, build the engine up front instead — ₱162,000 is cheap next to
   arriving with nothing to show.
4. **Decide phase 2 on year-1 data.** Automate the ATS join only if referral
   volume justifies ₱108,000. Assume it does not until it does.
5. **Get mass-operations salary and participation data before wave two.** Two
   assumptions in §4 are carrying ₱314,743 a year between them. They are not load-
   bearing, but they should be measured rather than argued.
6. **Re-run the benefit side once real data exists.** Everything in §4 is a
   planning assumption. The pilot replaces them with measurements within two
   quarters, and the holdout replaces the causal claim within three.
