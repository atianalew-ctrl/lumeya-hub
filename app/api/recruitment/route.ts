import { NextResponse } from "next/server";

const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";

const headers = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export const PRIORITY_CREATORS = [
  { id: "priority-1", name: "Ronja Aaslund", instagram: "@ronjaaa", note: "Priority" },
  { id: "priority-2", name: "Nikoline Amelia", instagram: "@nikoline.amelia", note: "Priority" },
  { id: "priority-3", name: "Sussie Agger", instagram: "@sussieagger", note: "Priority" },
  { id: "priority-4", name: "Amalie Asheim", instagram: "@amalieasheim", note: "Priority" },
  { id: "priority-5", name: "Nella Ryglova", instagram: "@nella.ryglova", note: "Priority" },
  { id: "priority-6", name: "Celina Beck", instagram: "@celinabeck", note: "Priority" },
  { id: "priority-7", name: "Daniel", instagram: "@daniel.ugc", note: "Last name TBD" },
  { id: "priority-8", name: "Sakura", instagram: "@sakura.creates", note: "Last name TBD" },
];

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lumeya_creators?select=id,display_name,instagram,email,created_at,approved&approved=eq.false&order=created_at.desc`,
      { headers, next: { revalidate: 0 } }
    );
    if (!res.ok) {
      return NextResponse.json({ priority: PRIORITY_CREATORS, pending: [] });
    }
    const pending = await res.json();
    return NextResponse.json({ priority: PRIORITY_CREATORS, pending: Array.isArray(pending) ? pending : [] });
  } catch {
    return NextResponse.json({ priority: PRIORITY_CREATORS, pending: [] });
  }
}
