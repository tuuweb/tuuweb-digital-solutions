import { useEffect, useRef, useState } from "react";
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

/**
 * Carrusel horizontal infinito, auto-scroll suave + drag/swipe manual.
 * Duplica los items para crear bucle continuo.
 */
export function PokerCardsCarousel({ items }: { items: PokerCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const loop = [...items, ...items, ...items];

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    // arrancar en el bloque del medio para poder ir izquierda o derecha
    el.scrollLeft = el.scrollWidth / 3;

    let raf = 0;
    let last = performance.now();
    const speed = 35; // px/seg

    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused && el) {
        el.scrollLeft += speed * dt;
        const third = el.scrollWidth / 3;
        if (el.scrollLeft >= third * 2) el.scrollLeft -= third;
        if (el.scrollLeft <= 0) el.scrollLeft += third;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, items.length]);

  // Drag manual
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });
  const onDown = (e: React.PointerEvent) => {
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: trackRef.current?.scrollLeft ?? 0,
    };
    setPaused(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active || !trackRef.current) return;
    trackRef.current.scrollLeft = drag.current.startScroll - (e.clientX - drag.current.startX);
  };
  const onUp = () => {
    drag.current.active = false;
    setTimeout(() => setPaused(false), 800);
  };

  return (
    <div
      className="relative -mx-4 px-4 sm:mx-0 sm:px-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-hide pb-4 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollBehavior: "auto" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {loop.map((item, i) => (
          <div
            key={`${item.to}-${i}`}
            className="shrink-0 w-[78%] sm:w-[340px] md:w-[360px] rounded-3xl overflow-hidden border border-border bg-card hover-lift"
          >
            <div className="relative h-44 overflow-hidden">
              <img src={item.bg} alt={item.title} className="w-full h-full object-cover pointer-events-none" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute top-3 left-3 h-11 w-11 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-elegant">
                <item.icon className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl font-bold mb-1.5">{item.title}</h3>
              <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{item.desc}</p>
              <ul className="space-y-1.5 mb-4">
                {item.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" /> {b}
                  </li>
                ))}
              </ul>
              <Link
                to={item.to}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-3 transition-smooth"
                onClick={(e) => drag.current.active && e.preventDefault()}
              >
                Explorar <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
