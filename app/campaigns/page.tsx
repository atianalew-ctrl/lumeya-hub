"use client";
import { useState, useEffect, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";

interface Campaign {
  id: string;
  title?: string;
  name?: string;
  platform?: string;
  budget?: number | null;
  status?: string | null;
  created_at: string;
  lumeya_fee?: number | null;
  [key: string]: unknown;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  active: { bg: "#dbeafe", text: "#1e40af" },
  completed: { bg: "#dcfce7", text: "#166534" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = (status || "pending").toLowerCase();
  const colors = STATUS_COLORS[s] || { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: colors.bg, color: colors.text }}>
      {s}
    </span>
  );
}

function CampaignsContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    try {
      await fetch("/api/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchCampaigns();
    } catch {
      alert("Failed to update campaign");
    }
  };

  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalFees = totalBudget * 0.12;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-4 border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Total GMV</p>
          <p className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>
            €{totalBudget.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Total Lumeya Fees (12%)</p>
          <p className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>
            €{totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Active Campaigns</p>
          <p className="text-2xl font-semibold" style={{ color: "var(--foreground)" }}>{activeCampaigns}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Loading campaigns…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>No campaigns yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Title", "Platform", "Budget", "Status", "Created", "Actions"].map((h) => (
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
                    style={{ borderBottom: i < campaigns.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                      {campaign.title || campaign.name || "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                      {campaign.platform || "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                      {campaign.budget ? `€${Number(campaign.budget).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(campaign.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={campaign.status || "pending"}
                        onChange={(e) => handleStatusChange(campaign.id, e.target.value)}
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
        )}
      </div>
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
