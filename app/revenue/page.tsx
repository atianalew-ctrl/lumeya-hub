"use client";
import { useState, useEffect } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";

interface Payment {
  id: string;
  campaign_id: string | null;
  budget: number | null;
  platform_fee: number | null;
  creator_payout: number | null;
  status: string | null;
  created_at: string;
}

function fmtEur(n: number): string {
  return `€${n.toLocaleString("en-EU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const steps = [
  {
    num: 1,
    done: true,
    title: "Platform ready",
    desc: "Your Lumeya Hub is live and connected to Supabase.",
    action: null,
  },
  {
    num: 2,
    done: true,
    title: "Stripe keys configured",
    desc: "Test keys are configured. Publishable key: pk_test_51TEnXSC… — Secret key stored as Supabase edge function secret.",
    action: { label: "Open Stripe Dashboard ↗", href: "https://dashboard.stripe.com", external: true },
  },
  {
    num: 3,
    done: false,
    title: "Add keys to Vercel",
    desc: null,
    instructions: [
      "Go to vercel.com → lumeya-connect project → Settings → Environment Variables",
      "Add STRIPE_SECRET_KEY = sk_live_...",
      "Add STRIPE_PUBLISHABLE_KEY = pk_live_...",
      "Add STRIPE_WEBHOOK_SECRET = whsec_...",
      "Redeploy the project after adding keys",
    ],
    action: { label: "Open Vercel ↗", href: "https://vercel.com/dashboard", external: true },
  },
  {
    num: 4,
    done: false,
    title: "Deploy stripe-checkout edge function",
    desc: null,
    instructions: [
      "1. Install Supabase CLI: npm install -g supabase",
      "2. Login: supabase login",
      "3. Link project: supabase link --project-ref xbgdynlutmosupfqafap",
      "4. Set secret: supabase secrets set STRIPE_SECRET_KEY=sk_test_...",
      "5. Deploy: supabase functions deploy stripe-checkout",
      "6. Test: supabase functions invoke stripe-checkout --body '{\"type\":\"campaign\",\"amount\":100,\"brand_email\":\"test@test.com\",\"campaign_id\":\"test\"}'",
      "Edge function file: lumeya-connect/supabase/functions/stripe-checkout/index.ts",
    ],
    action: { label: "Open Supabase Functions ↗", href: "https://supabase.com/dashboard/project/xbgdynlutmosupfqafap/functions", external: true },
  },
  {
    num: 5,
    done: false,
    title: "Test a payment",
    desc: "Once live, test end-to-end with a €1 campaign to verify the full flow.",
    action: null,
  },
];

function SetupStep({ step, index }: { step: typeof steps[0]; index: number }) {
  const [open, setOpen] = useState(index === 1); // default open second step

  return (
    <div className="border rounded-xl overflow-hidden transition-all"
      style={{
        borderColor: step.done ? "#bbf7d0" : "var(--border)",
        background: step.done ? "#f0fdf4" : "var(--card-bg)",
      }}>
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        onClick={() => !step.done && setOpen(o => !o)}>
        <div className="flex-shrink-0">
          {step.done ? (
            <CheckCircle2 size={22} style={{ color: "#22c55e" }} />
          ) : (
            <Circle size={22} style={{ color: "var(--muted-foreground)" }} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Step {step.num}</span>
            {step.done && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "#dcfce7", color: "#166534" }}>Done</span>
            )}
          </div>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--foreground)" }}>{step.title}</p>
        </div>
        {!step.done && (
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{open ? "▲" : "▼"}</span>
        )}
      </button>

      {(open || step.done) && (step.desc || step.instructions || step.action) && (
        <div className="px-5 pb-4 space-y-3" style={{ paddingLeft: "calc(20px + 22px + 16px)" }}>
          {step.desc && (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{step.desc}</p>
          )}
          {step.instructions && (
            <div className="rounded-lg p-3 space-y-1.5"
              style={{ background: "#f8fafc", border: "1px solid var(--border)" }}>
              {step.instructions.map((ins, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: "var(--primary)" }}>
                    {i + 1}.
                  </span>
                  <p className="text-xs" style={{ color: "#374151" }}>
                    {ins.includes("=") ? (
                      <>
                        {ins.split("=")[0]}={" "}
                        <code className="px-1 py-0.5 rounded text-xs font-mono"
                          style={{ background: "#e5e7eb", color: "#111827" }}>
                          {ins.split("=").slice(1).join("=")}
                        </code>
                      </>
                    ) : ins}
                  </p>
                </div>
              ))}
            </div>
          )}
          {step.action && (
            <a
              href={step.action.href}
              target={step.action.external ? "_blank" : undefined}
              rel={step.action.external ? "noreferrer" : undefined}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#4a6fa5" }}>
              {step.action.label}
              {step.action.external && <ExternalLink size={12} />}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function RevenueContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          "https://xbgdynlutmosupfqafap.supabase.co/rest/v1/payments?select=id,campaign_id,budget,platform_fee,creator_payout,status,created_at&order=created_at.desc",
          {
            headers: {
              apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs",
              Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs",
            },
          }
        );
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalBudget = payments.reduce((s, p) => s + (p.budget || 0), 0);
  const totalFees = payments.reduce((s, p) => s + (p.platform_fee || 0), 0);
  const totalPayouts = payments.reduce((s, p) => s + (p.creator_payout || 0), 0);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Setup Wizard */}
      <div className="rounded-xl border p-5" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        <div className="mb-5">
          <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>💳 Stripe Setup Wizard</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Follow these steps to enable payment processing for campaigns.
          </p>
        </div>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <SetupStep key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>

      {/* Live Payment Data */}
      <div className="rounded-xl border p-5" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--foreground)" }}>📊 Live Payment Data</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: "var(--muted)" }} />
            ))}
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="rounded-lg p-4 text-center" style={{ background: "#f0fdf4" }}>
                <p className="text-xl font-bold" style={{ color: "#166534" }}>{fmtEur(totalBudget)}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#166534" }}>Total Budget</p>
              </div>
              <div className="rounded-lg p-4 text-center" style={{ background: "#eff6ff" }}>
                <p className="text-xl font-bold" style={{ color: "#1e40af" }}>{fmtEur(totalFees)}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#1e40af" }}>Platform Fees (12%)</p>
              </div>
              <div className="rounded-lg p-4 text-center" style={{ background: "#faf5ff" }}>
                <p className="text-xl font-bold" style={{ color: "#6d28d9" }}>{fmtEur(totalPayouts)}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#6d28d9" }}>Creator Payouts</p>
              </div>
            </div>

            {/* Payments table */}
            {payments.length === 0 ? (
              <div className="rounded-lg px-5 py-8 text-center border-2 border-dashed"
                style={{ borderColor: "var(--border)" }}>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No transactions yet — payments will appear here once Stripe is connected and campaigns are funded.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                      {["Campaign ID", "Budget", "Platform Fee", "Creator Payout", "Status", "Date"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--muted-foreground)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={p.id}
                        style={{ borderBottom: i < payments.length - 1 ? "1px solid var(--border)" : "none" }}
                        className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                          {p.campaign_id ? p.campaign_id.substring(0, 8) + "…" : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                          {p.budget ? fmtEur(p.budget) : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "#1e40af" }}>
                          {p.platform_fee ? fmtEur(p.platform_fee) : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "#6d28d9" }}>
                          {p.creator_payout ? fmtEur(p.creator_payout) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {p.status ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                              style={{
                                background: p.status === "released" ? "#dcfce7" : p.status === "funded" ? "#dbeafe" : "#fef3c7",
                                color: p.status === "released" ? "#166534" : p.status === "funded" ? "#1e40af" : "#92400e",
                              }}>
                              {p.status}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                          {new Date(p.created_at).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Revenue Model info */}
      <div className="rounded-xl border p-5" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>💡 Revenue Model</h2>
        <div className="space-y-3">
          {[
            {
              num: "1", title: "Transaction Fee (12%)",
              desc: "Primary revenue stream — taken from each campaign payment before creator payout.",
              color: "#4a6fa5",
            },
            {
              num: "2", title: "Brand Subscription",
              desc: "€99–299/month for premium brand features (Phase 5).",
              color: "#6b8fc5",
            },
            {
              num: "3", title: "Creator Tools",
              desc: "€9–29/month for media kit builder and AI matchmaker (Phase 5).",
              color: "#8fa8d0",
            },
          ].map(item => (
            <div key={item.num} className="flex items-start gap-4 p-4 rounded-lg" style={{ background: "#f9fafb" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                style={{ background: item.color }}>{item.num}</div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{item.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RevenuePage() {
  return (
    <AuthGate>
      <AppShell title="Revenue">
        <RevenueContent />
      </AppShell>
    </AuthGate>
  );
}
