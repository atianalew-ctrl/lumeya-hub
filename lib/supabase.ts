const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";

async function supabaseQuery(table: string, select = "count", filter?: string) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter ? `&${filter}` : ""}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "count=exact",
    },
  });
  if (!res.ok) return null;
  const count = res.headers.get("content-range");
  if (count) {
    const parts = count.split("/");
    return parts[1] ? parseInt(parts[1]) : 0;
  }
  return null;
}

export async function getStats() {
  const [creators, waitlist, opportunities] = await Promise.all([
    supabaseQuery("profiles", "id"),
    supabaseQuery("waitlist", "id"),
    supabaseQuery("opportunities", "id"),
  ]);

  return {
    creators: creators ?? "—",
    pendingApprovals: "—",
    waitlistSignups: waitlist ?? "—",
    openOpportunities: opportunities ?? "—",
  };
}
