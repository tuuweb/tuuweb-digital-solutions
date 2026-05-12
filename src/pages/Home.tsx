import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Globe, Printer, ShoppingBag, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import printingImg from "@/assets/printing.jpg";
import techImg from "@/assets/tech-products.jpg";
import { BrandsMarquee } from "@/components/BrandsMarquee";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HomeSearch } from "@/components/HomeSearch";
import { PokerCardsCarousel, type PokerCard } from "@/components/PokerCardsCarousel";
import { SupportForm } from "@/components/SupportForm";
import { TiendaSection } from "@/pages/Tienda";
import { DirectorioSection } from "@/pages/Directorio";
import { waLink, INSTAGRAM_URL } from "@/lib/contact";

const sectionPreviews: PokerCard[] = [
  { to: "/servicios-web", icon: Globe, title: "Servicios Web", desc: "Landing, e-commerce, POS y sistemas a medida.", bullets: ["Diseño premium", "SEO optimizado", "Hosting incluido"], bg: heroBg },
  { to: "/impresiones", icon: Printer, title: "Impresiones & Avisos LED", desc: "Tarjetas, uniformes, vinilos y avisos luminosos.", bullets: ["Calidad premium", "Entrega rápida", "Diseño incluido"], bg: printingImg },
  { to: "/tienda", icon: ShoppingBag, title: "Tienda TuuWeb", desc: "Anuncios, electrónicos y accesorios al mejor precio.", bullets: ["Marcas reconocidas", "Garantía", "Envío nacional"], bg: techImg },
  { to: "/directorio", icon: Zap, title: "Negocios de Confianza", desc: "Empresas verificadas y recomendadas por categoría.", bullets: ["Restaurantes", "Salud", "Servicios"], bg: heroBg },
];

export default function Home() {
  return (
    <>
      {/* HERO INTRO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-glow" />
        <div className="relative container mx-auto px-4 pt-12 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-4 py-1.5 text-sm mb-5"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Soluciones digitales y físicas para emprendedores</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.05] max-w-5xl mx-auto"
          >
            <span className="text-gradient">TuuWeb:</span> Potencia Digital y<br className="hidden sm:inline" />
            Soluciones Físicas para tu Negocio
          </motion.h1>
        </div>
      </section>

      {/* CARRUSEL PRINCIPAL */}
      <HeroCarousel />

      {/* BUSCADOR + CATEGORÍAS */}
      <HomeSearch />

      {/* QUICK NAV */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { icon: Globe, label: "Páginas Web", to: "/servicios-web" },
            { icon: Printer, label: "Impresiones", to: "/impresiones" },
            { icon: ShoppingBag, label: "Tienda", to: "/tienda" },
            { icon: Zap, label: "Negocios", to: "/directorio" },
          ].map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={f.to} className="block glass border border-border rounded-2xl p-5 text-center hover-lift">
                <f.icon className="h-7 w-7 text-primary mb-2 mx-auto" />
                <div className="text-sm font-semibold">{f.label}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MARCAS / CARRUSEL EN MOVIMIENTO SUAVE */}
      <BrandsMarquee />

      {/* TODO LO QUE TU NEGOCIO NECESITA - estilo cartas en la mano */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="font-display text-3xl md:text-5xl font-bold">Todo lo que tu negocio necesita</h2>
          <p className="text-muted-foreground mt-3">Desliza las cartas para descubrir cada sección.</p>
        </div>
        <PokerCardsCarousel items={sectionPreviews} />
      </section>

      {/* TIENDA EMBED */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tienda</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-1">Anuncios, electrónicos <span className="text-gradient">y más</span></h2>
            <p className="text-muted-foreground mt-2 max-w-xl">Filtra por precio o busca lo que necesitas.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/tienda">Ver tienda completa <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <TiendaSection embedded limit={6} />
      </section>

      {/* DIRECTORIO EMBED */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Directorio</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-1">Negocios de Confianza <span className="text-gradient">por Categoría</span></h2>
            <p className="text-muted-foreground mt-2 max-w-xl">Empresas verificadas y recomendadas por TuuWeb.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/directorio">Ver todos <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <DirectorioSection limit={6} />
      </section>

      {/* WHY */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display text-3xl md:text-5xl font-bold">¿Por qué <span className="text-gradient">TuuWeb</span>?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Diseño Premium", desc: "Webs que enamoran. Animaciones suaves, móvil primero, optimizado SEO.", emoji: "✨" },
            { title: "Precios Justos", desc: "Pensados para emprendedores y pymes. Paga una vez, sin mensualidades ocultas.", emoji: "💎" },
            { title: "Todo en uno", desc: "Web + impresiones + uniformes + papelería. Una sola marca, una sola voz.", emoji: "🚀" },
          ].map((c) => (
            <div key={c.title} className="glass border border-border rounded-2xl p-8 hover-lift">
              <div className="text-3xl mb-3">{c.emoji}</div>
              <h3 className="font-display text-xl font-bold mb-2">{c.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FORMULARIO DE CONTACTO / SOPORTE */}
      <section className="container mx-auto px-4 pb-20">
        <SupportForm />
      </section>

      {/* CTA FINAL */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 md:p-16 text-center shadow-elegant">
          <div className="absolute inset-0 bg-gradient-glow opacity-50" />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground">¿Listo para potenciar tu marca?</h2>
            <p className="mt-3 text-primary-foreground/90 max-w-xl mx-auto">Hablemos por WhatsApp y empecemos hoy mismo.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="h-12 px-8">
                <a href={waLink("Hola, quiero potenciar mi marca con TuuWeb")} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />Escríbenos por WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 bg-transparent border-white/30 text-primary-foreground hover:bg-white/10">
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                  Síguenos en Instagram
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
