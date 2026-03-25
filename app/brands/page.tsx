"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { Plus, Pencil, Trash2, X, Check, ExternalLink, RefreshCw } from "lucide-react";

interface Brand {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  stage: string | null;
  notes: string | null;
  website: string | null;
  instagram: string | null;
  last_activity_date: string | null;
  revenue_generated: number | null;
  created_at: string;
}

type StageKey = "prospect" | "contacted" | "replied" | "demo" | "converted" | "churned";

const STAGES: { value: StageKey; label: string; color: string; bg: string }[] = [
  { value: "prospect",  label: "Prospect",  color: "#6b7280", bg: "#f3f4f6" },
  { value: "contacted", label: "Contacted", color: "#1d4ed8", bg: "#dbeafe" },
  { value: "replied",   label: "Replied",   color: "#92400e", bg: "#fef3c7" },
  { value: "demo",      label: "Demo",      color: "#6d28d9", bg: "#ede9fe" },
  { value: "converted", label: "Converted", color: "#166534", bg: "#dcfce7" },
  { value: "churned",   label: "Churned",   color: "#991b1b", bg: "#fee2e2" },
];

const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.value, s]));

const SETUP_SQL = `-- Run this SQL in your Supabase SQL Editor:
create table if not exists brand_crm (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  contact_email text,
  stage text default 'prospect',
  notes text,
  website text,
  instagram text,
  last_activity_date date,
  revenue_generated numeric default 0,
  created_at timestamptz default now()
);`;

const emptyForm = {
  company_name: "",
  contact_name: "",
  contact_email: "",
  website: "",
  instagram: "",
  stage: "prospect" as StageKey,
  last_activity_date: "",
  revenue_generated: "",
  notes: "",
};

function StageBadge({ stage }: { stage: string | null }) {
  const s = stage ? STAGE_MAP[stage as StageKey] : null;
  if (!s) return <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>{s.label}</span>
  );
}

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: typeof emptyForm) => Promise<void>;
  initial?: typeof emptyForm | null;
  title: string;
  saving: boolean;
}

function SlideOver({ open, onClose, onSave, initial, title, saving }: SlideOverProps) {
  const [form, setForm] = useState(emptyForm);
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(initial ?? emptyForm);
      setTimeout(() => firstInput.current?.focus(), 50);
    }
  }, [open, initial]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const labelStyle = "block text-xs font-medium mb-1";
  const inputStyle = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2";
  const inputVars = {
    borderColor: "var(--border)",
    background: "var(--card-bg)",
    color: "var(--foreground)",
  } as React.CSSProperties;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl transition-transform duration-300"
        style={{
          width: "clamp(320px, 440px, 95vw)",
          background: "white",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#e5e7eb" }}>
          <h2 className="font-semibold text-base" style={{ color: "#111827" }}>{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} style={{ color: "#6b7280" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Company Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input ref={firstInput} value={form.company_name} onChange={(e) => set("company_name", e.target.value)}
              placeholder="e.g. Nike Denmark" className={inputStyle} style={inputVars} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Contact Name</label>
              <input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)}
                placeholder="Jane Doe" className={inputStyle} style={inputVars} />
            </div>
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Contact Email</label>
              <input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)}
                placeholder="jane@brand.com" className={inputStyle} style={inputVars} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Website</label>
              <input value={form.website} onChange={(e) => set("website", e.target.value)}
                placeholder="https://…" className={inputStyle} style={inputVars} />
            </div>
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Instagram</label>
              <input value={form.instagram} onChange={(e) => set("instagram", e.target.value)}
                placeholder="handle (no @)" className={inputStyle} style={inputVars} />
            </div>
          </div>

          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Stage</label>
            <select value={form.stage} onChange={(e) => set("stage", e.target.value)}
              className={inputStyle} style={inputVars}>
              {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Last Activity</label>
              <input type="date" value={form.last_activity_date} onChange={(e) => set("last_activity_date", e.target.value)}
                className={inputStyle} style={inputVars} />
            </div>
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Revenue Generated (€)</label>
              <input type="number" value={form.revenue_generated} onChange={(e) => set("revenue_generated", e.target.value)}
                placeholder="0" className={inputStyle} style={inputVars} />
            </div>
          </div>

          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              rows={4} placeholder="Internal notes about this brand…"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 resize-none"
              style={inputVars} />
          </div>
        </div>

        <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: "#e5e7eb" }}>
          <button onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: "#d1d5db", color: "#374151" }}>
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.company_name.trim()}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "#4a6fa5" }}>
            {saving ? "Saving…" : <><Check size={14} /> Save</>}
          </button>
        </div>
      </div>
    </>
  );
}

interface DeleteDialogProps {
  brand: Brand | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  deleting: boolean;
}

function DeleteDialog({ brand, onConfirm, onCancel, deleting }: DeleteDialogProps) {
  if (!brand) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4" style={{ background: "white" }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: "#111827" }}>Delete Brand</h3>
        <p className="text-sm mb-5" style={{ color: "#6b7280" }}>
          Are you sure you want to delete <strong>{brand.company_name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: "#d1d5db", color: "#374151" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "#ef4444" }}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function toFormValues(brand: Brand): typeof emptyForm {
  return {
    company_name: brand.company_name ?? "",
    contact_name: brand.contact_name ?? "",
    contact_email: brand.contact_email ?? "",
    website: brand.website ?? "",
    instagram: brand.instagram ?? "",
    stage: (brand.stage as StageKey) ?? "prospect",
    last_activity_date: brand.last_activity_date ? brand.last_activity_date.slice(0, 10) : "",
    revenue_generated: brand.revenue_generated != null ? String(brand.revenue_generated) : "",
    notes: brand.notes ?? "",
  };
}

