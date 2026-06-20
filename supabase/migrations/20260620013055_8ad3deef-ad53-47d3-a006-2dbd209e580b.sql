CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.admin_password_ok(_password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public', 'extensions'
AS $$
  SELECT encode(digest(coalesce(_password, ''), 'sha256'), 'hex') = '7439518ffdfb61a5b8095c3764217d0a24e31f74c70ebe0e204cc7d83adc1ea6'
$$;

CREATE OR REPLACE FUNCTION public.admin_header_password_ok()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT public.admin_password_ok(
    coalesce(
      nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-admin-password',
      ''
    )
  )
$$;

REVOKE ALL ON FUNCTION public.admin_password_ok(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_header_password_ok() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_password_ok(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_header_password_ok() TO anon, authenticated;

REVOKE ALL ON FUNCTION public.admin_assert_password(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_allowed_table(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_read_table(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_insert_row(text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_row(text, text, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_delete_row(text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_upsert_site_content(text, text, text) FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sold_projects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsor_gallery TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_popups TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trusted_brands TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.physical_products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.directory_recommendations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_slides TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_messages TO anon, authenticated;

DROP POLICY IF EXISTS "password admin all sold_projects" ON public.sold_projects;
CREATE POLICY "password admin all sold_projects" ON public.sold_projects
FOR ALL TO anon, authenticated
USING (public.admin_header_password_ok())
WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all sponsor_gallery" ON public.sponsor_gallery;
CREATE POLICY "password admin all sponsor_gallery" ON public.sponsor_gallery
FOR ALL TO anon, authenticated
USING (public.admin_header_password_ok())
WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all promo_popups" ON public.promo_popups;
CREATE POLICY "password admin all promo_popups" ON public.promo_popups
FOR ALL TO anon, authenticated
USING (public.admin_header_password_ok())
WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all site_content" ON public.site_content;
CREATE POLICY "password admin all site_content" ON public.site_content
FOR ALL TO anon, authenticated
USING (public.admin_header_password_ok())
WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all trusted_brands" ON public.trusted_brands;
CREATE POLICY "password admin all trusted_brands" ON public.trusted_brands
FOR ALL TO anon, authenticated
USING (public.admin_header_password_ok())
WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all physical_products" ON public.physical_products;
CREATE POLICY "password admin all physical_products" ON public.physical_products
FOR ALL TO anon, authenticated
USING (public.admin_header_password_ok())
WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all directory_recommendations" ON public.directory_recommendations;
CREATE POLICY "password admin all directory_recommendations" ON public.directory_recommendations
FOR ALL TO anon, authenticated
USING (public.admin_header_password_ok())
WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all hero_slides" ON public.hero_slides;
CREATE POLICY "password admin all hero_slides" ON public.hero_slides
FOR ALL TO anon, authenticated
USING (public.admin_header_password_ok())
WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all support_messages" ON public.support_messages;
CREATE POLICY "password admin all support_messages" ON public.support_messages
FOR ALL TO anon, authenticated
USING (public.admin_header_password_ok())
WITH CHECK (public.admin_header_password_ok());