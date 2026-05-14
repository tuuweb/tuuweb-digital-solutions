create extension if not exists pgcrypto;

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.process_admin_claim()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  expected_hash text := '48f4b1592bb51f8f77ca28a5c5bf635398effc8fe4a1f5600e1fd34dfedc43ae';
begin
  if new.user_id <> auth.uid() then
    raise exception 'No autorizado';
  end if;

  if new.code_hash <> expected_hash then
    raise exception 'Contraseña incorrecta';
  end if;

  insert into public.user_roles (user_id, role)
  values (new.user_id, 'admin')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

revoke execute on function public.process_admin_claim() from anon, authenticated, public;

drop trigger if exists process_admin_claim_trigger on public.admin_claims;
create trigger process_admin_claim_trigger
before insert on public.admin_claims
for each row execute function public.process_admin_claim();