# Business Requirements Document — Growth: HC Talent Marketplace

**For:** IT evaluation
**Version:** 1.0 · **Date:** 18 August 2026
**Reference build:** commit `07e848e` — https://ruffa06.github.io/Talent-Marketplace/
**Business owner:** People & Culture Department (PCD)
**Status:** for review

---

## 1. Document purpose

This document specifies what the Growth: HC Talent Marketplace must do, so that
IT can assess build effort, integration impact, security posture and
supportability. It describes requirements, not implementation. Where a working
prototype already demonstrates a requirement, the reference is given so
reviewers can click it rather than imagine it.

**Scope of this BRD:** the production system. The prototype at the link above
is evidence of intent and a UX reference, not the thing being specified.

---

## 2. Business context

Home Credit PH has no mechanism for internal work to reach internal people.
Employees grow vertically or leave; managers hire externally for capability
that exists elsewhere in the business; development plans do not convert into
action. See `docs/BUSINESS_CASE.md`.

**Population for first release:** 637 employees.

---

## 3. Scope

### In scope

- Employee profiles with skills, aspirations and verification status
- Four opportunity types: Gig, Vacancy, Developmental Job Immersion, Service Offer
- Posting, administrative approval, publication and closure of opportunities
- Application, nomination, and host decision workflows
- AI-assisted matching with an explainable rubric
- Post-activity surveys for both participant and host
- Administrative dashboards, history and audit
- Notifications, including a 7-day response service level
- SSO authentication and role-based authorisation
- HRIS profile import; LMS certification import

### Out of scope for release 1

- Mobile native applications (the web application must be responsive)
- Compensation, payroll or headcount transactions
- Performance management integration beyond the talent-review record
- Multi-language interface
- Integration with external (public) job boards
- Skills taxonomy normalisation against Disprz — planned for phase 2

---

## 4. Stakeholders

| Role | Interest |
|---|---|
| PCD | Owns the process, the four commitments, and the talent-review record |
| Employees | Discover and apply; publish service offers |
| Line managers | Approve participation; protect core workload |
| Host managers | Post work; select candidates; complete host surveys |
| Recruiters | Post vacancies; screen internal candidates |
| Administrators | Approve or reject posts; monitor; audit |
| IT | Build, integrate, secure, operate |
| Data Protection Officer | RA 10173 compliance |

---

## 5. Functional requirements

Priority uses MoSCoW: **M**ust / **S**hould / **C**ould / **W**on't (this release).

### 5.1 Identity and access

| ID | Requirement | Pri |
|---|---|---|
| FR-1.1 | Authenticate via corporate SSO (Azure AD or Okta). No local passwords. | M |
| FR-1.2 | Derive role (Employee / Manager / Recruiter / Administrator) from HRIS attributes, not user selection. | M |
| FR-1.3 | Enforce authorisation server-side on every endpoint. A client-side role must never grant access. | M |
| FR-1.4 | A user may hold multiple roles simultaneously (a manager is also an employee). | M |
| FR-1.5 | Administrators may impersonate for support, with the action written to the audit log. | S |

> The prototype uses an unauthenticated role selector. This is a demonstration
> device and must not survive into production.

### 5.2 Profile

| ID | Requirement | Pri |
|---|---|---|
| FR-2.1 | Maintain a profile: skills held, skills to develop, aspiration statement, availability. | M |
| FR-2.2 | Pre-populate name, department, reporting line from HRIS; these fields are read-only. | M |
| FR-2.3 | Distinguish **verified** from **claimed** skills. Verification occurs three ways: manager endorsement, a host rating of 4★ or higher on relevant work, or an LMS-logged certification. | M |
| FR-2.4 | Display the definition of a skill on hover or focus. | S |
| FR-2.5 | Show profile completeness and its effect on matching. | S |
| FR-2.6 | Employee may set themselves open or closed to opportunities. | M |

### 5.3 Opportunities

| ID | Requirement | Pri |
|---|---|---|
| FR-3.1 | Create opportunities of all four types with type-appropriate fields. | M |
| FR-3.2 | DJI posts must capture the Policy 211_2021 fields: immersion split, duration 3–9 months, home department retention of headcount, salary and benefits, and the four required sign-offs. | M |
| FR-3.3 | Route every post through administrative approval before publication. | M |
| FR-3.4 | Support states: draft, pending review, live, filled, closed, rejected. | M |
| FR-3.5 | Service Offers invert the flow — an employee publishes availability and teams request their time. | M |
| FR-3.6 | Search and filter by type, department, match score and free text, with no default score cut-off. | M |
| FR-3.7 | Flag stale posts (no activity for a configurable period) to administrators. | S |
| FR-3.8 | Allow a prospective applicant to ask the post owner a question without applying. | S |

> Reference: FR-3.6's deliberate absence of a score floor is a product decision
> — stretch roles are the point. FR-3.8 is demonstrated as "Ask more info".

### 5.4 Matching

