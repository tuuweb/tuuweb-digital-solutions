import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Printer, ShoppingBag, Building2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Item { label: string; desc: string; to: string; cat: Cat; }
type Cat = "all" | "web" | "impresiones" | "tienda" | "negocios";

const CATS: { key: Cat; label: string; icon: any }[] = [
  { key: "all", label: "Todo", icon: Search },
  { key: "web", label: "Servicios Web", icon: Globe },
  { key: "impresiones", label: "Impresiones", icon: Printer },
  { key: "tienda", label: "Tienda", icon: ShoppingBag },
  { key: "negocios", label: "Negocios", icon: Building2 },
];

const ITEMS: Item[] = [
  { label: "Landing Page profesional", desc: "Web one-page con animaciones y SEO", to: "/servicios-web", cat: "web" },
  { label: "Tienda online / E-commerce", desc: "Catálogo, carrito, pagos, envíos", to: "/servicios-web", cat: "web" },
  { label: "Sistema POS para tu negocio", desc: "Ventas, inventario, reportes", to: "/servicios-web", cat: "web" },
  { label: "Tarjetas de presentación", desc: "Diseño + impresión premium", to: "/impresiones", cat: "impresiones" },
  { label: "Uniformes empresariales", desc: "Camisetas, polos, gorras estampadas", to: "/impresiones", cat: "impresiones" },
  { label: "Avisos LED luminosos", desc: "Avisos para fachada, vinilos, lonas", to: "/impresiones", cat: "impresiones" },
  { label: "Anuncios y artículos electrónicos", desc: "Accesorios, gadgets al mejor precio", to: "/tienda", cat: "tienda" },
  { label: "Audífonos y accesorios tech", desc: "Marcas reconocidas con garantía", to: "/tienda", cat: "tienda" },
  { label: "Restaurantes recomendados", desc: "Negocios verificados por TuuWeb", to: "/directorio", cat: "negocios" },
  { label: "Salud y bienestar", desc: "Odontologías, clínicas, spa…", to: "/directorio", cat: "negocios" },
];

export function HomeSearch() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Cat>("all");

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return ITEMS.filter((i) => (cat === "all" || i.cat === cat) && (!t || i.label.toLowerCase().includes(t) || i.desc.toLowerCase().includes(t)));
  }, [q, cat]);

  const showResults = q.trim().length > 0 || cat !== "all";

  return (
    <div className="container mx-auto px-4 -mt-6 relative z-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto rounded-3xl border border-border bg-card/95 backdrop-blur p-4 md:p-5 shadow-elegant">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="¿Qué necesitas? Ej: tarjetas, landing, audífonos, restaurante…"
              className="pl-10 h-12 text-base" />
          </div>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
          {CATS.map((c) => (
            <Button key={c.key} size="sm" variant={cat === c.key ? "default" : "outline"} onClick={() => setCat(c.key)}
              className={`shrink-0 gap-1.5 ${cat === c.key ? "bg-gradient-primary text-primary-foreground" : ""}`}>
              <c.icon className="h-3.5 w-3.5" />{c.label}
            </Button>
          ))}
        </div>

        <AnimatePresence>
          {showResults && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden">
              <div className="grid sm:grid-cols-2 gap-2 mt-4">
                {results.length === 0 && <p className="col-span-full text-sm text-muted-foreground text-center py-4">Sin coincidencias. Prueba otra palabra o categoría.</p>}
                {results.map((r) => (
                  <Link key={r.label + r.to} to={r.to}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 hover:border-primary/40 hover:bg-card transition-smooth">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{r.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.desc}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-smooth" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
