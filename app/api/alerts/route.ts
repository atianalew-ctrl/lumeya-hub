import { NextResponse } from "next/server";

const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";

async function countQuery(table: string, filter: string): Promise<number> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=id&${filter}`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          Prefer: "count=exact",
          "Range-Unit": "items",
          Range: "0-0",
        },
        next: { revalidate: 0 },
      }
    );
    const cr = res.headers.get("content-range");
    if (cr) {
      const total = cr.split("/")[1];
      return total === "*" ? 0 : parseInt(total);
    }
    return 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  const todayMidnight = new Date();
  todayMidnight.setUTCHours(0, 0, 0, 0);
  const todayISO = todayMidnight.toISOString();

  const [pendingCreators, newWaitlistToday, pendingCampaigns] = await Promise.all([
    countQuery("lumeya_creators", "approved=eq.false"),
    countQuery("brand_waitlist", `created_at=gte.${todayISO}`),
    countQuery("campaigns", "status=eq.pending"),
  ]);

  return NextResponse.json({ pendingCreators, newWaitlistToday, pendingCampaigns });
}
