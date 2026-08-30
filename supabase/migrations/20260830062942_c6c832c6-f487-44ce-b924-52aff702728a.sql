ALTER TABLE public.physical_products ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[];

CREATE TABLE public.why_web_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kicker text,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  stat text,
  image_url text NOT NULL DEFAULT '',
  accent text NOT NULL DEFAULT '#ff7a1a',
  cta_label text,
  cta_link text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.why_web_slides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.why_web_slides TO authenticated;
GRANT ALL ON public.why_web_slides TO service_role;
ALTER TABLE public.why_web_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "why_web_public_read" ON public.why_web_slides FOR SELECT USING (true);
CREATE POLICY "why_web_admin_all" ON public.why_web_slides FOR ALL TO anon, authenticated
  USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());
CREATE TRIGGER why_web_slides_updated BEFORE UPDATE ON public.why_web_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.web_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'Servicios',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_cop integer NOT NULL DEFAULT 0,
  old_price_cop integer,
  badge text,
  image_url text NOT NULL DEFAULT '',
  features text[] NOT NULL DEFAULT '{}'::text[],
  is_popular boolean NOT NULL DEFAULT false,
  is_package boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.web_plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.web_plans TO authenticated;
GRANT ALL ON public.web_plans TO service_role;
ALTER TABLE public.web_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "web_plans_public_read" ON public.web_plans FOR SELECT USING (true);
CREATE POLICY "web_plans_admin_all" ON public.web_plans FOR ALL TO anon, authenticated
  USING (public.admin_header_password_ok()) WITH CHECK (public.admin_header_password_ok());
CREATE TRIGGER web_plans_updated BEFORE UPDATE ON public.web_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.why_web_slides (kicker, title, description, stat, image_url, accent, cta_label, cta_link, sort_order) VALUES
('VISIBILIDAD 24/7', 'Tu negocio abierto todos los días', 'Mientras duermes tu página sigue mostrando tus productos, precios y contacto. Nunca pierdes un cliente por estar cerrado.', '+70% de clientes buscan en Google antes de comprar', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=1600', '#ff7a1a', 'Quiero mi página', '/servicios-web', 1),
('CONFIANZA', 'Una marca sin web parece improvisada', 'Los clientes comparan. Tener sitio propio con dominio y diseño profesional te separa de la competencia que solo vive en redes.', '8 de cada 10 personas desconfían de un negocio sin web', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600', '#38bdf8', 'Ver planes', '/servicios-web', 2),
('MÁS VENTAS', 'Vende sin depender de las redes', 'Catálogo, carrito y pedidos directos a tu WhatsApp. Tu web trabaja como un vendedor que nunca descansa.', 'Hasta 3x más pedidos con catálogo en línea', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600', '#22c55e', 'Cotizar tienda', '/servicios-web', 3),
('CONTROL TOTAL', 'Tus clientes, tus datos, tus reglas', 'Un algoritmo no decide quién te ve. Tu dominio y tu contenido son tuyos para siempre.', 'Tu web es un activo, las redes son alquiler', 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1600', '#a855f7', 'Hablemos', '/servicios-web', 4);

INSERT INTO public.web_plans (category, title, description, price_cop, old_price_cop, badge, image_url, features, is_popular, is_package, sort_order) VALUES
('⚡ Categoría 01: Impulsa tu negocio','Sistema POS Web','Plataforma completa para administrar ventas, inventario y facturación electrónica DIAN desde cualquier dispositivo.',950000,NULL,NULL,'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',ARRAY['Dominio + Hosting 1 año','Facturación electrónica DIAN','Inventario completo','Reportes avanzados'],false,false,1),
('⚡ Categoría 01: Impulsa tu negocio','Tienda Online','E-commerce con panel de control sin código. Recibe pedidos por WhatsApp y empieza a vender hoy mismo.',500000,NULL,'🔥 Más vendido','https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80',ARRAY['Panel admin sin código','Pedidos por WhatsApp','Filtros inteligentes','Pagos en línea opcional'],true,false,2),
('⚡ Categoría 01: Impulsa tu negocio','Menú Digital QR','Menú interactivo con código QR para tu restaurante. Cambia precios y platos al instante.',280000,NULL,'✧ Nuevo','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',ARRAY['Código QR listo','Actualización en tiempo real','Fotos de platos','Multi-idioma'],false,false,3),
('🌐 Categoría 02: Presencia profesional','Landing Page','Página de presentación premium para captar clientes. Diseño 100% personalizado y optimizado para móvil.',350000,NULL,'🔥 Más vendido','https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80',ARRAY['Dominio + hosting 1 año','100% personalizado','Optimizado móvil','Botón WhatsApp'],true,false,4),
('🌐 Categoría 02: Presencia profesional','Portafolio Pro','Muestra tus servicios y proyectos con una galería premium y formularios de contacto integrados.',420000,NULL,'★ Recomendado','https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',ARRAY['Galería premium','Sección servicios','Formulario contacto','Blog opcional'],false,false,5),
('🎉 Categoría 03: Eventos y ocasiones','Invitación Digital','Invitaciones animadas con cuenta regresiva, RSVP y mapa. Perfecta para bodas, quinces y eventos.',220000,NULL,'✧ Nuevo','https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=80',ARRAY['Entrega en 48h','Animado','RSVP integrado','Cuenta regresiva'],false,false,6),
('🎁 Paquetes — Ahorra más','Negocio Completo','Todo lo que tu negocio necesita: presencia web, tienda online y sistema de ventas en un solo paquete.',1100000,1450000,'★ Ahorra $300.000','https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80',ARRAY['Landing Page','Tienda Online','Sistema POS'],true,true,7),
('🎁 Paquetes — Ahorra más','Kit Restaurante','Combo perfecto para restaurantes: web profesional + menú digital QR siempre actualizado.',480000,630000,'Ahorra $100.000','https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',ARRAY['Landing Page','Menú Digital QR'],false,true,8),
('🎁 Paquetes — Ahorra más','Marca Personal','Construye tu marca personal con landing, portafolio y SEO básico para aparecer en Google.',620000,770000,'Ahorra $80.000','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',ARRAY['Landing Page','Portafolio Pro','SEO básico'],false,true,9);