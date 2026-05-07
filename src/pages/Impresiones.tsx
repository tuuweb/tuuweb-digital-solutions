import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import printingImg from "@/assets/printing.jpg";

const items = [
  { name: "Avisos LED", emoji: "💡" },
  { name: "Tarjetas de presentación", emoji: "💳" },
  { name: "Facturas", emoji: "🧾" },
  { name: "Vinilos", emoji: "🎨" },
  { name: "Uniformes personalizados", emoji: "👕" },
  { name: "Banners", emoji: "🚩" },
  { name: "Gorras bordadas", emoji: "🧢" },
  { name: "Papelería comercial", emoji: "📄" },
  { name: "Señalización", emoji: "🪧" },
  { name: "Stickers", emoji: "🏷️" },
  { name: "Almanaques", emoji: "📅" },
  { name: "Agendas personalizadas", emoji: "📓" },
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
            <a href="https://wa.me/573000000000?text=Hola,%20quiero%20cotizar%20impresiones" target="_blank" rel="noreferrer">
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <motion.div key={it.name}
            initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl border border-border bg-card p-6 hover-lift cursor-default"
          >
            <div className="text-4xl mb-3">{it.emoji}</div>
            <div className="font-semibold">{it.name}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
