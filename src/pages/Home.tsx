import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Globe, Printer, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import printingImg from "@/assets/printing.jpg";
import techImg from "@/assets/tech-products.jpg";
import { BrandsMarquee } from "@/components/BrandsMarquee";

const sectionPreviews = [
  {
    to: "/servicios-web",
    icon: Globe,
    title: "Servicios Web",
    desc: "Landing pages, e-commerce, POS, sistemas de citas y más.",
    bullets: ["Diseño premium", "SEO optimizado", "Hosting incluido"],
    bg: heroBg,
  },
  {
    to: "/impresiones",
    icon: Printer,
    title: "Impresiones & Uniformes",
    desc: "Tarjetas, volantes, pendones, uniformes corporativos y avisos LED.",
    bullets: ["Calidad premium", "Entrega rápida", "Diseño incluido"],
    bg: printingImg,
  },
  {
    to: "/tienda",
    icon: ShoppingBag,
    title: "Tienda Tech",
    desc: "Teclados, mouses, cámaras de seguridad y accesorios.",
    bullets: ["Marcas reconocidas", "Garantía", "Envío nacional"],
    bg: techImg,
  },
  {
    to: "/directorio",
    icon: Zap,
    title: "Directorio de Aliados",
    desc: "Negocios verificados que confían en TuuWeb.",
    bullets: ["Restaurantes", "Salud", "Servicios"],
    bg: heroBg,
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-50"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-glow" />

        <div className="relative container mx-auto px-4 pt-20 pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-4 py-1.5 text-sm mb-6"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Soluciones digitales y físicas para emprendedores</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] max-w-5xl mx-auto"
          >
            <span className="text-gradient">TuuWeb:</span> Potencia Digital y<br />
            Soluciones Físicas para tu Negocio
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Desde tu página web hasta tus uniformes, todo en un solo lugar y a precio de emprendedor.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-elegant text-base h-12 px-8">
              <Link to="/servicios-web">Ver Servicios Web <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8">
              <Link to="/impresiones">Cotizar Impresión</Link>
            </Button>
          </motion.div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Globe, label: "Páginas Web", to: "/servicios-web" },
              { icon: Printer, label: "Impresiones", to: "/impresiones" },
              { icon: ShoppingBag, label: "Tienda Tech", to: "/tienda" },
              { icon: Zap, label: "Directorio", to: "/directorio" },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <Link to={f.to} className="block glass border border-border rounded-2xl p-5 hover-lift">
                  <f.icon className="h-7 w-7 text-primary mb-2 mx-auto" />
                  <div className="text-sm font-semibold">{f.label}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MARCAS / CARRUSEL EN MOVIMIENTO */}
      <BrandsMarquee />

      {/* PREVIEW DE TODAS LAS SECCIONES */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold">Todo lo que tu negocio necesita</h2>
          <p className="text-muted-foreground mt-3">Explora cada sección y descubre cómo podemos ayudarte.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sectionPreviews.map((s, i) => (
            <motion.div
              key={s.to}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            >
              <Link to={s.to} className="group relative block rounded-3xl overflow-hidden border border-border bg-card hover-lift">
                <div className="relative h-48 overflow-hidden">
                  <img src={s.bg} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <div className="absolute top-4 left-4 h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-elegant">
                    <s.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-bold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{s.desc}</p>
                  <ul className="space-y-1.5 mb-5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-success" /> {b}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-3 transition-smooth">
                    Explorar <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="container mx-auto px-4 py-20">
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

      {/* CTA FINAL */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 md:p-16 text-center shadow-elegant">
          <div className="absolute inset-0 bg-gradient-glow opacity-50" />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground">¿Listo para potenciar tu marca?</h2>
            <p className="mt-3 text-primary-foreground/90 max-w-xl mx-auto">Hablemos por WhatsApp y empecemos hoy mismo.</p>
            <Button asChild size="lg" variant="secondary" className="mt-6 h-12 px-8">
              <a href="https://wa.me/573000000000" target="_blank" rel="noreferrer">Escríbenos por WhatsApp</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
