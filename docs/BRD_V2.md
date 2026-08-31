# Business Requirements Document — Growth v2

**For:** IT effort estimation and build planning
**Version:** 2.0 · **Date:** 31 August 2026
**Business owner:** People & Culture Department (PCD)
**Reference build:** `prototype/talent-marketplace-v2.html` on branch
`claude/talent-marketplace-v2-explore-kps8k8` — 5,062 lines, runs with no build step
**Supersedes:** `docs/BRD.md` v1.0 (which remains the reference for anything marked *Unchanged*)
**Status:** for IT estimation

---

## 1. Purpose and how to use this document

This document exists so IT can produce a **bottom-up man-day estimate**. It is
written as a delta against BRD v1.0, because most of that scope is unchanged and
re-estimating it wastes your time.

Every requirement carries a change marker:

| Marker | Meaning for estimation |
|---|---|
| **U** | Unchanged from BRD v1.0. Carry your v1 estimate forward. |
| **C** | Changed. Re-estimate; the v1 estimate is a starting point, not an answer. |
| **N** | New in v2. No prior estimate exists. |
| **R** | Removed in v2. Deduct any v1 estimate. |

**§7 is the estimation worksheet.** Every functional requirement maps to a build
unit (BU-xx); the worksheet has one row per build unit with blank effort columns
for you to fill. §8 lists the assumptions that materially change effort if they
turn out to be false.

A clickable reference build exists for every **N** and **C** requirement. Open
it before estimating — it is faster than reading the requirement twice, and it
is the difference between estimating a described feature and a demonstrated one.

---

## 2. What changed in v2, and why

Home Credit PH already runs internal recruitment in **HC Connect Internal Job
Posting** ("HC Connect"). v1 assumed the marketplace would run vacancy
applications too. It cannot: that would split one hiring process across two
systems and lose candidates in the seam.

v2 therefore gives up the half it was never going to win and keeps the half HC
Connect cannot do — knowing what an employee can already do, scoring fit, and
surfacing a role they were never going to search for.

| | Was (v1) | Is (v2) |
|---|---|---|
| Internal vacancies | Posted, applied for, and decided in the marketplace | **Promoted only.** Listed with a match score and job description; the application happens in HC Connect on a tracked handoff |
| Recruiter role | Fourth role: posts vacancies, screens applicants | **Removed.** Three roles: Employee, Manager, Administrator |
| Vacancy outcome measurement | Implicit — the data was already in our database | **Explicit referral attribution**: code, click log, self-report, monthly reconciliation against the HC Connect export |
| Employee skills | Authored by each employee | **Batch pre-filled by PCD** from HR records; employees correct rather than author |
| Service offers | Published from the profile page | Published from Post an Opportunity |

**The commercial consequence, stated plainly:** v2's *claimable* benefit is
smaller than v1's, because vacancy hires now belong to HC Connect. Everything
the marketplace can still claim about vacancies depends on the referral
attribution in §5.4. See `docs/V2_CBA.md`.

---

## 3. Scope

### In scope for release 1

- Employee profiles with skills, aspirations and verification status **(C — adds pre-filled provenance)**
- **Three** opportunity types run end to end: Gig, Developmental Job Immersion, Service Offer **(C)**
- Internal vacancy **promotion and handoff** to HC Connect **(N)**
- Referral attribution: codes, view and click logging, self-report, reconciliation export **(N)**
- Batch employee-skills upload with validation and provenance **(N)**
- Posting, administrative approval, publication and closure **(U)**
- Application, nomination and host decision workflows — for the three in-app types only **(C)**
- AI-assisted matching with an explainable rubric, extended to promoted vacancies **(C)**
- Post-activity surveys for participant and host **(U)**
- Administrative dashboards, history and audit **(C — adds the attribution report)**
- Notifications, including the 7-day response service level **(U)**
- SSO authentication and role-based authorisation, three roles **(C)**
- HRIS profile import; LMS certification import **(U)**

### Out of scope for release 1

- Vacancy application, screening, interview or offer workflows — **owned by HC Connect and explicitly not built here (R)**
- Automated write-back of applications or hires into HC Connect — phase 2, see BU-42
- Mobile native applications (the web application must be responsive) **(U)**
- Compensation, payroll or headcount transactions **(U)**
- Multi-language interface **(U)**
- Skills taxonomy normalisation against Disprz — phase 2 **(U)**

---

## 4. Roles

