"use client";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { ExternalLink, Lock, Globe, User, Briefcase, Eye } from "lucide-react";

const BASE = "https://lumeya-connect.vercel.app";

type PageItem = {
  path: string;
  label: string;
  desc: string;
  status?: "live" | "coming-soon" | "gated";
};

const PUBLIC_PAGES: PageItem[] = [
  { path: "/", label: "Homepage", desc: "Main landing — hero, creator reel, features, how it works" },
  { path: "/creators", label: "Browse Creators", desc: "Public creator marketplace listing" },
  { path: "/opportunities", label: "Opportunities", desc: "Open brand briefs creators can apply to" },
  { path: "/community", label: "Community", desc: "Creator community posts and feed" },
  { path: "/feed", label: "The Feed", desc: "Video content board — creator UGC reel" },
  { path: "/for-brands", label: "For Brands", desc: "Brand-facing landing page with market stats" },
  { path: "/pricing", label: "Pricing", desc: "Subscription plans — Starter, Growth, Black" },
  { path: "/black", label: "Lumeya Black", desc: "Premium/exclusive tier landing page" },
  { path: "/matchmaker", label: "AI Matchmaker", desc: "Public brand–creator matching tool" },
  { path: "/waitlist", label: "Waitlist", desc: "Brand waitlist signup" },
  { path: "/creator-signup", label: "Creator Signup", desc: "New creator registration" },
  { path: "/brand-login", label: "Brand Login", desc: "Brand sign in / sign up" },
  { path: "/privacy", label: "Privacy Policy", desc: "Legal" },
  { path: "/terms", label: "Terms of Service", desc: "Legal" },
  { path: "/contact", label: "Contact", desc: "Contact page" },
];

const BRAND_PAGES: PageItem[] = [
  { path: "/dashboard", label: "Brand Dashboard", desc: "Main hub — stats, checklist, quick actions, opportunities, messages", status: "gated" },
  { path: "/brand-onboarding", label: "Brand Onboarding", desc: "5-step wizard: account setup, industry, content needs, first action", status: "gated" },
  { path: "/brand-os", label: "Brand OS", desc: "AI workspace — content AI, creator hub, LinkedIn, schedule, analytics", status: "gated" },
  { path: "/brief", label: "Brief Generator", desc: "AI-powered campaign brief builder", status: "gated" },
  { path: "/post-opportunity", label: "Post Opportunity", desc: "Create a new brand brief for creators to apply", status: "gated" },
  { path: "/create-campaign", label: "Create Campaign", desc: "Launch a paid creator campaign with Stripe", status: "gated" },
  { path: "/my-campaigns", label: "My Campaigns", desc: "All brand campaigns — active, draft, completed", status: "gated" },
  { path: "/activate", label: "Content Activation", desc: "Turn UGC into paid ads — Meta/TikTok integration", status: "gated" },
  { path: "/analytics", label: "Analytics", desc: "Campaign performance — reach, engagement, ROI (coming soon)", status: "gated" },
  { path: "/contract", label: "Contract Signing", desc: "Generate and sign creator collaboration contracts", status: "gated" },
  { path: "/messages", label: "Messages", desc: "Direct conversations with creators", status: "gated" },
  { path: "/notifications", label: "Notifications", desc: "Brand alerts and activity", status: "gated" },
  { path: "/brand-management", label: "Brand Management", desc: "Lumeya Black — creator-run brand management (exclusive)", status: "gated" },
];

const CREATOR_PAGES: PageItem[] = [
  { path: "/creator-dashboard", label: "Creator Dashboard", desc: "Overview — collab requests, applications, opportunities", status: "gated" },
  { path: "/creator-edit", label: "Edit Profile", desc: "Update creator profile, portfolio, bio, rates", status: "gated" },
  { path: "/creator-onboarding", label: "Creator Onboarding", desc: "First-time setup wizard for new creators", status: "gated" },
  { path: "/messages", label: "Messages", desc: "Conversations with brands", status: "gated" },
  { path: "/notifications", label: "Notifications", desc: "Creator alerts — new briefs, collab requests", status: "gated" },
];

