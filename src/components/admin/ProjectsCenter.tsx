import { useEffect, useMemo, useState } from "react";
import { adminSupabase as supabase } from "@/lib/adminSupabase";
import { formatCOP } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus, Trash2, Edit, Copy, Eye, EyeOff, ExternalLink, CheckCircle2, Download,
  Github, Server, Globe, Sparkles, KeyRound, CalendarClock, ArrowLeft, Search,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

/* ============================ tipos ============================ */
export type Project = {
  id: string;
  numero: number | null;
  nombre_proyecto: string | null;
  cliente: string;
  dominio: string | null;
  tipo_pagina: string | null;
  estado_proyecto: string | null;
  estado_pagina: string | null;
  cotizacion_cop: number | null;
  servicios: string[] | null;
  proveedor_dominio: string | null;
  correo_dominio: string | null;
  fecha_renovacion_dominio: string | null;
  proveedor_hosting: string | null;
  correo_hosting: string | null;
  telefono_hosting: string | null;
  fecha_renovacion_hosting: string | null;
  base_datos: string | null;
  correo_bd: string | null;
  ia_usada: string | null;
  correo_ia: string | null;
  notas: string | null;
  created_at: string;
};

type Credential = {
  id: string;
  project_id: string;
  kind: string;
  provider: string;
  username: string | null;
  url: string | null;
  notes: string | null;
  has_secret: boolean;
};

type Repo = {
  id: string; project_id: string; provider: string; username: string | null;
  repo: string | null; url: string | null; branch: string | null; notes: string | null;
};

type Renewal = {
  id: string; project_id: string; kind: string; provider: string | null;
  renewal_date: string | null; price_cop: number; periodicity: string; status: string; notes: string | null;
};

type Option = { id: string; kind: string; name: string; is_active: boolean; sort_order: number };

const KINDS = [
  { value: "ia", label: "IA utilizada" },
  { value: "hosting", label: "Hosting" },
  { value: "dominio", label: "Dominio" },
  { value: "empresa", label: "Empresa / proveedor" },
  { value: "email", label: "Email" },
  { value: "github", label: "GitHub" },
  { value: "otros", label: "Otros" },
];

const PERIODS = ["anual", "semestral", "trimestral", "mensual", "bianual"];
const db = supabase as any;

