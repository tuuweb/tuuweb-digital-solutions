import { createContext, useContext, useEffect, type ReactNode } from "react";

// Modo único (claro). Se elimina el toggle claro/oscuro.
const ThemeCtx = createContext<{ theme: "light" }>({ theme: "light" });

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try { localStorage.removeItem("theme"); } catch {}
  }, []);
  return <ThemeCtx.Provider value={{ theme: "light" }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
