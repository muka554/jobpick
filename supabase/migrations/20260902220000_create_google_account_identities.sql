-- JobPick Google OAuth account-linking contract.
-- Google `sub` is the immutable provider subject and is the identity key.
-- The CV backend must call the security-definer function with service_role only.
-- No Google access token, ID token, client secret, or CV content is stored here.

create table if not exists public.user_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google')),
  provider_subject text not null check (char_length(provider_subject) between 1 and 255),
  email text not null check (char_length(email) between 3 and 320),
  email_verified boolean not null default true,
  display_name text not null default '' check (char_length(display_name) <= 200),
  avatar_url text not null default '' check (char_length(avatar_url) <= 2048),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_login_at timestamptz not null default timezone('utc', now()),
  constraint user_identities_provider_subject_key unique (provider, provider_subject),
  constraint user_identities_user_provider_key unique (user_id, provider)
);

create index if not exists user_identities_user_id_idx
  on public.user_identities (user_id);

create or replace function public.set_user_identities_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists user_identities_set_updated_at on public.user_identities;
create trigger user_identities_set_updated_at
before update on public.user_identities
for each row execute function public.set_user_identities_updated_at();

alter table public.user_identities enable row level security;
alter table public.user_identities force row level security;

-- Identity rows are backend-managed. End users must not enumerate or mutate them.
revoke all on table public.user_identities from anon, authenticated, public;
grant select, insert, update on table public.user_identities to service_role;

create or replace function public.upsert_google_identity(
  p_user_id uuid,
  p_google_sub text,
  p_email text,
  p_display_name text default '',
  p_avatar_url text default ''
)
returns public.user_identities
language plpgsql
security definer
set search_path = public
as $$
declare
  v_identity public.user_identities;
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_name text := btrim(coalesce(p_display_name, ''));
  v_avatar text := btrim(coalesce(p_avatar_url, ''));
begin
  if p_user_id is null then raise exception 'user id is required'; end if;
  if p_google_sub is null or p_google_sub !~ '^[A-Za-z0-9._-]{1,255}$' then raise exception 'invalid Google subject'; end if;
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid verified Google email'; end if;
  if length(v_name) > 200 or length(v_avatar) > 2048 then raise exception 'Google profile field too long'; end if;

  -- Never silently reassign a provider identity to another local account.
  select * into v_identity
  from public.user_identities
  where provider = 'google' and provider_subject = p_google_sub
  for update;

  if found and v_identity.user_id <> p_user_id then
    raise exception 'Google identity is already linked to another account';
  end if;

  insert into public.user_identities
    (user_id, provider, provider_subject, email, email_verified, display_name, avatar_url, last_login_at)
  values
    (p_user_id, 'google', p_google_sub, v_email, true, v_name, v_avatar, timezone('utc', now()))
  on conflict (provider, provider_subject) do update
  set email = excluded.email,
      email_verified = true,
      display_name = excluded.display_name,
      avatar_url = excluded.avatar_url,
      last_login_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  returning * into v_identity;

  return v_identity;
end;
$$;

revoke all on function public.upsert_google_identity(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.upsert_google_identity(uuid, text, text, text, text) to service_role;

comment on table public.user_identities is
  'Backend-managed external login identities. Google accounts are keyed by immutable Google sub; tokens are never stored.';
comment on column public.user_identities.provider_subject is
  'Immutable Google OpenID Connect sub claim, not an email address.';
