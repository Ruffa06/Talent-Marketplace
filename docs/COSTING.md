# Costing — 637-employee pilot

**Version:** v1.0 (`07e848e`) · **Prepared:** 18 August 2026
**Population:** 637 employees · **Horizon:** 3 years

---

## Read this first

Two of the numbers below are firm and two are not.

**Firm:** the Claude API cost and the cloud infrastructure cost. Both are
published list prices and the workload is calculated from stated assumptions
you can challenge line by line.

**Not firm:** the build effort and the external-platform pricing. Build effort
is a planning estimate at Philippine market rates — validate against your own
rate card. External vendor pricing, including Gloat's, **is not published**;
the bands here are placeholders for an RFP, not quotes. Do not present them as
vendor figures.

**FX assumption:** ₱58 = US$1. Verify before circulating; a 10% move shifts
every peso figure by 10%.

---

## 1. Claude API — the AI matching workload

### Workload model

| Driver | Assumption |
|---|---|
| Employees | 637 |
| Live opportunities at steady state | 40 |
| New or materially changed opportunities per month | 15 |
| Employees updating their profile per month | 100 |
| Keyword pre-filter retention | 40% of pairs reach the model |
| Tokens per scoring call | ~1,500 in / ~250 out |

This yields **10,192 pairs** for the initial backfill and **5,422 pairs per
month** at steady state.

### Cost by model (list price, Anthropic first-party API)

| Model | $/1M in | $/1M out | Backfill (one-off) | Monthly | Monthly (Batch API) | **Annual (batched)** |
|---|---|---|---|---|---|---|
| Claude Haiku 4.5 | $1 | $5 | $28 | $15 | $7 | **$89** |
| Claude Sonnet 5 | $3 | $15 | $84 | $45 | $22 | **$268** |
| Claude Opus 5 | $5 | $25 | $140 | $75 | $37 | **$447** |

The Batch API runs asynchronously at 50% of list price. Matching is not
latency-sensitive — a score that appears within the hour is fine — so batching
should be the default and roughly halves the bill.

**Finding: AI cost is immaterial.** Even on Opus 5 without batching, matching
costs under US$900 a year for the whole pilot — about ₱82 per employee per
year. Model choice should be driven by match quality, not cost. Prompt caching
on the system prompt would reduce this further and is not modelled.

> **Note on the current code.** `backend/routers/matches.py` pins
> `claude-sonnet-4-6`. That model is still current, but for this workload
> **Claude Haiku 4.5 is the better default** — scoring against a rubric is a
> constrained task. Benchmark Haiku 4.5 against Sonnet 5 on 50 real pairs
> before committing; the cost difference over three years is under US$600
> either way, so pick on quality.

---

## 2. Option A — build in-house

Builds on what already exists: v1 is complete and the FastAPI backend already
implements the required endpoints.

### One-off build

| Item | Cost (₱) |
|---|---|
| Full-stack developer, 3 months @ ₱150k | 450,000 |
| Designer, 2 months at 50% @ ₱110k | 110,000 |
| PM/BA, 3 months at 30% @ ₱150k | 135,000 |
| Security review + Data Privacy Act assessment | 80,000 |
| Contingency (20%) | 155,000 |
| **Build subtotal** | **₱930,000** (US$16,034) |

Scope covered: SSO, real persistence for all flows, HRIS profile import, email
notifications, admin reporting, penetration test remediation.

### Annual run

| Item | Cost (₱/yr) |
|---|---|
| Supabase Pro (US$25/mo) | 17,400 |
| API hosting (US$20/mo) | 13,920 |
| Claude API — Sonnet 5, batched | 15,567 |
| Transactional email | 6,960 |
| Monitoring and logging | 6,960 |
| **Run subtotal** | **₱60,807** (US$1,048) |

### Totals

| | ₱ | US$ | Per employee (₱) |
|---|---|---|---|
| Year 1 | 990,807 | 17,083 | 1,555 |
| Year 2+ (per year) | 60,807 | 1,048 | 95 |
| **3-year TCO** | **1,112,420** | **19,180** | **1,746** |

**Excluded, and material:** ongoing internal ownership. Budget 0.2–0.3 FTE for
maintenance, support and enhancements from year 2 — roughly ₱360k–₱540k a year
fully loaded. Include it before comparing; it roughly quadruples the year-2 run
cost and is the single most under-estimated line in build-vs-buy.

---

## 3. Option B — external platform (Gloat and peers)

### Pricing is not public

Gloat, Fuel50, Eightfold and Workday Talent Marketplace do not publish per-seat
pricing. Everything below is a **planning band for an RFP**, derived from how
enterprise HR SaaS is typically structured — not from any quote.

