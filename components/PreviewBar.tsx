"use client";

import { useState } from "react";
import { ExternalLink, Loader } from "lucide-react";

export default function PreviewBar() {
  const [loading, setLoading] = useState<"brand" | "creator" | null>(null);

  const generateMagicLink = async (type: "brand" | "creator") => {
    setLoading(type);
    try {
      const res = await fetch("/api/preview-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const { link } = await res.json();
      if (link) {
        window.open(link, "_blank");
      } else {
        alert("Failed to generate preview link");
      }
    } catch (err) {
      alert("Error: " + (err as any).message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-slate-700 border-b border-slate-600 px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Preview site as:</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => generateMagicLink("brand")}
            disabled={loading === "brand"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-500 bg-slate-600 text-white hover:bg-slate-500 disabled:opacity-50 transition-colors"
          >
            {loading === "brand" ? <Loader size={12} className="animate-spin" /> : <ExternalLink size={12} />}
            View as Brand →
          </button>
          <button
            onClick={() => generateMagicLink("creator")}
            disabled={loading === "creator"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-500 bg-slate-600 text-white hover:bg-slate-500 disabled:opacity-50 transition-colors"
          >
            {loading === "creator" ? <Loader size={12} className="animate-spin" /> : <ExternalLink size={12} />}
            View as Creator →
          </button>
          <a
            href="https://lumeya-connect.vercel.app/creators"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-500 bg-slate-600 text-white hover:bg-slate-500 transition-colors"
          >
            <ExternalLink size={12} />
            View Public →
          </a>
        </div>
      </div>
    </div>
  );
}
