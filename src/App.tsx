import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/layout/Layout";
import { PageLoader } from "@/components/PageLoader";

import Home from "@/pages/Home";
import ServiciosWeb from "@/pages/ServiciosWeb";
import Impresiones from "@/pages/Impresiones";
import Tienda from "@/pages/Tienda";
import Directorio from "@/pages/Directorio";

import AdminEmanuel from "@/pages/AdminEmanuel";
import NotFound from "@/pages/NotFound";

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios-web" element={<ServiciosWeb />} />
        <Route path="/impresiones" element={<Impresiones />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/directorio" element={<Directorio />} />
        
        <Route path="/admin-emanuel" element={<AdminEmanuel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <PageLoader />;
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}
