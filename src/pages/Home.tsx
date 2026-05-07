import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Globe, Printer, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

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

      {/* WHY */}
      <section className="container mx-auto px-4 py-20">
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
    </>
  );
}
