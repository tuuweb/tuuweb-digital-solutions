import { useState, useRef, type TouchEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, type LucideIcon } from "lucide-react";

export interface PokerCard {
  to: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  bullets: string[];
  bg: string;
}

export function PokerCardsCarousel({ items }: { items: PokerCard[] }) {
  const [active, setActive] = useState(0);
  const startX = useRef<number | null>(null);
  const n = items.length;

  const next = () => setActive((i) => (i + 1) % n);
  const prev = () => setActive((i) => (i - 1 + n) % n);

  const onTouchStart = (e: TouchEvent) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: TouchEvent) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) (dx > 0 ? prev : next)();
    startX.current = null;
  };

  // Posición relativa: -2,-1,0,1,2 (centro = 0)
  const pos = (i: number) => {
    let p = i - active;
    if (p > n / 2) p -= n;
    if (p < -n / 2) p += n;
    return p;
  };

  return (
    <div className="relative">
      <div
        className="relative h-[480px] md:h-[520px] flex items-center justify-center select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ perspective: 1400 }}
      >
        {items.map((item, i) => {
          const p = pos(i);
          const abs = Math.abs(p);
          if (abs > 2) return null;
          const isCenter = p === 0;
          // distribución estilo "cartas en la mano"
          const x = p * (isCenter ? 0 : 140);
          const rot = p * 8;
          const y = abs * 18;
          const scale = isCenter ? 1 : 0.82 - abs * 0.05;
          const z = 10 - abs;
          const opacity = isCenter ? 1 : 0.7 - abs * 0.15;

          const Card = (
            <motion.div
              key={item.to + i}
              animate={{ x, y, rotate: rot, scale, opacity }}
              transition={{ type: "spring", stiffness: 220, damping: 28 }}
              style={{ zIndex: z }}
              className="absolute w-[280px] sm:w-[320px] md:w-[360px]"
              onClick={() => !isCenter && setActive(i)}
            >
              <div className={`group relative rounded-3xl overflow-hidden border bg-card hover-lift cursor-pointer ${isCenter ? "border-primary/40 shadow-elegant" : "border-border"}`}>
                <div className="relative h-44 overflow-hidden">
                  <img src={item.bg} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <div className="absolute top-3 left-3 h-11 w-11 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-elegant">
                    <item.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold mb-1.5">{item.title}</h3>
                  <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{item.desc}</p>
                  <AnimatePresence>
                    {isCenter && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5 mb-4 overflow-hidden"
                      >
                        {item.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-success" /> {b}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                  {isCenter && (
                    <Link to={item.to} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-3 transition-smooth">
                      Explorar <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          );
          return Card;
        })}
      </div>

      <div className="flex items-center justify-center gap-3 mt-2">
        <button onClick={prev} aria-label="Anterior"
          className="h-10 w-10 rounded-full glass border border-border flex items-center justify-center hover:bg-card transition-smooth">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5">
          {items.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`Carta ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === active ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"}`} />
          ))}
        </div>
        <button onClick={next} aria-label="Siguiente"
          className="h-10 w-10 rounded-full glass border border-border flex items-center justify-center hover:bg-card transition-smooth">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export type { ReactNode };
