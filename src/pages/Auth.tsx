import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/supabase";
import logo from "@/assets/logo.png";

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handle = async (e: React.FormEvent<HTMLFormElement>, mode: "in" | "up") => {
    e.preventDefault();
    if (!isSupabaseConfigured) { toast.error("Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env"); return; }
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    setLoading(true);
    const res = mode === "in"
      ? await signIn(email, password)
      : await signUp(email, password, String(fd.get("full_name") ?? ""));
    setLoading(false);
    if (res.error) toast.error(res.error);
    else { toast.success(mode === "in" ? "¡Bienvenido!" : "Cuenta creada. Revisa tu correo si requiere confirmación."); nav("/"); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={logo} alt="TuuWeb" className="h-14 w-14 mx-auto rounded-xl shadow-glow" />
          <h1 className="font-display text-2xl font-bold mt-3">Bienvenido a <span className="text-gradient">TuuWeb</span></h1>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <Tabs defaultValue="in">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="in">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="up">Crear cuenta</TabsTrigger>
            </TabsList>
            <TabsContent value="in">
              <form onSubmit={(e) => handle(e, "in")} className="space-y-4">
                <div><Label>Email</Label><Input name="email" type="email" required /></div>
                <div><Label>Contraseña</Label><Input name="password" type="password" required /></div>
                <Button disabled={loading} className="w-full bg-gradient-primary text-primary-foreground">Entrar</Button>
              </form>
            </TabsContent>
            <TabsContent value="up">
              <form onSubmit={(e) => handle(e, "up")} className="space-y-4">
                <div><Label>Nombre completo</Label><Input name="full_name" required /></div>
                <div><Label>Email</Label><Input name="email" type="email" required /></div>
                <div><Label>Contraseña</Label><Input name="password" type="password" minLength={6} required /></div>
                <Button disabled={loading} className="w-full bg-gradient-primary text-primary-foreground">Crear cuenta</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
