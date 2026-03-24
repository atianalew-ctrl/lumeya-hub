"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { ExternalLink } from "lucide-react";

const phases = [
  { name: "Phase 1: Foundation", pct: 95, color: "#4a6fa5" },
  { name: "Phase 2: Production Ready", pct: 85, color: "#6b8fc5" },
  { name: "Phase 3: Creator Tools", pct: 70, color: "#8fa8d0" },
  { name: "Phase 4: Campaign System", pct: 60, color: "#b0c4de" },
  { name: "Phase 5: Payments & Scale", pct: 10, color: "#d0dcea" },
];

const quickLinks = [
  { label: "Open site", url: "https://lumeya-connect.vercel.app", color: "#4a6fa5" },
  { label: "Admin panel", url: "https://lumeya-connect.vercel.app/admin/dashboard", color: "#6b5fa5" },
  { label: "Supabase", url: "https://supabase.com/dashboard/project/xbgdynlutmosupfqafap", color: "#3ecf8e" },
  { label: "GitHub", url: "https://github.com/atianalew-ctrl/lumeya-connect", color: "#1a1a1a" },
];

const todos = [
  "Buy lumeya.io domain (~€10 on namecheap.com)",
  "Upgrade Supabase to Pro ($25/mo) — prevents DB going offline",
  "Set up hello@lumeya.io email",
  "Get OpenAI API key → send to Audrey for AI Matchmaker",
  "Create Stripe account → send keys to Audrey for payments",
  "Create @joinlumeya Instagram + LinkedIn page",
  "Get signed consent from 8 creators (Ronja, Nikoline, Sussie, Amalie, Nella, Celina, Daniel, Sakura)",
];

interface Stats {
  creators: number | string;
  pendingApprovals: number | string;
  waitlistSignups: number | string;
  openOpportunities: number | string;
}

interface Alerts {
  pendingCreators: number;
  newWaitlistToday: number;
  pendingCampaigns: number;
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
  const [alerts, setAlerts] = useState<Alerts | null>(null);
  const [commit, setCommit] = useState<Commit | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoadingStats(false); })
      .catch(() => { setStats({ creators: "—", pendingApprovals: "—", waitlistSignups: "—", openOpportunities: "—" }); setLoadingStats(false); });

    fetch("/api/alerts")
      .then((r) => r.json())
      .then((d) => setAlerts(d))
      .catch(() => {});

    fetch("/api/commit")
      .then((r) => r.json())
      .then((d) => setCommit(d))
      .catch(() => {});
  }, []);

  const hasAlerts = alerts && (alerts.pendingCreators > 0 || alerts.newWaitlistToday > 0 || alerts.pendingCampaigns > 0);

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Alerts */}
      {hasAlerts && (
        <section>
          <div className="flex flex-wrap gap-2">
            {alerts!.pendingCreators > 0 && (
              <Link href="/creators">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: "#fef3c7", color: "#92400e" }}>
                  ⚠️ {alerts!.pendingCreators} creator{alerts!.pendingCreators !== 1 ? "s" : ""} pending approval
                </span>
              </Link>
            )}
            {alerts!.newWaitlistToday > 0 && (
              <Link href="/waitlist">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: "#fef3c7", color: "#92400e" }}>
                  📥 {alerts!.newWaitlistToday} new waitlist signup{alerts!.newWaitlistToday !== 1 ? "s" : ""} today
                </span>
              </Link>
            )}
            {alerts!.pendingCampaigns > 0 && (
              <Link href="/campaigns">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: "#fef3c7", color: "#92400e" }}>
                  💼 {alerts!.pendingCampaigns} campaign{alerts!.pendingCampaigns !== 1 ? "s" : ""} submitted
                </span>
              </Link>
            )}
          </div>
        </section>
      )}

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

      {/* Pending TODOs */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Pending TODOs</h2>
        <div className="rounded-xl p-5 border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
          <div className="space-y-3">
            {todos.map((todo, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 text-sm flex-shrink-0">⬜</span>
                <span className="text-sm" style={{ color: "var(--foreground)" }}>{todo}</span>
              </div>
            ))}
          </div>
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
