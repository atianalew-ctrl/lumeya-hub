import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";

const headers = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const SELECT_FIELDS = "id,title,brand_name,category,description,overview,deliverables,budget_min,budget_max,budget_display,deadline,location,timeline,tags,status,application_count,created_at,updated_at";

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/opportunities?select=${SELECT_FIELDS}&order=created_at.desc`,
      { headers, next: { revalidate: 0 } }
    );
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    const data = await res.json();

    // Auto-expire passed deadlines (fire-and-forget)
    const today = new Date().toISOString().split("T")[0];
    fetch(`${SUPABASE_URL}/rest/v1/opportunities?status=eq.open&deadline=lt.${today}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ status: "closed" }),
    }).catch(() => {});

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title, brand_name, category, description, overview,
      deliverables, budget_min, budget_max, budget_display,
      deadline, location, timeline, tags, status,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const payload: Record<string, unknown> = { title };
    if (brand_name !== undefined) payload.brand_name = brand_name;
    if (category !== undefined) payload.category = category;
    if (description !== undefined) payload.description = description;
    if (overview !== undefined) payload.overview = overview;
    if (deliverables !== undefined) payload.deliverables = deliverables;
    if (budget_min !== undefined) payload.budget_min = budget_min;
    if (budget_max !== undefined) payload.budget_max = budget_max;
    if (budget_display !== undefined) payload.budget_display = budget_display;
    if (deadline !== undefined) payload.deadline = deadline;
    if (location !== undefined) payload.location = location;
    if (timeline !== undefined) payload.timeline = timeline;
    if (tags !== undefined) payload.tags = tags;
    if (status !== undefined) payload.status = status;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/opportunities`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json();
    const allowed = [
      "title", "brand_name", "category", "description", "overview",
      "deliverables", "budget_min", "budget_max", "budget_display",
      "deadline", "location", "timeline", "tags", "status",
    ];
    const payload: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) payload[key] = body[key];
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/opportunities?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await fetch(`${SUPABASE_URL}/rest/v1/opportunities?id=eq.${id}`, {
      method: "DELETE",
      headers: { ...headers, Prefer: "return=representation" },
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