| Role | Population | Change |
|---|---|---|
| Employee | All 637 | U |
| Manager | ~60 people managers | U |
| Administrator (PCD) | 3–5 | C — inherits vacancy-board curation and skills upload from the removed Recruiter role |
| ~~Recruiter~~ | — | **R** |

> **Estimation note.** Removing a role reduces authorisation surface but does not
> remove the work it did. Vacancy curation moved to Administrator (BU-21) and is
> new build, not a deletion.

---

## 5. Functional requirements

Priority uses MoSCoW: **M**ust / **S**hould / **C**ould / **W**on't (this release).
`BU` is the build unit in the §7 worksheet.

### 5.1 Identity and access

| ID | Requirement | Pri | Δ | BU |
|---|---|---|---|---|
| FR-1.1 | Authenticate via corporate SSO (Azure AD or Okta). No local passwords. | M | U | BU-01 |
| FR-1.2 | Derive role (Employee / Manager / Administrator) from HRIS attributes, not user selection. | M | C | BU-02 |
| FR-1.3 | Enforce authorisation server-side on every endpoint. A client-side role must never grant access. | M | U | BU-02 |
| FR-1.4 | A user may hold multiple roles simultaneously. | M | U | BU-02 |
| FR-1.5 | Administrators may impersonate for support, with the action written to the audit log. | S | U | BU-03 |

> The reference build uses an unauthenticated role selector. It is a
> demonstration device and must not survive into production.

### 5.2 Profile and skills

| ID | Requirement | Pri | Δ | BU |
|---|---|---|---|---|
| FR-2.1 | Maintain a profile: skills held, skills to develop, aspiration statement, availability. | M | U | BU-10 |
| FR-2.2 | Pre-populate name, department, reporting line from HRIS; read-only. | M | U | BU-11 |
| FR-2.3 | Distinguish skill provenance: **verified** (manager endorsement, 4★+ host rating, or LMS certification), **pre-filled** (loaded by PCD from HR records), **self-declared**. Rank verified > pre-filled > self-declared in matching. | M | **C** | BU-12 |
| FR-2.4 | Display the definition of a skill on hover or focus. | S | U | BU-10 |
| FR-2.5 | Show profile completeness and its effect on matching. | S | U | BU-10 |
| FR-2.6 | Employee may set themselves open or closed to opportunities. | M | U | BU-10 |
| FR-2.7 | Display pre-filled skills as an editable starting point, stating where they came from and inviting correction. | M | **N** | BU-12 |
| FR-2.8 | An employee may remove or amend any pre-filled skill. A later upload must not reinstate a skill the employee removed. | M | **N** | BU-13 |

### 5.3 Batch skills upload  *(all new)*

| ID | Requirement | Pri | Δ | BU |
|---|---|---|---|---|
| FR-3.1 | Administrators may upload a CSV of employee skills. Accept flexible column names and any column order. | M | N | BU-14 |
| FR-3.2 | Parse RFC-4180 CSV: quoted fields, embedded commas and semicolons, CRLF, BOM. | M | N | BU-14 |
| FR-3.3 | Validate before writing. Report per-line errors for unnamed or skill-less rows; merge duplicate employees; import unrecognised skills as written and list them as ontology candidates. | M | N | BU-15 |
| FR-3.4 | Preview which profiles gain which skills, and the count of profiles currently empty, before anything is written. | M | N | BU-15 |
| FR-3.5 | Writes are additive only. Never delete a skill; never overwrite one the employee has edited. A partial collision must not fail the batch. | M | N | BU-16 |
| FR-3.6 | Record every upload with uploader identity and timestamp; expose the log. | M | N | BU-16 |
| FR-3.7 | Report coverage against the full population: profiles with skills, total skills, average per profile, profiles at 8+ skills. | M | N | BU-17 |
| FR-3.8 | Provide a downloadable CSV template. | S | N | BU-14 |

> **Why this exists.** Matching only sees what is written down. An empty profile
> matches nothing, so its owner sees an empty board and does not return. Asking
> 637 people to author their skills before the product has done anything for
> them is the wrong order of events. Reference build: *Skills Upload* under
> People. The coverage panel currently reads *"627 people have no skills on
> file"* — that is the number to drive to zero before launch, ahead of sign-ups
> or posts.

### 5.4 Vacancy promotion and referral attribution  *(all new — the core of v2)*

