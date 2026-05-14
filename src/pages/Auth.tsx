import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export default function Auth() {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handle = async (e: React.FormEvent<HTMLFormElement>, mode: "in" | "up") => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")).trim();
    const password = String(fd.get("password"));
    setLoading(true);
    const res = mode === "in"
      ? await signIn(email, password)
      : await signUp(email, password, String(fd.get("full_name") ?? "").trim());
    setLoading(false);
    if (res.error) toast.error(res.error);
    else { toast.success(mode === "in" ? "¡Bienvenido!" : "Cuenta creada. Revisa tu correo si requiere confirmación."); nav("/"); }
  };

  const google = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) toast.error(error);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={logo} alt="TuuWeb" className="h-14 w-14 mx-auto rounded-xl shadow-glow" />
          <h1 className="font-display text-2xl font-bold mt-3">Bienvenido a <span className="text-gradient">TuuWeb</span></h1>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <Button type="button" onClick={google} disabled={loading} variant="outline" className="w-full h-11 mb-4 gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar con Google
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">o con email</span></div>
          </div>
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
