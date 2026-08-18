# Business Case — Growth: HC Talent Marketplace

**Version:** v1.0 (`07e848e`) · **Prepared:** 18 August 2026
**Sponsor:** People & Culture Department (PCD), Home Credit PH
**Decision sought:** approval to pilot with 637 employees

---

## 1. The problem

Career growth at Home Credit PH is currently understood as vertical: you grow
when a role opens above you. That produces three costs.

1. **Talent leaves to grow.** When the only visible path is a promotion that
   may be years away, capable people find their next move outside the company.
   The skills leave with them.
2. **Work goes outside that could have been done inside.** Managers hire or
   contract for capability that already exists in another business unit,
   because they have no way to see it. Internal placement is faster and cheaper
   than external hiring, and the person already knows our systems and
   customers.
3. **Development plans stay on paper.** IDPs are written annually and then have
   nowhere to go. There is no mechanism that converts "I want to develop X"
   into actually doing X.

None of these are visibility problems that better communication fixes. They are
structural: there is no marketplace, so there are no transactions.

## 2. The proposal

A single internal platform where work and people find each other, in both
directions.

- **Employees** discover gigs, vacancies and Developmental Job Immersions
  across the company, matched to their skills and stated aspirations, and can
  publish what they are willing to help others with.
- **Managers and recruiters** post work to the whole company rather than to
  their own network, and see ranked internal candidates.
- **PCD** gets a record of who is developing what, which is currently invisible.

Four instruments, three you apply for and one you offer:

| Type | What it is |
|---|---|
| **Gig** | Short project alongside your role — hours to weeks. Outside work hours, or during them with written manager permission. |
| **Vacancy** | A permanent internal move. |
| **DJI** | Developmental Job Immersion, 3–9 months under Policy 211_2021. Headcount, salary and benefits stay with the home department. |
| **Service Offer** | Runs in reverse: an employee publishes what they will help with, and teams request their time. |

## 3. Why this works when similar initiatives fail

Internal mobility programmes usually fail for one of two reasons, and the
design addresses both explicitly.

**Failure one: nothing is in it for the employee.** Marketplace work is unpaid
and on top of an existing job. "Exposure" is not payment. The platform
therefore states four commitments that PCD — not the line manager — is
accountable for delivering:

1. A formal record on the employee's HR file, with the host manager's rating.
2. Inclusion in the annual talent review and succession discussion.
3. A post-activity survey issued immediately, routed to PCD.
4. First look at related vacancies in that function.

These are framed as policy, not goodwill, and they hold even when the people
around the employee change. That is the difference between a programme people
try once and one they return to.

**Failure two: managers hoard.** A manager who loses a person's time for a gig
bears a cost and sees no benefit. The design counters this with visible
reputational payoff — hosting managers become known as places people grow — and
by protecting the manager: the platform states plainly that if a marketplace
commitment compromises core work, it is adjusted or ended, with no penalty for
raising it.

## 4. What has been built

A complete, clickable prototype covering all four roles and all six modules,
live at **https://ruffa06.github.io/Talent-Marketplace/**.

It is not a mockup. Posting, approving, applying and deciding write to a shared
database, so what one person does is visible to everyone else on the link. An
employee can apply, and the manager sees the application arrive.

The remainder — surveys, nominations, dashboards, seeded personas — is
demonstration content that resets on reload. That split is deliberate: the
seeded content shows a populated, working marketplace, which is what makes the
concept legible to a reviewer. An empty system reads as broken.

## 5. Cost

Full workings in `docs/COSTING.md`.

| | 3-year TCO |
|---|---|
| Build in-house (extends what exists) | **US$19,180** (₱1.11M) |
| External platform (Gloat and peers, indicative) | US$175,000 – 480,000 |

The AI matching that underpins the concept costs **under US$300 a year** for
the whole population at list price with batching. Cost is not the constraint on
this idea; it never was.

