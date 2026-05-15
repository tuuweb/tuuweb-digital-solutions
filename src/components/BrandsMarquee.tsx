import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface Brand {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
}

const mapPinLogo = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40"><defs><linearGradient id="ng" x1="1" x2="31" y1="0" y2="40"><stop stop-color="#ff8a1f"/><stop offset="1" stop-color="#0b8fff"/></linearGradient></defs><path d="M16 0C7 0 1 7 1 15C1 25 16 40 16 40C16 40 31 25 31 15C31 7 25 0 16 0Z" fill="url(#ng)"/><circle cx="16" cy="15" r="6" fill="white"/></svg>`)}`;

const defaultBrands: Brand[] = [
  { id: "default-pin", name: "Marca aliada", logo_url: mapPinLogo, website_url: null },
  { id: "default-1", name: "Negocio colaborador", logo_url: "https://i.ibb.co/Hw37Z44/imagen-2026-04-14-022022200.png", website_url: null },
  { id: "default-2", name: "Proyecto creado", logo_url: "https://i.ibb.co/yc50fWW4/Captura-de-pantalla-2026-04-24-001156.png", website_url: null },
  { id: "default-3", name: "Empresa aliada", logo_url: "https://i.ibb.co/vrQHzk5/Gemini-Generated-Image-989vzv989vzv989v-1.png", website_url: null },
];

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

  const visibleBrands = brands.length > 0 ? brands : defaultBrands;

  // Duplicamos para loop infinito sin saltos
  const loop = [...visibleBrands, ...visibleBrands, ...visibleBrands];

  return (
    <section className="py-14 border-y border-brand-orange/20 bg-brand-sky/35 overflow-hidden">
      <div className="container mx-auto px-4 mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Marcas que confían en nosotros</p>
        <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">
          Empresas, negocios y locales <span className="text-gradient">que impulsamos</span>
        </h2>
      </div>

      <div className="relative group">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-brand-sky to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-brand-sky to-transparent z-10 pointer-events-none" />

        <div className="flex gap-8 animate-marquee group-hover:[animation-play-state:paused]" style={{ width: "max-content" }}>
          {loop.map((b, i) => {
            const card = (
              <div className="flex min-w-[150px] items-center justify-center rounded-2xl border border-white/80 bg-card/90 px-6 py-5 shadow-card transition-smooth animate-float hover:border-brand-orange/50 hover:bg-card hover:scale-105">
                <img
                  src={b.logo_url}
                  alt={b.name}
                  className="max-h-16 max-w-[120px] object-contain transition-smooth"
                  loading="lazy"
                />
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
