-- Reutiliza sold_projects como tabla de proyectos
ALTER TABLE public.sold_projects
  ADD COLUMN IF NOT EXISTS nombre_proyecto text,
  ADD COLUMN IF NOT EXISTS servicios text[] NOT NULL DEFAULT '{}';

-- Catálogo de proveedores/opciones
CREATE TABLE IF NOT EXISTS public.provider_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_options TO anon, authenticated;
GRANT ALL ON public.provider_options TO service_role;
ALTER TABLE public.provider_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin password all" ON public.provider_options FOR ALL TO anon, authenticated
  USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());
CREATE TRIGGER provider_options_updated BEFORE UPDATE ON public.provider_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Clave de cifrado (inaccesible desde el cliente)
CREATE TABLE IF NOT EXISTS public.app_crypto_keys (
  id text PRIMARY KEY,
  secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_crypto_keys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_crypto_keys FROM anon, authenticated;
GRANT ALL ON public.app_crypto_keys TO service_role;
INSERT INTO public.app_crypto_keys (id, secret)
VALUES ('credentials', encode(extensions.gen_random_bytes(32), 'hex'))
ON CONFLICT (id) DO NOTHING;

-- Credenciales (secreto cifrado)
CREATE TABLE IF NOT EXISTS public.project_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.sold_projects(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'otros',
  provider text NOT NULL DEFAULT '',
  username text,
  url text,
  notes text,
  secret_cipher text,
  has_secret boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.project_credentials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.project_credentials FROM anon, authenticated;
GRANT SELECT (id, project_id, kind, provider, username, url, notes, has_secret, created_at, updated_at)
  ON public.project_credentials TO anon, authenticated;
GRANT DELETE ON public.project_credentials TO anon, authenticated;
GRANT ALL ON public.project_credentials TO service_role;
CREATE POLICY "admin password all" ON public.project_credentials FOR ALL TO anon, authenticated
  USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());
CREATE TRIGGER project_credentials_updated BEFORE UPDATE ON public.project_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Repositorios
CREATE TABLE IF NOT EXISTS public.project_repos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.sold_projects(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'GitHub',
  username text,
  repo text,
  url text,
  branch text DEFAULT 'main',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_repos TO anon, authenticated;
GRANT ALL ON public.project_repos TO service_role;
ALTER TABLE public.project_repos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin password all" ON public.project_repos FOR ALL TO anon, authenticated
  USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());
CREATE TRIGGER project_repos_updated BEFORE UPDATE ON public.project_repos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Renovaciones
CREATE TABLE IF NOT EXISTS public.project_renewals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.sold_projects(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'dominio',
  provider text,
  renewal_date date,
  price_cop numeric NOT NULL DEFAULT 0,
  periodicity text NOT NULL DEFAULT 'anual',
  status text NOT NULL DEFAULT 'activa',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_renewals TO anon, authenticated;
GRANT ALL ON public.project_renewals TO service_role;
ALTER TABLE public.project_renewals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin password all" ON public.project_renewals FOR ALL TO anon, authenticated
  USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());
CREATE TRIGGER project_renewals_updated BEFORE UPDATE ON public.project_renewals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.renewal_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  renewal_id uuid NOT NULL REFERENCES public.project_renewals(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.sold_projects(id) ON DELETE CASCADE,
  renewed_on date NOT NULL DEFAULT current_date,
  previous_date date,
  new_date date,
  price_cop numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.renewal_history TO anon, authenticated;
GRANT ALL ON public.renewal_history TO service_role;
ALTER TABLE public.renewal_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin password all" ON public.renewal_history FOR ALL TO anon, authenticated
  USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());

-- Guardar credencial cifrada
CREATE OR REPLACE FUNCTION public.admin_save_credential(
  _id uuid, _project_id uuid, _kind text, _provider text,
  _username text, _password text, _url text, _notes text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','extensions' AS $$
DECLARE k text; cipher text; out_id uuid;
BEGIN
  IF NOT public.admin_header_password_ok() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  SELECT secret INTO k FROM public.app_crypto_keys WHERE id = 'credentials';
  IF _password IS NOT NULL AND _password <> '' THEN
    cipher := encode(extensions.pgp_sym_encrypt(_password, k), 'base64');
  END IF;
  IF _id IS NULL THEN
    INSERT INTO public.project_credentials (project_id, kind, provider, username, url, notes, secret_cipher, has_secret)
    VALUES (_project_id, coalesce(_kind,'otros'), coalesce(_provider,''), _username, _url, _notes, cipher, cipher IS NOT NULL)
    RETURNING id INTO out_id;
  ELSE
    UPDATE public.project_credentials SET
      project_id = _project_id, kind = coalesce(_kind,'otros'), provider = coalesce(_provider,''),
      username = _username, url = _url, notes = _notes,
      secret_cipher = coalesce(cipher, secret_cipher),
      has_secret = (coalesce(cipher, secret_cipher) IS NOT NULL)
    WHERE id = _id RETURNING id INTO out_id;
  END IF;
  RETURN out_id;
END; $$;

-- Revelar credencial
CREATE OR REPLACE FUNCTION public.admin_reveal_credential(_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','extensions' AS $$
DECLARE k text; c text;
BEGIN
  IF NOT public.admin_header_password_ok() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  SELECT secret INTO k FROM public.app_crypto_keys WHERE id = 'credentials';
  SELECT secret_cipher INTO c FROM public.project_credentials WHERE id = _id;
  IF c IS NULL THEN RETURN NULL; END IF;
  RETURN extensions.pgp_sym_decrypt(decode(c,'base64'), k);
END; $$;

-- Marcar renovación como hecha
CREATE OR REPLACE FUNCTION public.admin_mark_renewed(_id uuid, _notes text DEFAULT NULL)
RETURNS date LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE r public.project_renewals; base date; next_date date; step interval;
BEGIN
  IF NOT public.admin_header_password_ok() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  SELECT * INTO r FROM public.project_renewals WHERE id = _id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Renovación no encontrada'; END IF;
  step := CASE lower(coalesce(r.periodicity,'anual'))
            WHEN 'mensual' THEN interval '1 month'
            WHEN 'trimestral' THEN interval '3 months'
            WHEN 'semestral' THEN interval '6 months'
            WHEN 'bianual' THEN interval '2 years'
            ELSE interval '1 year' END;
  base := greatest(coalesce(r.renewal_date, current_date), current_date);
  next_date := (base + step)::date;
  INSERT INTO public.renewal_history (renewal_id, project_id, renewed_on, previous_date, new_date, price_cop, notes)
  VALUES (r.id, r.project_id, current_date, r.renewal_date, next_date, r.price_cop, _notes);
  UPDATE public.project_renewals SET renewal_date = next_date, status = 'activa' WHERE id = r.id;
  IF r.kind = 'dominio' THEN
    UPDATE public.sold_projects SET fecha_renovacion_dominio = next_date WHERE id = r.project_id;
  ELSIF r.kind = 'hosting' THEN
    UPDATE public.sold_projects SET fecha_renovacion_hosting = next_date WHERE id = r.project_id;
  END IF;
  RETURN next_date;
END; $$;

REVOKE ALL ON FUNCTION public.admin_save_credential(uuid,uuid,text,text,text,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_reveal_credential(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_mark_renewed(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_save_credential(uuid,uuid,text,text,text,text,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reveal_credential(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_mark_renewed(uuid,text) TO anon, authenticated;

-- Catálogos iniciales
INSERT INTO public.provider_options (kind, name, sort_order) VALUES
 ('ia','Lovable',1),('ia','Bolt',2),('ia','Cursor',3),('ia','Claude',4),('ia','ChatGPT',5),('ia','Otra',9),
 ('hosting','Hostinger',1),('hosting','Vercel',2),('hosting','Netlify',3),('hosting','VPS',4),('hosting','Otro',9),
 ('dominio','GoDaddy',1),('dominio','Namecheap',2),('dominio','Cloudflare',3),('dominio','Spaceship',4),('dominio','Otro',9),
 ('empresa','TuuWeb',1),('empresa','Otro',9),
 ('email','Gmail',1),('email','Outlook',2),('email','Zoho',3),('email','Otro',9),
 ('github','GitHub',1),('github','GitLab',2),('github','Bitbucket',3),
 ('servicio','Página Web',1),('servicio','Hosting',2),('servicio','Dominio',3),('servicio','Base de datos',4),('servicio','Mantenimiento',5),('servicio','SEO',6),('servicio','Impresiones',7),
 ('otros','Otro',1)
ON CONFLICT (kind, name) DO NOTHING;