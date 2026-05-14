import { useState, useEffect } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Admin from "./Admin";

const STORAGE_KEY = "tuuweb_admin_unlocked";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function AdminEmanuel() {
  const { user, isAdmin } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    if (!user) {
      setChecking(false);
      setErr("Primero inicia sesión y vuelve a esta ruta.");
      return;
    }
    const code_hash = await sha256(pwd);
    const { error } = await supabase.from("admin_claims").insert({ user_id: user.id, code_hash });
    setChecking(false);
    if (!error) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      if (!isAdmin) window.location.reload();
    } else {
      setErr("Contraseña incorrecta");
    }
  };

  if (unlocked) return <Admin />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-primary/30 bg-card p-8 shadow-elegant">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
              <ShieldCheck className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">Acceso <span className="text-gradient">Restringido</span></h1>
            <p className="text-sm text-muted-foreground mt-2">Panel privado de administración TuuWeb</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> Contraseña</Label>
              <Input
                type="password"
                value={pwd}
                onChange={(e) => { setPwd(e.target.value); setErr(""); }}
                autoFocus
                className="h-11 mt-1"
              />
              {err && <p className="text-destructive text-xs mt-2">{err}</p>}
            </div>
            <Button type="submit" disabled={checking} className="w-full h-11 bg-gradient-primary text-primary-foreground">Entrar al panel</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
