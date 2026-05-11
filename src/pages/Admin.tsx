import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, formatCOP } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trash2, Edit, Plus, Package, Building2, ShieldAlert, Briefcase, Sparkles, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Product { id: string; name: string; description: string; price_cop: number; stock: number; images: string[]; is_active: boolean; is_coming_soon: boolean; }
interface Rec { id: string; business_name: string; category: string; description: string; website_url: string | null; logo_url: string | null; is_coming_soon: boolean; }
interface SoldProject { id: string; project_name: string; category: string; client_name: string; client_contact: string | null; domain: string | null; price_cop: number; sold_at: string; notes: string | null; status: string; }
interface Brand { id: string; name: string; logo_url: string; website_url: string | null; sort_order: number; is_active: boolean; }
interface HeroSlide { id: string; title: string; subtitle: string | null; image_url: string; cta_label: string | null; cta_link: string | null; sort_order: number; is_active: boolean; }

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="container mx-auto px-4 py-20 text-center">Cargando...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h1 className="font-display text-2xl font-bold">Acceso restringido</h1>
      <p className="text-muted-foreground mt-2">Esta sección es solo para administradores.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Panel <span className="text-gradient">Admin</span></h1>
      <p className="text-muted-foreground mb-8">Gestiona productos, directorio, proyectos vendidos y marcas aliadas.</p>

      <Tabs defaultValue="hero">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="hero"><ImageIcon className="h-4 w-4 mr-2" />Carrusel principal</TabsTrigger>
          <TabsTrigger value="sold"><Briefcase className="h-4 w-4 mr-2" />Proyectos vendidos</TabsTrigger>
          <TabsTrigger value="brands"><Sparkles className="h-4 w-4 mr-2" />Marcas (carrusel)</TabsTrigger>
          <TabsTrigger value="products"><Package className="h-4 w-4 mr-2" />Productos</TabsTrigger>
          <TabsTrigger value="directory"><Building2 className="h-4 w-4 mr-2" />Directorio</TabsTrigger>
        </TabsList>
        <TabsContent value="hero" className="mt-6"><HeroSlidesAdmin /></TabsContent>
        <TabsContent value="sold" className="mt-6"><SoldProjectsAdmin /></TabsContent>
        <TabsContent value="brands" className="mt-6"><BrandsAdmin /></TabsContent>
        <TabsContent value="products" className="mt-6"><ProductsAdmin /></TabsContent>
        <TabsContent value="directory" className="mt-6"><DirectoryAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ======================= PROYECTOS VENDIDOS ======================= */
function SoldProjectsAdmin() {
  const [items, setItems] = useState<SoldProject[]>([]);
  const [editing, setEditing] = useState<SoldProject | null>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data } = await supabase.from("sold_projects").select("*").order("sold_at", { ascending: false });
    setItems((data ?? []) as SoldProject[]);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      project_name: String(fd.get("project_name")),
      category: String(fd.get("category")),
      client_name: String(fd.get("client_name")),
      client_contact: String(fd.get("client_contact") ?? "") || null,
      domain: String(fd.get("domain") ?? "") || null,
      price_cop: Number(fd.get("price_cop") ?? 0),
      sold_at: String(fd.get("sold_at")),
      notes: String(fd.get("notes") ?? "") || null,
      status: String(fd.get("status") ?? "activo"),
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

  const categories = Array.from(new Set(items.map((i) => i.category))).filter(Boolean);
  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);
  const total = filtered.reduce((sum, i) => sum + Number(i.price_cop || 0), 0);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>Todas ({items.length})</Button>
          {categories.map((c) => (
            <Button key={c} size="sm" variant={filter === c ? "default" : "outline"} onClick={() => setFilter(c)}>{c}</Button>
          ))}
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Nuevo proyecto vendido</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} proyecto vendido</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nombre del proyecto</Label><Input name="project_name" defaultValue={editing?.project_name} required /></div>
                <div>
                  <Label>Categoría</Label>
                  <Input name="category" defaultValue={editing?.category} placeholder="Páginas Web, Impresiones, Tienda, Eventos..." required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cliente</Label><Input name="client_name" defaultValue={editing?.client_name} required /></div>
                <div><Label>Contacto (tel/email)</Label><Input name="client_contact" defaultValue={editing?.client_contact ?? ""} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Dominio (opcional)</Label><Input name="domain" defaultValue={editing?.domain ?? ""} placeholder="micliente.com" /></div>
                <div><Label>Precio COP</Label><Input type="number" name="price_cop" defaultValue={editing?.price_cop ?? 0} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Fecha de venta</Label><Input type="date" name="sold_at" defaultValue={editing?.sold_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)} required /></div>
                <div>
                  <Label>Estado</Label>
                  <select name="status" defaultValue={editing?.status ?? "activo"} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="activo">Activo</option>
                    <option value="entregado">Entregado</option>
                    <option value="renovacion_pendiente">Renovación pendiente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
              <div><Label>Notas / detalles</Label><Textarea name="notes" defaultValue={editing?.notes ?? ""} placeholder="Detalles del proyecto, requerimientos especiales..." /></div>
              <DialogFooter><Button type="submit" className="bg-gradient-primary text-primary-foreground">Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Total proyectos</div>
          <div className="font-display text-2xl font-bold">{filtered.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Ingresos {filter !== "all" && `(${filter})`}</div>
          <div className="font-display text-2xl font-bold text-gradient">{formatCOP(total)}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Categorías</div>
          <div className="font-display text-2xl font-bold">{categories.length}</div>
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold truncate">{p.project_name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{p.category}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{p.status}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Cliente: <strong>{p.client_name}</strong>
                {p.client_contact && ` · ${p.client_contact}`}
                {p.domain && <> · <a href={`https://${p.domain}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">{p.domain}</a></>}
                {" · "}{formatCOP(p.price_cop)} · {new Date(p.sold_at).toLocaleDateString()}
              </div>
              {p.notes && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{p.notes}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => { setEditing(p); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="outline" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">Sin proyectos en esta categoría.</p>}
      </div>
    </>
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
