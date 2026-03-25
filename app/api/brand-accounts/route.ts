import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";

const headers = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export async function GET() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/brand_profiles?select=*&order=created_at.desc`,
    { headers }
  );
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  if (body.status !== undefined) allowed.status = body.status;
  if (body.is_suspended !== undefined) allowed.is_suspended = body.is_suspended;
  // Add any other fields as needed

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/brand_profiles?id=eq.${id}`,
    {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(allowed),
    }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
