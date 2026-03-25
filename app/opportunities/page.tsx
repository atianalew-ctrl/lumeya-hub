"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  brand_name: string | null;
  category: string | null;
  description: string | null;
  overview: string | null;
  deliverables: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_display: string | null;
  deadline: string | null;
  location: string | null;
  timeline: string | null;
  tags: string[] | null;
  status: string | null;
  application_count: number | null;
  created_at: string;
}

type FilterTab = "all" | "open" | "closed";

const CATEGORIES = ["Fashion", "Beauty", "Lifestyle", "Travel", "Food", "Tech", "Other"];

const emptyForm = {
  title: "",
  brand_name: "",
  category: "",
  description: "",
  overview: "",
  deliverables: "",
  budget_min: "",
  budget_max: "",
  budget_display: "",
  deadline: "",
  location: "",
  timeline: "",
  status: "open",
};

function formatBudget(opp: Opportunity): string {
  if (opp.budget_display) return opp.budget_display;
  if (opp.budget_min != null && opp.budget_max != null)
    return `€${opp.budget_min.toLocaleString()} – €${opp.budget_max.toLocaleString()}`;
  if (opp.budget_min != null) return `€${opp.budget_min.toLocaleString()}+`;
  if (opp.budget_max != null) return `Up to €${opp.budget_max.toLocaleString()}`;
  return "—";
}

function isExpired(opp: Opportunity): boolean {
  if (!opp.deadline) return false;
  if (opp.status === "closed") return false;
  return new Date(opp.deadline) < new Date();
}

function StatusBadge({ opp }: { opp: Opportunity }) {
  if (isExpired(opp))
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "#fee2e2", color: "#991b1b" }}>Expired</span>;
  if (opp.status === "open")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "#dcfce7", color: "#166534" }}>Open</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    style={{ background: "#f3f4f6", color: "#6b7280" }}>Closed</span>;
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
          width: "clamp(320px, 480px, 95vw)",
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
            <label className={labelStyle} style={{ color: "#374151" }}>Title <span style={{ color: "#ef4444" }}>*</span></label>
            <input ref={firstInput} value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Summer Campaign UGC" className={inputStyle} style={inputVars} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Brand Name</label>
              <input value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)}
                placeholder="e.g. Acme Co." className={inputStyle} style={inputVars} />
            </div>
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className={inputStyle} style={inputVars}>
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Overview</label>
            <textarea value={form.overview} onChange={(e) => set("overview", e.target.value)}
              rows={2} placeholder="Short summary of the opportunity…"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 resize-none"
              style={inputVars} />
          </div>

          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={3} placeholder="Full description…"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 resize-none"
              style={inputVars} />
          </div>

          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Deliverables</label>
            <textarea value={form.deliverables} onChange={(e) => set("deliverables", e.target.value)}
              rows={2} placeholder="What the creator needs to deliver…"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 resize-none"
              style={inputVars} />
          </div>

          {/* Budget */}
          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Budget</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input type="number" value={form.budget_min} onChange={(e) => set("budget_min", e.target.value)}
                  placeholder="Min (€)" className={inputStyle} style={inputVars} />
              </div>
              <div>
                <input type="number" value={form.budget_max} onChange={(e) => set("budget_max", e.target.value)}
                  placeholder="Max (€)" className={inputStyle} style={inputVars} />
              </div>
              <div>
                <input value={form.budget_display} onChange={(e) => set("budget_display", e.target.value)}
                  placeholder='e.g. "€500-1k"' className={inputStyle} style={inputVars} />
              </div>
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Budget Display overrides the min/max if set
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)}
                className={inputStyle} style={inputVars} />
            </div>
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Timeline</label>
              <input value={form.timeline} onChange={(e) => set("timeline", e.target.value)}
                placeholder="e.g. 2 weeks" className={inputStyle} style={inputVars} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Location</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Copenhagen / Remote" className={inputStyle} style={inputVars} />
            </div>
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className={inputStyle} style={inputVars}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
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
            disabled={saving || !form.title.trim()}
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
  opportunity: Opportunity | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  deleting: boolean;
}

