import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-24 bg-secondary/30">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-lg font-bold text-gradient">TuuWeb</h3>
          <p className="mt-2 text-sm text-muted-foreground">Potencia digital y soluciones físicas para tu negocio.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Servicios</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/servicios-web" className="hover:text-primary">Páginas Web</Link></li>
            <li><Link to="/impresiones" className="hover:text-primary">Impresiones</Link></li>
            <li><Link to="/tienda" className="hover:text-primary">Tienda Tech</Link></li>
            <li><Link to="/directorio" className="hover:text-primary">Directorio</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Contacto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>WhatsApp: +57 300 000 0000</li>
            <li>hola@tuuweb.com</li>
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
