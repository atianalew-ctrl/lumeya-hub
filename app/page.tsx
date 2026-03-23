"use client";
import { useState, useEffect } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { ExternalLink } from "lucide-react";

const phases = [
  { name: "Phase 1: Foundation", pct: 90, color: "#4a6fa5" },
  { name: "Phase 2: Creator Hub", pct: 55, color: "#6b8fc5" },
  { name: "Phase 3: Brand Portal", pct: 20, color: "#8fa8d0" },
  { name: "Phase 4: Marketplace", pct: 5, color: "#b0c4de" },
  { name: "Phase 5: Scale", pct: 0, color: "#d0dcea" },
];

const quickLinks = [
  { label: "Open site", url: "https://lumeya-connect.vercel.app", color: "#4a6fa5" },
  { label: "Open admin", url: "https://lumeya-connect.vercel.app/admin", color: "#6b5fa5" },
  { label: "Open Supabase", url: "https://supabase.com/dashboard/project/xbgdynlutmosupfqafap", color: "#3ecf8e" },
  { label: "Open GitHub", url: "https://github.com/atianalew-ctrl/lumeya-connect", color: "#1a1a1a" },
];

interface Stats {
  creators: number | string;
  pendingApprovals: number | string;
  waitlistSignups: number | string;
  openOpportunities: number | string;
}

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl p-5 border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
      <p className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>{label}</p>
      <p className="text-3xl font-semibold" style={{ color: "var(--foreground)" }}>
        {value === "—" ? <span style={{ color: "var(--muted-foreground)" }}>—</span> : value}
      </p>
    </div>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState<Stats>({
    creators: "…",
    pendingApprovals: "…",
    waitlistSignups: "…",
    openOpportunities: "…",
  });
  const [commit, setCommit] = useState<Commit | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Fetch stats
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoadingStats(false);
      })
      .catch(() => {
        setStats({ creators: "—", pendingApprovals: "—", waitlistSignups: "—", openOpportunities: "—" });
        setLoadingStats(false);
      });

    // Fetch commit
    fetch("/api/commit")
      .then((r) => r.json())
      .then((d) => setCommit(d))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Stats */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Platform Stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Creators" value={loadingStats ? "…" : stats.creators} />
          <StatCard label="Pending Approvals" value={loadingStats ? "…" : stats.pendingApprovals} />
          <StatCard label="Waitlist Signups" value={loadingStats ? "…" : stats.waitlistSignups} />
          <StatCard label="Open Opportunities" value={loadingStats ? "…" : stats.openOpportunities} />
        </div>
      </section>

      {/* Phase Progress */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Build Progress</h2>
        <div className="rounded-xl p-5 border space-y-4" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
          {phases.map((phase) => (
            <div key={phase.name}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm" style={{ color: "var(--foreground)" }}>{phase.name}</span>
                <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{phase.pct}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "var(--muted)" }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${phase.pct}%`, background: phase.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Deploy */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Latest Deploy</h2>
        <div className="rounded-xl p-5 border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
          {commit ? (
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                    {commit.sha}
                  </span>
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{commit.message}</span>
                </div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  by {commit.author} · {new Date(commit.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <a href={commit.url} target="_blank" rel="noreferrer" className="flex-shrink-0 p-1.5 rounded hover:bg-gray-100 transition-colors">
                <ExternalLink size={14} style={{ color: "var(--muted-foreground)" }} />
              </a>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Loading commit info…</p>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: link.color }}
            >
              <ExternalLink size={14} />
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGate>
      <AppShell title="Dashboard">
        <DashboardContent />
      </AppShell>
    </AuthGate>
  );
}
