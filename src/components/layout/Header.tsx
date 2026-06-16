import { Link, NavLink } from "react-router-dom";
import { Moon, Sun, Menu, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import logo from "@/assets/logo.png";
import { waLink } from "@/lib/contact";

const links = [
  { to: "/servicios-web", label: "Servicios Web" },
  { to: "/impresiones", label: "Impresiones" },
  { to: "/tienda", label: "Tienda" },
  { to: "/directorio", label: "Negocios" },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-4">
      <div
        className="mx-auto max-w-6xl rounded-2xl border border-brand-orange/40 shadow-elegant backdrop-blur-md"
        style={{ background: "linear-gradient(135deg, oklch(0.72 0.16 48 / 0.97), oklch(0.78 0.14 55 / 0.97))" }}
      >
        <div className="px-3 sm:px-5 min-h-14 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="rounded-xl bg-white px-1.5 py-1 shadow-card">
              <img src={logo} alt="TuuWeb" className="h-7 w-7 object-contain rounded-md group-hover:scale-110 transition-smooth" />
            </span>
            <span className="font-display text-lg font-bold text-white tracking-tight">TuuWeb</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-smooth ${
                    isActive
                      ? "bg-white text-brand-orange shadow-sm"
                      : "text-white/90 hover:bg-white/15 hover:text-white"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex rounded-full bg-white/15 p-0.5 border border-white/20">
              <button type="button" onClick={() => setTheme("light")}
                className={`h-7 w-7 rounded-full flex items-center justify-center transition-smooth ${theme === "light" ? "bg-white text-brand-orange" : "text-white hover:bg-white/10"}`}
                aria-label="Modo claro"><Sun className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => setTheme("dark")}
                className={`h-7 w-7 rounded-full flex items-center justify-center transition-smooth ${theme === "dark" ? "bg-white text-brand-orange" : "text-white hover:bg-white/10"}`}
                aria-label="Modo oscuro"><Moon className="h-3.5 w-3.5" /></button>
            </div>

            <a
              href={waLink("Hola TuuWeb, quiero información")}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 h-8 px-3 rounded-lg bg-white text-brand-orange hover:bg-white/90 text-sm font-semibold transition-smooth"
            >
              <MessageCircle className="h-4 w-4" />
              Cotizar
            </a>

            <button className="md:hidden text-white hover:bg-white/15 h-8 w-8 rounded-lg flex items-center justify-center" onClick={() => setMobile(!mobile)} aria-label="Menú">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {mobile && (
          <div className="md:hidden border-t border-white/20">
            <nav className="px-3 py-3 flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobile(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive ? "bg-white text-brand-orange" : "text-white hover:bg-white/15"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <a
                href={waLink("Hola TuuWeb, quiero información")}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobile(false)}
                className="mt-2 px-3 py-2 rounded-lg text-sm font-semibold bg-white text-brand-orange text-center inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" /> Cotizar por WhatsApp
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
