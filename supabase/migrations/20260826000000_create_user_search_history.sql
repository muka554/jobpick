-- JobPick search-history sync
-- Apply with: supabase db push
-- This migration stores only optional, account-synced search-history entries.
-- Do not use a service-role key in the browser. The publishable key is protected by the grants and RLS policies below.

create extension if not exists pgcrypto;

create table if not exists public.user_search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default '' check (char_length(role) <= 80),
  country text not null check (country in ('uae', 'ksa', 'egypt', 'qatar', 'kuwait', 'oman', 'bahrain', 'jordan')),
  city text not null default 'any' check (city ~ '^[a-z]+$'),
  normalized_role text generated always as (lower(btrim(role))) stored,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint user_search_history_dedupe unique (user_id, normalized_role, country, city)
);

create index if not exists user_search_history_user_updated_idx
  on public.user_search_history (user_id, updated_at desc);

create or replace function public.set_user_search_history_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists user_search_history_set_updated_at on public.user_search_history;
create trigger user_search_history_set_updated_at
before update on public.user_search_history
for each row execute function public.set_user_search_history_updated_at();

alter table public.user_search_history enable row level security;
alter table public.user_search_history force row level security;

revoke all on table public.user_search_history from anon, authenticated;
grant select, insert, update, delete on table public.user_search_history to authenticated;

drop policy if exists "Users read their own search history" on public.user_search_history;
create policy "Users read their own search history"
on public.user_search_history
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users insert their own search history" on public.user_search_history;
create policy "Users insert their own search history"
on public.user_search_history
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users update their own search history" on public.user_search_history;
create policy "Users update their own search history"
on public.user_search_history
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users delete their own search history" on public.user_search_history;
create policy "Users delete their own search history"
on public.user_search_history
for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

comment on table public.user_search_history is
'Optional account-backed JobPick search history. Local-only history remains the default for visitors who do not enable sync.';
