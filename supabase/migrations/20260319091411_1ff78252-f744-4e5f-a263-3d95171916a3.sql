
-- Create app_role enum
create type public.app_role as enum ('admin', 'user');

-- User roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

-- Security definer function for role checking
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Brands
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  letter text not null default '',
  gradient text not null default 'from-blue-500 to-cyan-500',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Series
create table public.series (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade not null,
  name text not null,
  created_at timestamptz not null default now()
);

-- Models
create table public.models (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade not null,
  name text not null,
  created_at timestamptz not null default now()
);

-- Model Screen Guards
create table public.model_screen_guards (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references public.models(id) on delete cascade not null,
  guard_type text not null,
  price numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  model_id uuid references public.models(id) on delete set null,
  guard_type text,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

-- RLS Policies

-- Brands: public read, admin write
create policy "Anyone can read brands" on public.brands for select using (true);
create policy "Admins can insert brands" on public.brands for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update brands" on public.brands for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete brands" on public.brands for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Series: public read, admin write
create policy "Anyone can read series" on public.series for select using (true);
create policy "Admins can insert series" on public.series for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update series" on public.series for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete series" on public.series for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Models: public read, admin write
create policy "Anyone can read models" on public.models for select using (true);
create policy "Admins can insert models" on public.models for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update models" on public.models for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete models" on public.models for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Model Screen Guards: public read, admin write
create policy "Anyone can read model_screen_guards" on public.model_screen_guards for select using (true);
create policy "Admins can insert guards" on public.model_screen_guards for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update guards" on public.model_screen_guards for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete guards" on public.model_screen_guards for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Bookings: anyone can create, admin can manage
create policy "Anyone can insert bookings" on public.bookings for insert with check (true);
create policy "Admins can read bookings" on public.bookings for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update bookings" on public.bookings for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete bookings" on public.bookings for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- User roles: admin can read
create policy "Admins can read user_roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
