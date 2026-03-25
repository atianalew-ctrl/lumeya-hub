import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";

const headers = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export async function GET() {
  try {
    const [feedRes, subRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/feed_posts?select=*&order=created_at.desc`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/campaign_submissions?select=*&order=created_at.desc`, { headers }),
    ]);

    const [feedPosts, submissions] = await Promise.all([feedRes.json(), subRes.json()]);

    const feed = Array.isArray(feedPosts)
      ? feedPosts.map((p: Record<string, unknown>) => ({ ...p, source: "feed" }))
      : [];
    const subs = Array.isArray(submissions)
      ? submissions.map((s: Record<string, unknown>) => ({ ...s, source: "submission" }))
      : [];

    // Merge and sort by created_at desc
    const merged = [...feed, ...subs].sort(
      (a, b) => new Date((b as Record<string, unknown>).created_at as string).getTime() - new Date((a as Record<string, unknown>).created_at as string).getTime()
    );

    return NextResponse.json(merged);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const source = searchParams.get("source");

  if (!id || !source) {
    return NextResponse.json({ error: "Missing id or source" }, { status: 400 });
  }

  const table = source === "feed" ? "feed_posts" : "campaign_submissions";

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status, review_comment } = body;

    const payload: Record<string, unknown> = {};
    if (status) payload.status = status;
    if (review_comment !== undefined) payload.review_comment = review_comment;
    payload.updated_at = new Date().toISOString();

    const res = await fetch(`${SUPABASE_URL}/rest/v1/campaign_submissions?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