function BrandsContent() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>("all");

  const [slideOpen, setSlideOpen] = useState(false);
  const [slideTitle, setSlideTitle] = useState("Add Brand");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slideInitial, setSlideInitial] = useState<typeof emptyForm | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brands");
      const data = await res.json();
      if (data?.needsSetup) {
        setNeedsSetup(true);
        setBrands([]);
      } else if (Array.isArray(data)) {
        setNeedsSetup(false);
        setBrands(data);
      } else {
        setBrands([]);
      }
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const openAdd = () => {
    setEditingId(null);
    setSlideInitial(null);
    setSlideTitle("Add Brand");
    setSlideOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setSlideInitial(toFormValues(brand));
    setSlideTitle("Edit Brand");
    setSlideOpen(true);
  };

  const handleSave = async (form: typeof emptyForm) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        company_name: form.company_name.trim(),
        contact_name: form.contact_name || null,
        contact_email: form.contact_email || null,
        website: form.website || null,
        instagram: form.instagram || null,
        stage: form.stage || "prospect",
        last_activity_date: form.last_activity_date || null,
        revenue_generated: form.revenue_generated ? Number(form.revenue_generated) : 0,
        notes: form.notes || null,
      };

      if (editingId) {
        await fetch(`/api/brands?id=${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setSlideOpen(false);
      await fetchBrands();
    } catch {
      alert("Failed to save brand");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/brands?id=${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      await fetchBrands();
    } catch {
      alert("Failed to delete brand");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = stageFilter === "all"
    ? brands
    : brands.filter((b) => b.stage === stageFilter);

  const stageCounts = STAGES.map((s) => ({
    ...s,
    count: brands.filter((b) => b.stage === s.value).length,
  }));

  if (loading) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Loading brands…</div>
    );
  }

  if (needsSetup) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>Brand CRM</h1>
        </div>
        <div className="rounded-xl border p-6 space-y-4" style={{ background: "var(--card-bg)", borderColor: "#fbbf24" }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="font-semibold text-base mb-1" style={{ color: "var(--foreground)" }}>Database Setup Required</h2>
              <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
                The <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--muted)" }}>brand_crm</code> table doesn&apos;t exist yet.
                Run the following SQL in your Supabase SQL Editor to create it:
              </p>
              <pre className="rounded-lg p-4 text-xs overflow-x-auto" style={{ background: "#1e293b", color: "#e2e8f0" }}>
                {SETUP_SQL}
              </pre>
              <div className="mt-4">
                <a href="https://supabase.com/dashboard/project/xbgdynlutmosupfqafap/sql/new"
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white mr-3"
                  style={{ background: "#4a6fa5" }}>
                  <ExternalLink size={14} /> Open Supabase SQL Editor
                </a>
                <button onClick={fetchBrands}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>Brand CRM</h1>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
          style={{ background: "#4a6fa5" }}>
          <Plus size={15} /> Add Brand
        </button>
      </div>

      {/* Pipeline summary */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStageFilter("all")}
          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
          style={{
            background: stageFilter === "all" ? "#4a6fa5" : "var(--card-bg)",
            color: stageFilter === "all" ? "white" : "var(--foreground)",
            borderColor: stageFilter === "all" ? "#4a6fa5" : "var(--border)",
          }}>
          All ({brands.length})
        </button>
        {stageCounts.map((s) => (
          <button
            key={s.value}
            onClick={() => setStageFilter(s.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
            style={{
              background: stageFilter === s.value ? s.bg : "var(--card-bg)",
              color: stageFilter === s.value ? s.color : "var(--muted-foreground)",
              borderColor: stageFilter === s.value ? "transparent" : "var(--border)",
              fontWeight: stageFilter === s.value ? 600 : 400,
            }}>
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            {stageFilter !== "all" ? "No brands in this stage." : "No brands yet. Add your first one!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Company", "Contact", "Email", "Stage", "Last Activity", "Revenue (€)", "Website", "Notes", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((brand, i) => (
                  <tr key={brand.id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: "var(--foreground)" }}>
                      {brand.company_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                      {brand.contact_name || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {brand.contact_email ? (
                        <a href={`mailto:${brand.contact_email}`} className="underline" style={{ color: "var(--primary)" }}>
                          {brand.contact_email}
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3"><StageBadge stage={brand.stage} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {brand.last_activity_date
                        ? new Date(brand.last_activity_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--foreground)" }}>
                      {brand.revenue_generated != null && brand.revenue_generated > 0
                        ? `€${Number(brand.revenue_generated).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {brand.website ? (
                        <a href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs underline"
                          style={{ color: "var(--primary)" }}>
                          <ExternalLink size={11} /> Visit
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      {brand.notes ? (
                        <span className="text-xs line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
                          {brand.notes}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <button onClick={() => openEdit(brand)}
                          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Edit">
                          <Pencil size={13} style={{ color: "#4a6fa5" }} />
                        </button>
                        <button onClick={() => setDeleteTarget(brand)}
                          className="p-1.5 rounded-md hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={13} style={{ color: "#ef4444" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        onSave={handleSave}
        initial={slideInitial}
        title={slideTitle}
        saving={saving}
      />

      <DeleteDialog
        brand={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}

export default function BrandsPage() {
  return (
    <AuthGate>
      <AppShell title="Brand CRM">
        <BrandsContent />
      </AppShell>
    </AuthGate>
  );
}
