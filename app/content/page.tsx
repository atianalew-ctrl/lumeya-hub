"use client";
import { useState, useEffect, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { Search, Trash2, X, Check, XCircle, Film, Image as ImageIcon } from "lucide-react";

interface ContentItem {
  id: string;
  source: "feed" | "submission";
  // feed_posts fields
  creator_name?: string;
  handle?: string;
  avatar_url?: string;
  image_url?: string;
  caption?: string;
  category?: string;
  brand?: string;
  type?: string;
  likes?: number;
  saves?: number;
  // campaign_submissions fields
  campaign_id?: string;
  creator_id?: string;
  file_name?: string;
  file_url?: string;
  status?: string;
  review_comment?: string;
  updated_at?: string;
  created_at: string;
}

type FilterType = "all" | "feed" | "submission" | "photo" | "video";

function SourceBadge({ source }: { source: "feed" | "submission" }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={
        source === "feed"
          ? { background: "#dbeafe", color: "#1d4ed8" }
          : { background: "#ede9fe", color: "#6d28d9" }
      }
    >
      {source === "feed" ? "Feed" : "Submission"}
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const styles: Record<string, { bg: string; color: string }> = {
    pending: { bg: "#fef3c7", color: "#92400e" },
    approved: { bg: "#dcfce7", color: "#166534" },
    rejected: { bg: "#fee2e2", color: "#991b1b" },
  };
  const s = styles[status] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function isVideo(item: ContentItem): boolean {
  return item.type === "reel" || (item.file_name ?? "").match(/\.(mp4|mov|webm)$/i) !== null;
}

function getMediaUrl(item: ContentItem): string {
  return item.image_url || item.file_url || "";
}

function getCreatorName(item: ContentItem): string {
  return item.creator_name || item.creator_id || "Unknown";
}

function ContentCard({
  item,
  onDelete,
  onApprove,
  onReject,
  onClick,
}: {
  item: ContentItem;
  onDelete: (item: ContentItem) => void;
  onApprove: (item: ContentItem) => void;
  onReject: (item: ContentItem) => void;
  onClick: (item: ContentItem) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const mediaUrl = getMediaUrl(item);
  const video = isVideo(item);

  return (
    <div
      className="break-inside-avoid mb-4 rounded-xl overflow-hidden border cursor-pointer transition-shadow hover:shadow-lg"
      style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
    >
      {/* Media */}
      <div className="relative" onClick={() => onClick(item)}>
        {mediaUrl ? (
          video ? (
            <video
              src={mediaUrl}
              className="w-full object-cover"
              style={{ maxHeight: 280 }}
              muted
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl}
              alt={item.caption || "Content"}
              className="w-full object-cover"
              style={{ maxHeight: 280 }}
            />
          )
        ) : (
          <div
            className="w-full flex items-center justify-center"
            style={{ height: 160, background: "var(--muted)" }}
          >
            {video ? (
              <Film size={32} style={{ color: "var(--muted-foreground)" }} />
            ) : (
              <ImageIcon size={32} style={{ color: "var(--muted-foreground)" }} />
            )}
          </div>
        )}

        {/* Hover overlay */}
        {hovered && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)" }}
          >
            {!confirmDelete ? (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                className="p-2 rounded-full text-white transition-all hover:scale-110"
                style={{ background: "#ef4444" }}
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            ) : (
              <div className="flex gap-2 items-center">
                <span className="text-white text-xs font-medium">Delete?</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "#ef4444" }}
                >
                  Yes
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                  className="px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: "white", color: "#374151" }}
                >
                  No
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
            {getCreatorName(item)}
          </span>
          <SourceBadge source={item.source} />
        </div>

        {(item.category || item.brand) && (
          <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
            {[item.category, item.brand].filter(Boolean).join(" · ")}
          </p>
        )}

        {item.caption && (
          <p className="text-xs line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
            {item.caption}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
          {item.source === "submission" && <StatusBadge status={item.status} />}
        </div>

        {item.source === "submission" && item.status === "pending" && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onApprove(item)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: "#dcfce7", color: "#166534" }}
            >
              <Check size={12} /> Approve
            </button>
            <button
              onClick={() => onReject(item)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: "#fee2e2", color: "#991b1b" }}
            >
              <XCircle size={12} /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Lightbox({
  item,
  onClose,
  onApprove,
  onReject,
}: {
  item: ContentItem | null;
  onClose: () => void;
  onApprove: (item: ContentItem) => void;
  onReject: (item: ContentItem) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!item) return null;

  const mediaUrl = getMediaUrl(item);
  const video = isVideo(item);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-w-4xl w-full max-h-[90vh]"
        style={{ background: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media side */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ background: "#000", minWidth: 280, maxWidth: 480, width: "50%" }}
        >
          {mediaUrl ? (
            video ? (
              <video
                src={mediaUrl}
                controls
                className="max-h-[90vh] w-full object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt={item.caption || "Content"}
                className="max-h-[90vh] w-full object-contain"
              />
            )
          ) : (
            <div className="flex items-center justify-center w-full h-64">
              <ImageIcon size={48} style={{ color: "#6b7280" }} />
            </div>
          )}
        </div>

        {/* Info side */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 gap-4" style={{ minWidth: 280 }}>
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-semibold" style={{ color: "#111827" }}>
              {getCreatorName(item)}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X size={18} style={{ color: "#6b7280" }} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <SourceBadge source={item.source} />
            {item.source === "submission" && <StatusBadge status={item.status} />}
            {item.type && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                style={{ background: "#f3f4f6", color: "#6b7280" }}>{item.type}</span>
            )}
          </div>

          {item.caption && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#9ca3af" }}>Caption</p>
              <p className="text-sm" style={{ color: "#374151" }}>{item.caption}</p>
            </div>
          )}

          <div className="space-y-2 text-sm">
            {item.category && (
              <div className="flex gap-2">
                <span style={{ color: "#9ca3af", minWidth: 80 }}>Category</span>
                <span style={{ color: "#374151" }}>{item.category}</span>
              </div>
            )}
            {item.brand && (
              <div className="flex gap-2">
                <span style={{ color: "#9ca3af", minWidth: 80 }}>Brand</span>
                <span style={{ color: "#374151" }}>{item.brand}</span>
              </div>
            )}
            {item.likes != null && (
              <div className="flex gap-2">
                <span style={{ color: "#9ca3af", minWidth: 80 }}>Likes</span>
                <span style={{ color: "#374151" }}>{item.likes}</span>
              </div>
            )}
            {item.saves != null && (
              <div className="flex gap-2">
                <span style={{ color: "#9ca3af", minWidth: 80 }}>Saves</span>
                <span style={{ color: "#374151" }}>{item.saves}</span>
              </div>
            )}
            {item.file_name && (
              <div className="flex gap-2">
                <span style={{ color: "#9ca3af", minWidth: 80 }}>File</span>
                <span style={{ color: "#374151" }} className="truncate">{item.file_name}</span>
              </div>
            )}
            {item.review_comment && (
              <div className="flex gap-2">
                <span style={{ color: "#9ca3af", minWidth: 80 }}>Review</span>
                <span style={{ color: "#374151" }}>{item.review_comment}</span>
              </div>
            )}
            <div className="flex gap-2">
              <span style={{ color: "#9ca3af", minWidth: 80 }}>Date</span>
              <span style={{ color: "#374151" }}>
                {new Date(item.created_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit"
                })}
              </span>
            </div>
          </div>

          {item.source === "submission" && item.status === "pending" && (
            <div className="flex gap-3 mt-auto pt-4 border-t" style={{ borderColor: "#e5e7eb" }}>
              <button
                onClick={() => { onApprove(item); onClose(); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: "#dcfce7", color: "#166534" }}
              >
                <Check size={14} /> Approve
              </button>
              <button
                onClick={() => { onReject(item); onClose(); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: "#fee2e2", color: "#991b1b" }}
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentVaultContent() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [lightboxItem, setLightboxItem] = useState<ContentItem | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
      else setError("Failed to load content");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const handleDelete = async (item: ContentItem) => {
    await fetch(`/api/content?id=${item.id}&source=${item.source}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleApprove = async (item: ContentItem) => {
    await fetch(`/api/content?id=${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    setItems((prev) =>
      prev.map((i) => i.id === item.id ? { ...i, status: "approved" } : i)
    );
  };

  const handleReject = async (item: ContentItem) => {
    await fetch(`/api/content?id=${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    setItems((prev) =>
      prev.map((i) => i.id === item.id ? { ...i, status: "rejected" } : i)
    );
  };

  const feedPosts = items.filter((i) => i.source === "feed");
  const submissions = items.filter((i) => i.source === "submission");

  const filtered = items.filter((item) => {
    if (filter === "feed" && item.source !== "feed") return false;
    if (filter === "submission" && item.source !== "submission") return false;
    if (filter === "photo" && isVideo(item)) return false;
    if (filter === "video" && !isVideo(item)) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = getCreatorName(item).toLowerCase();
      const cap = (item.caption || "").toLowerCase();
      const brand = (item.brand || "").toLowerCase();
      if (!name.includes(q) && !cap.includes(q) && !brand.includes(q)) return false;
    }
    return true;
  });

  const tabs: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "feed", label: "Feed" },
    { key: "submission", label: "Submissions" },
    { key: "photo", label: "Photos" },
    { key: "video", label: "Videos" },
  ];

  return (
    <div className="space-y-5 max-w-full">
      {/* Header stats */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { label: "Total pieces", value: items.length },
          { label: "Feed posts", value: feedPosts.length },
          { label: "Submissions", value: submissions.length },
        ].map((s) => (
          <div
            key={s.label}
            className="px-4 py-2.5 rounded-xl border text-sm"
            style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
          >
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>{s.value}</span>
            <span className="ml-1.5" style={{ color: "var(--muted-foreground)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by creator, caption, brand…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card-bg)", color: "var(--foreground)" }}
          />
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--muted)" }}>
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: filter === key ? 500 : 400,
                cursor: "pointer",
                background: filter === key ? "#eef2fa" : "transparent",
                color: filter === key ? "#4a6fa5" : "var(--muted-foreground)",
                border: "none",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Loading content vault…</div>
      ) : error ? (
        <div className="p-12 text-center text-sm text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
          No content found. {search || filter !== "all" ? "Try adjusting your filters." : "Upload some content!"}
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {filtered.map((item) => (
            <ContentCard
              key={`${item.source}-${item.id}`}
              item={item}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onReject={handleReject}
              onClick={setLightboxItem}
            />
          ))}
        </div>
      )}

      <Lightbox
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

export default function ContentPage() {
  return (
    <AuthGate>
      <AppShell title="Content Vault">
        <ContentVaultContent />
      </AppShell>
    </AuthGate>
  );
}
