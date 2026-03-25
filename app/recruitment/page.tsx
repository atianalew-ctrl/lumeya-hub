"use client";
import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { UserPlus, CheckCircle, Circle, Check } from "lucide-react";

type PriorityCreator = {
  id: string;
  name: string;
  instagram: string;
  note: string;
};

type PendingCreator = {
  id: string;
  display_name: string;
  instagram: string;
  email: string;
  created_at: string;
};

function RecruitmentContent() {
  const [priority, setPriority] = useState<PriorityCreator[]>([]);
  const [pending, setPending] = useState<PendingCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [consented, setConsented] = useState<Record<string, boolean>>({});
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    // Load localStorage state
    try {
      const c = localStorage.getItem("lumeya_recruit_checked");
      const co = localStorage.getItem("lumeya_recruit_consented");
      if (c) setChecked(JSON.parse(c));
      if (co) setConsented(JSON.parse(co));
    } catch {}

    fetch("/api/recruitment")
      .then(r => r.json())
      .then(d => {
        setPriority(d.priority || []);
        setPending(d.pending || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleChecked = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem("lumeya_recruit_checked", JSON.stringify(next));
  };

  const toggleConsented = (id: string) => {
    const next = { ...consented, [id]: !consented[id] };
    setConsented(next);
    localStorage.setItem("lumeya_recruit_consented", JSON.stringify(next));
  };

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await fetch("/api/creators", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved: true }),
      });
      setPending(p => p.filter(c => c.id !== id));
    } finally {
      setApproving(null);
    }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const signedCount = priority.filter(p => consented[p.id]).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <UserPlus size={20} style={{ color: "var(--primary)" }} />
        <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>Creator Recruitment</h1>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
        Track priority sign-ups and approve pending creators
      </p>

      {/* Section 1: Priority Sign-ups */}
      <div className="rounded-xl border overflow-hidden mb-6" style={{ borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "var(--sidebar-bg)" }}>
          <div>
            <h2 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Priority Sign-ups</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Creators Atiana needs to get signed consent from</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: signedCount === priority.length && priority.length > 0 ? "#dcfce7" : "#f3f4f6", color: signedCount === priority.length && priority.length > 0 ? "#15803d" : "#374151" }}>
            {signedCount}/{priority.length} consented
          </span>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {loading ? (
            <div className="p-6 text-sm text-center" style={{ color: "var(--muted-foreground)" }}>Loading…</div>
          ) : priority.map(p => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
              {/* Reached out checkbox */}
              <button onClick={() => toggleChecked(p.id)} className="flex-shrink-0">
                {checked[p.id]
                  ? <CheckCircle size={18} style={{ color: "var(--primary)" }} />
                  : <Circle size={18} style={{ color: "var(--muted-foreground)" }} />
                }
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${checked[p.id] ? "line-through opacity-60" : ""}`} style={{ color: "var(--foreground)" }}>
                  {p.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  {p.instagram}
                  {p.note !== "Priority" && <span className="ml-2 opacity-60">· {p.note}</span>}
                </p>
              </div>

              {/* Consent toggle */}
              <button
                onClick={() => toggleConsented(p.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                style={consented[p.id]
                  ? { background: "#dcfce7", borderColor: "#86efac", color: "#15803d" }
                  : { background: "transparent", borderColor: "var(--border)", color: "var(--muted-foreground)" }
                }
              >
                {consented[p.id] && <Check size={11} />}
                {consented[p.id] ? "Consent received" : "Consent pending"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Pending Approval */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)", background: "var(--sidebar-bg)" }}>
          <h2 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Pending Approval</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Creators who signed up but haven't been approved yet</p>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-center" style={{ color: "var(--muted-foreground)" }}>Loading…</div>
        ) : pending.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No pending approvals 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Creator", "Instagram", "Email", "Signed up", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < pending.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.display_name || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{c.instagram || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{c.email || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{fmt(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleApprove(c.id)}
                        disabled={approving === c.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-60"
                        style={{ background: "var(--primary)" }}
                      >
                        {approving === c.id ? "Approving…" : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecruitmentPage() {
  return (
    <AuthGate>
      <AppShell title="Recruitment">
        <RecruitmentContent />
      </AppShell>
    </AuthGate>
  );
}
