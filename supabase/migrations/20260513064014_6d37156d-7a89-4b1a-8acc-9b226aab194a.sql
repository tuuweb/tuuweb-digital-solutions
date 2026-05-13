drop policy if exists "support_public_insert" on public.support_messages;
create policy "support_visitor_insert" on public.support_messages
for insert to anon
with check (user_id is null);
create policy "support_signed_insert" on public.support_messages
for insert to authenticated
with check (user_id is null or auth.uid() = user_id);

revoke execute on function public.update_updated_at_column() from anon, authenticated, public;
revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.redeem_admin_code(text) from anon, public;
grant execute on function public.redeem_admin_code(text) to authenticated;