
-- Roles
create type public.app_role as enum ('admin','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select
  to authenticated using (auth.uid() = user_id);
create policy "Admins read all roles" on public.user_roles for select
  to authenticated using (public.has_role(auth.uid(),'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company text,
  facility text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "Users read own profile" on public.profiles for select
  to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update
  to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert
  to authenticated with check (auth.uid() = id);
create policy "Admins read all profiles" on public.profiles for select
  to authenticated using (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user')
  on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Calculations
create table public.calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  saved_name text,
  scope text not null,                 -- Stationary / Mobile / Electricity
  category text not null,
  product_name text not null,
  quantity numeric not null,
  unit text not null,
  co2_kg numeric not null default 0,
  ch4_kg numeric not null default 0,
  n2o_kg numeric not null default 0,
  co2e_kg numeric not null default 0,
  ef_source text,
  ef_details jsonb,
  company text,
  facility text,
  notes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.calculations to authenticated;
grant all on public.calculations to service_role;
alter table public.calculations enable row level security;

create policy "Users manage own calculations" on public.calculations for all
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins read all calculations" on public.calculations for select
  to authenticated using (public.has_role(auth.uid(),'admin'));

create index calculations_user_created_idx on public.calculations(user_id, created_at desc);
create index calculations_scope_idx on public.calculations(scope);

-- updated_at trigger for profiles
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
