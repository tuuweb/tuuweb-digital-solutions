import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Sparkles, Search, ArrowDownAZ, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, formatCOP, isSupabaseConfigured } from "@/lib/supabase";
import techImg from "@/assets/tech-products.jpg";
import { waLink } from "@/lib/contact";
import { ProductQuoteDialog, type QuoteItem } from "@/components/ProductQuoteDialog";

interface Product {
  id: string; name: string; description: string;
  price_cop: number; stock: number; images: string[];
  is_active: boolean; is_coming_soon: boolean;
}

type SortKey = "asc" | "desc" | "recent";

export function TiendaSection({ embedded = false, limit }: { embedded?: boolean; limit?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("asc");
  const [quoteItem, setQuoteItem] = useState<QuoteItem | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("physical_products").select("*")
        .eq("is_active", true).eq("is_coming_soon", false)
        .order("created_at", { ascending: false });
      setProducts((data ?? []) as Product[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const list = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === "asc") list.sort((a, b) => a.price_cop - b.price_cop);
    if (sort === "desc") list.sort((a, b) => b.price_cop - a.price_cop);
    return limit ? list.slice(0, limit) : list;
  }, [products, q, sort, limit]);

  const showOverlay = !loading && products.length === 0;
  const skeletonCount = limit ?? 4;

  return (
    <div className="relative">
      <div className={showOverlay ? "blur-sm pointer-events-none select-none" : ""}>
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto, anuncio, electrónico..." className="pl-10 h-11" />
          </div>
          <div className="flex gap-2">
            <Button variant={sort === "asc" ? "default" : "outline"} size="sm" onClick={() => setSort("asc")} className={sort === "asc" ? "bg-gradient-primary text-primary-foreground" : ""}>
              <ArrowDownAZ className="h-4 w-4 mr-1" /> Menor precio
            </Button>
            <Button variant={sort === "desc" ? "default" : "outline"} size="sm" onClick={() => setSort("desc")} className={sort === "desc" ? "bg-gradient-primary text-primary-foreground" : ""}>
              <Tag className="h-4 w-4 mr-1" /> Mayor precio
            </Button>
          </div>
        </div>

        {loading || showOverlay ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                <img src={techImg} alt="" className="w-full h-48 object-cover" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-6 bg-muted rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 scrollbar-hide">
            {filtered.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setQuoteItem({ name: p.name, description: p.description, price_cop: p.price_cop, image: p.images?.[0] ?? techImg })}
                className="shrink-0 w-[78%] sm:w-auto snap-center rounded-2xl border border-border bg-card overflow-hidden hover-lift cursor-pointer">
                <img src={p.images?.[0] ?? techImg} alt={p.name} className="w-full h-48 object-cover" />
                <div className="p-5">
                  <h3 className="font-semibold mb-1">{p.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gradient text-lg">{formatCOP(p.price_cop)}</span>
                    <Button size="sm" className="bg-gradient-primary text-primary-foreground pointer-events-none">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && !showOverlay && (
              <p className="col-span-full text-center text-muted-foreground py-8">Sin resultados.</p>
            )}
          </div>
        )}
      </div>

      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-orange/40 bg-card/95 backdrop-blur px-4 py-2 shadow-card pointer-events-auto">
            <Sparkles className="h-4 w-4 text-brand-orange animate-pulse" />
            <span className="text-sm font-semibold tracking-wide">Próximamente</span>
            {embedded && (
              <a href={waLink("Hola, quiero saber cuándo abre la tienda")} target="_blank" rel="noreferrer"
                className="ml-2 text-xs font-medium text-brand-orange hover:underline">Avísame</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Tienda() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Tienda <span className="text-gradient">TuuWeb</span></h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Anuncios, artículos electrónicos, accesorios y mucho más — al mejor precio.
        </p>
      </div>
      <TiendaSection />
    </div>
  );
}