External vendor pricing is not published and the figures above are RFP
placeholders, not quotes. The material point is structural: enterprise talent
marketplace vendors are built for 10,000+ seat deployments, and at 637 seats
the vendor's **minimum contract value**, not the per-seat rate, will set the
price.

## 6. Recommendation

**Pilot on what has been built. Do not buy yet.**

The marginal cost of running the 637-person pilot on v1 is close to zero, and
it answers the only question that matters before any purchase: will people
actually post and apply? A vendor RFP conducted after the pilot is a
fundamentally stronger negotiation, because it is evidenced rather than
theoretical.

Buying now means paying enterprise minimums to test a hypothesis that can be
tested for the cost of a few hours of engineering.

### Sequence

| Phase | Duration | Outcome |
|---|---|---|
| **1. Pilot** | 8 weeks | 637 employees. Measure posts created, applications, response rates, completion, and repeat use. |
| **2. Assess** | 2 weeks | Against the success measures below. Decide continue / rebuild / buy. |
| **3. Productionise** *(if continuing)* | 3 months | SSO, HRIS import, real notifications, security review, DPA assessment. ₱930k. |
| **4. Re-evaluate buy** | At scale-up | If the population grows materially, revisit vendor economics with real adoption data. |

## 7. Success measures for the pilot

Set these before launch, not after.

| Measure | Target | Why it matters |
|---|---|---|
| Employees who complete a profile | ≥ 40% (255) | Nothing works without skills data — matching only sees what is written down. |
| Opportunities posted | ≥ 25 | Supply is the harder side. A marketplace with no inventory fails regardless of demand. |
| Applications submitted | ≥ 100 | Demonstrates demand. |
| Applications answered within 7 days | ≥ 80% | **The single most important measure.** A silent no is the fastest way to lose someone permanently. |
| Completed engagements | ≥ 10 | Proves the loop closes, not just that it starts. |
| Post-activity survey completion | ≥ 70% | Whether the PCD commitments are actually being honoured. |
| Employees returning for a second action | ≥ 30% | The only real test of whether it was worth their time. |

The response-rate measure deserves emphasis. The platform computes a 7-day
escalation and shows the reminder that would go to an unresponsive post owner,
but **no email is sent in v1** — that needs a mail service behind a backend.
During the pilot this must be worked manually by PCD, or the measure will fail
for mechanical reasons rather than behavioural ones.

## 8. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Empty marketplace — no one posts | Medium | High | Seed 15–20 real opportunities before launch. Recruit five manager champions. Supply first, demand second. |
| Applications go unanswered | **High** | **High** | Work the 7-day rule manually during the pilot. Report response rates to leadership by name. |
| Managers block participation | Medium | High | The written-permission rule and the workload protection clause are already in the product. Brief managers before employees. |
| Thin profiles produce poor matches | High | Medium | The product already explains that low scores often reflect a thin profile. Run a profile-completion push in week one. |
| No authentication in v1 | **Certain** | Medium | Acceptable for a feedback pilot only. Anyone with the link can act as any role, including Administrator. Do not put confidential data in it. Must be resolved before any wider rollout. |
| Data Privacy Act exposure | Medium | High | Building in-house makes Home Credit PH both controller and processor. DPO sign-off required before expansion. |
| Key-person dependency | High | Medium | The prototype is one HTML file, well-commented, no build step — deliberately low bus factor. The production build must not lose that property without cause. |

## 9. What this business case does not claim

- **No ROI figure.** Benefits — retention, faster internal placement, reduced
  external hiring — are real but not measurable until the pilot produces
  baseline data. A modelled ROI now would be invented, and would not survive
  scrutiny.
- **No vendor quotes.** Section 5 uses RFP placeholders. Anyone presenting
  those as Gloat's pricing is misrepresenting them.
- **No claim that AI matching is proven.** Scores in v1 are seeded. The scoring
  endpoint exists in the codebase but is not wired into the prototype, and
  match quality has not been evaluated against real profiles.
