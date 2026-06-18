REVOKE ALL ON FUNCTION public.redeem_admin_code(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_admin_code(text) FROM anon;
REVOKE ALL ON FUNCTION public.redeem_admin_code(text) FROM authenticated;

DROP POLICY IF EXISTS "roles_admin_manage" ON public.user_roles;
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;

DROP POLICY IF EXISTS "users see own roles" ON public.user_roles;
CREATE POLICY "users see own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());