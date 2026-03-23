"use client";
import { useState, useEffect } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { GitCommit, ExternalLink, RefreshCw, Rocket } from "lucide-react";

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function DeploysContent() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommits = () => {
    setLoading(true);
    fetch("/api/commits")
      .then((r) => r.json())
      .then((d) => { setCommits(d); setLoading(false); })
      .catch(() => { setLoading(false); });
  };

  useEffect(() => { fetchCommits(); }, []);

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Last 15 commits on <span className="font-mono font-medium">atianalew-ctrl/lumeya-connect</span> main
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchCommits}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--primary)" }}
          >
            <Rocket size={12} />
            Open Vercel
          </a>
        </div>
      </div>

      {/* Deploy Note */}
      <div className="rounded-xl p-4 border" style={{ background: "#fffbf0", borderColor: "#f0e4b0" }}>
        <p className="text-xs font-medium mb-1" style={{ color: "#92610a" }}>Auto-deploy enabled</p>
        <p className="text-xs" style={{ color: "#a07020" }}>
          Every push to <span className="font-mono">main</span> triggers a Vercel deployment automatically. Monitor at{" "}
          <a href="https://vercel.com/atianalew-ctrl/lumeya-connect" target="_blank" rel="noreferrer" className="underline">
            vercel.com
          </a>
        </p>
      </div>

      {/* Commits list */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            Loading commits…
          </div>
        ) : commits.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            No commits found. Check GitHub PAT permissions.
          </div>
        ) : (
          <div className="divide-y" style={{ background: "var(--card-bg)" }}>
            {commits.map((commit, idx) => (
              <div key={commit.sha} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
                <div className="mt-0.5 flex-shrink-0">
                  <GitCommit size={14} style={{ color: idx === 0 ? "var(--primary)" : "var(--muted-foreground)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {idx === 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: "#eef2fa", color: "var(--primary)" }}>
                        Latest
                      </span>
                    )}
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                      {commit.sha}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{commit.message}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {commit.author} · {timeAgo(commit.date)}
                  </p>
                </div>
                <a
                  href={commit.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 p-1.5 rounded hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink size={12} style={{ color: "var(--muted-foreground)" }} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DeploysPage() {
  return (
    <AuthGate>
      <AppShell title="Deploy Log">
        <DeploysContent />
      </AppShell>
    </AuthGate>
  );
}
