-- Talent Marketplace pilot — shared state for the clickable prototype.
-- Run once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query -> Run).
--
-- NOTE ON ACCESS: this is a pilot with no login. The policies below let anyone
-- holding the publishable key read and write these two tables. That is
-- deliberate so employees can test without accounts -- but it means anyone with
-- the link can see and change all pilot data. Do not put anything confidential
-- in it, and drop these tables when the pilot ends.

create table if not exists public.opportunities (
  id           bigint generated always as identity primary key,
  title        text        not null,
  type         text        not null default 'Gig',
  department   text        not null default '',
  description  text        default '',
  posted_by    text        not null default 'Anonymous',
  posted_role  text        not null default 'recruiter',
  status       text        not null default 'pending',   -- pending | live | rejected
  created_at   timestamptz not null default now()
);

create table if not exists public.applications (
  id             bigint generated always as identity primary key,
  opp_title      text        not null,
  opp_type       text        default 'Gig',
  applicant      text        not null default 'Anonymous',
  applicant_role text        default 'employee',
  essay          text        default '',
  status         text        not null default 'applied', -- applied | accepted | declined
  created_at     timestamptz not null default now()
);

alter table public.opportunities enable row level security;
alter table public.applications  enable row level security;

-- Policies are dropped first so this script can be re-run safely.
drop policy if exists pilot_read   on public.opportunities;
drop policy if exists pilot_insert on public.opportunities;
drop policy if exists pilot_update on public.opportunities;
create policy pilot_read   on public.opportunities for select using (true);
create policy pilot_insert on public.opportunities for insert with check (true);
create policy pilot_update on public.opportunities for update using (true) with check (true);

drop policy if exists pilot_read   on public.applications;
drop policy if exists pilot_insert on public.applications;
drop policy if exists pilot_update on public.applications;
create policy pilot_read   on public.applications for select using (true);
create policy pilot_insert on public.applications for insert with check (true);
create policy pilot_update on public.applications for update using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.opportunities to anon, authenticated;
grant select, insert, update on public.applications  to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
