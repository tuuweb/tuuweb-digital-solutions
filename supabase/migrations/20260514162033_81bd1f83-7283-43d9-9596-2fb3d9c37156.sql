create or replace function public.redeem_admin_code(_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  expected_hash text := '48f4b1592bb51f8f77ca28a5c5bf635398effc8fe4a1f5600e1fd34dfedc43ae';
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

revoke execute on function public.redeem_admin_code(text) from anon, public;
grant execute on function public.redeem_admin_code(text) to authenticated;