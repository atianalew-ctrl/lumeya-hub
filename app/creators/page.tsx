"use client";
import { useState, useEffect, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";

interface Creator {
  id: string;
  display_name: string;
  bio: string | null;
  tagline: string | null;
  avatar_url: string | null;
  instagram: string | null;
  tiktok: string | null;
  followers: number | null;
  tiktok_followers: number | null;
  engagement_rate: number | null;
  approved: boolean | null;
  created_at: string;
  region: string | null;
}

function StatusBadge({ approved }: { approved: boolean | null }) {
  if (approved === true) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: "#dcfce7", color: "#166534" }}>
        Live
      </span>
    );
  }
  if (approved === false) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: "#fef3c7", color: "#92400e" }}>
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "#f3f4f6", color: "#6b7280" }}>
      Hidden
    </span>
  );
}

function Avatar({ creator }: { creator: Creator }) {
  const [imgError, setImgError] = useState(false);
  const initials = creator.display_name
    ? creator.display_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  if (creator.avatar_url && !imgError) {
    return (
      <img
        src={creator.avatar_url}
        alt={creator.display_name}
        onError={() => setImgError(true)}
        className="w-8 h-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
      style={{ background: "#4a6fa5" }}>
      {initials}
    </div>
  );
}

function CreatorsContent() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/creators");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCreators(data);
      } else {
        setError("Failed to load creators");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCreators(); }, [fetchCreators]);

  const handleToggle = async (creator: Creator) => {
    const newApproved = !(creator.approved === true);
    try {
      await fetch("/api/creators", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: creator.id, approved: newApproved }),
      });
      fetchCreators();
    } catch {
      alert("Failed to update creator");
    }
  };

  const live = creators.filter((c) => c.approved === true).length;
  const pending = creators.filter((c) => c.approved !== true).length;
  const total = creators.length;

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          <span style={{ color: "#166534" }}>{live} Live</span>
          {" · "}
          <span style={{ color: "#92400e" }}>{pending} Pending</span>
          {" · "}
          {total} Total
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Loading creators…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : creators.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>No creators yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Avatar", "Name", "Niche", "Followers", "Instagram", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--muted-foreground)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {creators.map((creator, i) => (
                  <tr key={creator.id}
                    style={{ borderBottom: i < creators.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-4 py-3">
                      <Avatar creator={creator} />
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                      {creator.display_name || "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                      {creator.tagline || "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                      {creator.followers ? creator.followers.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                      {creator.instagram ? (
                        <a href={`https://instagram.com/${creator.instagram}`} target="_blank" rel="noreferrer"
                          className="underline" style={{ color: "var(--primary)" }}>
                          @{creator.instagram}
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge approved={creator.approved} />
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(creator.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      {creator.approved === true ? (
                        <button
                          onClick={() => handleToggle(creator)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                          style={{ background: "#f3f4f6", color: "#6b7280" }}>
                          Hide
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggle(creator)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                          style={{ background: "#dcfce7", color: "#166534" }}>
                          Approve
                        </button>
                      )}
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

export default function CreatorsPage() {
  return (
    <AuthGate>
      <AppShell title="Creators">
        <CreatorsContent />
      </AppShell>
    </AuthGate>
  );
}
