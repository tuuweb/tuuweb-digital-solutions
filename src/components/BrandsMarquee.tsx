import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface Brand {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
}

export function BrandsMarquee() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const { data } = await supabase
        .from("trusted_brands")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setBrands((data ?? []) as Brand[]);
    })();
  }, []);

  if (brands.length === 0) return null;

  // Duplicamos para loop infinito sin saltos
  const loop = [...brands, ...brands, ...brands];

  return (
    <section className="py-16 border-y border-border/50 bg-secondary/20 overflow-hidden">
      <div className="container mx-auto px-4 mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Marcas que confían en nosotros</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">
          Más de <span className="text-gradient">{brands.length}+</span> negocios potenciados por TuuWeb
        </h2>
      </div>

      <div className="relative group">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex gap-8 animate-marquee group-hover:[animation-play-state:paused]" style={{ width: "max-content" }}>
          {loop.map((b, i) => {
            const card = (
              <div className="flex flex-col items-center gap-2 min-w-[160px] h-28 px-6 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-smooth justify-center hover-lift">
                <img
                  src={b.logo_url}
                  alt={b.name}
                  className="max-h-12 max-w-[120px] object-contain grayscale hover:grayscale-0 transition-smooth"
                  loading="lazy"
                />
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">{b.name}</span>
              </div>
            );
            return b.website_url ? (
              <a key={`${b.id}-${i}`} href={b.website_url} target="_blank" rel="noopener noreferrer">{card}</a>
            ) : (
              <div key={`${b.id}-${i}`}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
