import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface Rec {
  id: string; business_name: string; category: string;
  description: string; website_url: string | null; logo_url: string | null;
  is_coming_soon: boolean;
}

const categories = ["Todos", "Odontologías", "Ventas de Celulares", "Restaurantes"];

export default function Directorio() {
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

  const filtered = items.filter(
    (i) => (cat === "Todos" || i.category === cat) &&
           i.business_name.toLowerCase().includes(q.toLowerCase())
  );
  const showOverlay = !loading && items.length === 0;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold">
          Directorio <span className="text-gradient">de Confianza</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">Empresas verificadas y recomendadas por TuuWeb.</p>
      </div>

      <div className="relative">
        <div className={showOverlay ? "blur-sm pointer-events-none select-none" : ""}>
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showOverlay ? Array.from({ length: 6 }).map((_, i) => ({ id: String(i), business_name: "Negocio Demo", category: "Restaurantes", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", website_url: null, logo_url: null, is_coming_soon: true } as Rec)) : filtered).map((r, i) => (
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass border border-primary/30 rounded-3xl p-10 max-w-lg text-center shadow-elegant">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="font-display text-3xl font-bold mb-3">PRÓXIMAMENTE</h2>
              <p className="text-muted-foreground">Directorio de empresas confiables.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
