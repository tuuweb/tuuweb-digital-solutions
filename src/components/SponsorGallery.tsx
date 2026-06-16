import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { motion } from "framer-motion";

interface Sponsor {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  link_url: string | null;
  activo: boolean;
  orden: number;
}

export function SponsorGallery() {
  const [items, setItems] = useState<Sponsor[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const { data } = await supabase
        .from("sponsor_gallery")
        .select("*")
        .eq("activo", true)
        .order("orden", { ascending: true });
      setItems((data ?? []) as Sponsor[]);
    })();
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-orange font-semibold">Patrocinados</p>
        <h2 className="font-display text-2xl md:text-4xl font-bold mt-2">
          Negocios que confían en <span className="text-gradient">TuuWeb</span>
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s, i) => {
          const inner = (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover-lift h-full"
            >
              {s.imagen_url && (
                <img
                  src={s.imagen_url}
                  alt={s.titulo}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-smooth"
                />
              )}
              <div className="p-4">
                <h3 className="font-display font-bold text-lg">{s.titulo}</h3>
                {s.descripcion && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{s.descripcion}</p>
                )}
              </div>
            </motion.div>
          );
          return s.link_url ? (
            <a key={s.id} href={s.link_url} target="_blank" rel="noreferrer">{inner}</a>
          ) : (
            <div key={s.id}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