| ID | Requirement | Pri |
|---|---|---|
| FR-4.1 | Generate a match score for each employee–opportunity pair using an LLM. | M |
| FR-4.2 | Disclose clearly that scores are AI-generated. | M |
| FR-4.3 | Publish the rubric: factor weightings and score bands. | M |
| FR-4.4 | Persist the per-factor breakdown, not only the total, so a score can be explained after the fact. | M |
| FR-4.5 | Show, per opportunity, which required skills the employee holds and which they lack. | M |
| FR-4.6 | Suggest development activities for skills the employee lacks. | S |
| FR-4.7 | Never let a score block an application. | M |
| FR-4.8 | State the model's limitations to users, including that it cannot see what is not recorded. | M |
| FR-4.9 | Re-score when a profile or an opportunity changes materially. | M |
| FR-4.10 | Weight verified skills above claimed skills. | M |

Rubric as demonstrated — subject to PCD sign-off:

| Factor | Weight |
|---|---|
| Skill overlap (verified weighted ~2× claimed) | 50% |
| Aspiration fit | 20% |
| Track record and host ratings | 20% |
| Practicalities (bandwidth, duration, department) | 10% |

| Band | Reading |
|---|---|
| 85–100% | Strong match |
| 70–84% | Good match |
| 50–69% | Stretch |
| < 50% | Long shot |

### 5.5 Applications and decisions

| ID | Requirement | Pri |
|---|---|---|
| FR-5.1 | Apply to a live opportunity with a free-text statement. | M |
| FR-5.2 | Notify the employee's line manager on application. | M |
| FR-5.3 | Host manager accepts or declines, with a reason on decline. | M |
| FR-5.4 | Show the applicant a status timeline. | M |
| FR-5.5 | Applicant may withdraw. | M |
| FR-5.6 | Nominate a colleague for an opportunity, with a supporting statement. | M |
| FR-5.7 | Distinguish nominated from self-applied candidates to the poster. | S |
| FR-5.8 | Escalate applications with no decision after 7 calendar days: email the post owner, copy PCD. | M |
| FR-5.9 | Report response-rate performance by post owner to administrators. | S |

> FR-5.8 is the highest-value requirement in this document. Unanswered
> applications are the fastest way to kill an internal marketplace. The
> prototype computes the ageing and renders the message but sends no email —
> delivery is a production requirement.

### 5.6 Completion and feedback

| ID | Requirement | Pri |
|---|---|---|
| FR-6.1 | Issue a post-activity survey to the participant on completion. | M |
| FR-6.2 | Issue a different survey to the host manager. | M |
| FR-6.3 | Release both ratings only when both parties have submitted. | S |
| FR-6.4 | Write completed engagements and ratings to the employee's HR record. | M |
| FR-6.5 | Route survey responses to PCD. | M |
| FR-6.6 | A 4★+ host rating verifies the relevant skill on the profile. | S |

### 5.7 Administration and reporting

| ID | Requirement | Pri |
|---|---|---|
| FR-7.1 | Approve or reject pending posts, with a reason on rejection. | M |
| FR-7.2 | Provide a complete history of posts **including rejected ones**, and applications **including declined ones**. | M |
| FR-7.3 | Provide an append-only audit log of every state transition, with actor and timestamp. | M |
| FR-7.4 | Dashboard: participation, posts by type and department, application funnel, response-rate compliance. | M |
| FR-7.5 | Nomination leaderboard ranked by *selected* nominations, not volume. | C |
| FR-7.6 | Export reporting data to CSV. | S |
| FR-7.7 | Contact the owner of a stale post from templated messages. | C |

---

## 6. Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Page load (P95), corporate network | ≤ 2 s |
| NFR-2 | API response (P95), excluding AI scoring | ≤ 500 ms |
| NFR-3 | Match score generation | ≤ 60 s asynchronous; must not block the UI |
| NFR-4 | Availability, business hours | 99.5% |
| NFR-5 | Concurrent users supported | 200 (≈ 30% of population) |
| NFR-6 | Population headroom without re-architecture | 5,000 |
| NFR-7 | Browsers | Current Chrome, Edge, Safari, Firefox; iOS and Android Safari/Chrome |
| NFR-8 | Responsive | Usable 360 px – 2560 px; no horizontal scrolling of the page body |
| NFR-9 | Accessibility | WCAG 2.1 AA |
| NFR-10 | Recovery point / recovery time objective | RPO 24 h; RTO 8 h |
| NFR-11 | Data retention | Per PCD policy; audit log ≥ 3 years |
| NFR-12 | Localisation | English (Philippines) only in release 1 |

---

## 7. Integration requirements

| ID | System | Direction | Frequency | Content |
|---|---|---|---|---|
| INT-1 | SSO (Azure AD / Okta) | Inbound | Per session | Authentication, group membership |
| INT-2 | HRIS (Workday / SAP SuccessFactors) | Inbound | Nightly | Employee master: name, department, reporting line, job title, status |
| INT-3 | HRIS | Outbound | On completion | Completed engagements and host ratings to the HR record |
| INT-4 | LMS (Disprz) | Inbound | Nightly | Certifications, to verify skills |
| INT-5 | Email (SES / SendGrid / Exchange) | Outbound | Event-driven | Decisions, escalations, survey issuance |
| INT-6 | Claude API (Anthropic) | Outbound | Batched | Match scoring |

