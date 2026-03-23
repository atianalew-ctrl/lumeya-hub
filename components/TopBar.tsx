"use client";
import { Menu, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
}

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.refresh();
    window.location.reload();
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-5 border-b sticky top-0 z-10"
      style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={18} style={{ color: "var(--muted-foreground)" }} />
        </button>
        <h1 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{title}</h1>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        style={{ color: "var(--muted-foreground)" }}
      >
        <LogOut size={14} />
        Logout
      </button>
    </header>
  );
}
