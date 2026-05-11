import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Mail } from "lucide-react";
import { WHATSAPP_DISPLAY, INSTAGRAM_URL, INSTAGRAM_HANDLE, waLink } from "@/lib/contact";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-24 bg-secondary/30">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-lg font-bold text-gradient">TuuWeb</h3>
          <p className="mt-2 text-sm text-muted-foreground">Potencia digital y soluciones físicas para tu negocio.</p>
          <div className="flex gap-3 mt-4">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram"
               className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-smooth">
              <Instagram className="h-5 w-5" />
            </a>
            <a href={waLink("Hola TuuWeb")} target="_blank" rel="noreferrer" aria-label="WhatsApp"
               className="h-10 w-10 rounded-xl bg-success/90 flex items-center justify-center text-white hover:opacity-90 transition-smooth">
              <MessageCircle className="h-5 w-5" />
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
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hola@tuuweb.com</li>
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
