CREATE TABLE IF NOT EXISTS public.showcase_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kicker TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  price_label TEXT,
  cta_label TEXT,
  cta_link TEXT,
  accent TEXT DEFAULT '#ff7a1a',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.showcase_slides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.showcase_slides TO authenticated;
GRANT ALL ON public.showcase_slides TO service_role;

ALTER TABLE public.showcase_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "showcase_public_read" ON public.showcase_slides
  FOR SELECT USING (true);

CREATE POLICY "showcase_admin_write" ON public.showcase_slides
  FOR ALL TO authenticated
  USING (public.admin_header_password_ok() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.admin_header_password_ok() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_showcase_slides_updated
  BEFORE UPDATE ON public.showcase_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.showcase_slides (kicker, title, subtitle, image_url, price_label, cta_label, cta_link, accent, sort_order) VALUES
  ('SERVICIOS WEB', 'Páginas web que venden', 'Landing, e-commerce, POS y sistemas a medida con diseño premium y hosting incluido.', 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1600', 'Desde $350.000 COP', 'Ver planes web', '/servicios-web', '#ff7a1a', 1),
  ('IMPRESIONES & AVISOS LED', 'Marca tu presencia física', 'Tarjetas, uniformes, vinilos y avisos luminosos con producción rápida en toda Colombia.', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1600', 'Cotización gratis', 'Cotizar impresión', '/impresiones', '#38bdf8', 2),
  ('TIENDA TUUWEB', 'Electrónica y accesorios', 'Anuncios, artículos electrónicos y accesorios al mejor precio, con garantía y envío nacional.', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600', 'Envío nacional', 'Explorar tienda', '/tienda', '#a855f7', 3),
  ('DIRECTORIO', 'Negocios de confianza', 'Empresas verificadas y recomendadas por TuuWeb en cada categoría.', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600', 'Aparece aquí', 'Ver directorio', '/directorio', '#22c55e', 4);