function DeleteDialog({ opportunity, onConfirm, onCancel, deleting }: DeleteDialogProps) {
  if (!opportunity) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4" style={{ background: "white" }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: "#111827" }}>Delete Opportunity</h3>
        <p className="text-sm mb-5" style={{ color: "#6b7280" }}>
          Are you sure you want to delete <strong>{opportunity.title}</strong>? This cannot be undone.
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

function toFormValues(opp: Opportunity): typeof emptyForm {
  return {
    title: opp.title ?? "",
    brand_name: opp.brand_name ?? "",
    category: opp.category ?? "",
    description: opp.description ?? "",
    overview: opp.overview ?? "",
    deliverables: opp.deliverables ?? "",
    budget_min: opp.budget_min != null ? String(opp.budget_min) : "",
    budget_max: opp.budget_max != null ? String(opp.budget_max) : "",
    budget_display: opp.budget_display ?? "",
    deadline: opp.deadline ? opp.deadline.slice(0, 10) : "",
    location: opp.location ?? "",
    timeline: opp.timeline ?? "",
    status: opp.status ?? "open",
  };
}

function ApprovalQueue({ onApproved }: { onApproved: () => void }) {
  const [pending, setPending] = useState<Opportunity[]>([]);
  const [acting, setActing] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const res = await fetch("/api/opportunities");
      const data = await res.json();
      if (Array.isArray(data)) setPending(data.filter((o: Opportunity) => o.status === "pending"));
    } catch {}
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (id: string, status: "open" | "closed") => {
    setActing(id);
    try {
      await fetch(`/api/opportunities?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setPending(prev => prev.filter(o => o.id !== id));
      onApproved();
    } catch {
      alert("Failed to update opportunity");
    } finally {
      setActing(null);
    }
  };

  if (pending.length === 0) return (
    <div className="mb-6 rounded-xl border px-5 py-4 text-sm flex items-center gap-2"
      style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }}>
      <Check size={15} /> All caught up ✓ — no pending opportunities
    </div>
  );

  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold mb-3" style={{ color: "var(--foreground)" }}>
        Approval Queue <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: "#fef3c7", color: "#92400e" }}>{pending.length} pending</span>
      </h2>
      <div className="space-y-3">
        {pending.map(opp => (
          <div key={opp.id} className="rounded-xl border p-4 flex items-start gap-4"
            style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm" style={{ color: "#111827" }}>{opp.title}</p>
              {opp.brand_name && <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>by {opp.brand_name}</p>}
              {opp.description && <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "#4b5563" }}>{opp.description}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "#6b7280" }}>
                {opp.budget_display && <span>💰 {opp.budget_display}</span>}
                {opp.deadline && <span>📅 {new Date(opp.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
                {opp.category && <span>🏷 {opp.category}</span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                disabled={acting === opp.id}
                onClick={() => handleAction(opp.id, "open")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: "#16a34a" }}>
                {acting === opp.id ? "…" : "Approve"}
              </button>
              <button
                disabled={acting === opp.id}
                onClick={() => handleAction(opp.id, "closed")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: "#dc2626" }}>
                {acting === opp.id ? "…" : "Reject"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpportunitiesContent() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");

  const [slideOpen, setSlideOpen] = useState(false);
  const [slideTitle, setSlideTitle] = useState("New Opportunity");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slideInitial, setSlideInitial] = useState<typeof emptyForm | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOpps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/opportunities");
      const data = await res.json();
      if (Array.isArray(data)) setOpps(data);
      else setError(data.error || "Failed to load opportunities");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOpps(); }, [fetchOpps]);

  const openAdd = () => {
    setEditingId(null);
    setSlideInitial(null);
    setSlideTitle("New Opportunity");
    setSlideOpen(true);
  };

  const openEdit = (opp: Opportunity) => {
    setEditingId(opp.id);
    setSlideInitial(toFormValues(opp));
    setSlideTitle("Edit Opportunity");
    setSlideOpen(true);
  };

  const handleSave = async (form: typeof emptyForm) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        brand_name: form.brand_name || null,
        category: form.category || null,
        description: form.description || null,
        overview: form.overview || null,
        deliverables: form.deliverables || null,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        budget_display: form.budget_display || null,
        deadline: form.deadline || null,
        location: form.location || null,
        timeline: form.timeline || null,
        status: form.status || "open",
      };

      if (editingId) {
        await fetch(`/api/opportunities?id=${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/opportunities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setSlideOpen(false);
      await fetchOpps();
    } catch {
      alert("Failed to save opportunity");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/opportunities?id=${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      await fetchOpps();
    } catch {
      alert("Failed to delete opportunity");
    } finally {
      setDeleting(false);
    }
  };

  const totalCount = opps.length;
  const openCount = opps.filter((o) => o.status === "open" && !isExpired(o)).length;
  const closedCount = opps.filter((o) => o.status === "closed").length;

  const filtered = opps.filter((o) => {
    if (filter === "open") return o.status === "open";
    if (filter === "closed") return o.status === "closed";
    return true;
  });

  const filterBtnStyle = (tab: FilterTab) => ({
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: filter === tab ? 500 : 400,
    cursor: "pointer",
    background: filter === tab ? "#eef2fa" : "transparent",
    color: filter === tab ? "#4a6fa5" : "var(--muted-foreground)",
    border: "none",
    transition: "all 0.15s",
  } as React.CSSProperties);

  return (
    <div className="space-y-4 max-w-full">
      <ApprovalQueue onApproved={fetchOpps} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>Opportunities</h1>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
          style={{ background: "#4a6fa5" }}>
          <Plus size={15} /> New Opportunity
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total", value: totalCount, color: "var(--foreground)", bg: "var(--card-bg)" },
          { label: "Open", value: openCount, color: "#166534", bg: "#dcfce7" },
          { label: "Closed", value: closedCount, color: "#6b7280", bg: "#f3f4f6" },
        ].map((s) => (
          <div key={s.label} className="px-4 py-2 rounded-xl border text-sm font-medium"
            style={{ background: s.bg, color: s.color, borderColor: "transparent" }}>
            {s.value} {s.label}
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: "var(--muted)" }}>
        {(["all", "open", "closed"] as FilterTab[]).map((t) => (
          <button key={t} onClick={() => setFilter(t)} style={filterBtnStyle(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Loading opportunities…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            {filter !== "all" ? "No opportunities match this filter." : "No opportunities yet. Create one!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Title", "Brand", "Category", "Budget", "Deadline", "Applications", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((opp, i) => (
                  <tr key={opp.id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: "var(--foreground)" }}>
                      <div>{opp.title}</div>
                      {opp.overview && (
                        <div className="text-xs mt-0.5 max-w-[200px] truncate" style={{ color: "var(--muted-foreground)" }}>
                          {opp.overview}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {opp.brand_name || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {opp.category ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "#ede9fe", color: "#6d28d9" }}>
                          {opp.category}
                        </span>
                      ) : <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--foreground)" }}>
                      {formatBudget(opp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {opp.deadline
                        ? new Date(opp.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
                      {opp.application_count ?? 0}
                    </td>
                    <td className="px-4 py-3"><StatusBadge opp={opp} /></td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(opp.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <button onClick={() => openEdit(opp)}
                          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Edit">
                          <Pencil size={13} style={{ color: "#4a6fa5" }} />
                        </button>
                        <button onClick={() => setDeleteTarget(opp)}
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
        opportunity={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <AuthGate>
      <AppShell title="Opportunities">
        <OpportunitiesContent />
      </AppShell>
    </AuthGate>
  );
}
