"use client";
import { useState, useRef } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from "lucide-react";

type DeviceMode = "desktop" | "tablet" | "mobile";

const devices: { mode: DeviceMode; label: string; icon: React.FC<{ size: number }>; width: string }[] = [
  { mode: "desktop", label: "Desktop", icon: Monitor, width: "100%" },
  { mode: "tablet", label: "Tablet", icon: Tablet, width: "768px" },
  { mode: "mobile", label: "Mobile", icon: Smartphone, width: "390px" },
];

const BASE_URL = "https://lumeya-connect.vercel.app";

const quickPages = [
  { label: "Home", path: "/" },
  { label: "Creators", path: "/creators" },
  { label: "Sign up", path: "/signup" },
  { label: "Login", path: "/login" },
  { label: "Dashboard", path: "/dashboard" },
];

export default function PreviewPage() {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [currentPath, setCurrentPath] = useState("/");
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentDevice = devices.find((d) => d.mode === device)!;
  const currentUrl = BASE_URL + currentPath;

  return (
    <AuthGate>
      <AppShell title="Live Preview">
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Device switcher */}
            <div className="flex rounded-lg border p-0.5 gap-0.5" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
              {devices.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.mode}
                    onClick={() => setDevice(d.mode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
                    style={{
                      background: device === d.mode ? "var(--card-bg)" : "transparent",
                      color: device === d.mode ? "var(--primary)" : "var(--muted-foreground)",
                      fontWeight: device === d.mode ? 500 : 400,
                      boxShadow: device === d.mode ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    <Icon size={14} />
                    {d.label}
                  </button>
                );
              })}
            </div>

            {/* Quick pages */}
            <div className="flex gap-1.5 flex-wrap">
              {quickPages.map((page) => (
                <button
                  key={page.path}
                  onClick={() => { setCurrentPath(page.path); setKey((k) => k + 1); }}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-all"
                  style={{
                    borderColor: currentPath === page.path ? "var(--primary)" : "var(--border)",
                    color: currentPath === page.path ? "var(--primary)" : "var(--muted-foreground)",
                    background: currentPath === page.path ? "#eef2fa" : "var(--card-bg)",
                  }}
                >
                  {page.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setKey((k) => k + 1)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              >
                <RefreshCw size={12} />
                Refresh
              </button>
              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--primary)" }}
              >
                <ExternalLink size={12} />
                Open
              </a>
            </div>
          </div>

          {/* URL bar */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs" style={{ borderColor: "var(--border)", background: "var(--muted)", color: "var(--muted-foreground)" }}>
            <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            {currentUrl}
            {currentDevice.mode !== "desktop" && (
              <span className="ml-auto">{currentDevice.width}</span>
            )}
          </div>

          {/* iframe container */}
          <div
            className="rounded-xl border overflow-hidden flex justify-center"
            style={{ borderColor: "var(--border)", background: "#f0f0f0", minHeight: 500 }}
          >
            <div
              style={{
                width: currentDevice.width,
                transition: "width 0.3s ease",
                height: 600,
              }}
            >
              <iframe
                key={key}
                ref={iframeRef}
                src={currentUrl}
                className="w-full h-full border-0"
                title="Lumeya Connect Preview"
              />
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGate>
  );
}
