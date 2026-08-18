-- Talent Marketplace v2 — shared state for the exploration prototype.
--
-- Run once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query -> Run).
-- Every table is v2_-prefixed and independent of the v1 pilot tables, so v1
-- (live at ruffa06.github.io/Talent-Marketplace) keeps running untouched while
-- this is being tried out. Dropping every v2_ table removes the whole experiment.
--
-- WHAT CHANGED FROM v1
--   * No Recruiter role. Managers post gigs, DJIs and service requests;
--     People & Culture (admin) moderates and curates the vacancy board.
--   * No vacancy application flow. Permanent roles are run in the recruitment
--     system ("Careers"). This app promotes them and hands people over on a
--     tracked link, then reconciles against the Careers export.
--
-- NOTE ON ACCESS: as in v1, this is a pilot with no login. The policies below
-- let anyone holding the publishable key read and write these tables. That is
-- deliberate so employees can test without accounts -- but it means anyone with
-- the link can see and change all pilot data, including who was referred to
-- which requisition. Referral rows name employees and the roles they looked at,
-- which is more sensitive than v1's data: do not run this beyond a consenting
-- pilot group, and drop the tables when the pilot ends.

-- ── Opportunities you still apply for inside the marketplace ────────────────
-- Gig, Developmental Job Immersion, Service Offer, Service Request.
-- 'Vacancy' is deliberately absent: v2 does not take vacancy applications.
create table if not exists public.v2_opportunities (
  id           bigint generated always as identity primary key,
  title        text        not null,
  type         text        not null default 'Gig',
  department   text        not null default '',
  description  text        default '',
  posted_by    text        not null default 'Anonymous',
  posted_role  text        not null default 'manager',
  status       text        not null default 'pending',   -- pending | live | rejected
  created_at   timestamptz not null default now(),
  constraint v2_opportunities_type_not_vacancy check (lower(type) <> 'vacancy')
);

create table if not exists public.v2_applications (
  id             bigint generated always as identity primary key,
  opp_title      text        not null,
  opp_type       text        default 'Gig',
  applicant      text        not null default 'Anonymous',
  applicant_role text        default 'employee',
  essay          text        default '',
  status         text        not null default 'applied', -- applied | accepted | declined
  created_at     timestamptz not null default now()
);

-- ── Promoted requisitions ───────────────────────────────────────────────────
-- A pointer to a requisition that lives in Careers. Nothing here creates,
-- edits or closes a requisition; req_id is the join key to the ATS and is the
-- single most important column in this schema.
create table if not exists public.v2_vacancies (
  id           bigint generated always as identity primary key,
  req_id       text        not null unique,             -- Careers requisition ID
  title        text        not null,
  department   text        not null default '',
  location     text        default '',
  ats_url      text,                                    -- deep link into Careers
  jd_url       text,                                    -- link to the job description document
  closes_on    date,
  posted_by    text        not null default 'Anonymous', -- who promoted it here
  status       text        not null default 'live',      -- live | closed
  created_at   timestamptz not null default now()
);

-- ── Reach: who saw a promoted role ──────────────────────────────────────────
-- Throttled client-side to one row per viewer / requisition / day, so this
-- measures reach rather than how often somebody reloads the board. It is the
-- denominator of the click-through rate and nothing else.
create table if not exists public.v2_vacancy_views (
  id         bigint generated always as identity primary key,
  req_id     text        not null,
  viewer     text        not null default 'anonymous',
  created_at timestamptz not null default now()
);
create index if not exists v2_vacancy_views_req_idx on public.v2_vacancy_views (req_id, created_at desc);

-- ── The handoff: one row per person sent to Careers ─────────────────────────
-- This is the table the whole v2 measurement question hangs on.
--
--   code       the referral code shown to the employee and carried on the link
--              as ?src=growth&gref=<code>. It is what the Careers export joins
--              back to. Short, unambiguous alphabet (no I/O/0/1) because people
--              retype it by hand into a free-text field.
--   outcome    the employee's own answer to "did you apply?". SELF-REPORTED --
--              free, biased upward, never to be quoted as a hard number.
--   verified   set during the monthly reconciliation, when a row in the Careers
--              export carries this code or a source of 'Growth Marketplace'.
--              This is the only column fit for a paper that goes to Exco.
--
-- Attribution rule enforced at reconciliation time, not here: an application is
-- credited to the marketplace when a referral precedes it by no more than 30
-- days, last touch. Undercounting is the intended failure mode.
create table if not exists public.v2_vacancy_referrals (
  id             bigint generated always as identity primary key,
  code           text        not null unique,
  req_id         text        not null,
  vacancy_title  text        not null default '',
  department     text        default '',
  employee       text        not null default 'Anonymous',
  source         text        default 'board',            -- board | matches | search | digest
  outcome        text,                                   -- null | applied | no
  outcome_at     timestamptz,
  verified       boolean     not null default false,     -- confirmed against the Careers export
  verified_at    timestamptz,
  verified_source text       default 'Careers export',
  created_at     timestamptz not null default now()
);
create index if not exists v2_vacancy_referrals_req_idx on public.v2_vacancy_referrals (req_id, created_at desc);
create index if not exists v2_vacancy_referrals_emp_idx on public.v2_vacancy_referrals (employee);

-- ── Row level security ──────────────────────────────────────────────────────
alter table public.v2_opportunities       enable row level security;
alter table public.v2_applications        enable row level security;
alter table public.v2_vacancies           enable row level security;
alter table public.v2_vacancy_views       enable row level security;
alter table public.v2_vacancy_referrals   enable row level security;

-- Policies are dropped first so this script can be re-run safely.
do $$
declare t text;
begin
  foreach t in array array['v2_opportunities','v2_applications','v2_vacancies','v2_vacancy_views','v2_vacancy_referrals']
  loop
    execute format('drop policy if exists pilot_read   on public.%I', t);
    execute format('drop policy if exists pilot_insert on public.%I', t);
    execute format('drop policy if exists pilot_update on public.%I', t);
    execute format('create policy pilot_read   on public.%I for select using (true)', t);
    execute format('create policy pilot_insert on public.%I for insert with check (true)', t);
    execute format('create policy pilot_update on public.%I for update using (true) with check (true)', t);
  end loop;
end $$;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.v2_opportunities     to anon, authenticated;
grant select, insert, update on public.v2_applications      to anon, authenticated;
grant select, insert, update on public.v2_vacancies         to anon, authenticated;
grant select, insert         on public.v2_vacancy_views     to anon, authenticated;
grant select, insert, update on public.v2_vacancy_referrals to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- ── The reconciliation query ────────────────────────────────────────────────
-- Load the monthly Careers export into a staging table with at least
-- (referral_code, req_id, employee, applied_at), then:
--
--   update public.v2_vacancy_referrals r
--      set verified = true, verified_at = now(), verified_source = 'Careers export'
--     from careers_export e
--    where upper(trim(e.referral_code)) = r.code
--      and e.applied_at >= r.created_at
--      and e.applied_at <  r.created_at + interval '30 days';
--
-- Rows that do not join are not evidence of anything. Leave them unverified.
