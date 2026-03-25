import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";

const headers = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

function isTableMissingError(errText: string): boolean {
  return (
    errText.includes("relation") &&
    (errText.includes("does not exist") || errText.includes("brand_crm"))
  );
}

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/brand_crm?select=id,company_name,contact_name,contact_email,stage,notes,website,instagram,last_activity_date,revenue_generated,created_at&order=created_at.desc`,
      { headers, next: { revalidate: 0 } }
    );
    if (!res.ok) {
      const err = await res.text();
      if (res.status === 404 || isTableMissingError(err)) {
        return NextResponse.json({ error: err, needsSetup: true }, { status: 200 });
      }
      return NextResponse.json({ error: err }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      company_name, contact_name, contact_email, stage,
      notes, website, instagram, last_activity_date, revenue_generated,
    } = body;

    if (!company_name) {
      return NextResponse.json({ error: "company_name is required" }, { status: 400 });
    }

    const payload: Record<string, unknown> = { company_name };
    if (contact_name !== undefined) payload.contact_name = contact_name;
    if (contact_email !== undefined) payload.contact_email = contact_email;
    if (stage !== undefined) payload.stage = stage;
    if (notes !== undefined) payload.notes = notes;
    if (website !== undefined) payload.website = website;
    if (instagram !== undefined) payload.instagram = instagram;
    if (last_activity_date !== undefined) payload.last_activity_date = last_activity_date;
    if (revenue_generated !== undefined) payload.revenue_generated = revenue_generated;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/brand_crm`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      if (res.status === 404 || isTableMissingError(err)) {
        return NextResponse.json({ error: err, needsSetup: true }, { status: 200 });
      }
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
      "company_name", "contact_name", "contact_email", "stage",
      "notes", "website", "instagram", "last_activity_date", "revenue_generated",
    ];
    const payload: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) payload[key] = body[key];
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/brand_crm?id=eq.${id}`, {
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

    const res = await fetch(`${SUPABASE_URL}/rest/v1/brand_crm?id=eq.${id}`, {
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