| ID | Requirement | Pri | Δ | BU |
|---|---|---|---|---|
| FR-4.1 | Maintain a board of promoted requisitions: requisition ID, title, department, location, closing date, HC Connect link, job-description link. | M | N | BU-20 |
| FR-4.2 | Administrators may promote and un-promote a requisition. Nothing in this system creates, edits or closes a requisition in HC Connect. | M | N | BU-21 |
| FR-4.3 | Display a match score and the fit breakdown against a promoted requisition, on the same rubric as in-app opportunities. | M | N | BU-22 |
| FR-4.4 | Display the job description in-app so the employee can decide before clicking through; state that the authoritative copy lives in HC Connect. | S | N | BU-22 |
| FR-4.5 | On handoff, mint a unique referral code and record a referral row: code, requisition, employee, source surface, timestamp. | M | N | BU-23 |
| FR-4.6 | Open HC Connect with `?src=growth&gref=<code>` **and** display the code to the employee, so attribution survives an ATS that strips unknown query parameters. | M | N | BU-23 |
| FR-4.7 | Log a view at most once per employee, per requisition, per day, as the click-through denominator. | M | N | BU-24 |
| FR-4.8 | Ask the employee afterwards whether they applied; record the answer as **self-reported**. | M | N | BU-25 |
| FR-4.9 | Report the funnel — promoted, viewed, referred, self-reported, confirmed, hired — labelling every figure with how it is known: *measured here*, *self-reported*, or *from HC Connect*. | M | N | BU-26 |
| FR-4.10 | Never display a metric that cannot be substantiated. If a count is unavailable, show it as unavailable rather than as zero. | M | N | BU-26 |
| FR-4.11 | Export referrals as CSV for monthly reconciliation against the HC Connect export; join on referral code. | M | N | BU-27 |
| FR-4.12 | Mark a referral confirmed once matched in the HC Connect export, with source and timestamp. | M | N | BU-27 |
| FR-4.13 | Apply a 30-day last-touch attribution window. Referrals older than the window are not credited. | M | N | BU-27 |
| FR-4.14 | State to the employee what is and is not passed to HC Connect: the code and the requisition, never the profile, CV or match score. | M | N | BU-23 |

> **Estimation note.** BU-23 to BU-27 are the whole reason v2 exists. They are
> also the only place in this BRD where a defect is commercially material rather
> than cosmetic: an overstated attribution figure discredits the programme.
> Treat their test effort accordingly.

### 5.5 Opportunities  *(three types, not four)*

| ID | Requirement | Pri | Δ | BU |
|---|---|---|---|---|
| FR-5.1 | Create opportunities of three types — Gig, DJI, Service Offer — with type-appropriate fields. | M | C | BU-30 |
| FR-5.2 | Reject Vacancy as an in-app opportunity type at the API and database layer, not only in the UI. | M | N | BU-30 |
| FR-5.3 | DJI posts must capture the Policy 211_2021 fields: immersion split, duration 3–9 months, home-department retention of headcount, salary and benefits, and the four sign-offs. | M | U | BU-31 |
| FR-5.4 | Route every post through administrative approval before publication. | M | U | BU-32 |
| FR-5.5 | Support states: draft, pending review, live, filled, closed, rejected. | M | U | BU-32 |
| FR-5.6 | Service Offers invert the flow — an employee publishes availability and teams request their time. Published from Post an Opportunity. | M | C | BU-33 |
| FR-5.7 | Search and filter by type, department, match score and free text, with no default score cut-off. | M | U | BU-34 |
| FR-5.8 | Direct anyone seeking a permanent role from the opportunities board to the vacancy board. | S | N | BU-34 |
| FR-5.9 | Flag stale posts to administrators. | S | U | BU-35 |
| FR-5.10 | Allow a prospective applicant to ask the **post owner** a question without applying. | S | C | BU-35 |

### 5.6 Matching

| ID | Requirement | Pri | Δ | BU |
|---|---|---|---|---|
| FR-6.1 | Generate a match score for each employee–opportunity pair using an LLM. | M | U | BU-40 |
| FR-6.2 | Extend scoring to promoted vacancies. | M | **C** | BU-40 |
| FR-6.3 | Disclose clearly that scores are AI-generated. | M | U | BU-41 |
| FR-6.4 | Publish the rubric: factor weightings and score bands. | M | U | BU-41 |
| FR-6.5 | Persist the per-factor breakdown, not only the total. | M | U | BU-40 |
| FR-6.6 | Show which required skills the employee holds and which they lack. | M | U | BU-41 |
| FR-6.7 | Weight a skill by its provenance (verified > pre-filled > self-declared). | S | **N** | BU-40 |
| FR-6.8 | Suggest development activities for skills the employee lacks. | S | U | BU-41 |
| FR-6.9 | Never let a score block an application or a referral. | M | U | BU-41 |

