"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Upload, X, Copy } from "lucide-react";

const supabase = createClient(
  "https://xbgdynlutmosupfqafap.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDkzODQsImV4cCI6MjA4OTA4NTM4NH0.TFModn0Tm_eZDR9NpDTzxn7Yq1aAiNCc-qSAnMtADys"
);

const STATIC_CREATORS = [
  {
    display_name: "Ronja Aaslund",
    instagram: "@ronjaaaslund",
    location: "Stockholm, SE",
    tagline: "UGC Creator",
    bio: "Scandinavian minimalistic vibe, specialised in lifestyle and beauty brands. Known for clean, editorial UGC that converts.",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    followers: 42800,
    engagement_rate: 5.2,
  },
  {
    display_name: "Nikoline Amelia",
    instagram: "@nikolineamelia",
    location: "France",
    tagline: "UGC Creator",
    bio: "Fashion and lifestyle content creator. Creates authentic, relatable videos for sustainable brands.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    followers: 38900,
    engagement_rate: 4.8,
  },
  {
    display_name: "Sussie Agger",
    instagram: "@sussieagger",
    location: "Copenhagen, Denmark",
    tagline: "Content Creator",
    bio: "Copenhagen-based creator and social media strategist. Every piece of content I make is designed to stop the scroll and drive action.",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    followers: 89000,
    engagement_rate: 6.1,
  },
  {
    display_name: "Amalie Asheim",
    instagram: "@amalieash",
    location: "Bali / Dubai",
    tagline: "UGC Creator",
    bio: "Luxury lifestyle creator. Specializes in high-end beauty, fashion, and wellness content.",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    followers: 124000,
    engagement_rate: 7.2,
  },
  {
    display_name: "Nella Ryglova",
    instagram: "@nellaryglova",
    location: "Bali / Dubai",
    tagline: "UGC Creator",
    bio: "Minimalist creator specialised in voiceovers, food and fashion. My content feels effortless because I obsess over every detail.",
    avatar_url: "https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=400&q=80",
    followers: 67500,
    engagement_rate: 5.9,
  },
  {
    display_name: "Celina Beck",
    instagram: "@celinabeck",
    location: "Austin, TX",
    tagline: "UGC Creator",
    bio: "Beauty and lifestyle creator. Known for authentic, high-converting UGC content.",
    avatar_url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&q=80",
    followers: 54300,
    engagement_rate: 5.5,
  },
  {
    display_name: "Daniel Voss",
    instagram: "@danielvoss",
    location: "Berlin, Germany",
    tagline: "Creator",
    bio: "Tech and lifestyle creator focusing on product reviews and tutorials.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    followers: 45600,
    engagement_rate: 4.9,
  },
  {
    display_name: "Sakura Tanaka",
    instagram: "@sakura.tanaka",
    location: "Tokyo, Japan",
    tagline: "UGC Creator",
    bio: "Asian beauty and fashion specialist. Creates premium UGC for luxury brands.",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    followers: 78900,
    engagement_rate: 6.3,
  },
];

