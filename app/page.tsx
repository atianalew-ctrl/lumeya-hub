"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { ExternalLink, UserPlus, Megaphone, Users, Globe, Briefcase, Map, LayoutDashboard, User } from "lucide-react";

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

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="rounded-xl p-5 border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
      <p className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>{label}</p>
      <p className="text-3xl font-semibold" style={{ color: accent ?? "var(--foreground)" }}>
        {value === "—" ? <span style={{ color: "var(--muted-foreground)" }}>—</span> : value}
      </p>
    </div>
  );
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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

  const pendingCount = typeof alerts?.pendingCreators === "number" ? alerts.pendingCreators : 0;
  const oppCount = typeof stats.openOpportunities === "number" ? stats.openOpportunities : 0;
  const hasAlerts = pendingCount > 0 || (typeof alerts?.newWaitlistToday === "number" && alerts.newWaitlistToday > 0);

  const quickActions = [
    {
      icon: <Map size={22} />,
      label: "Site Navigator",
      desc: "All pages by role",
      href: "/site-map",
      external: false,
      color: "#4a6fa5",
    },
    {
      icon: <Globe size={22} />,
      label: "Live Site",
      desc: "Open as visitor",
      href: "https://lumeya-connect.vercel.app",
      external: true,
      color: "#1a1a1a",
    },
    {
      icon: <LayoutDashboard size={22} />,
      label: "Brand Dashboard",
      desc: "Open as brand",
      href: "https://lumeya-connect.vercel.app/dashboard",
      external: true,
      color: "#16a34a",
    },
    {
      icon: <User size={22} />,
      label: "Creator Dashboard",
      desc: "Open as creator",
      href: "https://lumeya-connect.vercel.app/creator-dashboard",
      external: true,
      color: "#9333ea",
    },
    {
      icon: <UserPlus size={22} />,
      label: "Approve Creators",
      desc: "Pending approvals",
      href: "/creators",
      external: false,
      color: "#ea580c",
    },
    {
      icon: <Megaphone size={22} />,
      label: "Campaigns",
      desc: "Manage brand campaigns",
      href: "/campaigns",
      external: false,
      color: "#6b5fa5",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Daily Briefing */}
      <section className="rounded-xl p-5 border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--foreground)" }}>
          {greeting()}, Atiana 👋
        </h2>
        <div className="space-y-2">
          {!alerts ? (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Loading briefing…</p>
          ) : (
            <>
              {pendingCount > 0 && (
                <Link href="/creators">
                  <div className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: "#92400e" }}>
                    ⚠️ <span><strong>{pendingCount}</strong> creator{pendingCount !== 1 ? "s" : ""} waiting for approval</span>
                  </div>
                </Link>
              )}
              {typeof alerts.newWaitlistToday === "number" && alerts.newWaitlistToday > 0 && (
                <Link href="/waitlist">
                  <div className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: "#1d4ed8" }}>
                    📥 <span><strong>{alerts.newWaitlistToday}</strong> new waitlist signup{alerts.newWaitlistToday !== 1 ? "s" : ""} today</span>
                  </div>
                </Link>
              )}
              {typeof oppCount === "number" && oppCount > 0 && (
                <Link href="/opportunities">
                  <div className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: "#1d4ed8" }}>
                    💼 <span><strong>{oppCount}</strong> open opportunit{oppCount !== 1 ? "ies" : "y"} waiting for applicants</span>
                  </div>
                </Link>
              )}
              {!hasAlerts && oppCount === 0 && (
                <div className="flex items-center gap-2 text-sm" style={{ color: "#166534" }}>
                  ✅ Platform looking healthy — nothing urgent today
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Platform Stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Creators" value={loadingStats ? "…" : stats.creators} />
          <StatCard label="Pending Approvals" value={loadingStats ? "…" : stats.pendingApprovals} accent={Number(stats.pendingApprovals) > 0 ? "#92400e" : undefined} />
          <StatCard label="Waitlist Signups" value={loadingStats ? "…" : stats.waitlistSignups} />
          <StatCard label="Open Opportunities" value={loadingStats ? "…" : stats.openOpportunities} />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const inner = (
              <div
                className="flex flex-col items-start gap-3 p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer h-full"
                style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
              >
                <div className="p-2.5 rounded-lg text-white" style={{ background: action.color }}>
                  {action.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{action.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{action.desc}</p>
                </div>
              </div>
            );
            return action.external ? (
              <a key={action.label} href={action.href} target="_blank" rel="noreferrer" className="block">
                {inner}
              </a>
            ) : (
              <Link key={action.label} href={action.href} className="block">
                {inner}
              </Link>
            );
          })}
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
      <AppShell title="Mission Control">
        <DashboardContent />
      </AppShell>
    </AuthGate>
  );
}