### 5.7 Applications, decisions, completion

| ID | Requirement | Pri | Δ | BU |
|---|---|---|---|---|
| FR-7.1 | Apply to Gig, DJI and Service Offer. **Vacancy applications are out of scope.** | M | C | BU-36 |
| FR-7.2 | Nominate a colleague for any in-app opportunity. | M | U | BU-37 |
| FR-7.3 | Host decides; applicant is notified either way. | M | U | BU-36 |
| FR-7.4 | Escalate an application unanswered after 7 days to the post owner, copied to PCD. | M | U | BU-50 |
| FR-7.5 | Issue post-activity surveys to participant and host; release ratings simultaneously. | M | U | BU-38 |

### 5.8 Administration and reporting

| ID | Requirement | Pri | Δ | BU |
|---|---|---|---|---|
| FR-8.1 | Approval queue for pending posts. | M | U | BU-32 |
| FR-8.2 | History and audit of every post and application, including rejected. | M | U | BU-60 |
| FR-8.3 | Nomination dashboard ranked by nominations **selected**, not volume. | S | U | BU-61 |
| FR-8.4 | Vacancy attribution report with CSV export. | M | **N** | BU-26 |
| FR-8.5 | Skills coverage report. | M | **N** | BU-17 |
| FR-8.6 | Report separately on what the marketplace **owns** (gig, DJI, service-offer outcomes) and what it **contributes to** (vacancy referrals). Never merge the two into one figure. | M | **N** | BU-62 |

---

## 6. Non-functional, integration, privacy and AI governance

### 6.1 Non-functional — deltas only

All BRD v1.0 targets (NFR-1 to NFR-12) carry forward unchanged, plus:

| ID | Requirement | Target | Δ |
|---|---|---|---|
| NFR-13 | Batch skills upload | 5,000 rows validated and previewed in ≤ 10 s; committed in ≤ 30 s | N |
| NFR-14 | Attribution counts must be exact at population scale, not sampled or page-limited | Correct at ≥ 100,000 view rows | N |
| NFR-15 | Referral handoff latency — click to HC Connect | ≤ 1 s | N |

> **NFR-14 is a real defect class, not a theoretical one.** The reference build
> originally counted view rows client-side under a page limit, which would have
> truncated in week three of the pilot and *overstated* click-through. Fixed in
> commit `23356ed` by having the database return an exact count. Any
> reimplementation must not reintroduce a client-side count.

### 6.2 Integration — deltas only

INT-1 to INT-6 from BRD v1.0 carry forward. Added:

| ID | System | Direction | Frequency | Content | Δ | BU |
|---|---|---|---|---|---|---|
| INT-7 | HC Connect — source field | Configuration on their side | Once | A source value `Growth Marketplace` plus an optional free-text referral-code field on the application form | **N** | BU-70 |
| INT-8 | HC Connect — application export | Inbound, manual | Monthly | Internal applications with source and referral code, for reconciliation | **N** | BU-27 |
| INT-9 | HC Connect — requisition feed | Inbound | Nightly | Open internal requisitions, to replace hand curation | **N — phase 2** | BU-42 |
| INT-10 | HC Connect — `application.created` webhook | Inbound | Event | Confirms a referral automatically, replacing the monthly join | **N — phase 2** | BU-42 |
| INT-11 | HRIS / LMS — competency extract | Inbound, manual | Ad hoc | Seed file for the batch skills upload | **N** | BU-14 |

> **INT-7 is a dependency on another team, not a build task, and it is the
> single highest-leverage item in this document.** It is a form configuration
> change on HC Connect's side — no engineering. Without it, referral
> reconciliation degrades to name matching and the attributed half of the
> business case is unprovable. **Secure it before the build starts.**

### 6.3 Data and privacy — deltas only

DP-1 to DP-8 carry forward. Added:

| ID | Requirement | Δ |
|---|---|---|
| DP-9 | Referral rows record which employee viewed and clicked through to which internal role. This is career-relevant personal data about identifiable staff and is materially more sensitive than anything v1 held. Access restricted to PCD. | **N** |
| DP-10 | The employee-skills table is a capability record about identifiable staff. Read the other way it is a record of what people **cannot** do. Access restricted to PCD; retention period agreed before first load. | **N** |
| DP-11 | Retention period for referral and view logs agreed with the DPO before go-live. Views are behavioural telemetry and should carry the shortest retention of anything in the system. | **N** |
| DP-12 | An employee may see their own referral history and request its erasure. | **N** |
| DP-13 | DPO assessment covering DP-9 to DP-12 is a **launch gate**, not a follow-up action. | **N** |

### 6.4 AI governance

AI-1 to AI-9 from BRD v1.0 carry forward unchanged, plus:

| ID | Requirement | Δ |
|---|---|---|
| AI-10 | Where a match score is computed from pre-filled skills the employee has not confirmed, the score must say so. A confident score built on unconfirmed data is the worst of both. | **N** |

### 6.5 Principal entities

v1 entities carry forward. Added in v2, with the reference schema in
`prototype/v2-supabase-schema.sql`:

`promoted_vacancies` · `vacancy_referrals` · `vacancy_views` · `employee_skills`

---

## 7. Estimation worksheet

**One row per build unit. Fill the effort columns.** Days are person-days,
inclusive of unit tests, code review, and deployment to a test environment;
exclusive of UAT support, which is BU-92.

Complexity is our read, offered as a sanity check on yours — **S** ≈ well-understood
CRUD, **M** ≈ non-trivial logic or one integration point, **L** ≈ novel logic,
multiple integration points, or a correctness-critical path.

Reference: `prototype/talent-marketplace-v2.html` demonstrates every item marked
✔. Demonstrated does not mean built — there is no authentication, no server-side
validation and no persistence beyond six tables — but the interaction design,
copy and edge-case handling are settled, which should reduce analysis and design
effort rather than build effort.

