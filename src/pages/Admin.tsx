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
import { Trash2, Edit, Plus, Package, Building2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface Product { id: string; name: string; description: string; price_cop: number; stock: number; images: string[]; is_active: boolean; is_coming_soon: boolean; }
interface Rec { id: string; business_name: string; category: string; description: string; website_url: string | null; logo_url: string | null; is_coming_soon: boolean; }

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
      <p className="text-muted-foreground mb-8">Gestiona productos y directorio de TuuWeb.</p>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products"><Package className="h-4 w-4 mr-2" />Productos</TabsTrigger>
          <TabsTrigger value="directory"><Building2 className="h-4 w-4 mr-2" />Directorio</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-6"><ProductsAdmin /></TabsContent>
        <TabsContent value="directory" className="mt-6"><DirectoryAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}

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
              <div className="font-semibold truncate">{r.business_name}</div>
              <div className="text-xs text-muted-foreground">{r.category} {r.is_coming_soon && "· próximamente"}</div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => { setEditing(r); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="outline" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">Sin empresas aún.</p>}
      </div>
    </>
  );
}
