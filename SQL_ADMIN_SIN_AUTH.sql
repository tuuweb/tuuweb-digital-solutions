-- =====================================================================
-- TUUWEB - ARREGLO ADMIN SIN AUTH
-- Pega TODO esto en el SQL Editor si alguna vez necesitas reparar el panel.
-- El panel /admin-emanuel queda con solo contraseña, sin correo ni usuario.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Corrige el error: column "updated_at" of relation "profiles" does not exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, updated_at)
  VALUES (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$$;

-- Valida la contraseña del panel sin guardar la clave en texto plano.
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

-- Limpia funciones viejas del intento con auth.
DROP FUNCTION IF EXISTS public.admin_read_table(text, text);
DROP FUNCTION IF EXISTS public.admin_insert_row(text, text, jsonb);
DROP FUNCTION IF EXISTS public.admin_update_row(text, text, uuid, jsonb);
DROP FUNCTION IF EXISTS public.admin_delete_row(text, text, uuid);
DROP FUNCTION IF EXISTS public.admin_upsert_site_content(text, text, text);
DROP FUNCTION IF EXISTS public.admin_assert_password(text);
DROP FUNCTION IF EXISTS public.admin_allowed_table(text);

-- Permisos para editar desde el panel cuando se envía la contraseña privada.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sold_projects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsor_gallery TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_popups TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trusted_brands TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.physical_products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.directory_recommendations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_slides TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_messages TO anon, authenticated;

-- Quita políticas viejas que dependían de correo/rol admin.
DROP POLICY IF EXISTS "admin all sold_projects" ON public.sold_projects;
DROP POLICY IF EXISTS "admin manage sponsors" ON public.sponsor_gallery;
DROP POLICY IF EXISTS "admin manage popups" ON public.promo_popups;
DROP POLICY IF EXISTS "admin manage site_content" ON public.site_content;
DROP POLICY IF EXISTS "brands_admin_manage" ON public.trusted_brands;
DROP POLICY IF EXISTS "products_admin_manage" ON public.physical_products;
DROP POLICY IF EXISTS "directory_admin_manage" ON public.directory_recommendations;
DROP POLICY IF EXISTS "hero_admin_manage" ON public.hero_slides;
DROP POLICY IF EXISTS "support_admin_manage" ON public.support_messages;

-- Crea políticas nuevas por contraseña para cada tabla administrable.
DROP POLICY IF EXISTS "password admin all sold_projects" ON public.sold_projects;
CREATE POLICY "password admin all sold_projects" ON public.sold_projects
FOR ALL TO anon, authenticated USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all sponsor_gallery" ON public.sponsor_gallery;
CREATE POLICY "password admin all sponsor_gallery" ON public.sponsor_gallery
FOR ALL TO anon, authenticated USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all promo_popups" ON public.promo_popups;
CREATE POLICY "password admin all promo_popups" ON public.promo_popups
FOR ALL TO anon, authenticated USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all site_content" ON public.site_content;
CREATE POLICY "password admin all site_content" ON public.site_content
FOR ALL TO anon, authenticated USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all trusted_brands" ON public.trusted_brands;
CREATE POLICY "password admin all trusted_brands" ON public.trusted_brands
FOR ALL TO anon, authenticated USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all physical_products" ON public.physical_products;
CREATE POLICY "password admin all physical_products" ON public.physical_products
FOR ALL TO anon, authenticated USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all directory_recommendations" ON public.directory_recommendations;
CREATE POLICY "password admin all directory_recommendations" ON public.directory_recommendations
FOR ALL TO anon, authenticated USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all hero_slides" ON public.hero_slides;
CREATE POLICY "password admin all hero_slides" ON public.hero_slides
FOR ALL TO anon, authenticated USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());

DROP POLICY IF EXISTS "password admin all support_messages" ON public.support_messages;
CREATE POLICY "password admin all support_messages" ON public.support_messages
FOR ALL TO anon, authenticated USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());