| BU | Workstream / item | Δ | Cx | Demo | Analysis | Backend | Frontend | QA | **Total** |
|---|---|---|---|---|---|---|---|---|---|
| | **A · Platform and access** | | | | | | | | |
| BU-01 | SSO integration (Azure AD / Okta) | U | M | | | | | | |
| BU-02 | Role derivation from HRIS; server-side authorisation, three roles | C | M | | | | | | |
| BU-03 | Administrator impersonation with audit | U | S | | | | | | |
| BU-04 | Application shell, navigation, responsive layout | C | M | ✔ | | | | | |
| | **B · Profile and skills** | | | | | | | | |
| BU-10 | Profile CRUD, skills held / to develop, aspirations, availability | U | M | ✔ | | | | | |
| BU-11 | HRIS profile pre-population, read-only fields | U | M | | | | | | |
| BU-12 | Skill provenance model (verified / pre-filled / self) and display | C | M | ✔ | | | | | |
| BU-13 | Employee edit precedence — an upload never reinstates a removed skill | N | M | | | | | | |
| BU-14 | CSV ingest: parser, flexible headers, template download | N | M | ✔ | | | | | |
| BU-15 | Validation, per-line error reporting, pre-commit preview | N | L | ✔ | | | | | |
| BU-16 | Additive commit, collision tolerance, upload audit log | N | M | ✔ | | | | | |
| BU-17 | Skills coverage reporting | N | S | ✔ | | | | | |
| | **C · Vacancy promotion and attribution** | | | | | | | | |
| BU-20 | Promoted requisition data model and board | N | S | ✔ | | | | | |
| BU-21 | Administrator promote / un-promote curation | N | S | ✔ | | | | | |
| BU-22 | Vacancy card: match score, fit breakdown, job-description reader | N | M | ✔ | | | | | |
| BU-23 | Referral code minting, handoff, tracked link, disclosure | N | **L** | ✔ | | | | | |
| BU-24 | View logging with per-day throttle; exact counting at scale | N | M | ✔ | | | | | |
| BU-25 | Self-report capture and prompting | N | S | ✔ | | | | | |
| BU-26 | Attribution funnel report with provenance labelling | N | **L** | ✔ | | | | | |
| BU-27 | Reconciliation: CSV export, confirmation, 30-day window | N | **L** | ✔ | | | | | |
| | **D · Opportunities** | | | | | | | | |
| BU-30 | Opportunity CRUD, three types; Vacancy rejected server-side | C | M | ✔ | | | | | |
| BU-31 | DJI Policy 211_2021 fields and four sign-offs | U | M | ✔ | | | | | |
| BU-32 | Approval workflow and state machine | U | M | ✔ | | | | | |
| BU-33 | Service Offers — inverted flow, request handling | C | M | ✔ | | | | | |
| BU-34 | Search, filter, vacancy-board signposting | C | S | ✔ | | | | | |
| BU-35 | Stale-post flagging; ask-the-post-owner | C | S | ✔ | | | | | |
| BU-36 | Applications and host decisions | C | M | ✔ | | | | | |
| BU-37 | Nominations | U | M | ✔ | | | | | |
| BU-38 | Post-activity surveys, simultaneous rating release | U | M | ✔ | | | | | |
| | **E · Matching** | | | | | | | | |
| BU-40 | Scoring service, rubric persistence, provenance weighting, batching | C | **L** | | | | | | |
| BU-41 | Score presentation, explainability, development suggestions | U | M | ✔ | | | | | |
| BU-42 | *Phase 2* — HC Connect requisition feed and confirmation webhook | N | L | | | | | | |
| | **F · Notifications** | | | | | | | | |
| BU-50 | Mail service, templates, 7-day escalation job | U | M | ✔ | | | | | |
| BU-51 | Self-report nudge | N | S | ✔ | | | | | |
| | **G · Administration and reporting** | | | | | | | | |
| BU-60 | History and audit views; append-only audit log | U | M | ✔ | | | | | |
| BU-61 | Nomination dashboard | U | S | ✔ | | | | | |
| BU-62 | Owned-versus-attributed reporting split | N | M | ✔ | | | | | |
| | **H · Integration** | | | | | | | | |
| BU-70 | HC Connect source-field coordination *(their configuration, our BA time)* | N | S | | | | | | |
| BU-71 | HRIS nightly employee extract | U | M | | | | | | |
| BU-72 | LMS certification import | U | M | | | | | | |
| BU-73 | HRIS write-back of completed engagements | U | M | | | | | | |
| | **I · Cross-cutting** | | | | | | | | |
| BU-80 | Data model, migrations, environments | C | M | | | | | | |
| BU-81 | Accessibility to WCAG 2.1 AA | U | M | | | | | | |
| BU-82 | Security hardening, rate limiting, secret management | U | M | | | | | | |
| BU-83 | Penetration test remediation | U | M | | | | | | |
| BU-84 | Observability, logging, alerting | U | S | | | | | | |
| BU-85 | Performance against NFR-1 to NFR-15 | C | M | | | | | | |
| | **J · Delivery** | | | | | | | | |
| BU-90 | Business analysis and requirement sign-off | C | M | | | | | | |
| BU-91 | Project management | U | M | | | | | | |
| BU-92 | UAT support and defect resolution | U | M | | | | | | |
| BU-93 | Cutover, pilot launch, hypercare | U | M | | | | | | |
| | **TOTAL** | | | | | | | | |

### 7.1 Cross-check against the business case

`docs/V2_CBA.md` carries a **top-down planning estimate** of 1.4 developer-months
in year 1 plus 0.9 in year 2 (phase 2), at ₱150k per developer-month, producing a
year-1 build of ₱711,000 including 20% contingency.

That figure was derived commercially, not from this worksheet. **Your bottom-up
total is the authoritative number.** If the two differ by more than about 25%,
that gap is worth understanding before either goes to a decision forum — and the
business case should be re-run on your figure, not the other way round.

`docs/v2-cba-model.py` recomputes the whole case from a changed input.

---

## 8. Assumptions that materially change effort

Each of these is a live uncertainty. If one resolves the wrong way, the
worksheet total moves — so please price them explicitly rather than absorbing
them.

