import { useEffect, useState } from "react";
import { adminSupabase as supabase, clearAdminPassword } from "@/lib/adminSupabase";
import { formatCOP } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trash2, Edit, Plus, Package, Building2, Briefcase, Sparkles, Globe, Image as ImageIcon, MessageSquare, Mail, Phone, Star, Megaphone, FileText, Download, LogOut } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Product { id: string; name: string; description: string; price_cop: number; stock: number; images: string[]; is_active: boolean; is_coming_soon: boolean; tags: string[] | null; }
interface Rec { id: string; business_name: string; category: string; description: string; website_url: string | null; logo_url: string | null; is_coming_soon: boolean; }
interface SoldProject {
  id: string; numero: number | null; cliente: string; dominio: string | null; tipo_pagina: string | null;
  estado_proyecto: string | null; estado_pagina: string | null; cotizacion_cop: number | null;
  proveedor_dominio: string | null; correo_dominio: string | null; fecha_renovacion_dominio: string | null;
  proveedor_hosting: string | null; correo_hosting: string | null; telefono_hosting: string | null; fecha_renovacion_hosting: string | null;
  base_datos: string | null; correo_bd: string | null; ia_usada: string | null; correo_ia: string | null; notas: string | null;
}
interface Brand { id: string; name: string; logo_url: string; website_url: string | null; sort_order: number; is_active: boolean; }
interface HeroSlide { id: string; title: string; subtitle: string | null; image_url: string; cta_label: string | null; cta_link: string | null; sort_order: number; is_active: boolean; }
interface SupportMsg { id: string; name: string; email: string; phone: string | null; topic: string | null; message: string; status: string; created_at: string; }
interface Sponsor { id: string; titulo: string; descripcion: string | null; imagen_url: string | null; link_url: string | null; activo: boolean; orden: number; }
interface Popup { id: string; titulo: string; mensaje: string | null; codigo: string | null; imagen_url: string | null; cta_text: string | null; cta_url: string | null; activo: boolean; frecuencia: string; fecha_inicio: string | null; fecha_fin: string | null; }
interface SiteContent { key: string; value: string | null; }

