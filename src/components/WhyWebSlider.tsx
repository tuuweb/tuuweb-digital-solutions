import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface WhySlide {
  id: string;
  kicker: string | null;
  title: string;
  description: string;
  stat: string | null;
  image_url: string;
  accent: string;
  cta_label: string | null;
  cta_link: string | null;
  sort_order: number;
}

const defaults: WhySlide[] = [
  { id: "w1", kicker: "VISIBILIDAD 24/7", title: "Tu negocio abierto todos los días", description: "Mientras duermes tu página sigue mostrando tus productos, precios y contacto. Nunca pierdes un cliente por estar cerrado.", stat: "+70% de clientes buscan en Google antes de comprar", image_url: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=1600", accent: "#ff7a1a", cta_label: "Quiero mi página", cta_link: "/servicios-web", sort_order: 1 },
  { id: "w2", kicker: "CONFIANZA", title: "Una marca sin web parece improvisada", description: "Los clientes comparan. Tener sitio propio con dominio y diseño profesional te separa de la competencia que solo vive en redes.", stat: "8 de cada 10 personas desconfían de un negocio sin web", image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600", accent: "#38bdf8", cta_label: "Ver planes", cta_link: "/servicios-web", sort_order: 2 },
  { id: "w3", kicker: "MÁS VENTAS", title: "Vende sin depender de las redes", description: "Catálogo, carrito y pedidos directos a tu WhatsApp. Tu web trabaja como un vendedor que nunca descansa.", stat: "Hasta 3x más pedidos con catálogo en línea", image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600", accent: "#22c55e", cta_label: "Cotizar tienda", cta_link: "/servicios-web", sort_order: 3 },
];

export function WhyWebSlider() {
  const [slides, setSlides] = useState<WhySlide[]>(defaults);
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const { data } = await supabase
        .from("why_web_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data && data.length) setSlides(data as WhySlide[]);
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  const s = slides[idx];
  if (!s) return null;
  const accent = s.accent || "#ff7a1a";
  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border shadow-elegant h-[540px] md:h-[520px] touch-pan-y"
      style={{ background: "#050914" }}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = touchX.current - (e.changedTouches[0]?.clientX ?? 0);
        touchX.current = null;
        if (Math.abs(dx) > 45) (dx > 0 ? next : prev)();
      }}
    >
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

      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(5,9,20,0.94) 0%, rgba(5,9,20,0.6) 60%, rgba(5,9,20,0.2) 100%)" }} />
      <div className="pointer-events-none absolute -left-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full blur-3xl opacity-40" style={{ background: accent }} />

      <div className="relative z-10 h-full flex items-center px-6 md:px-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id + "-txt"}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-xl text-white"
          >
            {s.kicker && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold tracking-[0.2em]"
                style={{ borderColor: accent, color: accent, boxShadow: `0 0 20px ${accent}55` }}>
                {s.kicker}
              </div>
            )}
            <h3 className="mt-4 font-display text-3xl md:text-5xl font-black leading-[1.05]" style={{ textShadow: `0 0 40px ${accent}55` }}>
              {s.title}
            </h3>
            <p className="mt-4 text-base md:text-lg text-white/80 max-w-lg">{s.description}</p>
            {s.stat && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur px-4 py-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4" style={{ color: accent }} />
                {s.stat}
              </div>
            )}
            {s.cta_label && s.cta_link && (
              <div className="mt-6">
                {s.cta_link.startsWith("http") ? (
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
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <button onClick={prev} aria-label="Anterior"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={next} aria-label="Siguiente"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20">
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} aria-label={`Ir a ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-10 bg-white" : "w-4 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
