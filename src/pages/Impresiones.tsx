import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import printingImg from "@/assets/printing.jpg";
import { waLink } from "@/lib/contact";

interface Service {
  name: string;
  emoji: string;
  description: string;
  image: string;
}

const items: Service[] = [
  { name: "Avisos LED", emoji: "💡", description: "Letreros luminosos personalizados que destacan tu negocio 24/7. Bajo consumo, alta visibilidad.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
  { name: "Tarjetas de presentación", emoji: "💳", description: "Diseño + impresión premium con acabados mate, brillante o metalizado. Entrega en 48h.", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80" },
  { name: "Facturas comerciales", emoji: "🧾", description: "Talonarios numerados, originales y copias en papel químico. Diseño con tu marca.", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80" },
  { name: "Vinilos adhesivos", emoji: "🎨", description: "Impresión en vinilo de alta resistencia para vidrieras, vehículos y paredes.", image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&q=80" },
  { name: "Uniformes personalizados", emoji: "👕", description: "Camisetas, polos y chaquetas con bordado o estampado. Tu equipo siempre profesional.", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80" },
  { name: "Banners y pendones", emoji: "🚩", description: "Banners en lona resistente para eventos, ferias y publicidad exterior. Tubos incluidos.", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80" },
  { name: "Gorras bordadas", emoji: "🧢", description: "Gorras de calidad con tu logo bordado en hilo. Promocionales o uniforme.", image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80" },
  { name: "Papelería comercial", emoji: "📄", description: "Hojas membretadas, sobres, carpetas y kit corporativo completo.", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80" },
  { name: "Señalización", emoji: "🪧", description: "Señales acrílicas, en PVC o metálicas para interiores y exteriores.", image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80" },
  { name: "Stickers personalizados", emoji: "🏷️", description: "Stickers troquelados en cualquier forma. Resistentes al agua y rayos UV.", image: "https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=600&q=80" },
  { name: "Almanaques", emoji: "📅", description: "Calendarios de pared o escritorio con tu marca. Ideales para fin de año.", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80" },
  { name: "Agendas personalizadas", emoji: "📓", description: "Libretas y agendas con tapa dura, anillado y diseño exclusivo de tu marca.", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80" },
];

export default function Impresiones() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            Impresiones y <span className="text-gradient">Avisos LED</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Calidad profesional para que tu marca brille. Producción rápida, precios competitivos y entrega en toda Colombia.
          </p>
          <Button asChild size="lg" className="mt-6 bg-gradient-primary text-primary-foreground shadow-elegant">
            <a href={waLink("Hola, quiero cotizar impresiones")} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4 mr-2" />Cotizar por WhatsApp
            </a>
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-glow blur-3xl" />
          <img src={printingImg} alt="Productos de impresión" loading="lazy" width={1280} height={800}
               className="relative rounded-3xl shadow-elegant w-full" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it, i) => (
          <motion.div key={it.name}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="group rounded-2xl border border-border bg-card overflow-hidden hover-lift"
          >
            <div className="relative h-44 overflow-hidden">
              <img src={it.image} alt={it.name} loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />
              <div className="absolute top-3 left-3 h-11 w-11 rounded-xl bg-card/90 backdrop-blur flex items-center justify-center text-2xl shadow-card">
                {it.emoji}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-display font-bold text-lg mb-1">{it.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.description}</p>
              <a href={waLink(`Hola, quiero cotizar: ${it.name}`)} target="_blank" rel="noreferrer"
                className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
                Cotizar →
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
