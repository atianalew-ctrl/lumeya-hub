"use client";
import { useState, useEffect, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import Link from "next/link";

type DateRange = 7 | 30 | 90 | 0;

interface AnalyticsData {
  period: { days: number };
  creators: {
    total: number;
    approved: number;
    pending: number;
    byRegion: { region: string; count: number }[];
    topByFollowers: { id: string; display_name: string; followers: number | null }[];
  };
  opportunities: {
    total: number;
    open: number;
    closed: number;
    pending: number;
    totalApplications: number;
    avgApplications: number;
  };
  campaigns: {
    total: number;
    byStatus: { pending: number; active: number; completed: number; cancelled: number };
  };
  payments: {
    totalBudget: number;
    totalPlatformFee: number;
    totalCreatorPayout: number;
    byStatus: { funded: number; released: number; pending: number };
  };
  profileViews: { total: number; last7days: number; last30days: number; period: number };
  content: { total: number; photos: number; videos: number; submissions: number };
  applications: {
    total: number;
    period: number;
    byStatus: { pending: number; accepted: number; rejected: number };
  };
  waitlist: { total: number };
  growth: { newCreatorsPeriod: number };
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtEur(n: number): string {
  return `€${n.toLocaleString("en-EU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border p-5 flex flex-col gap-1"
      style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{label}</p>
      <p className="text-3xl font-bold mt-1" style={{ color: "var(--foreground)" }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{sub}</p>}
    </div>
  );
}

function PillBadge({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
      style={{ background: bg, color }}>
      <span className="font-bold">{value}</span> {label}
    </span>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
      <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>{title}</h2>
      {children}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: "var(--muted)" }} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: "var(--muted)" }} />
        ))}
      </div>
    </div>
  );
}

const RANGES: { label: string; value: DateRange }[] = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "All time", value: 0 },
];

function AnalyticsContent() {
  const [range, setRange] = useState<DateRange>(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (days: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(range); }, [range, fetchData]);

  const rangeLabel = range === 0 ? "all time" : `last ${range} days`;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header + range filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--muted)" }}>
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
              style={{
                background: range === r.value ? "var(--card-bg)" : "transparent",
                color: range === r.value ? "var(--primary)" : "var(--muted-foreground)",
                boxShadow: range === r.value ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}>
              {r.label}
            </button>
          ))}
        </div>
        {loading && <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Refreshing…</span>}
      </div>

      {loading && !data ? <Skeleton /> : error ? (
        <div className="rounded-xl border p-8 text-center text-sm text-red-500">{error}</div>
      ) : data ? (
        <>
          {/* Hero metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Approved Creators"
              value={fmtNum(data.creators.approved)}
              sub={`${data.creators.total} total (${data.creators.pending} pending)`}
            />
            <StatCard
              label={`Profile Views (${rangeLabel})`}
              value={fmtNum(data.profileViews.period)}
              sub={`${fmtNum(data.profileViews.total)} all time`}
            />
            <StatCard
              label={`Applications (${rangeLabel})`}
              value={fmtNum(data.applications.period)}
              sub={`${fmtNum(data.applications.total)} total`}
            />
            <StatCard
              label="Total Campaigns"
              value={fmtNum(data.campaigns.total)}
              sub={`${data.campaigns.byStatus.active} active`}
            />
          </div>

          {/* Growth note */}
          {data.growth.newCreatorsPeriod > 0 && (
            <div className="rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2"
              style={{ background: "#f0f7ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>
              📈 Platform growing — <strong>{data.growth.newCreatorsPeriod} new creator{data.growth.newCreatorsPeriod !== 1 ? "s" : ""}</strong> joined in the {rangeLabel}
            </div>
          )}

          {/* Creator Intelligence */}
          <SectionCard title="🧠 Creator Intelligence">
            <div className="space-y-5">
              {/* Approval rate */}
              <div>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                  <span>Approval Rate</span>
                  <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                    {data.creators.total > 0 ? Math.round((data.creators.approved / data.creators.total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${data.creators.total > 0 ? (data.creators.approved / data.creators.total) * 100 : 0}%`,
                      background: "#4a6fa5",
                    }} />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                  {data.creators.approved} approved / {data.creators.total} total
                </p>
              </div>

              {/* By region */}
              {data.creators.byRegion.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>Creators by Region</p>
                  <div className="space-y-2">
                    {data.creators.byRegion.slice(0, 8).map((r, i) => {
                      const max = data.creators.byRegion[0].count;
                      const pct = max > 0 ? (r.count / max) * 100 : 0;
                      const colors = ["#4a6fa5", "#6b8fc5", "#8fa8d0", "#b3c7e0", "#d7e3f0", "#3d5a85", "#5c80b0", "#7a9ac0"];
                      return (
                        <div key={r.region} className="flex items-center gap-3">
                          <span className="text-xs w-28 truncate flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>{r.region}</span>
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                          </div>
                          <span className="text-xs w-8 text-right font-medium" style={{ color: "var(--foreground)" }}>{r.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top 5 by followers */}
              {data.creators.topByFollowers.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--foreground)" }}>Top Creators by Followers</p>
                  <div className="space-y-1.5">
                    {data.creators.topByFollowers.map((c, i) => (
                      <div key={c.id} className="flex items-center gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-white flex-shrink-0"
                          style={{ background: "#4a6fa5", fontSize: "10px" }}>{i + 1}</span>
                        <span className="flex-1 truncate" style={{ color: "var(--foreground)" }}>{c.display_name}</span>
                        <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                          {c.followers ? fmtNum(c.followers) : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Opportunity & Campaign Funnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="🎯 Opportunity & Application Funnel">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Opportunities</p>
                  <div className="flex flex-wrap gap-2">
                    <PillBadge label="Open" value={data.opportunities.open} color="#166534" bg="#dcfce7" />
                    <PillBadge label="Pending" value={data.opportunities.pending} color="#92400e" bg="#fef3c7" />
                    <PillBadge label="Closed" value={data.opportunities.closed} color="#6b7280" bg="#f3f4f6" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Applications</p>
                  <div className="flex flex-wrap gap-2">
                    <PillBadge label="Pending" value={data.applications.byStatus.pending} color="#92400e" bg="#fef3c7" />
                    <PillBadge label="Accepted" value={data.applications.byStatus.accepted} color="#166534" bg="#dcfce7" />
                    <PillBadge label="Rejected" value={data.applications.byStatus.rejected} color="#991b1b" bg="#fee2e2" />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="📋 Campaign Status">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Pending", value: data.campaigns.byStatus.pending, color: "#92400e", bg: "#fef3c7" },
                  { label: "Active", value: data.campaigns.byStatus.active, color: "#1e40af", bg: "#dbeafe" },
                  { label: "Completed", value: data.campaigns.byStatus.completed, color: "#166534", bg: "#dcfce7" },
                  { label: "Cancelled", value: data.campaigns.byStatus.cancelled, color: "#991b1b", bg: "#fee2e2" },
                ].map(s => (
                  <div key={s.label} className="rounded-lg p-3 text-center"
                    style={{ background: s.bg }}>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: s.color }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Revenue & Payments */}
          <SectionCard title="💰 Revenue & Payments">
            {data.payments.totalBudget === 0 ? (
              <div className="rounded-lg p-4 flex items-center gap-3"
                style={{ background: "#f0f4fa", border: "1px dashed #4a6fa5" }}>
                <span className="text-2xl">💳</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#4a6fa5" }}>Connect Stripe to unlock revenue tracking</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                    Payments will appear here once campaigns are funded.{" "}
                    <Link href="/revenue" className="underline font-medium" style={{ color: "#4a6fa5" }}>
                      Set up Stripe →
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg p-4 text-center" style={{ background: "#f0fdf4" }}>
                    <p className="text-xl font-bold" style={{ color: "#166534" }}>{fmtEur(data.payments.totalBudget)}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "#166534" }}>Total Budget</p>
                  </div>
                  <div className="rounded-lg p-4 text-center" style={{ background: "#eff6ff" }}>
                    <p className="text-xl font-bold" style={{ color: "#1e40af" }}>{fmtEur(data.payments.totalPlatformFee)}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "#1e40af" }}>Platform Fees (12%)</p>
                  </div>
                  <div className="rounded-lg p-4 text-center" style={{ background: "#faf5ff" }}>
                    <p className="text-xl font-bold" style={{ color: "#6d28d9" }}>{fmtEur(data.payments.totalCreatorPayout)}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "#6d28d9" }}>Creator Payouts</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <p className="text-xs font-semibold w-full" style={{ color: "var(--muted-foreground)" }}>Payment Status</p>
                  <PillBadge label="Funded" value={data.payments.byStatus.funded} color="#1e40af" bg="#dbeafe" />
                  <PillBadge label="Released" value={data.payments.byStatus.released} color="#166534" bg="#dcfce7" />
                  <PillBadge label="Pending" value={data.payments.byStatus.pending} color="#92400e" bg="#fef3c7" />
                </div>
              </div>
            )}
          </SectionCard>

          {/* Content & Engagement */}
          <SectionCard title="📸 Content & Engagement">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg p-3 text-center" style={{ background: "#fdf4ff" }}>
                <p className="text-2xl font-bold" style={{ color: "#7e22ce" }}>{fmtNum(data.content.photos)}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#7e22ce" }}>📷 Photos</p>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ background: "#fff1f2" }}>
                <p className="text-2xl font-bold" style={{ color: "#be123c" }}>{fmtNum(data.content.videos)}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#be123c" }}>🎬 Videos</p>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ background: "#f0fdf4" }}>
                <p className="text-2xl font-bold" style={{ color: "#166534" }}>{fmtNum(data.profileViews.total)}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#166534" }}>👁 Total Profile Views</p>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ background: "#eff6ff" }}>
                <p className="text-2xl font-bold" style={{ color: "#1e40af" }}>{fmtNum(data.waitlist.total)}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#1e40af" }}>✉️ Waitlist Signups</p>
              </div>
            </div>
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AuthGate>
      <AppShell title="Analytics">
        <AnalyticsContent />
      </AppShell>
    </AuthGate>
  );
}
