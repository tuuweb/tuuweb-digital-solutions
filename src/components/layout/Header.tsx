import { Link, NavLink } from "react-router-dom";
import { Moon, Sun, User as UserIcon, LogOut, Shield, Menu } from "lucide-react";
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
  const { theme, toggle } = useTheme();
  const { user, profile, signOut, isAdmin } = useAuth();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="TuuWeb" className="h-10 w-auto rounded-lg group-hover:scale-110 transition-smooth" />
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
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Cambiar tema">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user && (
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
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          </nav>
        </div>
      )}
    </header>
  );
}
