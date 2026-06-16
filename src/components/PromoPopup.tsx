import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Popup {
  id: string;
  titulo: string;
  mensaje: string | null;
  codigo: string | null;
  imagen_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  frecuencia: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
}

export function PromoPopup() {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("promo_popups")
        .select("*")
        .eq("activo", true)
        .order("created_at", { ascending: false })
        .limit(5);
      const valid = (data ?? []).find((p: Popup) => {
        if (p.fecha_inicio && p.fecha_inicio > now) return false;
        if (p.fecha_fin && p.fecha_fin < now) return false;
        return true;
      });
      if (!valid) return;
      const key = `promo_seen_${valid.id}`;
      if (valid.frecuencia === "session" && sessionStorage.getItem(key)) return;
      setPopup(valid as Popup);
      setTimeout(() => {
        setOpen(true);
        if (valid.frecuencia === "session") sessionStorage.setItem(key, "1");
      }, 1500);
    })();
  }, []);

  if (!popup) return null;

  const copyCode = async () => {
    if (!popup.codigo) return;
    await navigator.clipboard.writeText(popup.codigo);
    setCopied(true);
    toast.success("Código copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {popup.imagen_url && (
          <img src={popup.imagen_url} alt={popup.titulo} className="w-full h-48 object-cover" />
        )}
        <div className="p-6 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Promoción especial
          </div>
          <h2 className="font-display text-2xl font-bold">{popup.titulo}</h2>
          {popup.mensaje && <p className="text-sm text-muted-foreground">{popup.mensaje}</p>}
          {popup.codigo && (
            <button
              onClick={copyCode}
              className="w-full rounded-xl border-2 border-dashed border-brand-orange bg-brand-orange/5 p-4 hover:bg-brand-orange/10 transition-smooth"
            >
              <div className="text-xs text-muted-foreground mb-1">Usa el código</div>
              <div className="flex items-center justify-center gap-2 font-mono font-bold text-xl text-brand-orange">
                {popup.codigo}
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </div>
            </button>
          )}
          {popup.cta_url && (
            <Button asChild size="lg" className="w-full bg-gradient-primary text-primary-foreground">
              <a href={popup.cta_url} target={popup.cta_url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {popup.cta_text ?? "Saber más"}
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
