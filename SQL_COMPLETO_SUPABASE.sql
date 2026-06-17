-- =====================================================================
-- TUUWEB - SQL COMPLETO PARA SUPABASE (pega TODO esto en el SQL Editor)
-- Corrige el error: "function public.update_updated_at_column() does not exist"
-- Es idempotente: lo puedes correr varias veces sin romper nada.
-- =====================================================================

-- 0) Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Función updated_at (la que faltaba)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) Enum de roles + tabla user_roles + has_role
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users see own roles" ON public.user_roles;
CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 3) Perfiles + trigger handle_new_user
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users see own profile" ON public.profiles;
CREATE POLICY "users see own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, coalesce(new.email,''),
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user') ON CONFLICT (user_id, role) DO NOTHING;
  RETURN new;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4) Tracker de proyectos vendidos
DROP TABLE IF EXISTS public.sold_projects CASCADE;
CREATE TABLE public.sold_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero int,
  cliente text NOT NULL,
  dominio text,
  tipo_pagina text,
  estado_proyecto text DEFAULT 'En proceso',
  estado_pagina text DEFAULT 'Inactiva',
  cotizacion_cop numeric DEFAULT 0,
  proveedor_dominio text,
  correo_dominio text,
  fecha_renovacion_dominio date,
  proveedor_hosting text,
  correo_hosting text,
  telefono_hosting text,
  fecha_renovacion_hosting date,
  base_datos text,
  correo_bd text,
  ia_usada text,
  correo_ia text,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sold_projects TO authenticated;
GRANT ALL ON public.sold_projects TO service_role;
ALTER TABLE public.sold_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin all sold_projects" ON public.sold_projects;
CREATE POLICY "admin all sold_projects" ON public.sold_projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP TRIGGER IF EXISTS sold_projects_updated ON public.sold_projects;
CREATE TRIGGER sold_projects_updated BEFORE UPDATE ON public.sold_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Galería de patrocinados
CREATE TABLE IF NOT EXISTS public.sponsor_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  imagen_url text,
  link_url text,
  activo boolean NOT NULL DEFAULT true,
  orden int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sponsor_gallery TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sponsor_gallery TO authenticated;
GRANT ALL ON public.sponsor_gallery TO service_role;
ALTER TABLE public.sponsor_gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read active sponsors" ON public.sponsor_gallery;
CREATE POLICY "public read active sponsors" ON public.sponsor_gallery FOR SELECT
  USING (activo = true OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "admin manage sponsors" ON public.sponsor_gallery;
CREATE POLICY "admin manage sponsors" ON public.sponsor_gallery FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP TRIGGER IF EXISTS sponsor_gallery_updated ON public.sponsor_gallery;
CREATE TRIGGER sponsor_gallery_updated BEFORE UPDATE ON public.sponsor_gallery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Popups promocionales
CREATE TABLE IF NOT EXISTS public.promo_popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  mensaje text,
  codigo text,
  imagen_url text,
  cta_text text DEFAULT 'Cotizar por WhatsApp',
  cta_url text,
  activo boolean NOT NULL DEFAULT true,
  frecuencia text NOT NULL DEFAULT 'session',
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promo_popups TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.promo_popups TO authenticated;
GRANT ALL ON public.promo_popups TO service_role;
ALTER TABLE public.promo_popups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read active popups" ON public.promo_popups;
CREATE POLICY "public read active popups" ON public.promo_popups FOR SELECT
  USING (activo = true OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "admin manage popups" ON public.promo_popups;
CREATE POLICY "admin manage popups" ON public.promo_popups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP TRIGGER IF EXISTS promo_popups_updated ON public.promo_popups;
CREATE TRIGGER promo_popups_updated BEFORE UPDATE ON public.promo_popups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Site content (textos editables)
CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read site_content" ON public.site_content;
CREATE POLICY "public read site_content" ON public.site_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin manage site_content" ON public.site_content;
CREATE POLICY "admin manage site_content" ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 8) redeem_admin_code (contraseña: 55249964paola)
CREATE OR REPLACE FUNCTION public.redeem_admin_code(_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE expected_hash text := '7439518ffdfb61a5b8095c3764217d0a24e31f74c70ebe0e204cc7d83adc1ea6';
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión primero'; END IF;
  IF encode(digest(coalesce(_code,''),'sha256'),'hex') <> expected_hash THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(),'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END; $$;

-- =====================================================================
-- PASO MANUAL FINAL: crear el usuario admin
-- Authentication → Users → Add user:
--   email: emanueldavxd@gmail.com
--   password: 55249964paola
--   Auto Confirm User: SI
-- Luego corre esto para asignarle el rol admin:
-- =====================================================================
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'emanueldavxd@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