export default function Admin() {
  const logout = () => {
    clearAdminPassword();
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Panel <span className="text-gradient">Admin</span></h1>
          <p className="text-muted-foreground">Gestiona productos, directorio, proyectos vendidos y marcas aliadas.</p>
        </div>
        <Button type="button" variant="outline" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" /> Salir
        </Button>
      </div>

      <Tabs defaultValue="sold">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="sold"><Briefcase className="h-4 w-4 mr-2" />Tracker proyectos</TabsTrigger>
          <TabsTrigger value="messages"><MessageSquare className="h-4 w-4 mr-2" />Mensajes</TabsTrigger>
          <TabsTrigger value="hero"><ImageIcon className="h-4 w-4 mr-2" />Carrusel principal</TabsTrigger>
          <TabsTrigger value="why"><Sparkles className="h-4 w-4 mr-2" />Slider ¿Por qué web?</TabsTrigger>
          <TabsTrigger value="plans"><Globe className="h-4 w-4 mr-2" />Planes web</TabsTrigger>
          <TabsTrigger value="sponsors"><Star className="h-4 w-4 mr-2" />Patrocinados</TabsTrigger>
          <TabsTrigger value="popups"><Megaphone className="h-4 w-4 mr-2" />Popups</TabsTrigger>
          <TabsTrigger value="brands"><Sparkles className="h-4 w-4 mr-2" />Marcas</TabsTrigger>
          <TabsTrigger value="products"><Package className="h-4 w-4 mr-2" />Productos</TabsTrigger>
          <TabsTrigger value="directory"><Building2 className="h-4 w-4 mr-2" />Directorio</TabsTrigger>
          <TabsTrigger value="content"><FileText className="h-4 w-4 mr-2" />Textos</TabsTrigger>
        </TabsList>
        <TabsContent value="sold" className="mt-6"><SoldProjectsAdmin /></TabsContent>
        <TabsContent value="messages" className="mt-6"><SupportMessagesAdmin /></TabsContent>
        <TabsContent value="hero" className="mt-6"><HeroSlidesAdmin /></TabsContent>
        <TabsContent value="why" className="mt-6"><WhyWebAdmin /></TabsContent>
        <TabsContent value="plans" className="mt-6"><WebPlansAdmin /></TabsContent>
        <TabsContent value="sponsors" className="mt-6"><SponsorsAdmin /></TabsContent>
        <TabsContent value="popups" className="mt-6"><PopupsAdmin /></TabsContent>
        <TabsContent value="brands" className="mt-6"><BrandsAdmin /></TabsContent>
        <TabsContent value="products" className="mt-6"><ProductsAdmin /></TabsContent>
        <TabsContent value="directory" className="mt-6"><DirectoryAdmin /></TabsContent>
        <TabsContent value="content" className="mt-6"><SiteContentAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ======================= PROYECTOS VENDIDOS (TRACKER) ======================= */
function daysUntil(d: string | null): number | null {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

function SoldProjectsAdmin() {
  const [items, setItems] = useState<SoldProject[]>([]);
  const [editing, setEditing] = useState<SoldProject | null>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data } = await supabase.from("sold_projects").select("*").order("numero", { ascending: true });
    setItems((data ?? []) as SoldProject[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => { const x = String(fd.get(k) ?? "").trim(); return x === "" ? null : x; };
    const payload = {
      numero: fd.get("numero") ? Number(fd.get("numero")) : null,
      cliente: String(fd.get("cliente")),
      dominio: v("dominio"),
      tipo_pagina: v("tipo_pagina"),
      estado_proyecto: v("estado_proyecto"),
      estado_pagina: v("estado_pagina"),
      cotizacion_cop: fd.get("cotizacion_cop") ? Number(fd.get("cotizacion_cop")) : 0,
      proveedor_dominio: v("proveedor_dominio"),
      correo_dominio: v("correo_dominio"),
      fecha_renovacion_dominio: v("fecha_renovacion_dominio"),
      proveedor_hosting: v("proveedor_hosting"),
      correo_hosting: v("correo_hosting"),
      telefono_hosting: v("telefono_hosting"),
      fecha_renovacion_hosting: v("fecha_renovacion_hosting"),
      base_datos: v("base_datos"),
      correo_bd: v("correo_bd"),
      ia_usada: v("ia_usada"),
      correo_ia: v("correo_ia"),
      notas: v("notas"),
    };
    const { error } = editing
      ? await supabase.from("sold_projects").update(payload).eq("id", editing.id)
      : await supabase.from("sold_projects").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Guardado"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar registro?")) return;
    const { error } = await supabase.from("sold_projects").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); load(); }
  };

  const exportExcel = () => {
    const rows = items.map((p) => ({
      "N°": p.numero,
      "Cliente / Negocio": p.cliente,
      "Dominio": p.dominio,
      "Tipo de Página": p.tipo_pagina,
      "Estado Proyecto": p.estado_proyecto,
      "Estado Página": p.estado_pagina,
      "Cotización (COP)": p.cotizacion_cop,
      "Proveedor Dominio": p.proveedor_dominio,
      "Correo Dominio": p.correo_dominio,
      "Renovación Dominio": p.fecha_renovacion_dominio,
      "Días Renov. Dom.": daysUntil(p.fecha_renovacion_dominio),
      "Proveedor Hosting": p.proveedor_hosting,
      "Correo Hosting": p.correo_hosting,
      "Tel. Hosting": p.telefono_hosting,
      "Renovación Hosting": p.fecha_renovacion_hosting,
      "Días Renov. Host.": daysUntil(p.fecha_renovacion_hosting),
      "Base de Datos": p.base_datos,
      "Correo BD": p.correo_bd,
      "IA Usada": p.ia_usada,
      "Correo IA": p.correo_ia,
      "Notas": p.notas,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Proyectos");
    XLSX.writeFile(wb, `tracker_tuuweb_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const estados = Array.from(new Set(items.map((i) => i.estado_proyecto).filter(Boolean) as string[]));
  const filtered = filter === "all" ? items : items.filter((i) => i.estado_proyecto === filter);
  const total = filtered.reduce((s, i) => s + Number(i.cotizacion_cop || 0), 0);
  const proxRenov = items.filter((p) => {
    const d1 = daysUntil(p.fecha_renovacion_dominio);
    const d2 = daysUntil(p.fecha_renovacion_hosting);
    return (d1 !== null && d1 <= 30) || (d2 !== null && d2 <= 30);
  }).length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>Todos ({items.length})</Button>
          {estados.map((c) => (
            <Button key={c} size="sm" variant={filter === c ? "default" : "outline"} onClick={() => setFilter(c)}>{c}</Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportExcel}><Download className="h-4 w-4 mr-2" />Exportar Excel</Button>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nuevo proyecto</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto max-w-2xl">
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} proyecto</DialogTitle></DialogHeader>
              <form onSubmit={save} className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><Label>N°</Label><Input type="number" name="numero" defaultValue={editing?.numero ?? items.length + 1} /></div>
                  <div className="col-span-2"><Label>Cliente / Negocio</Label><Input name="cliente" defaultValue={editing?.cliente} required /></div>
                  <div className="col-span-2"><Label>Dominio</Label><Input name="dominio" defaultValue={editing?.dominio ?? ""} placeholder="ejemplo.com" /></div>
                  <div><Label>Tipo Página</Label><Input name="tipo_pagina" defaultValue={editing?.tipo_pagina ?? ""} placeholder="Web/POS" /></div>
                  <div><Label>Estado Proyecto</Label><Input name="estado_proyecto" defaultValue={editing?.estado_proyecto ?? "En proceso"} /></div>
                  <div><Label>Estado Página</Label><Input name="estado_pagina" defaultValue={editing?.estado_pagina ?? "Inactiva"} /></div>
                  <div><Label>Cotización (COP)</Label><Input type="number" name="cotizacion_cop" defaultValue={editing?.cotizacion_cop ?? 0} /></div>
                </div>
                <fieldset className="rounded-lg border border-border p-3 space-y-3">
                  <legend className="text-xs font-semibold px-1">Dominio</legend>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div><Label>Proveedor</Label><Input name="proveedor_dominio" defaultValue={editing?.proveedor_dominio ?? ""} placeholder="Spaceship, GoDaddy..." /></div>
                    <div><Label>Correo</Label><Input name="correo_dominio" defaultValue={editing?.correo_dominio ?? ""} /></div>
                    <div><Label>Renovación</Label><Input type="date" name="fecha_renovacion_dominio" defaultValue={editing?.fecha_renovacion_dominio ?? ""} /></div>
                  </div>
                </fieldset>
                <fieldset className="rounded-lg border border-border p-3 space-y-3">
                  <legend className="text-xs font-semibold px-1">Hosting</legend>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div><Label>Proveedor</Label><Input name="proveedor_hosting" defaultValue={editing?.proveedor_hosting ?? ""} placeholder="Vercel, VPS..." /></div>
                    <div><Label>Correo</Label><Input name="correo_hosting" defaultValue={editing?.correo_hosting ?? ""} /></div>
                    <div><Label>Teléfono</Label><Input name="telefono_hosting" defaultValue={editing?.telefono_hosting ?? ""} /></div>
                    <div className="col-span-2 sm:col-span-3"><Label>Renovación</Label><Input type="date" name="fecha_renovacion_hosting" defaultValue={editing?.fecha_renovacion_hosting ?? ""} /></div>
                  </div>
                </fieldset>
                <fieldset className="rounded-lg border border-border p-3 space-y-3">
                  <legend className="text-xs font-semibold px-1">Base de datos & IA</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Base de datos</Label><Input name="base_datos" defaultValue={editing?.base_datos ?? ""} placeholder="Supabase, Firebase..." /></div>
                    <div><Label>Correo BD</Label><Input name="correo_bd" defaultValue={editing?.correo_bd ?? ""} /></div>
                    <div><Label>IA usada</Label><Input name="ia_usada" defaultValue={editing?.ia_usada ?? ""} placeholder="Lovable, Claude..." /></div>
                    <div><Label>Correo IA</Label><Input name="correo_ia" defaultValue={editing?.correo_ia ?? ""} /></div>
                  </div>
                </fieldset>
                <div><Label>Notas</Label><Textarea name="notas" defaultValue={editing?.notas ?? ""} /></div>
                <DialogFooter><Button type="submit" className="bg-gradient-primary text-primary-foreground">Guardar</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-3 mb-4">
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Total</div><div className="font-display text-2xl font-bold">{filtered.length}</div></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Ingresos</div><div className="font-display text-2xl font-bold text-gradient">{formatCOP(total)}</div></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Próx. renovación (≤30d)</div><div className="font-display text-2xl font-bold text-destructive">{proxRenov}</div></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Estados</div><div className="font-display text-2xl font-bold">{estados.length}</div></div>
      </div>

      <div className="grid gap-3">
        {filtered.map((p) => {
          const dDom = daysUntil(p.fecha_renovacion_dominio);
          const dHost = daysUntil(p.fecha_renovacion_hosting);
          const warn = (dDom !== null && dDom <= 30) || (dHost !== null && dHost <= 30);
          return (
            <div key={p.id} className={`rounded-xl border bg-card p-4 ${warn ? "border-destructive/60" : "border-border"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">#{p.numero} · {p.cliente}</span>
                    {p.tipo_pagina && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{p.tipo_pagina}</span>}
                    {p.estado_proyecto && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{p.estado_proyecto}</span>}
                    {p.estado_pagina && <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success">{p.estado_pagina}</span>}
                  </div>
                  {p.dominio && <a href={`https://${p.dominio}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{p.dominio}</a>}
                  <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                    <div><strong>Dom.:</strong> {p.proveedor_dominio ?? "—"} · {p.fecha_renovacion_dominio ?? "sin fecha"} {dDom !== null && <span className={dDom <= 30 ? "text-destructive font-semibold" : ""}>({dDom}d)</span>}</div>
                    <div><strong>Host.:</strong> {p.proveedor_hosting ?? "—"} · {p.fecha_renovacion_hosting ?? "sin fecha"} {dHost !== null && <span className={dHost <= 30 ? "text-destructive font-semibold" : ""}>({dHost}d)</span>}</div>
                    <div><strong>BD:</strong> {p.base_datos ?? "—"}</div>
                    <div><strong>IA:</strong> {p.ia_usada ?? "—"}</div>
                    <div className="font-semibold text-foreground">{formatCOP(p.cotizacion_cop ?? 0)}</div>
                  </div>
                  {p.notas && <p className="text-xs text-muted-foreground mt-2 italic">{p.notas}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="outline" onClick={() => { setEditing(p); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="outline" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">Sin proyectos.</p>}
      </div>
    </>
  );
}

/* ======================= PATROCINADORES ======================= */
function SponsorsAdmin() {
  const [items, setItems] = useState<Sponsor[]>([]);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("sponsor_gallery").select("*").order("orden");
    setItems((data ?? []) as Sponsor[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      titulo: String(fd.get("titulo")),
      descripcion: String(fd.get("descripcion") ?? "") || null,
      imagen_url: String(fd.get("imagen_url") ?? "") || null,
      link_url: String(fd.get("link_url") ?? "") || null,
      orden: Number(fd.get("orden") ?? 0),
      activo: fd.get("activo") === "on",
    };
    const { error } = editing
      ? await supabase.from("sponsor_gallery").update(payload).eq("id", editing.id)
      : await supabase.from("sponsor_gallery").insert(payload);
    if (error) toast.error(error.message); else { toast.success("Guardado"); setOpen(false); setEditing(null); load(); }
  };
  const toggle = async (s: Sponsor) => {
    await supabase.from("sponsor_gallery").update({ activo: !s.activo }).eq("id", s.id); load();
  };
  const remove = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await supabase.from("sponsor_gallery").delete().eq("id", id); load();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">Negocios patrocinados que aparecen en la home. Activa/desactiva con el switch.</p>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nuevo patrocinado</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} patrocinado</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>Título</Label><Input name="titulo" defaultValue={editing?.titulo} required /></div>
              <div><Label>Descripción</Label><Textarea name="descripcion" defaultValue={editing?.descripcion ?? ""} /></div>
              <div><Label>URL imagen</Label><Input name="imagen_url" defaultValue={editing?.imagen_url ?? ""} placeholder="https://..." /></div>
              <div><Label>URL del negocio</Label><Input name="link_url" defaultValue={editing?.link_url ?? ""} placeholder="https://..." /></div>
              <div><Label>Orden</Label><Input type="number" name="orden" defaultValue={editing?.orden ?? 0} /></div>
              <div className="flex items-center justify-between"><Label>Activo</Label><Switch name="activo" defaultChecked={editing?.activo ?? true} /></div>
              <DialogFooter><Button type="submit" className="bg-gradient-primary text-primary-foreground">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
            {s.imagen_url && <img src={s.imagen_url} alt={s.titulo} className="h-16 w-16 object-cover rounded-lg" />}
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{s.titulo}</div>
              <div className="text-xs text-muted-foreground truncate">{s.link_url ?? "Sin link"} · #{s.orden}</div>
            </div>
            <Switch checked={s.activo} onCheckedChange={() => toggle(s)} />
            <Button size="icon" variant="outline" onClick={() => { setEditing(s); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm text-center py-8 col-span-full">Sin patrocinados.</p>}
      </div>
    </>
  );
}

/* ======================= POPUPS ======================= */
function PopupsAdmin() {
  const [items, setItems] = useState<Popup[]>([]);
  const [editing, setEditing] = useState<Popup | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("promo_popups").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Popup[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      titulo: String(fd.get("titulo")),
      mensaje: String(fd.get("mensaje") ?? "") || null,
      codigo: String(fd.get("codigo") ?? "") || null,
      imagen_url: String(fd.get("imagen_url") ?? "") || null,
      cta_text: String(fd.get("cta_text") ?? "") || null,
      cta_url: String(fd.get("cta_url") ?? "") || null,
      frecuencia: String(fd.get("frecuencia") ?? "session"),
      fecha_inicio: String(fd.get("fecha_inicio") ?? "") || null,
      fecha_fin: String(fd.get("fecha_fin") ?? "") || null,
      activo: fd.get("activo") === "on",
    };
    const { error } = editing
      ? await supabase.from("promo_popups").update(payload).eq("id", editing.id)
      : await supabase.from("promo_popups").insert(payload);
    if (error) toast.error(error.message); else { toast.success("Guardado"); setOpen(false); setEditing(null); load(); }
  };
  const toggle = async (p: Popup) => { await supabase.from("promo_popups").update({ activo: !p.activo }).eq("id", p.id); load(); };
  const remove = async (id: string) => { if (!confirm("¿Eliminar?")) return; await supabase.from("promo_popups").delete().eq("id", id); load(); };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">Ventanas emergentes para promociones, códigos de descuento o avisos.</p>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild><Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nuevo popup</Button></DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} popup</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>Título</Label><Input name="titulo" defaultValue={editing?.titulo} required /></div>
              <div><Label>Mensaje</Label><Textarea name="mensaje" defaultValue={editing?.mensaje ?? ""} placeholder="Compra una página web y recibe 1 cámara de seguridad gratis" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Código (opcional)</Label><Input name="codigo" defaultValue={editing?.codigo ?? ""} placeholder="TUUWEB20" /></div>
                <div>
                  <Label>Frecuencia</Label>
                  <select name="frecuencia" defaultValue={editing?.frecuencia ?? "session"} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="session">Una vez por sesión</option>
                    <option value="always">Siempre</option>
                  </select>
                </div>
              </div>
              <div><Label>Imagen URL</Label><Input name="imagen_url" defaultValue={editing?.imagen_url ?? ""} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Texto botón</Label><Input name="cta_text" defaultValue={editing?.cta_text ?? "Cotizar por WhatsApp"} /></div>
                <div><Label>URL botón</Label><Input name="cta_url" defaultValue={editing?.cta_url ?? ""} placeholder="https://wa.me/573332732672" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Inicio</Label><Input type="datetime-local" name="fecha_inicio" defaultValue={editing?.fecha_inicio?.slice(0, 16) ?? ""} /></div>
                <div><Label>Fin</Label><Input type="datetime-local" name="fecha_fin" defaultValue={editing?.fecha_fin?.slice(0, 16) ?? ""} /></div>
              </div>
              <div className="flex items-center justify-between"><Label>Activo</Label><Switch name="activo" defaultChecked={editing?.activo ?? true} /></div>
              <DialogFooter><Button type="submit" className="bg-gradient-primary text-primary-foreground">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3">
        {items.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{p.titulo} {p.codigo && <span className="text-xs px-2 py-0.5 rounded bg-brand-orange/10 text-brand-orange font-mono ml-2">{p.codigo}</span>}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{p.mensaje}</div>
              <div className="text-xs text-muted-foreground mt-1">Frecuencia: {p.frecuencia} · {p.activo ? "Activo" : "Pausado"}</div>
            </div>
            <Switch checked={p.activo} onCheckedChange={() => toggle(p)} />
            <Button size="icon" variant="outline" onClick={() => { setEditing(p); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">Sin popups.</p>}
      </div>
    </>
  );
}

/* ======================= TEXTOS DEL SITIO ======================= */
const DEFAULT_KEYS: Array<{ key: string; label: string; placeholder: string }> = [
  { key: "home_title", label: "Título principal", placeholder: "TuuWeb" },
  { key: "home_subtitle", label: "Subtítulo principal", placeholder: "Soluciones digitales y físicas" },
  { key: "tienda_title", label: "Título de tienda", placeholder: "Anuncios, electrónicos y más" },
  { key: "directorio_title", label: "Título de directorio", placeholder: "Negocios de Confianza" },
  { key: "why_title", label: "Título sección '¿Por qué TuuWeb?'", placeholder: "¿Por qué TuuWeb?" },
  { key: "cta_title", label: "Título CTA final", placeholder: "¿Listo para potenciar tu marca?" },
];

function SiteContentAdmin() {
  const [items, setItems] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("site_content").select("*");
    const map: Record<string, string> = {};
    (data as SiteContent[] | null)?.forEach((r) => { map[r.key] = r.value ?? ""; });
    setItems(map); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveOne = async (key: string, value: string) => {
    const { error } = await supabase.from("site_content").upsert({ key, value }, { onConflict: "key" });
    if (error) toast.error(error.message); else toast.success("Guardado");
  };

  if (loading) return <p className="text-muted-foreground text-sm">Cargando...</p>;

  return (
    <div className="space-y-3 max-w-2xl">
      <p className="text-sm text-muted-foreground">Edita los textos clave del sitio. Los cambios se reflejan en la web pública.</p>
      {DEFAULT_KEYS.map((k) => (
        <div key={k.key} className="rounded-xl border border-border bg-card p-4">
          <Label>{k.label}</Label>
          <div className="flex gap-2 mt-1">
            <Input
              defaultValue={items[k.key] ?? ""}
              placeholder={k.placeholder}
              onBlur={(e) => e.target.value !== (items[k.key] ?? "") && saveOne(k.key, e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">clave: <code>{k.key}</code></p>
        </div>
      ))}
    </div>
  );
}

/* ======================= MARCAS / CARRUSEL ======================= */
function BrandsAdmin() {
  const [items, setItems] = useState<Brand[]>([]);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("trusted_brands").select("*").order("sort_order", { ascending: true });
    setItems((data ?? []) as Brand[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name")),
      logo_url: String(fd.get("logo_url")),
      website_url: String(fd.get("website_url") ?? "") || null,
      sort_order: Number(fd.get("sort_order") ?? 0),
      is_active: fd.get("is_active") === "on",
    };
    const { error } = editing
      ? await supabase.from("trusted_brands").update(payload).eq("id", editing.id)
      : await supabase.from("trusted_brands").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Guardado"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar marca?")) return;
    const { error } = await supabase.from("trusted_brands").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); load(); }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">Logos del carrusel "Marcas que confían en nosotros". Al hacer click el visitante va al sitio.</p>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nueva marca</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nueva"} marca</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>Nombre del negocio</Label><Input name="name" defaultValue={editing?.name} required /></div>
              <div><Label>URL del logo</Label><Input name="logo_url" defaultValue={editing?.logo_url} placeholder="https://..." required /></div>
              <div><Label>URL del sitio (opcional)</Label><Input name="website_url" defaultValue={editing?.website_url ?? ""} placeholder="https://cliente.com" /></div>
              <div><Label>Orden (menor aparece primero)</Label><Input type="number" name="sort_order" defaultValue={editing?.sort_order ?? 0} /></div>
              <div className="flex items-center justify-between"><Label>Visible en el carrusel</Label><Switch name="is_active" defaultChecked={editing?.is_active ?? true} /></div>
              <DialogFooter><Button type="submit" className="bg-gradient-primary text-primary-foreground">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((b) => (
          <div key={b.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <img src={b.logo_url} alt={b.name} className="h-12 w-12 object-contain rounded bg-secondary p-1" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{b.name}</div>
              <div className="text-xs text-muted-foreground truncate">{b.website_url ?? "Sin URL"} · #{b.sort_order} · {b.is_active ? "visible" : "oculto"}</div>
            </div>
            <Button size="icon" variant="outline" onClick={() => { setEditing(b); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm text-center py-8 col-span-full">Sin marcas aún. Agrega la primera.</p>}
      </div>
    </>
  );
}

/* ======================= PRODUCTOS ======================= */
function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("physical_products").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Product[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name")),
      description: String(fd.get("description")),
      price_cop: Number(fd.get("price_cop")),
      stock: Number(fd.get("stock")),
      images: String(fd.get("images") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      tags: String(fd.get("tags") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      is_active: fd.get("is_active") === "on",
      is_coming_soon: fd.get("is_coming_soon") === "on",
    };
    const { error } = editing
      ? await supabase.from("physical_products").update(payload).eq("id", editing.id)
      : await supabase.from("physical_products").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Guardado"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar producto?")) return;
    const { error } = await supabase.from("physical_products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); load(); }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nuevo producto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} producto</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>Nombre</Label><Input name="name" defaultValue={editing?.name} required /></div>
              <div><Label>Descripción</Label><Textarea name="description" defaultValue={editing?.description} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Precio COP</Label><Input type="number" name="price_cop" defaultValue={editing?.price_cop ?? 0} required /></div>
                <div><Label>Stock</Label><Input type="number" name="stock" defaultValue={editing?.stock ?? 0} required /></div>
              </div>
              <div><Label>Imágenes (URLs separadas por coma)</Label><Input name="images" defaultValue={editing?.images?.join(", ")} /></div>
              <div><Label>Etiquetas (separadas por coma)</Label><Input name="tags" defaultValue={editing?.tags?.join(", ")} placeholder="Nuevo, Domicilio gratis, Oferta" /></div>
              <div className="flex items-center justify-between"><Label>Activo</Label><Switch name="is_active" defaultChecked={editing?.is_active ?? true} /></div>
              <div className="flex items-center justify-between"><Label>Próximamente</Label><Switch name="is_coming_soon" defaultChecked={editing?.is_coming_soon ?? false} /></div>
              <DialogFooter><Button type="submit" className="bg-gradient-primary text-primary-foreground">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3">
        {items.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{p.name}</div>
              <div className="text-xs text-muted-foreground">{formatCOP(p.price_cop)} · stock {p.stock} · {p.is_active ? "activo" : "inactivo"} {p.is_coming_soon && "· próximamente"}</div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => { setEditing(p); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="outline" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">Sin productos aún.</p>}
      </div>
    </>
  );
}

/* ======================= DIRECTORIO ======================= */
function DirectoryAdmin() {
  const [items, setItems] = useState<Rec[]>([]);
  const [editing, setEditing] = useState<Rec | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("directory_recommendations").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Rec[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      business_name: String(fd.get("business_name")),
      category: String(fd.get("category")),
      description: String(fd.get("description")),
      website_url: String(fd.get("website_url") ?? "") || null,
      logo_url: String(fd.get("logo_url") ?? "") || null,
      is_coming_soon: fd.get("is_coming_soon") === "on",
    };
    const { error } = editing
      ? await supabase.from("directory_recommendations").update(payload).eq("id", editing.id)
      : await supabase.from("directory_recommendations").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Guardado"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    const { error } = await supabase.from("directory_recommendations").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); load(); }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nueva empresa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nueva"} empresa</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>Nombre del negocio</Label><Input name="business_name" defaultValue={editing?.business_name} required /></div>
              <div><Label>Categoría</Label><Input name="category" defaultValue={editing?.category} placeholder="Restaurantes, Odontologías..." required /></div>
              <div><Label>Descripción</Label><Textarea name="description" defaultValue={editing?.description} /></div>
              <div><Label>Website</Label><Input name="website_url" defaultValue={editing?.website_url ?? ""} /></div>
              <div><Label>Logo URL</Label><Input name="logo_url" defaultValue={editing?.logo_url ?? ""} /></div>
              <div className="flex items-center justify-between"><Label>Próximamente</Label><Switch name="is_coming_soon" defaultChecked={editing?.is_coming_soon ?? false} /></div>
              <DialogFooter><Button type="submit" className="bg-gradient-primary text-primary-foreground">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3">
        {items.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{r.business_name} <span className="text-xs text-muted-foreground">· {r.category}</span></div>
              <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => { setEditing(r); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="outline" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">Sin entradas aún.</p>}
      </div>
    </>
  );
}

/* ======================= CARRUSEL HERO PRINCIPAL ======================= */
function HeroSlidesAdmin() {
  const [items, setItems] = useState<HeroSlide[]>([]);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [open, setOpen] = useState(false);
  const [imgPreview, setImgPreview] = useState<string>("");

  const load = async () => {
    const { data } = await supabase.from("hero_slides").select("*").order("sort_order", { ascending: true });
    setItems((data ?? []) as HeroSlide[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title")),
      subtitle: String(fd.get("subtitle") ?? "") || null,
      image_url: String(fd.get("image_url")),
      cta_label: String(fd.get("cta_label") ?? "") || null,
      cta_link: String(fd.get("cta_link") ?? "") || null,
      sort_order: Number(fd.get("sort_order") ?? 0),
      is_active: fd.get("is_active") === "on",
    };
    const { error } = editing
      ? await supabase.from("hero_slides").update(payload).eq("id", editing.id)
      : await supabase.from("hero_slides").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Guardado"); setOpen(false); setEditing(null); setImgPreview(""); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar slide?")) return;
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); load(); }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">Slides del carrusel grande de la página principal. Cambia imágenes, títulos y enlaces.</p>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setImgPreview(""); } }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nuevo slide</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} slide</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>Título</Label><Input name="title" defaultValue={editing?.title} required /></div>
              <div><Label>Subtítulo / descripción</Label><Textarea name="subtitle" defaultValue={editing?.subtitle ?? ""} rows={2} /></div>
              <div>
                <Label>URL de imagen (galería)</Label>
                <Input name="image_url" defaultValue={editing?.image_url}
                  onChange={(e) => setImgPreview(e.target.value)} placeholder="https://..." required />
                <p className="text-xs text-muted-foreground mt-1">Sube tu imagen a imgur, ibb.co o tu CDN y pega la URL.</p>
                {(imgPreview || editing?.image_url) && (
                  <img src={imgPreview || editing?.image_url} alt="preview"
                    className="mt-2 rounded-lg border border-border max-h-40 object-cover w-full" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Texto del botón</Label><Input name="cta_label" defaultValue={editing?.cta_label ?? ""} placeholder="Ver más" /></div>
                <div><Label>Enlace del botón</Label><Input name="cta_link" defaultValue={editing?.cta_link ?? ""} placeholder="/servicios-web" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Orden</Label><Input type="number" name="sort_order" defaultValue={editing?.sort_order ?? 0} /></div>
                <div className="flex items-center justify-between mt-6"><Label>Activo</Label><Switch name="is_active" defaultChecked={editing?.is_active ?? true} /></div>
              </div>
              <DialogFooter><Button type="submit" className="bg-gradient-primary text-primary-foreground">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <img src={s.image_url} alt={s.title} className="w-full h-32 object-cover" />
            <div className="p-4">
              <div className="font-semibold">{s.title} <span className="text-xs text-muted-foreground">#{s.sort_order} {s.is_active ? "" : "· oculto"}</span></div>
              <div className="text-xs text-muted-foreground line-clamp-2 mb-3">{s.subtitle}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(s); setImgPreview(s.image_url); setOpen(true); }}><Edit className="h-3.5 w-3.5 mr-1" />Editar</Button>
                <Button size="sm" variant="outline" onClick={() => remove(s.id)}><Trash2 className="h-3.5 w-3.5 mr-1" />Borrar</Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm text-center py-8 col-span-full">Sin slides aún. Se mostrarán los predeterminados en el inicio.</p>}
      </div>
    </>
  );
}

/* ======================= MENSAJES DE SOPORTE ======================= */
function SupportMessagesAdmin() {
  const [items, setItems] = useState<SupportMsg[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data } = await supabase.from("support_messages").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as SupportMsg[]);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("support_messages").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar mensaje?")) return;
    const { error } = await supabase.from("support_messages").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); load(); }
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "nuevo", "en_proceso", "respondido", "cerrado"].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)} className={filter === s ? "bg-gradient-primary text-primary-foreground" : ""}>
            {s === "all" ? `Todos (${items.length})` : s.replace("_", " ")}
          </Button>
        ))}
      </div>
      <div className="grid gap-3">
        {filtered.map((m) => (
          <div key={m.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{m.name}</span>
                  {m.topic && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{m.topic}</span>}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{m.status.replace("_", " ")}</span>
                  <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                  <a href={`mailto:${m.email}`} className="flex items-center gap-1 hover:text-primary"><Mail className="h-3 w-3" />{m.email}</a>
                  {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3" />{m.phone}</a>}
                </div>
                <p className="text-sm mt-2 whitespace-pre-wrap">{m.message}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <select value={m.status} onChange={(e) => setStatus(m.id, e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                  <option value="nuevo">nuevo</option>
                  <option value="en_proceso">en proceso</option>
                  <option value="respondido">respondido</option>
                  <option value="cerrado">cerrado</option>
                </select>
                <Button size="icon" variant="outline" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">Sin mensajes.</p>}
      </div>
    </>
  );
}

/* ======================= SHOWCASE SLIDER (SERVICIOS) ======================= */
interface WhyRow { id: string; kicker: string | null; title: string; description: string; stat: string | null; image_url: string; accent: string; cta_label: string | null; cta_link: string | null; sort_order: number; is_active: boolean; }
interface PlanRow { id: string; category: string; title: string; description: string; price_cop: number; old_price_cop: number | null; badge: string | null; image_url: string; features: string[]; is_popular: boolean; is_package: boolean; sort_order: number; is_active: boolean; }

function WhyWebAdmin() {
  const [items, setItems] = useState<WhyRow[]>([]);
  const [editing, setEditing] = useState<WhyRow | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("why_web_slides").select("*").order("sort_order", { ascending: true });
    setItems((data ?? []) as WhyRow[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      kicker: String(fd.get("kicker") ?? "") || null,
      title: String(fd.get("title")),
      description: String(fd.get("description") ?? ""),
      stat: String(fd.get("stat") ?? "") || null,
      image_url: String(fd.get("image_url") ?? ""),
      accent: String(fd.get("accent") ?? "#ff7a1a"),
      cta_label: String(fd.get("cta_label") ?? "") || null,
      cta_link: String(fd.get("cta_link") ?? "") || null,
      sort_order: Number(fd.get("sort_order") ?? 0),
      is_active: fd.get("is_active") === "on",
    };
    const { error } = editing
      ? await supabase.from("why_web_slides").update(payload).eq("id", editing.id)
      : await supabase.from("why_web_slides").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Guardado"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar slide?")) return;
    const { error } = await supabase.from("why_web_slides").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); load(); }
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <p className="text-sm text-muted-foreground">Slides del bloque "¿Por qué tu negocio necesita una web?" en el inicio.</p>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nuevo slide</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} slide</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>Etiqueta superior</Label><Input name="kicker" defaultValue={editing?.kicker ?? ""} placeholder="VISIBILIDAD 24/7" /></div>
              <div><Label>Título</Label><Input name="title" defaultValue={editing?.title} required /></div>
              <div><Label>Descripción</Label><Textarea name="description" defaultValue={editing?.description ?? ""} rows={3} /></div>
              <div><Label>Dato destacado</Label><Input name="stat" defaultValue={editing?.stat ?? ""} placeholder="+70% de clientes buscan en Google" /></div>
              <div><Label>URL de imagen</Label><Input name="image_url" defaultValue={editing?.image_url ?? ""} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Texto del botón</Label><Input name="cta_label" defaultValue={editing?.cta_label ?? ""} /></div>
                <div><Label>Enlace</Label><Input name="cta_link" defaultValue={editing?.cta_link ?? ""} placeholder="/servicios-web" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3 items-end">
                <div><Label>Color</Label><Input type="color" name="accent" defaultValue={editing?.accent ?? "#ff7a1a"} className="h-10 p-1" /></div>
                <div><Label>Orden</Label><Input type="number" name="sort_order" defaultValue={editing?.sort_order ?? 0} /></div>
                <div className="flex items-center justify-between"><Label>Activo</Label><Switch name="is_active" defaultChecked={editing?.is_active ?? true} /></div>
              </div>
              <DialogFooter><Button type="submit" className="bg-gradient-primary text-primary-foreground">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card overflow-hidden">
            {s.image_url && <img src={s.image_url} alt={s.title} className="w-full h-32 object-cover" />}
            <div className="p-4">
              <div className="font-semibold">{s.title} <span className="text-xs text-muted-foreground">#{s.sort_order} {s.is_active ? "" : "· oculto"}</span></div>
              <div className="text-xs text-muted-foreground line-clamp-2 mb-3">{s.description}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(s); setOpen(true); }}><Edit className="h-3.5 w-3.5 mr-1" />Editar</Button>
                <Button size="sm" variant="outline" onClick={() => remove(s.id)}><Trash2 className="h-3.5 w-3.5 mr-1" />Borrar</Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm text-center py-8 col-span-full">Sin slides. Se muestran los predeterminados.</p>}
      </div>
    </>
  );
}

/* ======================= PLANES DE SERVICIOS WEB ======================= */
function WebPlansAdmin() {
  const [items, setItems] = useState<PlanRow[]>([]);
  const [editing, setEditing] = useState<PlanRow | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("web_plans").select("*").order("sort_order", { ascending: true });
    setItems((data ?? []) as PlanRow[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const old = Number(fd.get("old_price_cop") ?? 0);
    const payload = {
      category: String(fd.get("category") ?? "Servicios"),
      title: String(fd.get("title")),
      description: String(fd.get("description") ?? ""),
      price_cop: Number(fd.get("price_cop") ?? 0),
      old_price_cop: old > 0 ? old : null,
      badge: String(fd.get("badge") ?? "") || null,
      image_url: String(fd.get("image_url") ?? ""),
      features: String(fd.get("features") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      is_popular: fd.get("is_popular") === "on",
      is_package: fd.get("is_package") === "on",
      sort_order: Number(fd.get("sort_order") ?? 0),
      is_active: fd.get("is_active") === "on",
    };
    const { error } = editing
      ? await supabase.from("web_plans").update(payload).eq("id", editing.id)
      : await supabase.from("web_plans").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Guardado"); setOpen(false); setEditing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar plan?")) return;
    const { error } = await supabase.from("web_plans").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); load(); }
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <p className="text-sm text-muted-foreground">Planes y paquetes de la página "Servicios Web". Precios, categorías, insignias y características.</p>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nuevo plan</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} plan</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>Categoría (agrupa los planes)</Label><Input name="category" defaultValue={editing?.category ?? "⚡ Categoría 01: Impulsa tu negocio"} required /></div>
              <div><Label>Título</Label><Input name="title" defaultValue={editing?.title} required /></div>
              <div><Label>Descripción</Label><Textarea name="description" defaultValue={editing?.description ?? ""} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Precio COP</Label><Input type="number" name="price_cop" defaultValue={editing?.price_cop ?? 0} required /></div>
                <div><Label>Precio antes (opcional)</Label><Input type="number" name="old_price_cop" defaultValue={editing?.old_price_cop ?? 0} /></div>
              </div>
              <div><Label>Insignia</Label><Input name="badge" defaultValue={editing?.badge ?? ""} placeholder="🔥 Más vendido" /></div>
              <div><Label>URL de imagen</Label><Input name="image_url" defaultValue={editing?.image_url ?? ""} /></div>
              <div><Label>Características (separadas por coma)</Label><Textarea name="features" defaultValue={editing?.features?.join(", ")} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between"><Label>Destacado</Label><Switch name="is_popular" defaultChecked={editing?.is_popular ?? false} /></div>
                <div className="flex items-center justify-between"><Label>Es paquete</Label><Switch name="is_package" defaultChecked={editing?.is_package ?? false} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Orden</Label><Input type="number" name="sort_order" defaultValue={editing?.sort_order ?? 0} /></div>
                <div className="flex items-center justify-between mt-6"><Label>Activo</Label><Switch name="is_active" defaultChecked={editing?.is_active ?? true} /></div>
              </div>
              <DialogFooter><Button type="submit" className="bg-gradient-primary text-primary-foreground">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3">
        {items.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{p.title} {p.badge && <span className="text-xs text-primary">{p.badge}</span>}</div>
              <div className="text-xs text-muted-foreground truncate">{p.category} · {formatCOP(p.price_cop)} · #{p.sort_order} {p.is_active ? "" : "· oculto"}</div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => { setEditing(p); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="outline" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">Sin planes aún.</p>}
      </div>
    </>
  );
}

