"use client";
import { useState, useEffect, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";

interface WaitlistEntry {
  id: string;
  email: string;
  created_at: string;
}

function WaitlistContent() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const signupsToday = entries.filter((e) => new Date(e.created_at) >= todayMidnight).length;

  const exportCSV = () => {
    const csv = ["email,created_at", ...entries.map((e) => `${e.email},${e.created_at}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lumeya-waitlist.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            <strong>{entries.length}</strong> total signups
            {" · "}
            <strong>{signupsToday}</strong> today
          </span>
        </div>
        <button
          onClick={exportCSV}
          disabled={entries.length === 0}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: "var(--primary)", color: "white" }}>
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
                  {["#", "Email", "Signed up"].map((h) => (
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
                    style={{ borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{i + 1}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>{entry.email}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(entry.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
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
      <AppShell title="Waitlist">
        <WaitlistContent />
      </AppShell>
    </AuthGate>
  );
}
