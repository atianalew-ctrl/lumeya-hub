import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";

export default function RevenuePage() {
  return (
    <AuthGate>
      <AppShell title="Revenue">
        <div className="space-y-6 max-w-2xl">

          {/* Coming Soon Banner */}
          <div className="rounded-xl p-6 border-2 border-dashed text-center"
            style={{ borderColor: "#4a6fa5", background: "#f0f4fa" }}>
            <p className="text-3xl mb-2">🚀</p>
            <p className="text-lg font-semibold mb-1" style={{ color: "#4a6fa5" }}>Coming in Phase 5</p>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              Revenue tracking, payout management, and financial reporting will be live once the payment system launches.
            </p>
          </div>

          {/* Revenue Model */}
          <div className="rounded-xl border p-5" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--foreground)" }}>📊 Planned Revenue Model</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg" style={{ background: "#f9fafb" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                  style={{ background: "#4a6fa5" }}>1</div>
                <div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: "var(--foreground)" }}>Transaction Fee</p>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    <strong>12% fee</strong> on all campaign payments · 88% goes to the creator
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>Primary revenue stream</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg" style={{ background: "#f9fafb" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                  style={{ background: "#6b8fc5" }}>2</div>
                <div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: "var(--foreground)" }}>Brand Subscription</p>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    <strong>€99–299/month</strong> for premium brand access, advanced search, and analytics
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>Phase 5 launch feature</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg" style={{ background: "#f9fafb" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                  style={{ background: "#8fa8d0" }}>3</div>
                <div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: "var(--foreground)" }}>Creator Tools</p>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    <strong>€9–29/month</strong> for media kit builder, portfolio tools, and AI matchmaker
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>Phase 5 launch feature</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="rounded-xl border p-5" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>📈 Current Status</h2>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: "#d1d5db" }}></div>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                <strong>0</strong> paid campaigns to date — in pre-launch phase
              </p>
            </div>
          </div>

        </div>
      </AppShell>
    </AuthGate>
  );
}
