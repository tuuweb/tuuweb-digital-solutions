import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Mail } from "lucide-react";
import { WHATSAPP_DISPLAY, INSTAGRAM_URL, INSTAGRAM_HANDLE, EMAIL, waLink } from "@/lib/contact";

export function Footer() {
  return (
    <footer className="border-t border-brand-orange/40 mt-24 bg-brand-orange text-white">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-lg font-bold">TuuWeb</h3>
          <p className="mt-2 text-sm text-white/85">Potencia digital y soluciones físicas para tu negocio.</p>
          <div className="flex gap-3 mt-4">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram"
               className="h-10 w-10 rounded-xl bg-white/18 border border-white/25 flex items-center justify-center text-white hover:bg-white/25 transition-smooth">
              <Instagram className="h-5 w-5" />
            </a>
            <a href={waLink("Hola TuuWeb")} target="_blank" rel="noreferrer" aria-label="WhatsApp"
               className="h-10 w-10 rounded-xl bg-white/18 border border-white/25 flex items-center justify-center text-white hover:bg-white/25 transition-smooth">
              <MessageCircle className="h-5 w-5" />
            </a>
            <a href={`mailto:${EMAIL}`} aria-label="Email"
               className="h-10 w-10 rounded-xl bg-white/18 border border-white/25 flex items-center justify-center text-white hover:bg-white/25 transition-smooth">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Servicios</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/servicios-web" className="hover:text-primary">Páginas Web</Link></li>
            <li><Link to="/impresiones" className="hover:text-primary">Impresiones</Link></li>
            <li><Link to="/tienda" className="hover:text-primary">Tienda</Link></li>
            <li><Link to="/directorio" className="hover:text-primary">Negocios de Confianza</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Contacto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> {WHATSAPP_DISPLAY}</li>
            <li className="flex items-center gap-2"><Instagram className="h-4 w-4" /> {INSTAGRAM_HANDLE}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> <a href={`mailto:${EMAIL}`} className="hover:text-primary">{EMAIL}</a></li>
            <li>Colombia</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Términos</li><li>Privacidad</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TuuWeb.com — Todos los derechos reservados
      </div>
    </footer>
  );
}
