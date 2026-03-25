"use client";
import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { Shield, X, Copy, Check } from "lucide-react";

type Creator = {
  id: string;
  display_name: string;
  instagram: string;
  created_at: string;
};

const CONSENT_TEMPLATE = `Hi [Creator Name],

I'd love to feature your content on Lumeya, a creator marketplace connecting Nordic creators with brands.

By replying "I consent", you agree that Lumeya may:
• Display your name, Instagram handle, and portfolio images on lumeya-connect.vercel.app
• Show your profile to brands looking for creators
• Use your content examples to demonstrate the platform

You can withdraw consent at any time by contacting hello@lumeya.io

Best,
Atiana / Lumeya`;

function ConsentContent() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState<Record<string, "pending" | "received">>({} as Record<string, "pending" | "received">);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load consent state from localStorage
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("lumeya_consent_"));
      const state: Record<string, "pending" | "received"> = {};
      const noteState: Record<string, string> = {};
      keys.forEach(k => {
        const id = k.replace("lumeya_consent_", "");
        const val = localStorage.getItem(k);
        if (val === "received" || val === "pending") state[id] = val;
      });
      const ns = localStorage.getItem("lumeya_consent_notes");
      if (ns) Object.assign(noteState, JSON.parse(ns));
      setConsent(state);
      setNotes(noteState);
    } catch {}

    fetch("/api/consent")
      .then(r => r.json())
      .then(d => setCreators(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const toggleConsent = (id: string) => {
    const current = consent[id] || "pending";
    const next: "pending" | "received" = current === "pending" ? "received" : "pending";
    const updated: Record<string, "pending" | "received"> = { ...consent, [id]: next };
    setConsent(updated);
    localStorage.setItem(`lumeya_consent_${id}`, next);
  };

  const updateNote = (id: string, val: string) => {
    const updated = { ...notes, [id]: val };
    setNotes(updated);
    localStorage.setItem("lumeya_consent_notes", JSON.stringify(updated));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CONSENT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const receivedCount = creators.filter(c => consent[c.id] === "received").length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} style={{ color: "var(--primary)" }} />
            <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>GDPR & Consent</h1>
          </div>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Creator data consent tracking</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <Shield size={14} /> Consent Template
        </button>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6">
        <p className="text-sm text-blue-800 font-medium mb-1">GDPR Compliance</p>
        <p className="text-xs text-blue-700">
          GDPR requires explicit consent from creators for using their likeness and content commercially. Track consent status below.
          {creators.length > 0 && (
            <span className="ml-2 font-medium">
              {receivedCount}/{creators.length} creators have given consent.
            </span>
          )}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)", background: "var(--sidebar-bg)" }}>
          <h2 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Approved Creators</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>All creators currently on the platform</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Loading creators…</div>
        ) : creators.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No approved creators yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Creator", "Instagram", "Joined", "Consent Status", "Notes"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {creators.map((c, i) => {
                  const status = consent[c.id] || "pending";
                  return (
                    <tr key={c.id}
                      style={{ borderBottom: i < creators.length - 1 ? "1px solid var(--border)" : "none" }}
                      className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{c.display_name || "—"}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{c.instagram || "—"}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--muted-foreground)" }}>{fmt(c.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleConsent(c.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                          style={status === "received"
                            ? { background: "#dcfce7", borderColor: "#86efac", color: "#15803d" }
                            : { background: "#fef9c3", borderColor: "#fde047", color: "#a16207" }
                          }
                        >
                          {status === "received" && <Check size={11} />}
                          {status === "received" ? "Received" : "Pending"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={notes[c.id] || ""}
                          onChange={e => updateNote(c.id, e.target.value)}
                          placeholder="Add note…"
                          className="text-xs w-full bg-transparent border-b border-transparent focus:border-gray-200 focus:outline-none py-0.5 transition-colors"
                          style={{ color: "var(--muted-foreground)" }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Consent Template Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-sm">Consent Message Template</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-500 mb-3">Copy and send to creators via Instagram DM or email:</p>
              <pre className="bg-gray-50 rounded-xl p-4 text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed border border-gray-100">
                {CONSENT_TEMPLATE}
              </pre>
              <button
                onClick={handleCopy}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ background: copied ? "#15803d" : "var(--primary)" }}
              >
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy to clipboard</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConsentPage() {
  return (
    <AuthGate>
      <AppShell title="GDPR & Consent">
        <ConsentContent />
      </AppShell>
    </AuthGate>
  );
}
