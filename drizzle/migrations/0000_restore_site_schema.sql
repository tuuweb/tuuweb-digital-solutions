CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.admin_password_ok(_password text)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO 'public','extensions' AS $$
  SELECT encode(extensions.digest(coalesce(_password,''),'sha256'),'hex') = '7439518ffdfb61a5b8095c3764217d0a24e31f74c70ebe0e204cc7d83adc1ea6'
$$;

CREATE OR REPLACE FUNCTION public.admin_header_password_ok()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO 'public' AS $$
  SELECT public.admin_password_ok(coalesce(nullif(current_setting('request.headers', true),'')::jsonb ->> 'x-admin-password',''))
$$;
REVOKE ALL ON FUNCTION public.admin_password_ok(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_header_password_ok() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_password_ok(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_header_password_ok() TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY, value text, updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, subtitle text,
  image_url text NOT NULL, cta_label text, cta_link text, is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.why_web_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kicker text, title text NOT NULL,
  description text NOT NULL DEFAULT '', stat text, image_url text NOT NULL DEFAULT '',
  accent text NOT NULL DEFAULT '#f97316', cta_label text, cta_link text,
  is_active boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.web_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), category text NOT NULL DEFAULT 'cat1',
  title text NOT NULL, description text NOT NULL DEFAULT '', price_cop numeric NOT NULL DEFAULT 0,
  old_price_cop numeric, badge text, image_url text NOT NULL DEFAULT '',
  features text[] NOT NULL DEFAULT '{}', is_popular boolean NOT NULL DEFAULT false,
  is_package boolean NOT NULL DEFAULT false, is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.physical_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, description text NOT NULL DEFAULT '',
  price_cop numeric NOT NULL DEFAULT 0, stock int NOT NULL DEFAULT 0, images text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}', is_active boolean NOT NULL DEFAULT true, is_coming_soon boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.directory_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_name text NOT NULL, category text NOT NULL,
  description text NOT NULL DEFAULT '', logo_url text, website_url text, is_coming_soon boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.trusted_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, logo_url text NOT NULL,
  website_url text, is_active boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.sponsor_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), titulo text NOT NULL, descripcion text, imagen_url text,
  link_url text, activo boolean NOT NULL DEFAULT true, orden int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.promo_popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), titulo text NOT NULL, mensaje text, codigo text,
  imagen_url text, cta_text text DEFAULT 'Cotizar por WhatsApp', cta_url text, activo boolean NOT NULL DEFAULT true,
  frecuencia text NOT NULL DEFAULT 'session', fecha_inicio timestamptz, fecha_fin timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, email text NOT NULL, phone text,
  topic text, message text NOT NULL, status text NOT NULL DEFAULT 'nuevo', user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.sold_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), numero int, cliente text NOT NULL, dominio text,
  tipo_pagina text, estado_proyecto text DEFAULT 'En proceso', estado_pagina text DEFAULT 'Inactiva',
  cotizacion_cop numeric DEFAULT 0, proveedor_dominio text, correo_dominio text, fecha_renovacion_dominio date,
  proveedor_hosting text, correo_hosting text, telefono_hosting text, fecha_renovacion_hosting date,
  base_datos text, correo_bd text, ia_usada text, correo_ia text, notas text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['site_content','hero_slides','why_web_slides','web_plans','physical_products',
    'directory_recommendations','trusted_brands','sponsor_gallery','promo_popups','support_messages','sold_projects']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('DROP POLICY IF EXISTS "admin password all" ON public.%I', t);
    EXECUTE format('CREATE POLICY "admin password all" ON public.%I FOR ALL TO anon, authenticated USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok())', t);
    IF t <> 'sold_projects' AND t <> 'support_messages' THEN
      EXECUTE format('DROP POLICY IF EXISTS "public read" ON public.%I', t);
      EXECUTE format('CREATE POLICY "public read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    END IF;
    IF t <> 'site_content' THEN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t||'_updated', t);
      EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t||'_updated', t);
    END IF;
  END LOOP;
END $$;

DROP POLICY IF EXISTS "public insert support" ON public.support_messages;
CREATE POLICY "public insert support" ON public.support_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO public.trusted_brands (name, logo_url, sort_order) VALUES
 ('Aliado 1','https://i.ibb.co/Hw37Z44/imagen-2026-04-14-022022200.png',1),
 ('Aliado 2','https://i.ibb.co/yc50fWW4/Captura-de-pantalla-2026-04-24-001156.png',2),
 ('Aliado 3','https://i.ibb.co/vrQHzk5/Gemini-Generated-Image-989vzv989vzv989v-1.png',3);