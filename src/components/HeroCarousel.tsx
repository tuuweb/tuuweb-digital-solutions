import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import heroBg from "@/assets/hero-bg.jpg";
import printingImg from "@/assets/printing.jpg";
import techImg from "@/assets/tech-products.jpg";

interface Slide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_label: string | null;
  cta_link: string | null;
  sort_order: number;
}

const defaults: Slide[] = [
  { id: "d1", title: "Tu Página Web Profesional", subtitle: "Landing, e-commerce y POS desde $350.000 COP. Diseño premium, hosting incluido.", image_url: heroBg, cta_label: "Ver Servicios Web", cta_link: "/servicios-web", sort_order: 1 },
  { id: "d2", title: "Impresiones & Avisos LED", subtitle: "Tarjetas, uniformes, vinilos y avisos luminosos. Producción rápida en toda Colombia.", image_url: printingImg, cta_label: "Cotizar Impresiones", cta_link: "/impresiones", sort_order: 2 },
  { id: "d3", title: "Tienda TuuWeb", subtitle: "Anuncios, artículos electrónicos y accesorios al mejor precio.", image_url: techImg, cta_label: "Explorar Tienda", cta_link: "/tienda", sort_order: 3 },
];

export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>(defaults);
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const { data } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) setSlides(data as Slide[]);
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[idx];
  if (!slide) return null;

  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  const handleTouchEnd = (x: number) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - x;
    touchStartX.current = null;
    if (Math.abs(delta) < 45) return;
    if (delta > 0) next();
    else prev();
  };

  return (
    <section
      className="relative mt-4 h-[520px] touch-pan-y overflow-hidden md:mt-6 md:h-[600px]"
      onTouchStart={(e) => { touchStartX.current = e.touches[0]?.clientX ?? null; }}
      onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
          <div className="absolute inset-0 bg-gradient-glow opacity-60" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full container mx-auto px-4 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + "-text"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl"
          >
            <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight">
              <span className="text-gradient">{slide.title}</span>
            </h2>
            {slide.subtitle && (
              <p className="mt-5 text-lg md:text-xl text-muted-foreground">{slide.subtitle}</p>
            )}
            {slide.cta_label && slide.cta_link && (
              <Button asChild size="lg" className="mt-8 bg-gradient-primary text-primary-foreground shadow-elegant h-12 px-8">
                {slide.cta_link.startsWith("http") ? (
                  <a href={slide.cta_link} target="_blank" rel="noreferrer">
                    {slide.cta_label} <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                ) : (
                  <Link to={slide.cta_link}>
                    {slide.cta_label} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={prev} aria-label="Anterior"
            className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border glass transition-smooth hover:bg-card md:flex">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} aria-label="Siguiente"
            className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border glass transition-smooth hover:bg-card md:flex">
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`Ir a slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-2 bg-muted-foreground/40"}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