**IT to confirm:** which HRIS is authoritative for reporting lines; whether
Disprz exposes a certification API; whether outbound mail must route through
Exchange rather than a third-party sender; and whether outbound calls to the
Anthropic API are permitted by the egress policy and under what data
classification.

---

## 8. Data and privacy

### 8.1 Principal entities

`users` · `profiles` · `skills` · `opportunities` · `applications` ·
`nominations` · `matches` · `feedback` · `notifications` · `audit_log`

Model detail in `docs/ARCHITECTURE.md` and `backend/models.py`.

### 8.2 Data Privacy Act (RA 10173)

| ID | Requirement |
|---|---|
| DP-1 | Personal data processed: name, department, reporting line, skills, aspirations, application content, ratings. |
| DP-2 | Building in-house makes Home Credit PH both personal information controller and processor. DPO assessment required before pilot expansion. |
| DP-3 | Privacy notice presented at first login, with consent recorded. |
| DP-4 | Aspiration statements and application text are visible to the poster; this must be stated at the point of entry. |
| DP-5 | Data subject rights — access, correction, erasure — supportable within statutory timeframes. |
| DP-6 | **Profile and application data must not be sent to any third party beyond what is strictly required for matching.** The content and retention terms of prompts sent to the Anthropic API require explicit DPO review. |
| DP-7 | Retention and disposal schedule agreed with PCD and the DPO. |
| DP-8 | NPC registration reviewed if the processing constitutes a new system of records. |

### 8.3 Security

| ID | Requirement |
|---|---|
| SEC-1 | TLS 1.2+ in transit; encryption at rest. |
| SEC-2 | No credentials in client-side code. |
| SEC-3 | Server-side authorisation on every endpoint; deny by default. |
| SEC-4 | Penetration test before go-live; criticals and highs remediated. |
| SEC-5 | Secrets in a managed secret store, not source control. |
| SEC-6 | Audit log immutable and separately retained. |
| SEC-7 | Rate limiting on write endpoints. |
| SEC-8 | Dependency vulnerability scanning in CI. |

---

## 9. AI governance

| ID | Requirement |
|---|---|
| AI-1 | AI-generated scores must be labelled as such wherever shown. |
| AI-2 | The rubric must be published to users, not held internally. |
| AI-3 | A score must never gate an application — advisory only. |
| AI-4 | Every score must be explainable after the fact; persist the factor breakdown. |
| AI-5 | Selection decisions are made by humans. No automated rejection. |
| AI-6 | Test for adverse impact across gender, age and department before go-live and annually. |
| AI-7 | Model, version and prompt template recorded against each score for reproducibility. |
| AI-8 | Users must be told the model cannot see undocumented experience, and that a low score may reflect a thin profile. |
| AI-9 | A documented fallback when the AI service is unavailable — the marketplace must remain usable without scores. |

---

## 10. Assumptions, constraints, dependencies

**Assumptions** — HRIS exposes an API for nightly extract; SSO is available for
all 637; Policy 211_2021 remains current; PCD owns and staffs the four
commitments.

**Constraints** — no additional headcount assumed for release 1; must operate
within existing cloud and egress policy; English only.

**Dependencies** — DPO assessment; HRIS integration slot; SSO application
registration; PCD sign-off on the rubric and the four commitments; mail relay
provisioning.

---

## 11. Acceptance criteria

1. All **Must** requirements demonstrated in UAT.
2. Penetration test complete; criticals and highs closed.
3. DPO sign-off recorded.
4. HRIS import runs for three consecutive nights without manual intervention.
5. Escalation email verified end to end against a real mailbox.
6. Adverse-impact test complete with results reviewed by PCD.
7. NFR-1, 2, 4, 8 and 9 measured and met.
8. Rollback plan documented and rehearsed.

---

## 12. Open questions for IT

1. Which HRIS is authoritative for reporting lines, and does it expose a usable API?
2. Is outbound traffic to the Anthropic API permitted, and at what data classification?
3. Must outbound mail route through Exchange, or is a third-party sender acceptable?
4. Does Disprz expose a certification API for skill verification?
5. Preferred hosting — existing cloud tenancy, or is a managed platform acceptable?
6. Does Home Credit PH already license a talent marketplace module within its HRIS suite? **This should be checked before any build is approved** — it may change the recommendation entirely.
7. What is the internal standard for AI governance sign-off, and who owns it?
8. Is the existing FastAPI/React codebase acceptable as a starting point, or must this conform to a different internal stack standard?

---

## 13. Reference materials

| Document | Content |
|---|---|
| `docs/BUSINESS_CASE.md` | Problem, proposal, recommendation, success measures, risks |
| `docs/COSTING.md` | Three-year TCO, build vs buy, AI workload model |
| `docs/ARCHITECTURE.md` | As-built and proposed architecture |
| `docs/V1_RELEASE.md` | What v1 is and how to retrieve it |
| `TECH_BLUEPRINT.md` | Original target design (partially superseded) |
| Prototype | https://ruffa06.github.io/Talent-Marketplace/ |