export function daysUntil(d?: string | null): number | null {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

function renewalTone(days: number | null) {
  if (days === null) return "bg-muted text-muted-foreground";
  if (days < 0) return "bg-destructive/15 text-destructive";
  if (days <= 15) return "bg-destructive/15 text-destructive";
  if (days <= 45) return "bg-brand-orange/20 text-foreground";
  if (days <= 90) return "bg-warning/25 text-foreground";
  return "bg-success/15 text-foreground";
}

const copy = async (text: string, label = "Copiado") => {
  try { await navigator.clipboard.writeText(text); toast.success(label); }
  catch { toast.error("No se pudo copiar"); }
};

const openUrl = (url?: string | null) => {
  if (!url) return toast.error("Sin URL");
  const full = /^https?:\/\//.test(url) ? url : `https://${url}`;
  window.open(full, "_blank", "noopener");
};

/* ============================ principal ============================ */
export default function ProjectsCenter() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);

  const load = async () => {
    const [p, r, o] = await Promise.all([
      db.from("sold_projects").select("*").order("created_at", { ascending: false }),
      db.from("project_renewals").select("*"),
      db.from("provider_options").select("*").order("sort_order"),
    ]);
    setProjects((p.data ?? []) as Project[]);
    setRenewals((r.data ?? []) as Renewal[]);
    setOptions((o.data ?? []) as Option[]);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return projects;
    return projects.filter((p) =>
      [p.nombre_proyecto, p.cliente, p.dominio, p.tipo_pagina, p.estado_proyecto].join(" ").toLowerCase().includes(s));
  }, [projects, q]);

  const current = projects.find((p) => p.id === openId) ?? null;

  const save = async () => {
    if (!editing?.cliente) return toast.error("El cliente es obligatorio");
    const payload = {
      nombre_proyecto: editing.nombre_proyecto ?? null,
      cliente: editing.cliente,
      dominio: editing.dominio ?? null,
      tipo_pagina: editing.tipo_pagina ?? null,
      estado_proyecto: editing.estado_proyecto ?? "En proceso",
      estado_pagina: editing.estado_pagina ?? "Inactiva",
      cotizacion_cop: Number(editing.cotizacion_cop ?? 0),
      servicios: editing.servicios ?? [],
      notas: editing.notas ?? null,
    };
    const res = editing.id
      ? await db.from("sold_projects").update(payload).eq("id", editing.id)
      : await db.from("sold_projects").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Proyecto guardado");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este proyecto y toda su información?")) return;
    const { error } = await db.from("sold_projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Eliminado");
    setOpenId(null);
    load();
  };

  const exportExcel = () => {
    const rows = projects.map((p) => ({
      Proyecto: p.nombre_proyecto ?? "", Cliente: p.cliente, Dominio: p.dominio ?? "",
      Tipo: p.tipo_pagina ?? "", Estado: p.estado_proyecto ?? "", "Estado página": p.estado_pagina ?? "",
      Valor: p.cotizacion_cop ?? 0, Servicios: (p.servicios ?? []).join(", "),
      "Renov. dominio": p.fecha_renovacion_dominio ?? "", "Renov. hosting": p.fecha_renovacion_hosting ?? "",
      Notas: p.notas ?? "",
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Proyectos");
    XLSX.writeFile(wb, `proyectos_tuuweb_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (current) {
    return (
      <ProjectDetail
        project={current}
        options={options}
        onBack={() => { setOpenId(null); load(); }}
        onEdit={() => setEditing(current)}
        onDelete={() => remove(current.id)}
      />
    );
  }

  const total = projects.reduce((s, p) => s + Number(p.cotizacion_cop ?? 0), 0);

  return (
    <div className="space-y-6">
      <RenewalsDashboard renewals={renewals} projects={projects} onChanged={load} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar proyecto, cliente o dominio…" className="pl-9" />
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-2 text-sm">
          <span className="text-muted-foreground">Ingresos: </span>
          <span className="font-semibold">{formatCOP(total)}</span>
        </div>
        <Button variant="outline" onClick={exportExcel}><Download className="h-4 w-4 mr-2" />Excel</Button>
        <Button onClick={() => setEditing({ estado_proyecto: "Activo", servicios: [] })}>
          <Plus className="h-4 w-4 mr-2" />Nuevo proyecto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => {
          const rs = renewals.filter((r) => r.project_id === p.id);
          const soon = rs
            .map((r) => daysUntil(r.renewal_date))
            .filter((d): d is number => d !== null)
            .sort((a, b) => a - b)[0] ?? daysUntil(p.fecha_renovacion_dominio);
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display font-bold truncate">{p.nombre_proyecto || p.dominio || p.cliente}</h3>
                  <p className="text-xs text-muted-foreground truncate">{p.cliente}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${p.estado_proyecto === "Activo" ? "bg-success/15 text-foreground" : "bg-muted text-muted-foreground"}`}>
                  {p.estado_proyecto ?? "—"}
                </span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {p.ia_usada && <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" />IA: {p.ia_usada}</div>}
                {p.proveedor_hosting && <div className="flex items-center gap-2"><Server className="h-3.5 w-3.5" />Hosting: {p.proveedor_hosting}</div>}
                {p.dominio && <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" />{p.dominio}</div>}
                {(p.servicios ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(p.servicios ?? []).map((s) => (
                      <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${renewalTone(soon ?? null)}`}>
                  {soon === null || soon === undefined ? "Sin renovación" : soon < 0 ? `Vencida hace ${Math.abs(soon)}d` : `Renueva en ${soon}d`}
                </span>
                <Button size="sm" onClick={() => setOpenId(p.id)}>Abrir proyecto</Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center md:col-span-2 xl:col-span-3">Sin proyectos.</p>}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar proyecto" : "Nuevo proyecto"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nombre del proyecto</Label><Input value={editing?.nombre_proyecto ?? ""} onChange={(e) => setEditing({ ...editing, nombre_proyecto: e.target.value })} placeholder="ZonaiPhone.com" /></div>
            <div><Label>Cliente *</Label><Input value={editing?.cliente ?? ""} onChange={(e) => setEditing({ ...editing, cliente: e.target.value })} /></div>
            <div><Label>Dominio</Label><Input value={editing?.dominio ?? ""} onChange={(e) => setEditing({ ...editing, dominio: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tipo de página</Label><Input value={editing?.tipo_pagina ?? ""} onChange={(e) => setEditing({ ...editing, tipo_pagina: e.target.value })} /></div>
              <div><Label>Valor (COP)</Label><Input type="number" value={editing?.cotizacion_cop ?? 0} onChange={(e) => setEditing({ ...editing, cotizacion_cop: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Estado</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={editing?.estado_proyecto ?? "En proceso"} onChange={(e) => setEditing({ ...editing, estado_proyecto: e.target.value })}>
                  {["Activo", "En proceso", "Pausado", "Finalizado", "Cancelado"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label>Estado de la página</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={editing?.estado_pagina ?? "Inactiva"} onChange={(e) => setEditing({ ...editing, estado_pagina: e.target.value })}>
                  {["Activa", "Inactiva", "En construcción"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Servicios contratados</Label>
              <div className="flex flex-wrap gap-2 pt-2">
                {options.filter((o) => o.kind === "servicio" && o.is_active).map((o) => {
                  const on = (editing?.servicios ?? []).includes(o.name);
                  return (
                    <button key={o.id} type="button"
                      onClick={() => {
                        const cur = editing?.servicios ?? [];
                        setEditing({ ...editing, servicios: on ? cur.filter((s) => s !== o.name) : [...cur, o.name] });
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-medium border ${on ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                      {o.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div><Label>Notas</Label><Textarea value={editing?.notas ?? ""} onChange={(e) => setEditing({ ...editing, notas: e.target.value })} /></div>
            <Button className="w-full" onClick={save}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================ dashboard renovaciones ============================ */
function RenewalsDashboard({ renewals, projects, onChanged }: { renewals: Renewal[]; projects: Project[]; onChanged: () => void }) {
  const [filter, setFilter] = useState("all");
  const rows = renewals
    .filter((r) => filter === "all" || r.kind === filter)
    .sort((a, b) => (a.renewal_date ?? "9999").localeCompare(b.renewal_date ?? "9999"))
    .slice(0, 12);

  const markRenewed = async (id: string) => {
    const { error } = await db.rpc("admin_mark_renewed", { _id: id, _notes: null });
    if (error) return toast.error(error.message);
    toast.success("Renovación registrada");
    onChanged();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-display font-bold flex items-center gap-2"><CalendarClock className="h-4 w-4" />Próximas renovaciones</h3>
        <div className="flex flex-wrap gap-2">
          {[["all", "Todas"], ["dominio", "Dominio"], ["hosting", "Hosting"], ["ia", "IA"], ["otros", "Otros"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`rounded-full px-3 py-1 text-xs font-medium border ${filter === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {rows.map((r) => {
          const p = projects.find((x) => x.id === r.project_id);
          const d = daysUntil(r.renewal_date);
          return (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm">
              <span className="font-medium min-w-[140px] truncate">{p?.nombre_proyecto || p?.cliente || "—"}</span>
              <span className="text-muted-foreground capitalize">{r.kind}</span>
              <span className="text-muted-foreground">{r.provider ?? "—"}</span>
              <span className="text-muted-foreground">{r.renewal_date ?? "sin fecha"}</span>
              <span className="text-muted-foreground">{formatCOP(Number(r.price_cop ?? 0))}</span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${renewalTone(d)}`}>
                {d === null ? "—" : d < 0 ? `vencida ${Math.abs(d)}d` : `${d} días`}
              </span>
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => markRenewed(r.id)}>
                <CheckCircle2 className="h-4 w-4 mr-1" />Renovado
              </Button>
            </div>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Sin renovaciones registradas.</p>}
      </div>
    </div>
  );
}

/* ============================ detalle de proyecto ============================ */
function ProjectDetail({ project, options, onBack, onEdit, onDelete }: {
  project: Project; options: Option[]; onBack: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const [creds, setCreds] = useState<Credential[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  const [credForm, setCredForm] = useState<any | null>(null);
  const [repoForm, setRepoForm] = useState<any | null>(null);
  const [renForm, setRenForm] = useState<any | null>(null);

  const load = async () => {
    const [c, g, r, h] = await Promise.all([
      db.from("project_credentials").select("id,project_id,kind,provider,username,url,notes,has_secret").eq("project_id", project.id),
      db.from("project_repos").select("*").eq("project_id", project.id),
      db.from("project_renewals").select("*").eq("project_id", project.id).order("renewal_date"),
      db.from("renewal_history").select("*").eq("project_id", project.id).order("renewed_on", { ascending: false }),
    ]);
    setCreds((c.data ?? []) as Credential[]);
    setRepos((g.data ?? []) as Repo[]);
    setRenewals((r.data ?? []) as Renewal[]);
    setHistory(h.data ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [project.id]);

  const namesOf = (kind: string) => options.filter((o) => o.kind === kind && o.is_active).map((o) => o.name);

  const reveal = async (id: string) => {
    if (revealed[id]) { setRevealed((p) => { const n = { ...p }; delete n[id]; return n; }); return; }
    const { data, error } = await db.rpc("admin_reveal_credential", { _id: id });
    if (error) return toast.error(error.message);
    setRevealed((p) => ({ ...p, [id]: (data as string) ?? "" }));
  };

  const copySecret = async (id: string) => {
    const { data, error } = await db.rpc("admin_reveal_credential", { _id: id });
    if (error) return toast.error(error.message);
    copy((data as string) ?? "", "Contraseña copiada");
  };

  const saveCred = async () => {
    const f = credForm;
    const { error } = await db.rpc("admin_save_credential", {
      _id: f.id ?? null, _project_id: project.id, _kind: f.kind ?? "otros",
      _provider: f.provider ?? "", _username: f.username ?? null,
      _password: f.password ?? null, _url: f.url ?? null, _notes: f.notes ?? null,
    });
    if (error) return toast.error(error.message);
    toast.success("Credencial guardada");
    setCredForm(null); load();
  };

  const delRow = async (table: string, id: string) => {
    if (!confirm("¿Eliminar?")) return;
    const { error } = await db.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const saveRepo = async () => {
    const f = { ...repoForm, project_id: project.id };
    const id = f.id; delete f.id;
    const res = id ? await db.from("project_repos").update(f).eq("id", id) : await db.from("project_repos").insert(f);
    if (res.error) return toast.error(res.error.message);
    toast.success("Repositorio guardado"); setRepoForm(null); load();
  };

  const saveRenewal = async () => {
    const f = { ...renForm, project_id: project.id, price_cop: Number(renForm.price_cop ?? 0) };
    const id = f.id; delete f.id;
    const res = id ? await db.from("project_renewals").update(f).eq("id", id) : await db.from("project_renewals").insert(f);
    if (res.error) return toast.error(res.error.message);
    toast.success("Renovación guardada"); setRenForm(null); load();
  };

  const markRenewed = async (id: string) => {
    const { error } = await db.rpc("admin_mark_renewed", { _id: id, _notes: null });
    if (error) return toast.error(error.message);
    toast.success("Renovación registrada"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" />Volver</Button>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold truncate">{project.nombre_proyecto || project.dominio || project.cliente}</h2>
          <p className="text-xs text-muted-foreground">{project.cliente} · {project.estado_proyecto}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {project.dominio && <Button size="sm" variant="outline" onClick={() => openUrl(project.dominio)}><ExternalLink className="h-4 w-4 mr-1" />Abrir web</Button>}
          <Button size="sm" variant="outline" onClick={onEdit}><Edit className="h-4 w-4 mr-1" />Editar</Button>
          <Button size="sm" variant="outline" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="creds"><KeyRound className="h-4 w-4 mr-1" />Credenciales</TabsTrigger>
          <TabsTrigger value="github"><Github className="h-4 w-4 mr-1" />GitHub</TabsTrigger>
          <TabsTrigger value="renov"><CalendarClock className="h-4 w-4 mr-1" />Renovaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-2 text-sm">
              <h3 className="font-display font-bold mb-2">Resumen</h3>
              <Row label="Cliente" value={project.cliente} />
              <Row label="Dominio" value={project.dominio} />
              <Row label="Tipo" value={project.tipo_pagina} />
              <Row label="Valor" value={formatCOP(Number(project.cotizacion_cop ?? 0))} />
              <Row label="Estado página" value={project.estado_pagina} />
              <Row label="Creado" value={new Date(project.created_at).toLocaleDateString("es-CO")} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 space-y-2 text-sm">
              <h3 className="font-display font-bold mb-2">Servicios y notas</h3>
              <div className="flex flex-wrap gap-1">
                {(project.servicios ?? []).map((s) => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">{s}</span>)}
                {(project.servicios ?? []).length === 0 && <span className="text-muted-foreground text-xs">Sin servicios registrados.</span>}
              </div>
              <p className="text-muted-foreground whitespace-pre-line pt-2">{project.notas || "Sin notas."}</p>
            </div>
          </div>
        </TabsContent>

        {/* CREDENCIALES */}
        <TabsContent value="creds" className="mt-4 space-y-3">
          <Button size="sm" onClick={() => setCredForm({ kind: "ia" })}><Plus className="h-4 w-4 mr-1" />Nueva credencial</Button>
          {creds.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold capitalize">{KINDS.find((k) => k.value === c.kind)?.label ?? c.kind}</span>
                <span className="font-semibold">{c.provider}</span>
                {c.url && <Button size="icon" variant="ghost" onClick={() => openUrl(c.url)}><ExternalLink className="h-4 w-4" /></Button>}
                <div className="ml-auto flex gap-1">
                  <Button size="icon" variant="outline" onClick={() => setCredForm({ ...c })}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="outline" onClick={() => delRow("project_credentials", c.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">{c.username ?? "—"}</span>
                {c.username && <Button size="icon" variant="ghost" onClick={() => copy(c.username!, "Usuario copiado")}><Copy className="h-4 w-4" /></Button>}
                <span className="font-mono text-muted-foreground">{revealed[c.id] ?? (c.has_secret ? "••••••••" : "sin contraseña")}</span>
                {c.has_secret && (
                  <>
                    <Button size="icon" variant="ghost" onClick={() => reveal(c.id)}>{revealed[c.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                    <Button size="icon" variant="ghost" onClick={() => copySecret(c.id)}><Copy className="h-4 w-4" /></Button>
                  </>
                )}
              </div>
              {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
            </div>
          ))}
          {creds.length === 0 && <p className="text-sm text-muted-foreground">Sin credenciales.</p>}

          <Dialog open={!!credForm} onOpenChange={(o) => !o && setCredForm(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{credForm?.id ? "Editar credencial" : "Nueva credencial"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Tipo</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={credForm?.kind ?? "otros"} onChange={(e) => setCredForm({ ...credForm, kind: e.target.value, provider: "" })}>
                    {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Proveedor / servicio</Label>
                  <Input list="prov-list" value={credForm?.provider ?? ""} onChange={(e) => setCredForm({ ...credForm, provider: e.target.value })} />
                  <datalist id="prov-list">{namesOf(credForm?.kind ?? "otros").map((n) => <option key={n} value={n} />)}</datalist>
                </div>
                <div><Label>Usuario o correo</Label><Input value={credForm?.username ?? ""} onChange={(e) => setCredForm({ ...credForm, username: e.target.value })} /></div>
                <div>
                  <Label>Contraseña {credForm?.id && <span className="text-xs text-muted-foreground">(vacío = no cambiar)</span>}</Label>
                  <Input type="password" value={credForm?.password ?? ""} onChange={(e) => setCredForm({ ...credForm, password: e.target.value })} />
                </div>
                <div><Label>URL de acceso</Label><Input value={credForm?.url ?? ""} onChange={(e) => setCredForm({ ...credForm, url: e.target.value })} /></div>
                <div><Label>Notas</Label><Textarea value={credForm?.notes ?? ""} onChange={(e) => setCredForm({ ...credForm, notes: e.target.value })} /></div>
                <Button className="w-full" onClick={saveCred}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* GITHUB */}
        <TabsContent value="github" className="mt-4 space-y-3">
          <Button size="sm" onClick={() => setRepoForm({ provider: "GitHub", branch: "main" })}><Plus className="h-4 w-4 mr-1" />Nuevo repositorio</Button>
          {repos.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm">
              <Github className="h-4 w-4" />
              <span className="font-semibold">{r.repo ?? "—"}</span>
              <span className="text-muted-foreground">{r.username} · {r.branch}</span>
              <div className="ml-auto flex gap-1">
                <Button size="sm" variant="outline" onClick={() => openUrl(r.url)}><ExternalLink className="h-4 w-4 mr-1" />Abrir GitHub</Button>
                <Button size="icon" variant="outline" onClick={() => setRepoForm({ ...r })}><Edit className="h-4 w-4" /></Button>
                <Button size="icon" variant="outline" onClick={() => delRow("project_repos", r.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {repos.length === 0 && <p className="text-sm text-muted-foreground">Sin repositorios.</p>}

          <Dialog open={!!repoForm} onOpenChange={(o) => !o && setRepoForm(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Repositorio</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Proveedor</Label><Input list="git-list" value={repoForm?.provider ?? ""} onChange={(e) => setRepoForm({ ...repoForm, provider: e.target.value })} />
                  <datalist id="git-list">{namesOf("github").map((n) => <option key={n} value={n} />)}</datalist></div>
                <div><Label>Usuario</Label><Input value={repoForm?.username ?? ""} onChange={(e) => setRepoForm({ ...repoForm, username: e.target.value })} /></div>
                <div><Label>Repositorio</Label><Input value={repoForm?.repo ?? ""} onChange={(e) => setRepoForm({ ...repoForm, repo: e.target.value })} /></div>
                <div><Label>URL</Label><Input value={repoForm?.url ?? ""} onChange={(e) => setRepoForm({ ...repoForm, url: e.target.value })} /></div>
                <div><Label>Rama principal</Label><Input value={repoForm?.branch ?? ""} onChange={(e) => setRepoForm({ ...repoForm, branch: e.target.value })} /></div>
                <div><Label>Notas</Label><Textarea value={repoForm?.notes ?? ""} onChange={(e) => setRepoForm({ ...repoForm, notes: e.target.value })} /></div>
                <Button className="w-full" onClick={saveRepo}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* RENOVACIONES */}
        <TabsContent value="renov" className="mt-4 space-y-3">
          <Button size="sm" onClick={() => setRenForm({ kind: "dominio", periodicity: "anual", status: "activa", price_cop: 0 })}>
            <Plus className="h-4 w-4 mr-1" />Nueva renovación
          </Button>
          {renewals.map((r) => {
            const d = daysUntil(r.renewal_date);
            return (
              <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm">
                <span className="font-semibold capitalize">{r.kind}</span>
                <span className="text-muted-foreground">{r.provider ?? "—"}</span>
                <span className="text-muted-foreground">{r.renewal_date ?? "sin fecha"} · {r.periodicity}</span>
                <span className="text-muted-foreground">{formatCOP(Number(r.price_cop ?? 0))}</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${renewalTone(d)}`}>{d === null ? "—" : d < 0 ? `vencida ${Math.abs(d)}d` : `${d} días`}</span>
                <div className="ml-auto flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => markRenewed(r.id)}><CheckCircle2 className="h-4 w-4 mr-1" />Renovado</Button>
                  <Button size="icon" variant="outline" onClick={() => setRenForm({ ...r })}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="outline" onClick={() => delRow("project_renewals", r.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            );
          })}
          {renewals.length === 0 && <p className="text-sm text-muted-foreground">Sin renovaciones.</p>}

          {history.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="font-semibold text-sm mb-2">Historial</h4>
              {history.map((h) => (
                <p key={h.id} className="text-xs text-muted-foreground">
                  {h.renewed_on}: {h.previous_date ?? "—"} → {h.new_date} · {formatCOP(Number(h.price_cop ?? 0))}
                </p>
              ))}
            </div>
          )}

          <Dialog open={!!renForm} onOpenChange={(o) => !o && setRenForm(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Renovación</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Servicio</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={renForm?.kind ?? "dominio"} onChange={(e) => setRenForm({ ...renForm, kind: e.target.value })}>
                    {["dominio", "hosting", "ia", "email", "otros"].map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div><Label>Proveedor</Label><Input list="ren-list" value={renForm?.provider ?? ""} onChange={(e) => setRenForm({ ...renForm, provider: e.target.value })} />
                  <datalist id="ren-list">{namesOf(renForm?.kind ?? "dominio").map((n) => <option key={n} value={n} />)}</datalist></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Fecha de renovación</Label><Input type="date" value={renForm?.renewal_date ?? ""} onChange={(e) => setRenForm({ ...renForm, renewal_date: e.target.value })} /></div>
                  <div><Label>Precio (COP)</Label><Input type="number" value={renForm?.price_cop ?? 0} onChange={(e) => setRenForm({ ...renForm, price_cop: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Periodicidad</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={renForm?.periodicity ?? "anual"} onChange={(e) => setRenForm({ ...renForm, periodicity: e.target.value })}>
                      {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={renForm?.status ?? "activa"} onChange={(e) => setRenForm({ ...renForm, status: e.target.value })}>
                      {["activa", "pausada", "cancelada"].map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div><Label>Notas</Label><Textarea value={renForm?.notes ?? ""} onChange={(e) => setRenForm({ ...renForm, notes: e.target.value })} /></div>
                <Button className="w-full" onClick={saveRenewal}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium truncate">{value || "—"}</span>
    </div>
  );
}

/* ============================ catálogos ============================ */
export function CatalogsAdmin() {
  const [items, setItems] = useState<Option[]>([]);
  const [form, setForm] = useState<any | null>(null);

  const load = async () => {
    const { data } = await db.from("provider_options").select("*").order("kind").order("sort_order");
    setItems((data ?? []) as Option[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form?.name) return toast.error("Escribe un nombre");
    const payload = { kind: form.kind ?? "otros", name: form.name, is_active: form.is_active ?? true, sort_order: Number(form.sort_order ?? 0) };
    const res = form.id ? await db.from("provider_options").update(payload).eq("id", form.id) : await db.from("provider_options").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Guardado"); setForm(null); load();
  };

  const toggle = async (o: Option) => {
    await db.from("provider_options").update({ is_active: !o.is_active }).eq("id", o.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar opción?")) return;
    await db.from("provider_options").delete().eq("id", id);
    load();
  };

  const kinds = [...KINDS.map((k) => k.value), "servicio"];

  return (
    <div className="space-y-4">
      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogTrigger asChild>
          <Button onClick={() => setForm({ kind: "ia", is_active: true, sort_order: 0 })}><Plus className="h-4 w-4 mr-2" />Nueva opción</Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Opción del catálogo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Catálogo</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form?.kind ?? "ia"} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div><Label>Nombre</Label><Input value={form?.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Orden</Label><Input type="number" value={form?.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
            <Button className="w-full" onClick={save}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {kinds.map((k) => {
        const list = items.filter((i) => i.kind === k);
        if (list.length === 0) return null;
        return (
          <div key={k} className="rounded-2xl border border-border bg-card p-4">
            <h4 className="font-display font-bold text-sm mb-2 capitalize">{KINDS.find((x) => x.value === k)?.label ?? k}</h4>
            <div className="flex flex-wrap gap-2">
              {list.map((o) => (
                <div key={o.id} className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${o.is_active ? "border-border" : "border-dashed border-border text-muted-foreground line-through"}`}>
                  <button onClick={() => toggle(o)}>{o.name}</button>
                  <button onClick={() => setForm({ ...o })}><Edit className="h-3 w-3" /></button>
                  <button onClick={() => remove(o.id)}><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
