"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { Search, Plus, Pencil, Trash2, X, Check, BadgeCheck, TrendingUp, Upload, Image as ImageIcon, Download } from "lucide-react";

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
  location: string | null;
  tags: string[] | null;
  content_types: string[] | null;
  languages: string[] | null;
  availability: string | null;
  is_verified: boolean | null;
  is_trending: boolean | null;
  rates: string | null;
  creator_type: string | null;
  available_for_remote: boolean | null;
  portfolio_images: string[] | null;
  video_url: string | null;
  video_urls: string[] | null;
}

type FilterTab = "all" | "live" | "pending" | "hidden";

const REGIONS = ["Denmark", "Norway", "Sweden", "Finland", "Iceland", "International", "Middle East", "Other"];
const CREATOR_TYPES = ["ugc", "influencer", "both"];
const AVAILABILITIES = ["available", "busy", "unavailable"];

const emptyForm = {
  display_name: "",
  bio: "",
  tagline: "",
  location: "",
  region: "",
  country: "",
  instagram: "",
  tiktok: "",
  followers: "",
  tiktok_followers: "",
  engagement_rate: "",
  rates: "",
  tags: "",
  content_types: "",
  creator_type: "",
  availability: "available",
  available_for_remote: false,
  approved: false,
  avatar_url: "",
  is_verified: false,
  is_trending: false,
};

function fmtFollowers(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function StatusBadge({ approved }: { approved: boolean | null }) {
  if (approved === true)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: "#dcfce7", color: "#166534" }}>Live</span>
    );
  if (approved === false)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ background: "#fef3c7", color: "#92400e" }}>Pending</span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "#f3f4f6", color: "#6b7280" }}>Hidden</span>
  );
}

function AvailabilityBadge({ status }: { status: string | null }) {
  if (status === "available")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "#dcfce7", color: "#166534" }}>✓ Available</span>;
  if (status === "busy")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "#fef3c7", color: "#92400e" }}>~ Busy</span>;
  if (status === "unavailable")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "#fee2e2", color: "#991b1b" }}>✗ Unavailable</span>;
  return <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>;
}

function CreatorTypeBadge({ type }: { type: string | null }) {
  if (!type) return <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>;
  const colors: Record<string, { bg: string; text: string }> = {
    ugc: { bg: "#ede9fe", text: "#6d28d9" },
    influencer: { bg: "#dbeafe", text: "#1d4ed8" },
    both: { bg: "#f0fdf4", text: "#15803d" },
  };
  const c = colors[type] || { bg: "#f3f4f6", text: "#6b7280" };
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
    style={{ background: c.bg, color: c.text }}>{type}</span>;
}

function Avatar({ creator }: { creator: Creator }) {
  const [imgError, setImgError] = useState(false);
  const initials = creator.display_name
    ? creator.display_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  if (creator.avatar_url && !imgError) {
    return (
      <img src={creator.avatar_url} alt={creator.display_name}
        onError={() => setImgError(true)}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
      style={{ background: "#4a6fa5" }}>{initials}</div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none"
      style={{ background: value ? "#4a6fa5" : "#d1d5db" }}
    >
      <span
        className="inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform"
        style={{ transform: value ? "translateX(1.4rem)" : "translateX(0.2rem)" }}
      />
    </button>
  );
}

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: typeof emptyForm, portfolioUrls: string[], videoUrls: string[]) => Promise<void>;
  initial?: typeof emptyForm | null;
  title: string;
  saving: boolean;
  initialPortfolioImages?: string[];
  initialVideoUrls?: string[];
}

const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";

async function uploadToSupabase(file: File, bucket: string, path: string): Promise<string | null> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": file.type,
    },
    body: file,
  });
  if (!res.ok) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

