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
      <span className="text-xs min-w-[160px] flex-shrink-0 pt-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</span>
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
            <Item label="Payments" value="Stripe (planned Phase 5)" />
            <Item label="Email" value="Resend / Supabase Edge Functions (planned)" />
          </Section>

          {/* Live URLs */}
          <Section title="🔗 Live URLs">
            <Item label="Production site" value="lumeya-connect.vercel.app" href="https://lumeya-connect.vercel.app" />
            <Item label="Dev Hub (this)" value="lumeya.mlfrance.dev" href="https://lumeya.mlfrance.dev" />
            <Item label="Admin panel" value="lumeya-connect.vercel.app/admin/dashboard" href="https://lumeya-connect.vercel.app/admin/dashboard" />
            <Item label="Admin password" value="lumeya2026" />
            <Item label="GitHub repo" value="github.com/atianalew-ctrl/lumeya-connect" href="https://github.com/atianalew-ctrl/lumeya-connect" />
            <Item label="Supabase dashboard" value="supabase.com/dashboard/project/xbgdynlutmosupfqafap" href="https://supabase.com/dashboard/project/xbgdynlutmosupfqafap" />
          </Section>

          {/* Supabase Tables */}
          <Section title="🗄 Supabase Tables">
            <Item label="lumeya_creators" value="Creator profiles — the core talent table" />
            <Item label="waitlist" value="Pre-launch waitlist emails" />
            <Item label="opportunities" value="Brand campaign briefs / collaboration posts" />
            <Item label="profiles" value="User profiles linked to auth.users" />
            <Item label="campaigns" value="Full campaign records with status + budget" />
            <Item label="campaign_creators" value="Many-to-many: campaigns ↔ creators" />
            <Item label="whitelisting_requests" value="Creator whitelisting / ad permission requests" />
            <Item label="ad_library" value="Approved ad creatives library" />
            <Item label="contracts" value="Agreements between brands and creators" />
            <Item label="community_posts" value="Creator community feed posts" />
            <Item label="notifications" value="In-app notifications" />
            <Item label="brand_waitlist" value="Brands waiting to join platform" />
            <Item label="briefs" value="Campaign creative briefs" />
          </Section>

          {/* Atiana's Pending Tasks */}
          <Section title="✅ Atiana's Pending Tasks">
            <TaskItem done text="Set up Supabase project" />
            <TaskItem done text="Create GitHub repo (atianalew-ctrl/lumeya-connect)" />
            <TaskItem done text="Deploy to Vercel" />
            <TaskItem text="Buy lumeya.io domain (~€10 on namecheap.com)" />
            <TaskItem text="Upgrade Supabase to Pro ($25/mo) — prevents DB going offline" />
            <TaskItem text="Set up hello@lumeya.io email" />
            <TaskItem text="Get OpenAI API key → send to Audrey for AI Matchmaker" />
            <TaskItem text="Create Stripe account → send keys to Audrey for payments" />
            <TaskItem text="Create @joinlumeya Instagram + LinkedIn page" />
            <TaskItem text="Get signed consent from 8 creators (Ronja, Nikoline, Sussie, Amalie, Nella, Celina, Daniel, Sakura)" />
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
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--foreground)" }}>12% Lumeya / 88% creator fee model</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Lumeya takes 12% of all campaign transactions. Creators keep 88%. Transparent, creator-friendly pricing vs competitors who take 20-30%.</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--foreground)" }}>Full campaign + whitelisting system</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Campaigns, whitelisting requests, ad library, contracts, and briefs all built into the platform. Not just a matchmaking tool — full workflow infrastructure.</p>
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
            <Item label="Our edge" value="Nordic-first, creator-led community, 12% transparent fee" />
          </Section>

        </div>
      </AppShell>
    </AuthGate>
  );
}
