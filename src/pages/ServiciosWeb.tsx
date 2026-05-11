import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCOP } from "@/lib/supabase";
import { waLink } from "@/lib/contact";

interface Plan {
  title: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  description: string;
  image: string;
  features: string[];
  popular?: boolean;
}

const cat1: Plan[] = [
  {
    title: "Sistema POS Web", price: 950000,
    description: "Plataforma completa para administrar ventas, inventario y facturación electrónica DIAN desde cualquier dispositivo.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
    features: ["Dominio + Hosting 1 año", "Facturación electrónica DIAN", "Inventario completo", "Reportes avanzados"],
  },
  {
    title: "Tienda Online", price: 500000, badge: "🔥 Más vendido", popular: true,
    description: "E-commerce con panel de control sin código. Recibe pedidos por WhatsApp y empieza a vender hoy mismo.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80",
    features: ["Panel admin sin código", "Pedidos por WhatsApp", "Filtros inteligentes", "Pagos en línea opcional"],
  },
  {
    title: "Menú Digital QR", price: 280000, badge: "✧ Nuevo",
    description: "Menú interactivo con código QR para tu restaurante. Cambia precios y platos al instante.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
    features: ["Código QR listo", "Actualización en tiempo real", "Fotos de platos", "Multi-idioma"],
  },
];

const cat2: Plan[] = [
  {
    title: "Landing Page", price: 350000, badge: "🔥 Más vendido", popular: true,
    description: "Página de presentación premium para captar clientes. Diseño 100% personalizado y optimizado para móvil.",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80",
    features: ["Dominio + hosting 1 año", "100% personalizado", "Optimizado móvil", "Botón WhatsApp"],
  },
  {
    title: "Portafolio Pro", price: 420000, badge: "★ Recomendado",
    description: "Muestra tus servicios y proyectos con una galería premium y formularios de contacto integrados.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    features: ["Galería premium", "Sección servicios", "Formulario contacto", "Blog opcional"],
  },
];

const cat3: Plan[] = [
  {
    title: "Invitación Digital", price: 220000, badge: "✧ Nuevo",
    description: "Invitaciones animadas con cuenta regresiva, RSVP y mapa. Perfecta para bodas, quinces y eventos.",
    image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&q=80",
    features: ["Entrega en 48h", "Animado", "RSVP integrado", "Cuenta regresiva"],
  },
];

const packages: Plan[] = [
  {
    title: "Negocio Completo", price: 1100000, oldPrice: 1450000, badge: "★ Ahorra $300.000", popular: true,
    description: "Todo lo que tu negocio necesita: presencia web, tienda online y sistema de ventas en un solo paquete.",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80",
    features: ["Landing Page", "Tienda Online", "Sistema POS"],
  },
  {
    title: "Kit Restaurante", price: 480000, oldPrice: 630000, badge: "Ahorra $100.000",
    description: "Combo perfecto para restaurantes: web profesional + menú digital QR siempre actualizado.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
    features: ["Landing Page", "Menú Digital QR"],
  },
  {
    title: "Marca Personal", price: 620000, oldPrice: 770000, badge: "Ahorra $80.000",
    description: "Construye tu marca personal con landing, portafolio y SEO básico para aparecer en Google.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    features: ["Landing Page", "Portafolio Pro", "SEO básico"],
  },
];

function Card({ plan, packageMode = false }: { plan: Plan; packageMode?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={`relative rounded-2xl border overflow-hidden flex flex-col bg-card transition-smooth ${
        plan.popular ? "border-primary shadow-elegant" : "border-border shadow-card hover:border-primary/50"
      }`}
    >
      <div className="relative h-40 overflow-hidden">
        <img src={plan.image} alt={plan.title} loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        {plan.badge && (
          <Badge className={`absolute top-3 right-3 ${plan.popular ? "bg-gradient-primary text-primary-foreground" : ""}`}>
            {plan.badge}
          </Badge>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display text-xl font-bold">{plan.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">{plan.description}</p>
        <div className="mb-5">
          {plan.oldPrice && <div className="text-sm text-muted-foreground line-through">{formatCOP(plan.oldPrice)}</div>}
          <div className="text-2xl font-bold text-gradient">{packageMode ? "" : "Desde "}{formatCOP(plan.price)}</div>
        </div>
        <ul className="space-y-2 flex-1 mb-6">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Button asChild className={plan.popular ? "bg-gradient-primary text-primary-foreground" : ""} variant={plan.popular ? "default" : "outline"}>
          <a href={waLink(`Hola, me interesa: ${plan.title}`)} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4 mr-2" />Solicitar
          </a>
        </Button>
      </div>
    </motion.div>
  );
}

function CategorySection({ title, plans, packageMode = false }: { title: string; plans: Plan[]; packageMode?: boolean }) {
  return (
    <div className="mb-16">
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">{title}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((p) => <Card key={p.title} plan={p} packageMode={packageMode} />)}
      </div>
    </div>
  );
}

export default function ServiciosWeb() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Servicios Web & <span className="text-gradient">Marketing</span></h1>
        <p className="mt-4 text-lg text-muted-foreground">Páginas web profesionales a precio de emprendedor. Sin mensualidades ocultas.</p>
      </div>

      <CategorySection title="⚡ Categoría 01: Impulsa tu negocio" plans={cat1} />
      <CategorySection title="🌐 Categoría 02: Presencia profesional" plans={cat2} />
      <CategorySection title="🎉 Categoría 03: Eventos y ocasiones" plans={cat3} />
      <CategorySection title="🎁 Paquetes — Ahorra más" plans={packages} packageMode />

      <div className="mt-12 rounded-3xl bg-gradient-primary p-1 shadow-elegant">
        <div className="rounded-3xl bg-card p-10 text-center">
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">📣 Servicios de Marketing Digital</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Gestión de Redes Sociales y Campañas Ads. Contáctanos para una cotización personalizada.
          </p>
          <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground">
            <a href={waLink("Hola, quiero cotizar marketing digital")} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" />Cotizar Marketing
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
