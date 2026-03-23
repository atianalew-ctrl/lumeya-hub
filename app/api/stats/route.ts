import { NextResponse } from "next/server";

const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";

async function countTable(table: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: "count=exact",
        "Range-Unit": "items",
        Range: "0-0",
      },
      next: { revalidate: 60 },
    });
    const cr = res.headers.get("content-range");
    if (cr) {
      const total = cr.split("/")[1];
      return total === "*" ? "—" : parseInt(total);
    }
    return "—";
  } catch {
    return "—";
  }
}

export async function GET() {
  const [creators, waitlist, opportunities] = await Promise.all([
    countTable("profiles"),
    countTable("waitlist"),
    countTable("opportunities"),
  ]);

  return NextResponse.json({
    creators,
    pendingApprovals: "—",
    waitlistSignups: waitlist,
    openOpportunities: opportunities,
  });
}
