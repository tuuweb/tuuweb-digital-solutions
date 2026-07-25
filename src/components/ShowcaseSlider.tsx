import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface Showcase {
  id: string;
  kicker: string | null;
  title: string;
  subtitle: string | null;
  image_url: string;
  price_label: string | null;
  cta_label: string | null;
  cta_link: string | null;
  accent: string | null;
  sort_order: number;
}

const defaults: Showcase[] = [
  { id: "s1", kicker: "SERVICIOS WEB", title: "Páginas web que venden", subtitle: "Landing, e-commerce, POS y sistemas a medida con diseño premium y hosting incluido.", image_url: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1600", price_label: "Desde $350.000 COP", cta_label: "Ver planes web", cta_link: "/servicios-web", accent: "#ff7a1a", sort_order: 1 },
  { id: "s2", kicker: "IMPRESIONES & AVISOS LED", title: "Marca tu presencia física", subtitle: "Tarjetas, uniformes, vinilos y avisos luminosos con producción rápida en toda Colombia.", image_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1600", price_label: "Cotización gratis", cta_label: "Cotizar impresión", cta_link: "/impresiones", accent: "#38bdf8", sort_order: 2 },
  { id: "s3", kicker: "TIENDA TUUWEB", title: "Electrónica y accesorios", subtitle: "Anuncios, artículos electrónicos y accesorios al mejor precio, con garantía y envío nacional.", image_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600", price_label: "Envío nacional", cta_label: "Explorar tienda", cta_link: "/tienda", accent: "#a855f7", sort_order: 3 },
];

export function ShowcaseSlider() {
  const [slides, setSlides] = useState<Showcase[]>(defaults);
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const { data } = await supabase
        .from("showcase_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data && data.length) setSlides(data as Showcase[]);
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length]);

  const s = slides[idx];
  if (!s) return null;
  const accent = s.accent || "#ff7a1a";
  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border shadow-elegant h-[520px] md:h-[560px] touch-pan-y"
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = touchX.current - (e.changedTouches[0]?.clientX ?? 0);
        touchX.current = null;
        if (Math.abs(dx) > 45) (dx > 0 ? next : prev)();
      }}
      style={{ background: "#050914" }}
    >
      {/* Fondo imagen */}
      <AnimatePresence mode="wait">
        <motion.img
          key={s.id + "-img"}
          src={s.image_url}
          alt={s.title}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* Overlays neón */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(5,9,20,0.92) 0%, rgba(5,9,20,0.55) 55%, rgba(5,9,20,0.15) 100%)" }} />
      <div className="pointer-events-none absolute -left-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full blur-3xl opacity-40" style={{ background: accent }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Contenido */}
      <div className="relative z-10 h-full flex items-center px-6 md:px-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id + "-txt"}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="max-w-xl text-white"
          >
            {s.kicker && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold tracking-[0.2em]"
                style={{ borderColor: accent, color: accent, boxShadow: `0 0 20px ${accent}55` }}>
                {s.kicker}
              </div>
            )}
            <h3 className="mt-4 font-display text-4xl md:text-6xl font-black leading-[1.02]"
              style={{ textShadow: `0 0 40px ${accent}66` }}>
              {s.title}
            </h3>
            {s.subtitle && <p className="mt-4 text-base md:text-lg text-white/80 max-w-lg">{s.subtitle}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {s.cta_label && s.cta_link && (
                s.cta_link.startsWith("http") ? (
                  <a href={s.cta_link} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-xl font-semibold text-white transition-transform hover:scale-105"
                    style={{ background: accent, boxShadow: `0 10px 30px ${accent}66` }}>
                    {s.cta_label} <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <Link to={s.cta_link}
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-xl font-semibold text-white transition-transform hover:scale-105"
                    style={{ background: accent, boxShadow: `0 10px 30px ${accent}66` }}>
                    {s.cta_label} <ArrowRight className="h-4 w-4" />
                  </Link>
                )
              )}
              {s.price_label && (
                <span className="text-sm font-semibold text-white/90 border-l border-white/25 pl-4">{s.price_label}</span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles */}
      <button onClick={prev} aria-label="Anterior"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={next} aria-label="Siguiente"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20">
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} aria-label={`Ir a ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-10 bg-white" : "w-4 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
