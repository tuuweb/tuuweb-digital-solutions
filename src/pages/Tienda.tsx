import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, formatCOP, isSupabaseConfigured } from "@/lib/supabase";
import techImg from "@/assets/tech-products.jpg";

interface Product {
  id: string; name: string; description: string;
  price_cop: number; stock: number; images: string[];
  is_active: boolean; is_coming_soon: boolean;
}

export default function Tienda() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  const showOverlay = !loading && products.length === 0;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Tienda <span className="text-gradient">Tech & Seguridad</span></h1>
        <p className="mt-4 text-lg text-muted-foreground">Teclados, mouses, cámaras y más a precios increíbles.</p>
      </div>

      <div className="relative">
        <div className={showOverlay ? "blur-sm pointer-events-none select-none" : ""}>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-muted h-80 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <img src={techImg} alt="" className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden hover-lift">
                  <img src={p.images?.[0] ?? techImg} alt={p.name} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <h3 className="font-semibold mb-1">{p.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gradient text-lg">{formatCOP(p.price_cop)}</span>
                      <Button size="sm" className="bg-gradient-primary text-primary-foreground">
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {showOverlay && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass border border-primary/30 rounded-3xl p-10 max-w-lg text-center shadow-elegant">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="font-display text-3xl font-bold mb-3">PRÓXIMAMENTE</h2>
              <p className="text-muted-foreground">Estamos preparando el mejor inventario para ti.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
