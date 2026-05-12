import { useState } from "react";
import { motion } from "framer-motion";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const schema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  topic: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Cuéntanos más").max(2000),
});

export function SupportForm({ defaultTopic = "" }: { defaultTopic?: string }) {
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone") ?? "",
      topic: fd.get("topic") ?? "",
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!isSupabaseConfigured) {
      toast.error("Backend no configurado todavía.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("support_messages").insert({
      ...parsed.data,
      phone: parsed.data.phone || null,
      topic: parsed.data.topic || null,
      status: "nuevo",
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("¡Mensaje enviado! Te contactamos pronto.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <MessageSquare className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold">¿Qué estás buscando?</h3>
          <p className="text-sm text-muted-foreground">Déjanos tus datos y te responderemos personalizado.</p>
        </div>
      </div>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
        <div><Label>Nombre*</Label><Input name="name" required maxLength={100} /></div>
        <div><Label>Email*</Label><Input name="email" type="email" required maxLength={255} /></div>
        <div><Label>Teléfono / WhatsApp</Label><Input name="phone" maxLength={40} /></div>
        <div><Label>Tema</Label>
          <select name="topic" defaultValue={defaultTopic}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Selecciona…</option>
            <option value="Servicios Web">Servicios Web</option>
            <option value="Impresiones">Impresiones &amp; Avisos</option>
            <option value="Tienda">Tienda / Producto</option>
            <option value="Directorio">Aparecer en Directorio</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div className="md:col-span-2"><Label>¿Qué necesitas?*</Label>
          <Textarea name="message" required minLength={5} maxLength={2000} rows={4}
            placeholder="Cuéntanos qué buscas, presupuesto aproximado, fecha…" />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button disabled={loading} type="submit" className="bg-gradient-primary text-primary-foreground h-11 px-6 gap-2">
            <Send className="h-4 w-4" /> {loading ? "Enviando…" : "Enviar solicitud"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
