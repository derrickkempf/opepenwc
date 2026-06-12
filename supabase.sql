-- Opepen World Cup — Supabase setup
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.
-- It creates the single key/value table the app shares (the match + every vote),
-- opens it for the public anon key, and turns on realtime so tallies update live.

create table if not exists public.kv (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

alter table public.kv enable row level security;

-- Public honour-system policies: anyone using the site (the public anon key) can
-- read and write. This is the simplest setup and matches a fun, open voting app.
-- For stricter control later, replace the "public write" policy with one scoped to
-- authenticated users (see the README note).
drop policy if exists "public read"  on public.kv;
drop policy if exists "public write" on public.kv;

create policy "public read"  on public.kv for select using (true);
create policy "public write" on public.kv for all    using (true) with check (true);

-- Turn on realtime for this table so votes/results update without a refresh.
-- (If this line errors with "already member", the table is already published — ignore it.)
alter publication supabase_realtime add table public.kv;
