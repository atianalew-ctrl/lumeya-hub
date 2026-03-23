import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
      <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Item({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs min-w-[140px] flex-shrink-0 pt-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="text-xs underline break-all" style={{ color: "var(--primary)" }}>{value}</a>
      ) : (
        <span className="text-xs font-mono break-all" style={{ color: "var(--foreground)" }}>{value}</span>
      )}
    </div>
  );
}

function TaskItem({ done, text }: { done?: boolean; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs mt-0.5 flex-shrink-0">{done ? "✅" : "⬜"}</span>
      <span className="text-xs" style={{ color: done ? "var(--muted-foreground)" : "var(--foreground)", textDecoration: done ? "line-through" : "none" }}>{text}</span>
    </div>
  );
}

export default function DocsPage() {
  return (
    <AuthGate>
      <AppShell title="Project Docs">
        <div className="max-w-3xl grid gap-4">

          {/* Stack */}
          <Section title="🛠 Tech Stack">
            <Item label="Frontend" value="React + TypeScript + Vite + shadcn/ui + Tailwind CSS" />
            <Item label="Backend" value="Supabase (PostgreSQL + Auth + Storage)" />
            <Item label="Hosting" value="Vercel (frontend), Supabase cloud (backend)" />
            <Item label="Auth" value="Supabase Auth — magic link + OAuth" />
            <Item label="Payments" value="Stripe (planned Phase 4)" />
            <Item label="Email" value="Resend / Supabase Edge Functions (planned)" />
          </Section>

          {/* Live URLs */}
          <Section title="🔗 Live URLs">
            <Item label="Production site" value="lumeya-connect.vercel.app" href="https://lumeya-connect.vercel.app" />
            <Item label="GitHub repo" value="github.com/atianalew-ctrl/lumeya-connect" href="https://github.com/atianalew-ctrl/lumeya-connect" />
            <Item label="Supabase dashboard" value="supabase.com/dashboard/project/xbgdynlutmosupfqafap" href="https://supabase.com/dashboard/project/xbgdynlutmosupfqafap" />
            <Item label="Vercel dashboard" value="vercel.com/atianalew-ctrl/lumeya-connect" href="https://vercel.com/atianalew-ctrl/lumeya-connect" />
            <Item label="Dev hub (this)" value="lumeya-hub.vercel.app" href="https://lumeya-hub.vercel.app" />
          </Section>

          {/* Supabase Tables */}
          <Section title="🗄 Supabase Tables">
            <Item label="profiles" value="Creator + brand user profiles (linked to auth.users)" />
            <Item label="waitlist" value="Pre-launch waitlist emails" />
            <Item label="opportunities" value="Brand campaign briefs / collaboration posts" />
            <Item label="applications" value="Creator applications to opportunities" />
            <Item label="contracts" value="Agreements between brands and creators" />
            <Item label="payments" value="Transaction records (Phase 4)" />
            <Item label="reviews" value="Ratings + feedback (Phase 4)" />
          </Section>

          {/* Atiana's Pending Tasks */}
          <Section title="✅ Atiana's Pending Tasks">
            <TaskItem done text="Set up Supabase project" />
            <TaskItem done text="Create GitHub repo (atianalew-ctrl/lumeya-connect)" />
            <TaskItem done text="Deploy to Vercel" />
            <TaskItem text="Approve creator profile design mockup" />
            <TaskItem text="Write copy for landing page hero section" />
            <TaskItem text="Set up Resend account for email" />
            <TaskItem text="Define creator approval criteria" />
            <TaskItem text="Connect custom domain (lumeya.com or lumeya.dk)" />
            <TaskItem text="Set up Stripe account for Phase 4" />
            <TaskItem text="Review initial creator waitlist submissions" />
          </Section>

          {/* Key Decisions */}
          <Section title="🧠 Key Decisions">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--foreground)" }}>Creator-first community model</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Lumeya leads with creators (not brands). Build a trusted creator network first, then bring brands to a curated pool.</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--foreground)" }}>Nordic market focus</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Starting in Denmark / Nordics. Nordic brands, local creators. Less competition, better trust.</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--foreground)" }}>Freemium brand model</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Brands browse for free, pay per collaboration. Creators earn through completed gigs (platform takes 10-15%).</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--foreground)" }}>No social follower requirements</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Focus on content quality, not vanity metrics. UGC creators valued equally to influencers.</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--foreground)" }}>Scandinavian minimal design</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Clean, trustworthy UI that appeals to Nordic aesthetic. Ivory/white palette, Inter font, slate blue primary.</p>
              </div>
            </div>
          </Section>

          {/* Competitors */}
          <Section title="🥊 Competitor Landscape">
            <Item label="Billo" value="UGC focus, US-centric, video heavy" />
            <Item label="Insense" value="Full UGC marketplace, strong Europe presence" />
            <Item label="Influee" value="Creator marketplace, EU-friendly" />
            <Item label="Popular Pays" value="Enterprise brands, US focused" />
            <Item label="Cohley" value="Content testing platform, brand-heavy" />
            <Item label="Aspire" value="Full influencer suite, complex, expensive" />
            <Item label="Our edge" value="Nordic-first, creator-led community, simple pricing" />
          </Section>

        </div>
      </AppShell>
    </AuthGate>
  );
}
