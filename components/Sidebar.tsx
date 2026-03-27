"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Megaphone, ListChecks, TrendingUp, BookOpen, X, Briefcase, Building2, UserCheck, Film, BarChart2, MessageSquare, Send, UserPlus, Shield, Map } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/site-map", label: "Site Navigator", icon: Map },
  { href: "/creators", label: "Creators", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/brands", label: "Brands", icon: Building2 },
  { href: "/brand-accounts", label: "Brand Accounts", icon: UserCheck },
  { href: "/content", label: "Content Vault", icon: Film },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/community", label: "Community", icon: MessageSquare },
  { href: "/waitlist", label: "Waitlist", icon: ListChecks },
  { href: "/revenue", label: "Revenue", icon: TrendingUp },
  { href: "/outreach", label: "Outreach", icon: Send },
  { href: "/recruitment", label: "Recruitment", icon: UserPlus },
  { href: "/consent", label: "GDPR & Consent", icon: Shield },
  { href: "/docs", label: "Docs", icon: BookOpen },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          width: 220,
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-14 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--primary)" }}>
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Lumeya HQ</span>
          {onClose && (
            <button onClick={onClose} className="ml-auto lg:hidden p-1 rounded">
              <X size={16} style={{ color: "var(--muted-foreground)" }} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: active ? "#eef2fa" : "transparent",
                  color: active ? "var(--primary)" : "var(--muted-foreground)",
                  fontWeight: active ? 500 : 400,
                }}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Version */}
        <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Lumeya HQ · v2.1</p>
        </div>
      </aside>
    </>
  );
}
