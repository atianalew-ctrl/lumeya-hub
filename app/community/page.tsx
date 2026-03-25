"use client";
import { useState, useEffect, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { Search, Trash2 } from "lucide-react";

interface CommunityPost {
  id: string;
  author_id: string | null;
  content: string | null;
  tags: string[] | null;
  post_type: string | null;
  like_count: number | null;
  comment_count: number | null;
  created_at: string;
  updated_at: string | null;
  author_name: string | null;
  author_role: string | null;
  author_avatar: string | null;
}

function PostTypeBadge({ type }: { type: string | null }) {
  if (!type) return <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>;
  const map: Record<string, { bg: string; text: string }> = {
    post: { bg: "#eff6ff", text: "#1e40af" },
    question: { bg: "#fdf4ff", text: "#7e22ce" },
    showcase: { bg: "#f0fdf4", text: "#166534" },
    tip: { bg: "#fef3c7", text: "#92400e" },
    announcement: { bg: "#fee2e2", text: "#991b1b" },
  };
  const c = map[type.toLowerCase()] || { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: c.bg, color: c.text }}>{type}</span>
  );
}

function AuthorAvatar({ post }: { post: CommunityPost }) {
  const [err, setErr] = useState(false);
  const initials = post.author_name
    ? post.author_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  if (post.author_avatar && !err) {
    return (
      <img src={post.author_avatar} alt={post.author_name || ""}
        onError={() => setErr(true)}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ background: "#4a6fa5" }}>{initials}</div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ background: "var(--muted)", width: i === 1 ? 32 : i === 3 ? "70%" : "50%" }} />
        </td>
      ))}
    </tr>
  );
}

function DeleteDialog({ post, onConfirm, onCancel, deleting }: {
  post: CommunityPost | null;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4" style={{ background: "white" }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: "#111827" }}>Delete Post</h3>
        <p className="text-sm mb-1" style={{ color: "#6b7280" }}>
          Delete post by <strong>{post.author_name || "Unknown"}</strong>?
        </p>
        <p className="text-xs mb-5 italic truncate" style={{ color: "#9ca3af" }}>
          &ldquo;{(post.content || "").substring(0, 80)}&rdquo;
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: "#d1d5db", color: "#374151" }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "#ef4444" }}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommunityContent() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CommunityPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/community");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const filtered = posts.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.author_name || "").toLowerCase().includes(q) ||
      (p.content || "").toLowerCase().includes(q)
    );
  });

  const totalLikes = posts.reduce((s, p) => s + (p.like_count || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comment_count || 0), 0);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/community?id=${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      await fetchPosts();
    } catch {
      alert("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Stats chips */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { label: "Total Posts", value: posts.length, color: "var(--foreground)", bg: "var(--card-bg)" },
          { label: "Total Likes", value: totalLikes, color: "#be123c", bg: "#fff1f2" },
          { label: "Total Comments", value: totalComments, color: "#1e40af", bg: "#eff6ff" },
        ].map(s => (
          <div key={s.label} className="px-4 py-2 rounded-xl border text-sm font-medium"
            style={{ background: s.bg, color: s.color, borderColor: "transparent" }}>
            <span className="font-bold">{s.value}</span> {s.label}
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by author or content…"
          className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"
          style={{ borderColor: "var(--border)", background: "var(--card-bg)", color: "var(--foreground)" }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["", "Author", "Content", "Type", "❤️ Likes", "💬 Comments", "Date", ""].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No community posts yet.</p>
            {search && (
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                No results for &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["", "Author", "Content", "Type", "❤️", "💬", "Date", ""].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((post, i) => (
                  <tr key={post.id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3"><AuthorAvatar post={post} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                        {post.author_name || "Unknown"}
                      </div>
                      {post.author_role && (
                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{post.author_role}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm truncate" style={{ color: "var(--foreground)", maxWidth: 320 }}
                        title={post.content || ""}>
                        {post.content ? post.content.substring(0, 80) + (post.content.length > 80 ? "…" : "") : "—"}
                      </p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3"><PostTypeBadge type={post.post_type} /></td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "#be123c" }}>
                      {post.like_count || 0}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "#1e40af" }}>
                      {post.comment_count || 0}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(post.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteTarget(post)}
                        className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                        title="Delete post">
                        <Trash2 size={14} style={{ color: "#ef4444" }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteDialog
        post={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}

export default function CommunityPage() {
  return (
    <AuthGate>
      <AppShell title="Community">
        <CommunityContent />
      </AppShell>
    </AuthGate>
  );
}
