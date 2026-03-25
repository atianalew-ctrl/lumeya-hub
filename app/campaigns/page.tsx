"use client";
import { useState, useEffect, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { LayoutGrid, List } from "lucide-react";

interface Campaign {
  id: string;
  opportunity_id: string | null;
  brand_id: string | null;
  creator_id: string | null;
  title: string | null;
  deliverables: string | null;
  deadline: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; header: string }> = {
  pending:   { bg: "#fffbeb", text: "#92400e", border: "#fde68a", header: "#f59e0b" },
  active:    { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", header: "#3b82f6" },
  completed: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", header: "#22c55e" },
  cancelled: { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", header: "#ef4444" },
};

const KANBAN_COLS = ["pending", "active", "completed", "cancelled"] as const;
type KanbanStatus = typeof KANBAN_COLS[number];

function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = (status || "pending").toLowerCase();
  const colors = STATUS_COLORS[s] || { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb", header: "#9ca3af" };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: colors.bg, color: colors.text }}>
      {s}
    </span>
  );
}

function CampaignCard({ campaign, onStatusChange }: {
  campaign: Campaign;
  onStatusChange: (id: string, status: string) => void;
}) {
  const s = (campaign.status || "pending").toLowerCase();
  const colors = STATUS_COLORS[s] || STATUS_COLORS.pending;
  return (
    <div className="rounded-xl border p-4 space-y-2 shadow-sm hover:shadow-md transition-shadow"
      style={{ background: colors.bg, borderColor: colors.border }}>
      <div className="font-medium text-sm" style={{ color: "#111827" }}>
        {campaign.title || `Campaign #${campaign.id.slice(0, 8)}`}
      </div>
      {campaign.deliverables && (
        <p className="text-xs line-clamp-2" style={{ color: "#6b7280" }}>{campaign.deliverables}</p>
      )}
      {campaign.deadline && (
        <p className="text-xs" style={{ color: "#9ca3af" }}>
          🗓 {new Date(campaign.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      )}
      <select
        value={campaign.status || "pending"}
        onChange={(e) => onStatusChange(campaign.id, e.target.value)}
        className="w-full text-xs rounded-lg px-2 py-1.5 border mt-1 cursor-pointer"
        style={{ borderColor: colors.border, background: "white", color: "#374151" }}>
        <option value="pending">Pending</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}

function KanbanView({ campaigns, onStatusChange }: {
  campaigns: Campaign[];
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-4 min-w-[800px]">
      {KANBAN_COLS.map((col) => {
        const colCampaigns = campaigns.filter((c) => (c.status || "pending").toLowerCase() === col);
        const colors = STATUS_COLORS[col];
        return (
          <div key={col} className="space-y-3">
            {/* Column header */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: colors.bg, borderLeft: `4px solid ${colors.header}` }}>
              <span className="text-xs font-semibold uppercase tracking-wider capitalize"
                style={{ color: colors.text }}>{col}</span>
              <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: colors.border, color: colors.text }}>
                {colCampaigns.length}
              </span>
            </div>
            {/* Cards */}
            <div className="space-y-3 min-h-[100px]">
              {colCampaigns.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-center text-xs"
                  style={{ borderColor: colors.border, color: "#9ca3af" }}>
                  No {col} campaigns
                </div>
              ) : (
                colCampaigns.map((c) => (
                  <CampaignCard key={c.id} campaign={c} onStatusChange={onStatusChange} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ campaigns, onStatusChange }: {
  campaigns: Campaign[];
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Title", "Deliverables", "Deadline", "Status", "Created", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--muted-foreground)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign, i) => (
              <tr key={campaign.id}
                style={{ borderBottom: i < campaigns.length - 1 ? "1px solid var(--border)" : "none" }}
                className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                  {campaign.title || `Campaign #${campaign.id.slice(0, 8)}`}
                </td>
                <td className="px-4 py-3 max-w-[200px]" style={{ color: "var(--muted-foreground)" }}>
                  <span className="block truncate text-xs">{campaign.deliverables || "—"}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {campaign.deadline
                    ? new Date(campaign.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={campaign.status} />
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                  {new Date(campaign.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={campaign.status || "pending"}
                    onChange={(e) => onStatusChange(campaign.id, e.target.value)}
                    className="text-xs rounded-lg px-2 py-1.5 border"
                    style={{ borderColor: "var(--border)", background: "var(--card-bg)", color: "var(--foreground)" }}>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CampaignsContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCampaigns(data);
      } else {
        setError("Failed to load campaigns");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleStatusChange = async (id: string, status: string) => {
    // Optimistic update
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    try {
      await fetch("/api/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      alert("Failed to update campaign");
      fetchCampaigns(); // revert on error
    }
  };

  const pending = campaigns.filter((c) => (c.status || "pending").toLowerCase() === "pending").length;
  const active = campaigns.filter((c) => (c.status || "").toLowerCase() === "active").length;
  const completed = campaigns.filter((c) => (c.status || "").toLowerCase() === "completed").length;
  const cancelled = campaigns.filter((c) => (c.status || "").toLowerCase() === "cancelled").length;

  return (
    <div className="space-y-4 max-w-full">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pending", value: pending, ...STATUS_COLORS.pending },
          { label: "Active", value: active, ...STATUS_COLORS.active },
          { label: "Completed", value: completed, ...STATUS_COLORS.completed },
          { label: "Cancelled", value: cancelled, ...STATUS_COLORS.cancelled },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 border"
            style={{ background: s.bg, borderColor: s.border }}>
            <p className="text-xs font-medium mb-1" style={{ color: s.text }}>{s.label}</p>
            <p className="text-2xl font-semibold" style={{ color: s.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} total
        </p>
        <div className="flex gap-1 p-1 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--card-bg)" }}>
          <button
            onClick={() => setViewMode("kanban")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              background: viewMode === "kanban" ? "#eef2fa" : "transparent",
              color: viewMode === "kanban" ? "#4a6fa5" : "var(--muted-foreground)",
            }}>
            <LayoutGrid size={13} /> Kanban
          </button>
          <button
            onClick={() => setViewMode("list")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              background: viewMode === "list" ? "#eef2fa" : "transparent",
              color: viewMode === "list" ? "#4a6fa5" : "var(--muted-foreground)",
            }}>
            <List size={13} /> List
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center text-sm rounded-xl border"
          style={{ color: "var(--muted-foreground)", borderColor: "var(--border)", background: "var(--card-bg)" }}>
          Loading campaigns…
        </div>
      ) : error ? (
        <div className="p-8 text-center text-sm text-red-500 rounded-xl border"
          style={{ borderColor: "var(--border)" }}>{error}</div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 text-center rounded-xl border"
          style={{ color: "var(--muted-foreground)", borderColor: "var(--border)", background: "var(--card-bg)" }}>
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm font-medium mb-1">No campaigns yet</p>
          <p className="text-xs">Campaigns are created when a brand selects a creator for an opportunity.</p>
        </div>
      ) : (
        <div className={viewMode === "kanban" ? "overflow-x-auto" : ""}>
          {viewMode === "kanban" ? (
            <KanbanView campaigns={campaigns} onStatusChange={handleStatusChange} />
          ) : (
            <ListView campaigns={campaigns} onStatusChange={handleStatusChange} />
          )}
        </div>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <AuthGate>
      <AppShell title="Campaigns">
        <CampaignsContent />
      </AppShell>
    </AuthGate>
  );
}