**The dominant factor at 637 seats is the vendor's minimum contract value, not
the per-seat rate.** Enterprise talent marketplace vendors are built for
10,000+ seat deployments. A published rate of, say, US$20 per employee per year
would imply US$12,740 for your population — well below the floor most vendors
will contract at. Expect the minimum to bind, which makes the effective
per-employee cost several times the headline rate.

| Component | Indicative band (US$) |
|---|---|
| Annual licence — minimum ACV likely binding | 50,000 – 120,000 |
| Implementation / onboarding (one-off) | 25,000 – 100,000 |
| HRIS + SSO integration services | 0 – 20,000 |

| | US$ | ₱ | Per employee (₱) |
|---|---|---|---|
| Year 1 | 75,000 – 240,000 | 4.35M – 13.92M | 6,829 – 21,852 |
| Year 2+ (per year) | 50,000 – 120,000 | 2.90M – 6.96M | 4,553 – 10,926 |
| **3-year TCO** | **175,000 – 480,000** | **10.2M – 27.8M** | — |

---

## 4. Comparison

| | In-house (Option A) | External platform (Option B) |
|---|---|---|
| 3-year TCO | **US$19,180** | US$175,000 – 480,000 |
| Multiple | 1× | **9× – 25×** |
| Time to pilot | Already live | 3–6 months to first login |
| Fit to Home Credit PH process | Exact — DJI under Policy 211_2021, Service Offers, nominations, PCD commitments are all modelled | Requires configuration; some concepts may not map |
| Skills ontology | Build or license separately | Mature, multi-language, maintained |
| HRIS / SSO connectors | Build | Pre-built |
| Benchmarking against other firms | None | Usually included |
| Security certifications (SOC 2, ISO 27001) | Your responsibility | Vendor holds |
| Support SLA | Internal team | Contractual |
| Key-person risk | **High** — concentrated in whoever maintains it | Low |
| Exit cost | Low | Contract-bound; data extraction terms matter |

### The honest read

On pure cost the in-house option wins by an order of magnitude, and the gap is
too wide for FX or estimate error to close. But cost is not the whole question,
and the comparison above is not apples-to-apples: an enterprise platform buys a
maintained skills ontology, pre-built connectors, certifications, a support SLA
and a product roadmap. In-house, all of those are yours to build and keep
building.

The case for building is strongest because **the pilot is already built and
running at effectively zero incremental cost.** The rational sequence is:

1. **Run the 637-person pilot on v1.** Marginal cost is near zero. Prove that
   people post, apply, and come back.
2. **Use pilot data as the RFP baseline.** Real adoption numbers turn a vendor
   negotiation from theoretical to evidenced, and give you a floor to compare
   against.
3. **Decide at scale-up, not now.** If the marketplace becomes core
   infrastructure across a much larger population, the vendor economics improve
   and the ontology and connectors start to earn their keep. At 637 seats they
   do not.

Buying now means paying enterprise minimums to validate a hypothesis you can
test for the cost of a few hours of engineering time.

---

## 5. Sensitivities

| Change | Effect |
|---|---|
| FX moves to ₱65/US$ | In-house Y1 rises to ~₱1.11M; vendor bands rise proportionally. Conclusion unchanged. |
| Build effort doubles | In-house 3-yr TCO ≈ US$35k. Still 5×–14× cheaper. |
| Population grows to 5,000 | In-house run scales sub-linearly (API cost ~8×, still under US$4k/yr). Vendor per-seat economics improve materially — revisit. |
| 0.3 FTE maintenance included | In-house 3-yr TCO ≈ US$47k. Still 4×–10× cheaper. |
| Vendor discounts to US$25k/yr all-in | 3-yr ≈ US$75k. Gap narrows to ~4×; worth a serious look. |

---

## 6. What must be validated before this goes to a decision forum

1. **Your actual developer rate card** — the ₱150k/month assumption drives the
   whole build estimate.
2. **Whether the 0.2–0.3 FTE maintenance can be absorbed** by an existing team
   or needs incremental headcount.
3. **Real vendor quotes.** Issue an RFP to Gloat, Fuel50 and Eightfold with
   your seat count stated up front and ask specifically for minimum contract
   value. Replace section 3 with real numbers.
4. **Whether your HRIS already includes a talent marketplace module** — if you
   run Workday or SuccessFactors, the incremental add-on cost may be far below
   the standalone bands above and is the first thing to check.
5. **Data Privacy Act (RA 10173) position** — an in-house build makes you the
   personal information controller *and* processor. Confirm with your Data
   Protection Officer before pilot expansion.
