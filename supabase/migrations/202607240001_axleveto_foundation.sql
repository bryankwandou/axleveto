create extension if not exists pgcrypto;

create type public.fleet_role as enum ('driver','dispatcher','maintenance_manager','fleet_admin');
create type public.vehicle_state as enum ('ready','attention','blocked');
create type public.inspection_state as enum ('draft','submitted','reviewed','rejected');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  role public.fleet_role not null,
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  unit_number text not null,
  plate text not null,
  make_model text not null,
  odometer bigint not null check (odometer >= 0),
  state public.vehicle_state not null default 'attention',
  created_at timestamptz not null default now(),
  unique (organization_id, unit_number)
);

create table public.driver_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  assigned_on date not null default current_date,
  released_at timestamptz
);

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  driver_id uuid not null references public.profiles(id) on delete restrict,
  raw_notes text not null,
  drafted_report jsonb not null,
  safety_flags jsonb not null default '[]'::jsonb,
  state public.inspection_state not null default 'draft',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

create table public.maintenance_intervals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  service_type text not null,
  due_odometer bigint not null,
  interval_miles integer not null check (interval_miles > 0),
  critical boolean not null default false,
  unique (vehicle_id, service_type)
);

create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  service_type text not null,
  completed_odometer bigint not null,
  parts_cost numeric(12,2) not null default 0,
  labor_cost numeric(12,2) not null default 0,
  notes text not null,
  completed_by uuid not null references public.profiles(id) on delete restrict,
  completed_at timestamptz not null default now()
);

create table public.dispatch_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  can_dispatch boolean not null,
  reasons jsonb not null,
  evaluated_by uuid references public.profiles(id) on delete restrict,
  evaluated_at timestamptz not null default now()
);

create table public.dispatch_overrides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  dispatch_log_id uuid not null references public.dispatch_log(id) on delete restrict,
  authorized_by uuid not null references public.profiles(id) on delete restrict,
  physical_verification boolean not null check (physical_verification),
  justification text not null check (length(trim(justification)) >= 30),
  created_at timestamptz not null default now()
);

create table public.proof_anchors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  record_type text not null,
  record_id uuid not null,
  digest text not null,
  network text not null default 'solana-devnet',
  signature text unique,
  anchored_at timestamptz
);

create or replace function public.current_organization_id() returns uuid language sql stable security definer set search_path=public as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_fleet_role() returns public.fleet_role language sql stable security definer set search_path=public as $$
  select role from public.profiles where id = auth.uid()
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.driver_assignments enable row level security;
alter table public.inspections enable row level security;
alter table public.maintenance_intervals enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.dispatch_log enable row level security;
alter table public.dispatch_overrides enable row level security;
alter table public.proof_anchors enable row level security;

create policy tenant_profiles on public.profiles for select using (organization_id = public.current_organization_id());
create policy tenant_vehicles on public.vehicles for select using (organization_id = public.current_organization_id());
create policy assigned_driver_vehicle on public.vehicles for select using (
  organization_id = public.current_organization_id() and (
    public.current_fleet_role() <> 'driver' or exists (
      select 1 from public.driver_assignments da where da.vehicle_id=vehicles.id and da.driver_id=auth.uid() and da.released_at is null
    )
  )
);
create policy tenant_inspections_select on public.inspections for select using (organization_id = public.current_organization_id());
create policy driver_inspections_insert on public.inspections for insert with check (organization_id = public.current_organization_id() and driver_id = auth.uid());
create policy maintenance_intervals_read on public.maintenance_intervals for select using (organization_id = public.current_organization_id());
create policy maintenance_records_read on public.maintenance_records for select using (organization_id = public.current_organization_id());
create policy maintenance_records_write on public.maintenance_records for insert with check (organization_id = public.current_organization_id() and public.current_fleet_role() in ('maintenance_manager','fleet_admin'));
create policy dispatch_log_read on public.dispatch_log for select using (organization_id = public.current_organization_id());
create policy dispatch_override_read on public.dispatch_overrides for select using (organization_id = public.current_organization_id());
create policy dispatch_override_write on public.dispatch_overrides for insert with check (organization_id = public.current_organization_id() and public.current_fleet_role() in ('maintenance_manager','fleet_admin'));
create policy proof_anchor_read on public.proof_anchors for select using (organization_id = public.current_organization_id());

create or replace function public.prevent_audit_mutation() returns trigger language plpgsql as $$ begin raise exception 'audit records are append-only'; end $$;
create trigger dispatch_log_immutable before update or delete on public.dispatch_log for each row execute function public.prevent_audit_mutation();
create trigger dispatch_overrides_immutable before update or delete on public.dispatch_overrides for each row execute function public.prevent_audit_mutation();
create trigger maintenance_records_immutable before update or delete on public.maintenance_records for each row execute function public.prevent_audit_mutation();

create or replace function public.reset_matching_interval() returns trigger language plpgsql security definer set search_path=public as $$
begin
  update public.maintenance_intervals
  set due_odometer = new.completed_odometer + interval_miles
  where vehicle_id = new.vehicle_id and lower(service_type) = lower(new.service_type);
  return new;
end $$;
create trigger maintenance_resets_interval after insert on public.maintenance_records for each row execute function public.reset_matching_interval();