import { Link, NavLink } from "react-router-dom";
import { Moon, Sun, User as UserIcon, LogOut, Shield, Menu, LogIn, ShoppingCart, PackageSearch } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";

const links = [
  { to: "/servicios-web", label: "Servicios Web" },
  { to: "/impresiones", label: "Impresiones" },
  { to: "/tienda", label: "Tienda" },
  { to: "/directorio", label: "Negocios" },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut, isAdmin } = useAuth();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-card">
      <div className="container mx-auto px-3 sm:px-4 min-h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="rounded-2xl border border-brand-orange/30 bg-secondary px-2.5 py-1.5 shadow-card">
            <img src={logo} alt="TuuWeb" className="h-8 w-8 object-contain rounded-md group-hover:scale-110 transition-smooth" />
          </span>
          <span className="font-display text-xl font-bold text-gradient">TuuWeb</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex rounded-full border border-border bg-secondary p-1">
            <Button type="button" variant={theme === "light" ? "default" : "ghost"} size="sm" onClick={() => setTheme("light")} className={theme === "light" ? "h-8 rounded-full bg-brand-orange text-primary-foreground" : "h-8 rounded-full"}><Sun className="h-4 w-4" /></Button>
            <Button type="button" variant={theme === "dark" ? "default" : "ghost"} size="sm" onClick={() => setTheme("dark")} className={theme === "dark" ? "h-8 rounded-full bg-brand-orange text-primary-foreground" : "h-8 rounded-full"}><Moon className="h-4 w-4" /></Button>
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 hidden sm:inline-flex">
                  <UserIcon className="h-4 w-4" />
                  <span className="truncate max-w-[100px]">{profile?.full_name ?? user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin-emanuel"><Shield className="h-4 w-4 mr-2" />Panel admin</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/mi-cuenta"><ShoppingCart className="h-4 w-4 mr-2" />Mi cuenta</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/mi-cuenta"><PackageSearch className="h-4 w-4 mr-2" />Rastreo / historial</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex bg-gradient-primary text-primary-foreground gap-2">
              <Link to="/auth"><LogIn className="h-4 w-4" />Iniciar sesión</Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobile(!mobile)} aria-label="Menú">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobile && (
        <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobile(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {!user && (
              <Link to="/auth" onClick={() => setMobile(false)}
                className="mt-2 px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-primary text-primary-foreground text-center">
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
