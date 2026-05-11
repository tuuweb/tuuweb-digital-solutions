import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { waLink } from "@/lib/contact";

interface Rec {
  id: string; business_name: string; category: string;
  description: string; website_url: string | null; logo_url: string | null;
  is_coming_soon: boolean;
}

const demoRecs: Rec[] = [
  { id: "d1", business_name: "Restaurante La Plaza", category: "Restaurantes", description: "Comida casera con sabor local.", website_url: null, logo_url: null, is_coming_soon: true },
  { id: "d2", business_name: "Odontología Sonríe+", category: "Salud", description: "Especialistas en estética dental.", website_url: null, logo_url: null, is_coming_soon: true },
  { id: "d3", business_name: "TecniCell", category: "Electrónica", description: "Reparación de celulares y accesorios.", website_url: null, logo_url: null, is_coming_soon: true },
  { id: "d4", business_name: "Belleza Glow", category: "Belleza", description: "Spa, peluquería y estética.", website_url: null, logo_url: null, is_coming_soon: true },
  { id: "d5", business_name: "AutoLavado Express", category: "Automotriz", description: "Lavado y detallado profesional.", website_url: null, logo_url: null, is_coming_soon: true },
  { id: "d6", business_name: "Veterinaria Patitas", category: "Mascotas", description: "Consultas, vacunas y peluquería canina.", website_url: null, logo_url: null, is_coming_soon: true },
];

export function DirectorioSection({ limit }: { limit?: number }) {
  const [items, setItems] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("directory_recommendations").select("*")
        .eq("is_coming_soon", false).order("created_at", { ascending: false });
      setItems((data ?? []) as Rec[]);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(items.map((i) => i.category))).filter(Boolean)], [items]);

  const filtered = useMemo(() => {
    const list = items.filter(
      (i) => (cat === "Todos" || i.category === cat) &&
             i.business_name.toLowerCase().includes(q.toLowerCase())
    );
    return limit ? list.slice(0, limit) : list;
  }, [items, q, cat, limit]);

  const showOverlay = !loading && items.length === 0;
  const display = showOverlay ? demoRecs.slice(0, limit ?? 6) : filtered;

  return (
    <div className="relative">
      <div className={showOverlay ? "blur-sm pointer-events-none select-none" : ""}>
        {!showOverlay && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar negocio..." className="pl-10 h-12" />
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {categories.map((c) => (
                <Button key={c} variant={cat === c ? "default" : "outline"} size="sm"
                  className={cat === c ? "bg-gradient-primary text-primary-foreground" : ""}
                  onClick={() => setCat(c)}>{c}</Button>
              ))}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {display.map((r, i) => (
            <motion.div key={r.id}
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-6 hover-lift">
              <div className="flex items-center gap-3 mb-3">
                {r.logo_url
                  ? <img src={r.logo_url} alt={r.business_name} className="h-12 w-12 rounded-xl object-cover" />
                  : <div className="h-12 w-12 rounded-xl bg-gradient-primary" />}
                <div>
                  <h3 className="font-semibold">{r.business_name}</h3>
                  <span className="text-xs text-muted-foreground">{r.category}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{r.description}</p>
              {r.website_url && (
                <a href={r.website_url} target="_blank" rel="noreferrer"
                  className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
                  Visitar sitio <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="glass border border-primary/30 rounded-3xl p-8 md:p-10 max-w-lg text-center shadow-elegant pointer-events-auto">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <h2 className="font-display text-3xl font-bold mb-3">PRÓXIMAMENTE</h2>
            <p className="text-muted-foreground">Estamos verificando los mejores negocios por categoría.</p>
            <Button asChild className="mt-5 bg-gradient-primary text-primary-foreground">
              <a href={waLink("Hola, quiero aparecer en el directorio")} target="_blank" rel="noreferrer">Quiero aparecer aquí</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Directorio() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold">
          Negocios de Confianza <span className="text-gradient">por Categoría</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">Empresas verificadas y recomendadas por TuuWeb.</p>
      </div>
      <DirectorioSection />
    </div>
  );
}
