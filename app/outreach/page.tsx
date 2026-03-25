"use client";
import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { Send, Plus, X, Pencil, Trash2, ChevronDown } from "lucide-react";

type BrandRecord = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  industry: string;
  pipeline_stage: string;
  notes: string;
  last_contact_at: string | null;
  created_at: string;
};

const STAGES = ["Prospect", "Contacted", "Replied", "Demo Booked", "Converted", "Churned"] as const;
type Stage = typeof STAGES[number];

const STAGE_COLORS: Record<Stage, { bg: string; text: string }> = {
  Prospect:     { bg: "#f3f4f6", text: "#374151" },
  Contacted:    { bg: "#dbeafe", text: "#1d4ed8" },
  Replied:      { bg: "#fef9c3", text: "#a16207" },
  "Demo Booked":{ bg: "#f3e8ff", text: "#7c3aed" },
  Converted:    { bg: "#dcfce7", text: "#15803d" },
  Churned:      { bg: "#fee2e2", text: "#dc2626" },
};

const SETUP_SQL = `CREATE TABLE IF NOT EXISTS brand_crm (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  contact_name text,
  email text,
  industry text,
  pipeline_stage text default 'prospect',
  notes text,
  last_contact_at timestamptz,
  created_at timestamptz default now()
);`;

const EMPTY_FORM = {
  company_name: "", contact_name: "", email: "", industry: "",
  pipeline_stage: "Prospect", notes: "",
};

function StagePill({ stage }: { stage: string }) {
  const colors = STAGE_COLORS[stage as Stage] ?? { bg: "#f3f4f6", text: "#374151" };
  return (
    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
      style={{ background: colors.bg, color: colors.text }}>
      {stage}
    </span>
  );
}

function SlideOver({ open, onClose, initial, onSave }: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<BrandRecord>;
  onSave: (data: typeof EMPTY_FORM) => Promise<void>;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ ...EMPTY_FORM, ...initial });
  }, [initial, open]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-sm">{initial?.id ? "Edit Brand" : "Add Brand"}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {[
            { key: "company_name", label: "Company Name", required: true },
            { key: "contact_name", label: "Contact Name" },
            { key: "email", label: "Email", type: "email" },
            { key: "industry", label: "Industry" },
          ].map(({ key, label, type, required }) => (
            <div key={key}>
              <label className="text-xs font-medium block mb-1">{label}{required && " *"}</label>
              <input
                type={type || "text"}
                required={required}
                value={(form as any)[key]}
                onChange={e => set(key, e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium block mb-1">Pipeline Stage</label>
            <div className="relative">
              <select
                value={form.pipeline_stage}
                onChange={e => set("pipeline_stage", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 pr-8"
                style={{ borderColor: "var(--border)" }}
              >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: "var(--primary)" }}
          >
            {saving ? "Saving…" : initial?.id ? "Save Changes" : "Add Brand"}
          </button>
        </form>
      </div>
    </div>
  );
}

function OutreachContent() {
  const [records, setRecords] = useState<BrandRecord[]>([]);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slideOver, setSlideOver] = useState<{ open: boolean; record?: BrandRecord }>({ open: false });

  const load = async () => {
    try {
      const res = await fetch("/api/outreach");
      const json = await res.json();
      if (json.setup_needed) { setSetupNeeded(true); setRecords([]); }
      else setRecords(json.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form: typeof EMPTY_FORM) => {
    if (slideOver.record?.id) {
      await fetch("/api/outreach", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slideOver.record.id, ...form }),
      });
    } else {
      await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand record?")) return;
    await fetch(`/api/outreach?id=${id}`, { method: "DELETE" });
    await load();
  };

  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Send size={20} style={{ color: "var(--primary)" }} />
            <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>Brand Outreach</h1>
          </div>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Track your brand pipeline</p>
        </div>
        <button
          onClick={() => setSlideOver({ open: true })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: "var(--primary)" }}
        >
          <Plus size={15} /> Add Brand
        </button>
      </div>

      {/* Setup card */}
      {setupNeeded && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 mb-6">
          <p className="text-sm font-medium text-amber-800 mb-2">Database setup needed</p>
          <p className="text-xs text-amber-700 mb-3">Run the following SQL in your Supabase SQL editor to enable outreach tracking:</p>
          <pre className="bg-amber-100 rounded-lg p-3 text-xs text-amber-900 overflow-x-auto whitespace-pre-wrap">{SETUP_SQL}</pre>
          <a
            href="https://supabase.com/dashboard/project/xbgdynlutmosupfqafap/sql"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-3 text-xs font-medium text-amber-800 underline hover:text-amber-900"
          >
            Open Supabase SQL Editor →
          </a>
        </div>
      )}

      {/* Stats row */}
      {records.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {STAGES.map(stage => {
            const count = records.filter(r => r.pipeline_stage === stage).length;
            const colors = STAGE_COLORS[stage];
            return (
              <div key={stage} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{stage}</p>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>{count}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Loading…</div>
        ) : records.length === 0 && !setupNeeded ? (
          <div className="p-12 text-center">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No brands yet. Click "Add Brand" to start tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--sidebar-bg)", borderBottom: "1px solid var(--border)" }}>
                  {["Company", "Contact", "Email", "Industry", "Stage", "Last Contact", "Notes", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id}
                    style={{ borderBottom: i < records.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{r.company_name || "—"}</td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{r.contact_name || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{r.email || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{r.industry || "—"}</td>
                    <td className="px-4 py-3"><StagePill stage={r.pipeline_stage || "Prospect"} /></td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{fmt(r.last_contact_at)}</td>
                    <td className="px-4 py-3 text-xs max-w-[200px] truncate" style={{ color: "var(--muted-foreground)" }}>{r.notes || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSlideOver({ open: true, record: r })}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} style={{ color: "var(--muted-foreground)" }} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} className="text-red-400" />
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
        open={slideOver.open}
        onClose={() => setSlideOver({ open: false })}
        initial={slideOver.record}
        onSave={handleSave}
      />
    </div>
  );
}

export default function OutreachPage() {
  return (
    <AuthGate>
      <AppShell title="Outreach">
        <OutreachContent />
      </AppShell>
    </AuthGate>
  );
}
