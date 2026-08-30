import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCOP, supabase, isSupabaseConfigured } from "@/lib/supabase";
import { waLink } from "@/lib/contact";

interface Plan {
  id: string;
  category: string;
  title: string;
  price_cop: number;
  old_price_cop: number | null;
  badge: string | null;
  description: string;
  image_url: string;
  features: string[];
  is_popular: boolean;
  is_package: boolean;
  sort_order: number;
}

const fallback: Plan[] = [
  { id: "f1", category: "⚡ Categoría 01: Impulsa tu negocio", title: "Sistema POS Web", price_cop: 950000, old_price_cop: null, badge: null, description: "Plataforma completa para administrar ventas, inventario y facturación electrónica DIAN.", image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80", features: ["Dominio + Hosting 1 año", "Facturación DIAN", "Inventario completo"], is_popular: false, is_package: false, sort_order: 1 },
  { id: "f2", category: "🌐 Categoría 02: Presencia profesional", title: "Landing Page", price_cop: 350000, old_price_cop: null, badge: "🔥 Más vendido", description: "Página de presentación premium para captar clientes.", image_url: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80", features: ["Dominio + hosting 1 año", "100% personalizado", "Botón WhatsApp"], is_popular: true, is_package: false, sort_order: 2 },
];


function Card({ plan }: { plan: Plan }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={`relative rounded-2xl border overflow-hidden flex flex-col bg-card transition-smooth ${
        plan.is_popular ? "border-primary shadow-elegant" : "border-border shadow-card hover:border-primary/50"
      }`}
    >
      <div className="relative h-40 overflow-hidden">
        <img src={plan.image_url} alt={plan.title} loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        {plan.badge && (
          <Badge className={`absolute top-3 right-3 ${plan.is_popular ? "bg-gradient-primary text-primary-foreground" : ""}`}>
            {plan.badge}
          </Badge>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display text-xl font-bold">{plan.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">{plan.description}</p>
        <div className="mb-5">
          {plan.old_price_cop ? <div className="text-sm text-muted-foreground line-through">{formatCOP(plan.old_price_cop)}</div> : null}
          <div className="text-2xl font-bold text-gradient">{plan.is_package ? "" : "Desde "}{formatCOP(plan.price_cop)}</div>
        </div>
        <ul className="space-y-2 flex-1 mb-6">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Button asChild className={plan.is_popular ? "bg-gradient-primary text-primary-foreground" : ""} variant={plan.is_popular ? "default" : "outline"}>
          <a href={waLink(`Hola, me interesa: ${plan.title}`)} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4 mr-2" />Solicitar
          </a>
        </Button>
      </div>
    </motion.div>
  );
}

export default function ServiciosWeb() {
  const [plans, setPlans] = useState<Plan[]>(fallback);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const { data } = await supabase
        .from("web_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data && data.length) setPlans(data as Plan[]);
    })();
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Plan[]>();
    plans.forEach((p) => {
      const key = p.category || "Servicios";
      map.set(key, [...(map.get(key) ?? []), p]);
    });
    return Array.from(map.entries());
  }, [plans]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Servicios Web & <span className="text-gradient">Marketing</span></h1>
        <p className="mt-4 text-lg text-muted-foreground">Páginas web profesionales a precio de emprendedor. Sin mensualidades ocultas.</p>
      </div>

      {groups.map(([cat, list]) => (
        <div key={cat} className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">{cat}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((p) => <Card key={p.id} plan={p} />)}
          </div>
        </div>
      ))}


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