function SlideOver({ open, onClose, onSave, initial, title, saving, initialPortfolioImages, initialVideoUrls }: SlideOverProps) {
  const [form, setForm] = useState(emptyForm);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [videoUploading, setVideoUploading] = useState(false);
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(initial ?? emptyForm);
      setAvatarPreview(initial?.avatar_url ?? null);
      setPortfolioUrls(initialPortfolioImages ?? []);
      setPortfolioPreviews(initialPortfolioImages ?? []);
      setVideoUrls(initialVideoUrls ?? []);
      setTimeout(() => firstInput.current?.focus(), 50);
    }
  }, [open, initial, initialPortfolioImages, initialVideoUrls]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const set = (key: string, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, "_")}`;
    const url = await uploadToSupabase(file, "creator-avatars", path);
    if (url) set("avatar_url", url);
    setAvatarUploading(false);
  };

  const handlePortfolioFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPortfolioUploading(true);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPortfolioPreviews(prev => [...prev, ...newPreviews]);
    for (const file of files) {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
      const url = await uploadToSupabase(file, "creator-portfolio", path);
      if (url) setPortfolioUrls(prev => [...prev, url]);
    }
    setPortfolioUploading(false);
  };

  const handleVideoFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setVideoUploading(true);
    for (const file of files) {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;
      const url = await uploadToSupabase(file, "creator-videos", path);
      if (url) setVideoUrls(prev => [...prev, url]);
    }
    setVideoUploading(false);
  };

  const labelStyle = "block text-xs font-medium mb-1";
  const inputStyle = "w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2";
  const inputVars = { borderColor: "var(--border)", background: "var(--card-bg)", color: "var(--foreground)" } as React.CSSProperties;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl transition-transform duration-300"
        style={{
          width: "clamp(320px, 460px, 95vw)",
          background: "white",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#e5e7eb" }}>
          <h2 className="font-semibold text-base" style={{ color: "#111827" }}>{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} style={{ color: "#6b7280" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Display name */}
          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Display Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input ref={firstInput} value={form.display_name} onChange={(e) => set("display_name", e.target.value)}
              placeholder="e.g. Sofia Larsen" className={inputStyle} style={inputVars} />
          </div>

          {/* Tagline */}
          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Tagline / Niche</label>
            <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)}
              placeholder="e.g. Lifestyle & Beauty" className={inputStyle} style={inputVars} />
          </div>

          {/* Bio */}
          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Bio</label>
            <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)}
              rows={3} placeholder="Short bio…"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 resize-none"
              style={inputVars} />
          </div>

          {/* Location + Region */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Location</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Copenhagen" className={inputStyle} style={inputVars} />
            </div>
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Region</label>
              <select value={form.region} onChange={(e) => set("region", e.target.value)}
                className={inputStyle} style={inputVars}>
                <option value="">Select…</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Country */}
          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Country</label>
            <input value={form.country} onChange={(e) => set("country", e.target.value)}
              placeholder="e.g. Denmark" className={inputStyle} style={inputVars} />
          </div>

          {/* Instagram + TikTok */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Instagram</label>
              <input value={form.instagram} onChange={(e) => set("instagram", e.target.value)}
                placeholder="handle (no @)" className={inputStyle} style={inputVars} />
            </div>
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>TikTok</label>
              <input value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)}
                placeholder="handle (no @)" className={inputStyle} style={inputVars} />
            </div>
          </div>

          {/* Followers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>IG Followers</label>
              <input type="number" value={form.followers} onChange={(e) => set("followers", e.target.value)}
                placeholder="0" className={inputStyle} style={inputVars} />
            </div>
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>TikTok Followers</label>
              <input type="number" value={form.tiktok_followers} onChange={(e) => set("tiktok_followers", e.target.value)}
                placeholder="0" className={inputStyle} style={inputVars} />
            </div>
          </div>

          {/* ER + Rates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Engagement Rate (%)</label>
              <input type="number" step="0.1" value={form.engagement_rate} onChange={(e) => set("engagement_rate", e.target.value)}
                placeholder="e.g. 3.5" className={inputStyle} style={inputVars} />
            </div>
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Rates</label>
              <input value={form.rates} onChange={(e) => set("rates", e.target.value)}
                placeholder='e.g. "40-200€"' className={inputStyle} style={inputVars} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Tags</label>
            <input value={form.tags} onChange={(e) => set("tags", e.target.value)}
              placeholder="Beauty, Lifestyle, Fashion (comma separated)"
              className={inputStyle} style={inputVars} />
          </div>

          {/* Content Types */}
          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Content Types</label>
            <input value={form.content_types} onChange={(e) => set("content_types", e.target.value)}
              placeholder="UGC Videos, Product Reviews, Tutorials"
              className={inputStyle} style={inputVars} />
          </div>

          {/* Creator Type + Availability */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Creator Type</label>
              <select value={form.creator_type} onChange={(e) => set("creator_type", e.target.value)}
                className={inputStyle} style={inputVars}>
                <option value="">Select…</option>
                {CREATOR_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelStyle} style={{ color: "#374151" }}>Availability</label>
              <select value={form.availability} onChange={(e) => set("availability", e.target.value)}
                className={inputStyle} style={inputVars}>
                {AVAILABILITIES.map((a) => (
                  <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Avatar Upload */}
          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 flex items-center justify-center"
                style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={20} style={{ color: "var(--muted-foreground)" }} />
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ borderColor: "var(--border)", background: "var(--card-bg)", color: "var(--foreground)" }}>
                  <Upload size={13} />
                  {avatarUploading ? "Uploading…" : "Upload photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} disabled={avatarUploading} />
                </label>
                <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>JPG, PNG or WebP</p>
              </div>
            </div>
          </div>

          {/* Portfolio Photos */}
          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Portfolio Photos / Videos</label>
            <label className="cursor-pointer block">
              <div className="w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-6 transition-colors hover:opacity-80"
                style={{ borderColor: "var(--border)", background: "var(--muted)", color: "var(--muted-foreground)" }}>
                <Upload size={18} />
                <span className="text-xs">{portfolioUploading ? "Uploading…" : "Upload photos or videos"}</span>
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Select multiple files</span>
              </div>
              <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handlePortfolioFiles} disabled={portfolioUploading} />
            </label>
            {portfolioPreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {portfolioPreviews.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>

          {/* Video Upload */}
          <div>
            <label className={labelStyle} style={{ color: "#374151" }}>Videos (UGC Reel)</label>
            <label className="cursor-pointer block">
              <div className="w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-5 transition-colors hover:opacity-80"
                style={{ borderColor: "var(--border)", background: "var(--muted)", color: "var(--muted-foreground)" }}>
                <Upload size={18} />
                <span className="text-xs">{videoUploading ? "Uploading…" : "Upload videos (MP4 preferred)"}</span>
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>MOV, MP4 — select multiple</span>
              </div>
              <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideoFiles} disabled={videoUploading} />
            </label>
            {videoUrls.length > 0 && (
              <div className="mt-2 space-y-1">
                {videoUrls.map((url, i) => (
                  <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg"
                    style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                    <span className="truncate">Video {i + 1} ✓ uploaded</span>
                    <button type="button" onClick={() => setVideoUrls(prev => prev.filter((_, j) => j !== i))}
                      className="ml-2 hover:text-red-500 transition-colors">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "#374151" }}>Available for Remote</span>
              <Toggle value={form.available_for_remote} onChange={(v) => set("available_for_remote", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "#374151" }}>Approved / Live</span>
              <Toggle value={form.approved} onChange={(v) => set("approved", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "#374151" }}>Verified Badge ✓</span>
              <Toggle value={Boolean(form.is_verified)} onChange={(v) => set("is_verified", v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "#374151" }}>Trending 🔥</span>
              <Toggle value={Boolean(form.is_trending)} onChange={(v) => set("is_trending", v)} />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: "#e5e7eb" }}>
          <button onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: "#d1d5db", color: "#374151" }}>
            Cancel
          </button>
          <button
            onClick={() => onSave(form, portfolioUrls, videoUrls)}
            disabled={saving || !form.display_name.trim()}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "#4a6fa5" }}>
            {saving ? "Saving…" : <><Check size={14} /> Save</>}
          </button>
        </div>
      </div>
    </>
  );
}

interface DeleteDialogProps {
  creator: Creator | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  deleting: boolean;
}

function DeleteDialog({ creator, onConfirm, onCancel, deleting }: DeleteDialogProps) {
  if (!creator) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4" style={{ background: "white" }}>
        <h3 className="text-base font-semibold mb-2" style={{ color: "#111827" }}>Delete Creator</h3>
        <p className="text-sm mb-5" style={{ color: "#6b7280" }}>
          Are you sure you want to delete <strong>{creator.display_name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: "#d1d5db", color: "#374151" }}>
            Cancel
          </button>
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

function toFormValues(creator: Creator): typeof emptyForm {
  return {
    display_name: creator.display_name ?? "",
    bio: creator.bio ?? "",
    tagline: creator.tagline ?? "",
    location: creator.location ?? "",
    region: creator.region ?? "",
    country: "",
    instagram: creator.instagram ?? "",
    tiktok: creator.tiktok ?? "",
    followers: creator.followers != null ? String(creator.followers) : "",
    tiktok_followers: creator.tiktok_followers != null ? String(creator.tiktok_followers) : "",
    engagement_rate: creator.engagement_rate != null ? String(creator.engagement_rate) : "",
    rates: creator.rates ?? "",
    tags: (creator.tags ?? []).join(", "),
    content_types: (creator.content_types ?? []).join(", "),
    creator_type: creator.creator_type ?? "",
    availability: creator.availability ?? "available",
    available_for_remote: creator.available_for_remote === true,
    avatar_url: creator.avatar_url ?? "",
    approved: creator.approved === true,
    is_verified: creator.is_verified === true,
    is_trending: creator.is_trending === true,
  };
}

function CreatorsContent() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  const [slideOpen, setSlideOpen] = useState(false);
  const [slideTitle, setSlideTitle] = useState("Add Creator");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slideInitial, setSlideInitial] = useState<typeof emptyForm | null>(null);
  const [slidePortfolioImages, setSlidePortfolioImages] = useState<string[]>([]);
  const [slideVideoUrls, setSlideVideoUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Creator | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkToast, setBulkToast] = useState<string | null>(null);

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/creators");
      const data = await res.json();
      if (Array.isArray(data)) setCreators(data);
      else setError("Failed to load creators");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCreators(); }, [fetchCreators]);

  const openAdd = () => {
    setEditingId(null);
    setSlideInitial(null);
    setSlidePortfolioImages([]);
    setSlideVideoUrls([]);
    setSlideTitle("Add Creator");
    setSlideOpen(true);
  };

  const openEdit = (creator: Creator) => {
    setEditingId(creator.id);
    setSlideInitial(toFormValues(creator));
    setSlidePortfolioImages(creator.portfolio_images ?? []);
    setSlideVideoUrls(creator.video_urls ?? (creator.video_url ? [creator.video_url] : []));
    setSlideTitle("Edit Creator");
    setSlideOpen(true);
  };

  const handleSave = async (form: typeof emptyForm, portfolioUrls: string[], videoUrls: string[]) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        display_name: form.display_name.trim(),
        bio: form.bio || null,
        tagline: form.tagline || null,
        location: form.location || null,
        region: form.region || null,
        country: form.country || null,
        instagram: form.instagram || null,
        tiktok: form.tiktok || null,
        followers: form.followers ? Number(form.followers) : null,
        tiktok_followers: form.tiktok_followers ? Number(form.tiktok_followers) : null,
        engagement_rate: form.engagement_rate ? Number(form.engagement_rate) : null,
        rates: form.rates || null,
        creator_type: form.creator_type || null,
        availability: form.availability || null,
        available_for_remote: form.available_for_remote,
        avatar_url: form.avatar_url || null,
        approved: form.approved,
        tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        content_types: form.content_types ? form.content_types.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        is_verified: form.is_verified,
        is_trending: form.is_trending,
        ...(portfolioUrls.length > 0 ? { portfolio_images: portfolioUrls } : {}),
        ...(videoUrls.length > 0 ? { video_urls: videoUrls, video_url: videoUrls[0] } : {}),
      };

      if (editingId) {
        await fetch("/api/creators", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        await fetch("/api/creators", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setSlideOpen(false);
      await fetchCreators();
    } catch {
      alert("Failed to save creator");
    } finally {
      setSaving(false);
    }
  };

  const sendApprovalNotification = async (creator: Creator) => {
    const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
    const SVC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
        method: "POST",
        headers: {
          apikey: SVC_KEY,
          Authorization: `Bearer ${SVC_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          user_id: creator.id,
          type: "system",
          title: "Your profile is live! 🎉",
          body: "Congrats! Your Lumeya creator profile has been approved. Brands can now find and contact you.",
          link: "/creator-dashboard",
          read: false,
        }),
      });
    } catch {
      // Best-effort — don't crash approve flow
    }
  };

  const handleToggle = async (creator: Creator) => {
    const newApproved = !(creator.approved === true);
    await fetch("/api/creators", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: creator.id, approved: newApproved }),
    });
    if (newApproved) {
      await sendApprovalNotification(creator);
    }
    fetchCreators();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/creators?id=${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      await fetchCreators();
    } catch {
      alert("Failed to delete creator");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setBulkApproving(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch("/api/creators", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, approved: true }),
          })
        )
      );
      setBulkToast(`${selectedIds.size} creator${selectedIds.size > 1 ? "s" : ""} approved!`);
      setSelectedIds(new Set());
      await fetchCreators();
      setTimeout(() => setBulkToast(null), 3000);
    } catch {
      alert("Failed to bulk approve");
    } finally {
      setBulkApproving(false);
    }
  };

  const live = creators.filter((c) => c.approved === true).length;
  const pending = creators.filter((c) => c.approved === false).length;
  const hidden = creators.filter((c) => c.approved == null).length;
  const total = creators.length;

  const filtered = creators.filter((c) => {
    if (filter === "live" && c.approved !== true) return false;
    if (filter === "pending" && c.approved !== false) return false;
    if (filter === "hidden" && c.approved != null) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = (c.display_name ?? "").toLowerCase();
      const ig = (c.instagram ?? "").toLowerCase();
      const tk = (c.tiktok ?? "").toLowerCase();
      const reg = (c.region ?? "").toLowerCase();
      if (!name.includes(q) && !ig.includes(q) && !tk.includes(q) && !reg.includes(q)) return false;
    }
    return true;
  });

  const filterBtnStyle = (tab: FilterTab) => ({
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: filter === tab ? 500 : 400,
    cursor: "pointer",
    background: filter === tab ? "#eef2fa" : "transparent",
    color: filter === tab ? "#4a6fa5" : "var(--muted-foreground)",
    border: "none",
    transition: "all 0.15s",
  } as React.CSSProperties);

  const allFilteredIds = filtered.map(c => c.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.has(id));
  const someSelected = allFilteredIds.some(id => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        allFilteredIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        allFilteredIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tableHeaders = [
    "checkbox", "", "Name / Tagline", "Region", "Instagram", "TikTok",
    "IG Followers", "ER%", "Type", "Availability", "Badges", "Status", "Created", "Actions"
  ];

  return (
    <div className="space-y-4 max-w-full">
      {/* Success toast */}
      {bulkToast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white"
          style={{ background: "#166534" }}>
          ✓ {bulkToast}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-3">
          {[
            { label: "Live", value: live, color: "#166534", bg: "#dcfce7" },
            { label: "Pending", value: pending, color: "#92400e", bg: "#fef3c7" },
            { label: "Hidden", value: hidden, color: "#6b7280", bg: "#f3f4f6" },
            { label: "Total", value: total, color: "var(--foreground)", bg: "var(--card-bg)" },
          ].map((s) => (
            <div key={s.label} className="px-4 py-2 rounded-xl border text-sm font-medium"
              style={{ background: s.bg, color: s.color, borderColor: "transparent" }}>
              {s.value} {s.label}
            </div>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkApprove}
              disabled={bulkApproving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "#166534" }}>
              <Check size={14} />
              {bulkApproving ? "Approving…" : `Approve Selected (${selectedIds.size})`}
            </button>
          )}
          <button
            onClick={() => {
              const headers = ["Name","Instagram","TikTok","Region","Followers","TikTok Followers","ER%","Rates","Type","Availability","Approved","Created"];
              const rows = filtered.map(c => [
                c.display_name, c.instagram||"", c.tiktok||"", c.region||"",
                c.followers||0, c.tiktok_followers||0, c.engagement_rate||0,
                c.rates||"", c.creator_type||"", c.availability||"", c.approved?"Yes":"No",
                new Date(c.created_at).toLocaleDateString()
              ]);
              const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href=url; a.download="lumeya-creators.csv"; a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40 border"
            style={{ borderColor: "var(--border)", background: "var(--card-bg)", color: "var(--foreground)" }}>
            <Download size={14} />
            Export CSV
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ background: "#4a6fa5" }}>
            <Plus size={15} />
            Add Creator
          </button>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, Instagram, TikTok, region…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: "var(--border)", background: "var(--card-bg)", color: "var(--foreground)" }}
          />
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--muted)" }}>
          {(["all", "live", "pending", "hidden"] as FilterTab[]).map((t) => (
            <button key={t} onClick={() => setFilter(t)} style={filterBtnStyle(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Loading creators…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            {search || filter !== "all" ? "No creators match your filter." : "No creators yet. Add one!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </th>
                  {tableHeaders.slice(1).map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "var(--muted-foreground)" }}>{h === "checkbox" ? "" : h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((creator, i) => (
                  <tr key={creator.id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(creator.id)}
                        onChange={() => toggleSelect(creator.id)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3"><Avatar creator={creator} /></td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-medium" style={{ color: "var(--foreground)" }}>{creator.display_name || "—"}</div>
                      {creator.tagline && <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{creator.tagline}</div>}
                      {creator.location && <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>📍 {creator.location}</div>}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {creator.region || "—"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {creator.instagram ? (
                        <a href={`https://instagram.com/${creator.instagram}`} target="_blank" rel="noreferrer"
                          className="underline text-xs" style={{ color: "var(--primary)" }}>
                          @{creator.instagram}
                        </a>
                      ) : <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {creator.tiktok ? (
                        <a href={`https://tiktok.com/@${creator.tiktok}`} target="_blank" rel="noreferrer"
                          className="underline text-xs" style={{ color: "var(--primary)" }}>
                          @{creator.tiktok}
                        </a>
                      ) : <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {fmtFollowers(creator.followers)}
                      {creator.tiktok_followers && (
                        <div className="text-xs opacity-70">TT: {fmtFollowers(creator.tiktok_followers)}</div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {creator.engagement_rate != null ? `${creator.engagement_rate}%` : "—"}
                    </td>
                    <td className="px-3 py-3"><CreatorTypeBadge type={creator.creator_type} /></td>
                    <td className="px-3 py-3 whitespace-nowrap"><AvailabilityBadge status={creator.availability} /></td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {creator.is_verified && (
                          <span title="Verified"><BadgeCheck size={14} style={{ color: "#3b82f6" }} /></span>
                        )}
                        {creator.is_trending && (
                          <span title="Trending"><TrendingUp size={14} style={{ color: "#f59e0b" }} /></span>
                        )}
                        {!creator.is_verified && !creator.is_trending && (
                          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3"><StatusBadge approved={creator.approved} /></td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(creator.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {creator.approved === true ? (
                          <button onClick={() => handleToggle(creator)}
                            className="px-2.5 py-1 rounded-md text-xs font-medium transition-opacity hover:opacity-80"
                            style={{ background: "#f3f4f6", color: "#6b7280" }}>Hide</button>
                        ) : (
                          <button onClick={() => handleToggle(creator)}
                            className="px-2.5 py-1 rounded-md text-xs font-medium transition-opacity hover:opacity-80"
                            style={{ background: "#dcfce7", color: "#166534" }}>Approve</button>
                        )}
                        <button onClick={() => openEdit(creator)}
                          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                          title="Edit">
                          <Pencil size={13} style={{ color: "#4a6fa5" }} />
                        </button>
                        <button onClick={() => setDeleteTarget(creator)}
                          className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete">
                          <Trash2 size={13} style={{ color: "#ef4444" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        onSave={handleSave}
        initial={slideInitial}
        title={slideTitle}
        saving={saving}
        initialPortfolioImages={slidePortfolioImages}
        initialVideoUrls={slideVideoUrls}
      />

      <DeleteDialog
        creator={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
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
