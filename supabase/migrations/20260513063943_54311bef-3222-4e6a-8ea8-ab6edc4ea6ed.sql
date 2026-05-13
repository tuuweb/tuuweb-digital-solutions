create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'user');

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.redeem_admin_code(_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  expected_hash text := '38bd89357ea88e627f4cd910986672e772099aac3065a40115503ee42df276a3';
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión primero';
  end if;

  if encode(digest(coalesce(_code, ''), 'sha256'), 'hex') <> expected_hash then
    return false;
  end if;

  insert into public.user_roles (user_id, role)
  values (auth.uid(), 'admin')
  on conflict (user_id, role) do nothing;

  return true;
end;
$$;

create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  cta_label text,
  cta_link text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.hero_slides enable row level security;

create table public.trusted_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  website_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.trusted_brands enable row level security;

create table public.physical_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price_cop integer not null default 0,
  stock integer not null default 0,
  images text[] not null default '{}',
  is_active boolean not null default true,
  is_coming_soon boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.physical_products enable row level security;

create table public.directory_recommendations (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  category text not null,
  description text not null default '',
  website_url text,
  logo_url text,
  is_coming_soon boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.directory_recommendations enable row level security;

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  email text not null,
  phone text,
  topic text,
  message text not null,
  status text not null default 'nuevo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.support_messages enable row level security;

create table public.sold_projects (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  category text not null,
  client_name text not null,
  client_contact text,
  domain text,
  price_cop integer not null default 0,
  sold_at date not null default current_date,
  notes text,
  status text not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.sold_projects enable row level security;

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid,
  item_type text not null default 'product',
  title text not null,
  price_cop integer not null default 0,
  quantity integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cart_items enable row level security;

create table public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  order_type text not null default 'product',
  title text not null,
  status text not null default 'recibido',
  total_cop integer not null default 0,
  tracking_code text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.customer_orders enable row level security;

create table public.web_project_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  project_type text not null,
  price_cop integer not null default 0,
  domain text,
  business_name text not null,
  description text not null default '',
  owner_contact text not null,
  renewal_date date,
  status text not null default 'cotizacion',
  admin_notes text,
  source text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.web_project_orders enable row level security;

create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger update_hero_slides_updated_at before update on public.hero_slides for each row execute function public.update_updated_at_column();
create trigger update_trusted_brands_updated_at before update on public.trusted_brands for each row execute function public.update_updated_at_column();
create trigger update_physical_products_updated_at before update on public.physical_products for each row execute function public.update_updated_at_column();
create trigger update_directory_recommendations_updated_at before update on public.directory_recommendations for each row execute function public.update_updated_at_column();
create trigger update_support_messages_updated_at before update on public.support_messages for each row execute function public.update_updated_at_column();
create trigger update_sold_projects_updated_at before update on public.sold_projects for each row execute function public.update_updated_at_column();
create trigger update_cart_items_updated_at before update on public.cart_items for each row execute function public.update_updated_at_column();
create trigger update_customer_orders_updated_at before update on public.customer_orders for each row execute function public.update_updated_at_column();
create trigger update_web_project_orders_updated_at before update on public.web_project_orders for each row execute function public.update_updated_at_column();

create policy "profiles_select_own_or_admin" on public.profiles for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "roles_select_own_or_admin" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "roles_admin_manage" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "hero_public_active" on public.hero_slides for select to anon, authenticated using (is_active = true);
create policy "hero_admin_manage" on public.hero_slides for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "brands_public_active" on public.trusted_brands for select to anon, authenticated using (is_active = true);
create policy "brands_admin_manage" on public.trusted_brands for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "products_public_active" on public.physical_products for select to anon, authenticated using (is_active = true);
create policy "products_admin_manage" on public.physical_products for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "directory_public_visible" on public.directory_recommendations for select to anon, authenticated using (is_coming_soon = false);
create policy "directory_admin_manage" on public.directory_recommendations for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "support_public_insert" on public.support_messages for insert to anon, authenticated with check (true);
create policy "support_user_select_own" on public.support_messages for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "support_admin_manage" on public.support_messages for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "sold_projects_admin_manage" on public.sold_projects for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "cart_user_manage_own" on public.cart_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cart_admin_view" on public.cart_items for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "orders_user_select_own" on public.customer_orders for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "orders_user_insert_own" on public.customer_orders for insert to authenticated with check (auth.uid() = user_id);
create policy "orders_admin_manage" on public.customer_orders for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "web_projects_user_select_own" on public.web_project_orders for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "web_projects_user_insert_own" on public.web_project_orders for insert to authenticated with check (auth.uid() = user_id or user_id is null);
create policy "web_projects_admin_manage" on public.web_project_orders for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create index idx_user_roles_user_role on public.user_roles(user_id, role);
create index idx_cart_items_user on public.cart_items(user_id);
create index idx_customer_orders_user on public.customer_orders(user_id);
create index idx_web_project_orders_user_status on public.web_project_orders(user_id, status);
create index idx_support_messages_status_created on public.support_messages(status, created_at desc);