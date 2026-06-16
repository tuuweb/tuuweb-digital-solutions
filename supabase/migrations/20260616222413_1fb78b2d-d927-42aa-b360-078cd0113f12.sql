
-- 1. Sold projects: rebuild with all tracker columns
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
CREATE POLICY "admin all sold_projects" ON public.sold_projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER sold_projects_updated BEFORE UPDATE ON public.sold_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Sponsor gallery
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
CREATE POLICY "public read active sponsors" ON public.sponsor_gallery FOR SELECT USING (activo = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin manage sponsors" ON public.sponsor_gallery FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER sponsor_gallery_updated BEFORE UPDATE ON public.sponsor_gallery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Promo popups
CREATE TABLE IF NOT EXISTS public.promo_popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  mensaje text,
  codigo text,
  imagen_url text,
  cta_text text DEFAULT 'Cotizar por WhatsApp',
  cta_url text,
  activo boolean NOT NULL DEFAULT true,
  frecuencia text NOT NULL DEFAULT 'session', -- session | always
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promo_popups TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.promo_popups TO authenticated;
GRANT ALL ON public.promo_popups TO service_role;
ALTER TABLE public.promo_popups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active popups" ON public.promo_popups FOR SELECT USING (activo = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin manage popups" ON public.promo_popups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER promo_popups_updated BEFORE UPDATE ON public.promo_popups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Site content (clave/valor para textos editables)
CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read site_content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "admin manage site_content" ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Update admin password hash to new password "55249964paola"
CREATE OR REPLACE FUNCTION public.redeem_admin_code(_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  expected_hash text := '7439518ffdfb61a5b8095c3764217d0a24e31f74c70ebe0e204cc7d83adc1ea6';
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
$function$;

CREATE OR REPLACE FUNCTION public.process_admin_claim()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  expected_hash text := '7439518ffdfb61a5b8095c3764217d0a24e31f74c70ebe0e204cc7d83adc1ea6';
begin
  if new.user_id <> auth.uid() then raise exception 'No autorizado'; end if;
  if new.code_hash <> expected_hash then raise exception 'Contraseña incorrecta'; end if;
  insert into public.user_roles (user_id, role)
  values (new.user_id, 'admin')
  on conflict (user_id, role) do nothing;
  return new;
end;
$function$;
