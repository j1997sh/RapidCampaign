create table if not exists public.postcode_geography_cache (
  postcode text primary key,
  postcode_compact text not null unique,
  parliamentary_constituency text,
  ward text,
  local_authority text,
  region text,
  latitude double precision,
  longitude double precision,
  source text not null default 'postcodes.io',
  raw jsonb not null default '{}'::jsonb,
  resolved_at timestamptz not null default now()
);
alter table public.postcode_geography_cache enable row level security;
create policy postcode_cache_admin_select on public.postcode_geography_cache for select to authenticated using (exists (select 1 from public.organisation_memberships m where m.user_id=(select auth.uid()) and m.role in ('global_admin','regional_admin')));
grant select on public.postcode_geography_cache to authenticated;
create index if not exists postcode_geography_constituency_idx on public.postcode_geography_cache(parliamentary_constituency);
create index if not exists postcode_geography_ward_idx on public.postcode_geography_cache(ward);
create index if not exists postcode_geography_authority_idx on public.postcode_geography_cache(local_authority);
create index if not exists postcode_geography_region_idx on public.postcode_geography_cache(region);
