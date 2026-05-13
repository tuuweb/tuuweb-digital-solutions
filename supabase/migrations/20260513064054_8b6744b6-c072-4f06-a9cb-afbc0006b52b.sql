revoke execute on function public.redeem_admin_code(text) from authenticated;

create table if not exists public.admin_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  code_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_claims enable row level security;

create or replace function public.process_admin_claim()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  expected_hash text := '38bd89357ea88e627f4cd910986672e772099aac3065a40115503ee42df276e772099aac3065a40115503ee42df276a3';
begin
  expected_hash := '38bd89357ea88e627f4cd910986672e772099aac3065a40115503ee42df276a3';
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

create policy "admin_claim_insert_own" on public.admin_claims
for insert to authenticated
with check (auth.uid() = user_id);

create policy "admin_claim_select_admin" on public.admin_claims
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "admin_claim_delete_admin" on public.admin_claims
for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));