const ADMIN_PAGES: PageItem[] = [
  { path: "/admin", label: "Admin Panel", desc: "Creator approvals, portfolio management, data editing" },
];

function PageCard({ item, role }: { item: PageItem; role: "public" | "brand" | "creator" | "admin" }) {
  const colors = {
    public: { bg: "#f0f7ff", border: "#bfdbfe", icon: "#2563eb" },
    brand: { bg: "#f0fdf4", border: "#bbf7d0", icon: "#16a34a" },
    creator: { bg: "#fdf4ff", border: "#e9d5ff", icon: "#9333ea" },
    admin: { bg: "#fff7ed", border: "#fed7aa", icon: "#ea580c" },
  };
  const c = colors[role];

  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-2 hover:shadow-sm transition-all hover:-translate-y-0.5"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{item.label}</p>
            {item.status === "gated" && (
              <Lock size={11} className="shrink-0" style={{ color: c.icon }} />
            )}
          </div>
          <p className="font-mono text-[11px] mb-1.5" style={{ color: c.icon }}>{item.path}</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{item.desc}</p>
        </div>
        <a
          href={`${BASE}${item.path}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 p-1.5 rounded-lg hover:bg-white/60 transition-colors"
          title="Open on live site"
        >
          <ExternalLink size={14} style={{ color: c.icon }} />
        </a>
      </div>
    </div>
  );
}

function Section({
  title, icon, role, pages, desc
}: {
  title: string;
  icon: React.ReactNode;
  role: "public" | "brand" | "creator" | "admin";
  pages: PageItem[];
  desc: string;
}) {
  const roleColors = {
    public: "#2563eb",
    brand: "#16a34a",
    creator: "#9333ea",
    admin: "#ea580c",
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg text-white" style={{ background: roleColors[role] }}>
          {icon}
        </div>
        <div>
          <h2 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>{title}</h2>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
        </div>
        <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#f1f5f9", color: "var(--muted-foreground)" }}>
          {pages.length} pages
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pages.map((p) => (
          <PageCard key={p.path} item={p} role={role} />
        ))}
      </div>
    </section>
  );
}

function SiteMapContent() {
  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <div className="rounded-xl p-5 border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--foreground)" }}>Site Navigator</h1>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Every page on the live site, organized by who sees it. Click ↗ to open any page directly.
            </p>
          </div>
          <a
            href={BASE}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#1a1a1a" }}
          >
            <Globe size={14} /> Open Live Site
          </a>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          {[
            { color: "#2563eb", bg: "#f0f7ff", label: "Public — anyone can see" },
            { color: "#16a34a", bg: "#f0fdf4", label: "Brand — must be logged in as brand" },
            { color: "#9333ea", bg: "#fdf4ff", label: "Creator — must be logged in as creator" },
            { color: "#ea580c", bg: "#fff7ed", label: "Admin — Lumeya internal only" },
          ].map(({ color, bg, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2" style={{ background: bg, borderColor: color }} />
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <Lock size={12} style={{ color: "var(--muted-foreground)" }} />
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>= login required</span>
          </div>
        </div>
      </div>

      <Section
        title="Public Pages"
        icon={<Globe size={16} />}
        role="public"
        pages={PUBLIC_PAGES}
        desc="Visible to everyone — no login needed"
      />

      <Section
        title="Brand Portal"
        icon={<Briefcase size={16} />}
        role="brand"
        pages={BRAND_PAGES}
        desc="Only accessible to logged-in brand accounts"
      />

      <Section
        title="Creator Portal"
        icon={<User size={16} />}
        role="creator"
        pages={CREATOR_PAGES}
        desc="Only accessible to logged-in creator accounts"
      />

      <Section
        title="Admin"
        icon={<Eye size={16} />}
        role="admin"
        pages={ADMIN_PAGES}
        desc="Internal Lumeya admin panel"
      />
    </div>
  );
}

export default function SiteMapPage() {
  return (
    <AuthGate>
      <AppShell title="Site Navigator">
        <SiteMapContent />
      </AppShell>
    </AuthGate>
  );
}