| # | Assumption | If false |
|---|---|---|
| A1 | HC Connect will add a `Growth Marketplace` source value and a referral-code field (INT-7). | Reconciliation becomes name-and-date matching. Add analysis and QA to BU-27; confirmed-application rates fall sharply and FR-4.9's headline number weakens. |
| A2 | HC Connect requisitions can be linked to by a stable URL containing the requisition ID. | BU-23's tracked handoff needs another mechanism. Re-estimate BU-20 and BU-23. |
| A3 | HC Connect preserves unknown query parameters, or the employee pastes the code. | Already mitigated by FR-4.6 showing the code. No change. |
| A4 | HR holds a usable competency extract for a meaningful share of the 637. | BU-14 to BU-17 still build, but the coverage objective in FR-3.7 is unreachable at launch and profile completion reverts to a manual campaign. |
| A5 | Supabase (or the chosen platform) provides exact server-side counts. | NFR-14 needs a different implementation — re-estimate BU-24 and BU-26. |
| A6 | The existing FastAPI backend under `backend/` is a usable starting point. | Re-estimate workstreams B, D and E from scratch. |
| A7 | Egress to the Anthropic API is permitted under the data classification agreed with the DPO. | BU-40 blocks entirely. The marketplace still functions without scores (AI-9), but the promoted vacancy board loses its only differentiator against HC Connect's own listing. |
| A8 | 637 users, ~25 concurrently promoted requisitions, ~60 internal requisitions opened a year. | Volumes above roughly 5× require re-estimating BU-24, BU-26 and BU-40. |
| A9 | Three roles are sufficient; no separate PCD-analyst role is required. | Add to BU-02. |
| A10 | Phase 2 (BU-42) is deferred and may be cancelled. | If required at launch, add BU-42 to the year-1 total. |

---

## 9. Acceptance criteria

Release 1 is accepted when:

1. A user signs in via SSO and lands in the correct role, derived from HRIS.
2. An administrator uploads a competency file; validation errors are reported per line; committed skills appear on the named profiles with **pre-filled** provenance; coverage reporting reflects the load.
3. An employee removes a pre-filled skill, a second upload runs, and **the removed skill does not return**.
4. An employee sees a promoted vacancy with a match score and job description, is handed to HC Connect on a link carrying a referral code, is shown that code, and confirms afterwards that they applied.
5. A referral appearing in the HC Connect export is confirmed in the attribution report, inside the 30-day window; one outside the window is not.
6. The attribution report labels every figure by provenance, and shows an unavailable count as unavailable rather than as zero.
7. A manager posts a gig, an administrator approves it, an employee applies, the manager decides, and both parties complete the survey.
8. An application unanswered for 7 days generates an escalation email to the post owner, copied to PCD.
9. **Vacancy applications cannot be created through this system by any route**, including a direct API call.
10. Penetration test criticals and highs are remediated; the DPO has signed off DP-9 to DP-13.
11. NFR-1 to NFR-15 are met, evidenced.

---

## 10. Open questions for IT

1. **Which HC Connect integration points are available, and on what timeline?** Specifically INT-7 (source field), INT-8 (export), and whether INT-9/INT-10 are feasible at all. This determines whether phase 2 is a plan or a hope.
2. **Is the existing FastAPI backend a viable base, or is a rewrite cleaner?** (A6 — this is the largest single swing in the worksheet.)
3. **Is outbound access to the Anthropic API permitted, under what data classification, and with what retention terms?** (A7, DP-6.)
4. **Who owns the monthly reconciliation** (FR-4.11, FR-4.12) — PCD or IT? It is roughly four hours a quarter, but an unowned reconciliation silently becomes a zero.
5. **What is the retention period for view and referral logs?** (DP-11.) Views are the highest-volume and least valuable data in the system; a short retention would be sensible.
6. **Does HC Connect intend to add its own internal recommendations?** If so, the marketplace's remaining differentiator has a shelf life, and that belongs in the build-versus-defer conversation now rather than after.

---

## 11. Reference materials

| Document | Purpose |
|---|---|
| `docs/BRD.md` | BRD v1.0 — the reference for everything marked **U** |
| `docs/V2_EXPLORATION.md` | Why v2 is shaped this way; the attribution design and its honest limits |
| `docs/V2_CBA.md` | Cost-benefit analysis, competitive comparison, top-down cost estimate |
| `docs/Growth-v2-CBA.xlsx` | The CBA as a working model, with the vendor comparison |
| `docs/v2-cba-model.py` | Recomputes the business case from changed inputs |
| `docs/ARCHITECTURE.md` | v1 as built and the proposed production architecture |
| `prototype/talent-marketplace-v2.html` | The reference build — every ✔ in §7 |
| `prototype/v2-supabase-schema.sql` | Reference data model for the four new entities |
| `docs/BRD_V2.pdf` | This document as a PDF, for circulation. Regenerate with `docs/brd-to-pdf.py` + `docs/brd-to-pdf.js` after editing the markdown — do not hand-edit the PDF. |
