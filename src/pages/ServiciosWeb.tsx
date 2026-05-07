import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCOP } from "@/lib/supabase";

interface Plan {
  title: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  features: string[];
  popular?: boolean;
}

const cat1: Plan[] = [
  { title: "Sistema POS Web", price: 950000, features: ["Dominio + Hosting 1 año", "Facturación electrónica DIAN", "Inventario completo", "Reportes avanzados"] },
  { title: "Tienda Online", price: 500000, badge: "🔥 Más vendido", popular: true, features: ["Panel admin sin código", "Pedidos por WhatsApp", "Filtros inteligentes"] },
  { title: "Menú Digital QR", price: 280000, badge: "✧ Nuevo", features: ["Código QR listo", "Actualización en tiempo real", "Fotos de platos"] },
];

const cat2: Plan[] = [
  { title: "Landing Page", price: 350000, badge: "🔥 Más vendido", popular: true, features: ["Dominio + hosting 1 año", "100% personalizado", "Optimizado móvil", "Botón WhatsApp"] },
  { title: "Portafolio Pro", price: 420000, badge: "★ Recomendado", features: ["Galería premium", "Sección servicios", "Formulario contacto"] },
];

const cat3: Plan[] = [
  { title: "Invitación Digital", price: 220000, badge: "✧ Nuevo", features: ["Entrega en 48h", "Animado", "RSVP integrado", "Cuenta regresiva"] },
];

const packages = [
  { title: "Negocio Completo", price: 1100000, oldPrice: 1450000, badge: "★ Ahorra $300.000", features: ["Landing Page", "Tienda Online", "Sistema POS"], popular: true },
  { title: "Kit Restaurante", price: 480000, oldPrice: 630000, badge: "Ahorra $100.000", features: ["Landing Page", "Menú Digital QR"] },
  { title: "Marca Personal", price: 620000, oldPrice: 770000, badge: "Ahorra $80.000", features: ["Landing Page", "Portafolio Pro", "SEO básico"] },
];

function Card({ plan, packageMode = false }: { plan: Plan; packageMode?: boolean }) {
  const wa = `https://wa.me/573000000000?text=${encodeURIComponent(`Hola, me interesa: ${plan.title}`)}`;
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={`relative rounded-2xl border p-6 flex flex-col bg-card transition-smooth ${
        plan.popular ? "border-primary shadow-elegant" : "border-border shadow-card hover:border-primary/50"
      }`}
    >
      {plan.badge && (
        <Badge className={`absolute -top-3 left-6 ${plan.popular ? "bg-gradient-primary text-primary-foreground" : ""}`}>
          {plan.badge}
        </Badge>
      )}
      <h3 className="font-display text-xl font-bold">{plan.title}</h3>
      <div className="mt-4 mb-5">
        {plan.oldPrice && <div className="text-sm text-muted-foreground line-through">{formatCOP(plan.oldPrice)}</div>}
        <div className="text-3xl font-bold text-gradient">{packageMode ? "" : "Desde "}{formatCOP(plan.price)}</div>
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
        <a href={wa} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4 mr-2" />Solicitar</a>
      </Button>
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
            <a href="https://wa.me/573000000000?text=Hola,%20quiero%20cotizar%20marketing%20digital" target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" />Cotizar Marketing
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