export default function CreatorProfiles() {
  const [creators, setCreators] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(0);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from("lumeya_creators")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCreators(data);
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
          setFormData(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch creators:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportStaticCreators = async () => {
    if (!window.confirm("Import 8 static creators (Ronja, Nikoline, Sussie, Amalie, Nella, Celina, Daniel, Sakura)?")) return;
    setImporting(true);
    try {
      const { data, error } = await supabase.from("lumeya_creators").insert(
        STATIC_CREATORS.map((c) => ({
          display_name: c.display_name,
          instagram: c.instagram,
          location: c.location,
          tagline: c.tagline,
          bio: c.bio,
          avatar_url: c.avatar_url,
          followers: c.followers,
          engagement_rate: c.engagement_rate,
          approved: true,
          created_at: new Date().toISOString(),
        }))
      ).select();

      if (!error) {
        alert("✓ 8 static creators imported!");
        await fetchCreators();
      } else {
        alert("Error: " + error.message);
      }
    } catch (err) {
      alert("Error: " + (err as any).message);
    } finally {
      setImporting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedId) return;
    try {
      const { error } = await supabase
        .from("lumeya_creators")
        .update(formData)
        .eq("id", selectedId);

      if (!error) {
        alert("✓ Draft saved");
      } else {
        alert("Error: " + error.message);
      }
    } catch (err) {
      alert("Error: " + (err as any).message);
    }
  };

  const handlePublish = async () => {
    if (!selectedId) return;
    try {
      const { error } = await supabase
        .from("lumeya_creators")
        .update({ ...formData, approved: true })
        .eq("id", selectedId);

      if (!error) {
        alert("✓ Published!");
      } else {
        alert("Error: " + error.message);
      }
    } catch (err) {
      alert("Error: " + (err as any).message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading creators…</div>;

  return (
    <div className="min-h-screen bg-accent">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-display font-normal tracking-tight">Creator Profiles</h1>
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">← Back</Link>
          </div>
          <p className="text-muted-foreground">Edit and manage creator profiles with live preview</p>
        </div>

        {/* Import Button */}
        <div className="mb-8 p-6 bg-card rounded-2xl border border-border">
          <button
            onClick={handleImportStaticCreators}
            disabled={importing}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {importing ? "Importing…" : "🚀 Import 8 Static Creators"}
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            Ronja, Nikoline, Sussie, Amalie, Nella, Celina, Daniel, Sakura → Supabase
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Editor */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold mb-6">Editor</h2>

            {/* Creator Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Select Creator</label>
              <select
                value={selectedId || ""}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedId(id);
                  const creator = creators.find((c) => c.id === id);
                  setFormData(creator || {});
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm"
              >
                <option value="">-- Select --</option>
                {creators.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.display_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedId && (
              <div className="space-y-6">
                {/* Creator Type Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Type</label>
                  <div className="flex gap-2">
                    {["UGC Creator", "Influencer", "Both"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, creator_type: type })}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                          formData.creator_type === type
                            ? "bg-slate-800 text-white"
                            : "border border-border hover:border-foreground/30"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Photo</label>
                  {formData.avatar_url && (
                    <img src={formData.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover mb-2" />
                  )}
                  <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-foreground/30 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Upload size={14} /> Choose image
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setFormData({ ...formData, avatar_url: ev.target?.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Basic Fields */}
                <fieldset className="space-y-3">
                  <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Basic</legend>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.display_name || ""}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Tagline (e.g., UGC Creator)"
                    value={formData.tagline || ""}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
                  />
                  <textarea
                    placeholder="Bio"
                    value={formData.bio || ""}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm resize-none"
                  />
                </fieldset>

                {/* Location */}
                <input
                  type="text"
                  placeholder="Location (City, Country)"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
                />

                {/* Content & Tags */}
                <fieldset className="space-y-3">
                  <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</legend>
                  <input
                    type="text"
                    placeholder="Content types (comma-separated: UGC, Reels, TikTok)"
                    value={Array.isArray(formData.content_types) ? formData.content_types.join(", ") : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, content_types: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Niche tags (comma-separated: Lifestyle, Beauty, Minimal)"
                    value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
                  />
                </fieldset>

                {/* Social */}
                <fieldset className="space-y-3">
                  <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Social</legend>
                  <input
                    type="text"
                    placeholder="Instagram (@username)"
                    value={formData.instagram || ""}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
                  />
                  <input
                    type="text"
                    placeholder="TikTok (@username)"
                    value={formData.tiktok || ""}
                    onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Followers"
                      value={formData.followers || ""}
                      onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Engagement %"
                      value={formData.engagement_rate || ""}
                      onChange={(e) => setFormData({ ...formData, engagement_rate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
                    />
                  </div>
                </fieldset>

                {/* Professional */}
                <fieldset className="space-y-3">
                  <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Professional</legend>
                  <input
                    type="text"
                    placeholder="Languages (English, Danish, Swedish)"
                    value={Array.isArray(formData.languages) ? formData.languages.join(", ") : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, languages: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Rate card (€150-300/video)"
                    value={formData.rates || ""}
                    onChange={(e) => setFormData({ ...formData, rates: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Response time (Same day)"
                    value={formData.response_time || ""}
                    onChange={(e) => setFormData({ ...formData, response_time: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm"
                  />
                </fieldset>

                {/* Admin Section */}
                <div className="p-4 bg-accent rounded-lg space-y-4">
                  <h3 className="font-semibold text-sm text-foreground">Admin Only</h3>
                  <textarea
                    placeholder="Internal notes"
                    value={formData.internal_notes || ""}
                    onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-sm resize-none"
                  />
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured_creator === true}
                        onChange={(e) => setFormData({ ...formData, featured_creator: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Featured Creator</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_verified === true}
                        onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Verified</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_trending === true}
                        onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Trending</span>
                    </label>
                  </div>
                </div>

                {/* Save Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={handleSaveDraft}
                    className="flex-1 px-4 py-2 border border-border rounded-full hover:bg-accent transition-colors text-sm font-medium"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => {
                      handlePublish();
                      setLastRefresh(Date.now());
                    }}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors text-sm font-medium"
                  >
                    Save & Publish
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Live Preview */}
          <div className="bg-card rounded-2xl border border-border p-6 sticky top-8 max-h-screen overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Live Preview</h2>
              {selectedId && (
                <a
                  href={`https://lumeya-connect.vercel.app/creators/${selectedId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  ↗ Open
                </a>
              )}
            </div>

            {selectedId ? (
              <iframe
                key={`${selectedId}-${lastRefresh}`}
                src={`https://lumeya-connect.vercel.app/creators/${selectedId}?t=${lastRefresh}`}
                className="flex-1 w-full rounded-xl border border-border"
                title="Creator Profile Preview"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <p className="text-muted-foreground text-sm">No creator selected</p>
                  <p className="text-xs text-muted-foreground mt-1">Choose one from the dropdown above</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
