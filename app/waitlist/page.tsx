"use client";
import { useState, useEffect, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { Copy, Check } from "lucide-react";

interface WaitlistEntry {
  id: string;
  email: string;
  company_name: string | null;
  interest: string | null;
  created_at: string;
}

function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all hover:opacity-80"
      style={{ borderColor: "var(--border)", background: copied ? "#dcfce7" : "var(--card-bg)", color: copied ? "#166534" : "var(--muted-foreground)" }}
      title="Copy email">
      {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy email</>}
    </button>
  );
}

function ContactedBadge({ contacted, onClick }: { contacted: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all hover:opacity-80"
      style={{
        borderColor: contacted ? "#bbf7d0" : "var(--border)",
        background: contacted ? "#dcfce7" : "var(--card-bg)",
        color: contacted ? "#166534" : "var(--muted-foreground)",
      }}
      title={contacted ? "Mark as not contacted" : "Mark as contacted"}>
      {contacted ? "✓ Contacted" : "Mark contacted"}
    </button>
  );
}

function WaitlistContent() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactedIds, setContactedIds] = useState<Set<string>>(new Set());

  const fetchWaitlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist");
      const data = await res.json();
      if (Array.isArray(data)) {
        setEntries(data);
      } else {
        setError("Failed to load waitlist");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWaitlist(); }, [fetchWaitlist]);

  // Load contacted IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lumeya_contacted_waitlist");
      if (stored) setContactedIds(new Set(JSON.parse(stored)));
    } catch { /* ignore */ }
  }, []);

  const toggleContacted = (id: string) => {
    setContactedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("lumeya_contacted_waitlist", JSON.stringify([...next]));
      } catch { /* ignore */ }
      return next;
    });
  };

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const signupsToday = entries.filter((e) => new Date(e.created_at) >= todayMidnight).length;
  const contactedCount = entries.filter((e) => contactedIds.has(e.id)).length;

  const exportCSV = () => {
    const csv = [
      "email,company_name,interest,created_at,contacted",
      ...entries.map((e) =>
        `"${e.email}","${e.company_name || ""}","${e.interest || ""}","${e.created_at}","${contactedIds.has(e.id) ? "yes" : "no"}"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lumeya-brand-waitlist.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total signups", value: entries.length, color: "var(--foreground)", bg: "var(--card-bg)" },
            { label: "Today", value: signupsToday, color: "#1e40af", bg: "#dbeafe" },
            { label: "Contacted", value: contactedCount, color: "#166534", bg: "#dcfce7" },
            { label: "Remaining", value: entries.length - contactedCount, color: "#92400e", bg: "#fef3c7" },
          ].map((s) => (
            <div key={s.label} className="px-4 py-2 rounded-xl border text-sm font-medium"
              style={{ background: s.bg, color: s.color, borderColor: "transparent" }}>
              <span className="font-bold">{s.value}</span> {s.label}
            </div>
          ))}
        </div>
        <button
          onClick={exportCSV}
          disabled={entries.length === 0}
          className="ml-auto px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: "#4a6fa5", color: "white" }}>
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Loading waitlist…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>No waitlist entries yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["#", "Email", "Company", "Interest", "Signed Up", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--muted-foreground)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={entry.id}
                    style={{
                      borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none",
                      opacity: contactedIds.has(entry.id) ? 0.65 : 1,
                    }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{entry.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {entry.company_name || <span className="text-xs opacity-50">—</span>}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="text-xs block truncate" style={{ color: "var(--muted-foreground)" }}
                        title={entry.interest || ""}>
                        {entry.interest || <span className="opacity-50">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(entry.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                      <div className="opacity-70">
                        {new Date(entry.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CopyEmailButton email={entry.email} />
                        <ContactedBadge
                          contacted={contactedIds.has(entry.id)}
                          onClick={() => toggleContacted(entry.id)}
                        />
                      </div>
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

export default function WaitlistPage() {
  return (
    <AuthGate>
      <AppShell title="Brand Waitlist">
        <WaitlistContent />
      </AppShell>
    </AuthGate>
  );
}
