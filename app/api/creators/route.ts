import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";

const headers = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const SELECT_FIELDS = "id,display_name,bio,tagline,avatar_url,instagram,tiktok,followers,tiktok_followers,engagement_rate,approved,created_at,region,location,tags,content_types,languages,availability,is_verified,is_trending,rates,creator_type,available_for_remote";

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lumeya_creators?select=${SELECT_FIELDS}&order=created_at.desc`,
      { headers, next: { revalidate: 0 } }
    );
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      display_name, bio, tagline, instagram, tiktok,
      followers, tiktok_followers, engagement_rate,
      region, location, country, avatar_url, approved,
      rates, creator_type, availability, available_for_remote,
      tags, content_types, languages,
    } = body;

    if (!display_name) {
      return NextResponse.json({ error: "display_name is required" }, { status: 400 });
    }

    const payload: Record<string, unknown> = { display_name };
    if (bio !== undefined) payload.bio = bio;
    if (tagline !== undefined) payload.tagline = tagline;
    if (instagram !== undefined) payload.instagram = instagram;
    if (tiktok !== undefined) payload.tiktok = tiktok;
    if (followers !== undefined) payload.followers = followers;
    if (tiktok_followers !== undefined) payload.tiktok_followers = tiktok_followers;
    if (engagement_rate !== undefined) payload.engagement_rate = engagement_rate;
    if (region !== undefined) payload.region = region;
    if (location !== undefined) payload.location = location;
    if (country !== undefined) payload.country = country;
    if (avatar_url !== undefined) payload.avatar_url = avatar_url;
    if (approved !== undefined) payload.approved = approved;
    if (rates !== undefined) payload.rates = rates;
    if (creator_type !== undefined) payload.creator_type = creator_type;
    if (availability !== undefined) payload.availability = availability;
    if (available_for_remote !== undefined) payload.available_for_remote = available_for_remote;
    if (tags !== undefined) payload.tags = tags;
    if (content_types !== undefined) payload.content_types = content_types;
    if (languages !== undefined) payload.languages = languages;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lumeya_creators`,
      {
        method: "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(payload),
      }
    );
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
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const allowed = [
      "display_name", "bio", "tagline", "instagram", "tiktok",
      "followers", "tiktok_followers", "engagement_rate",
      "region", "location", "country", "avatar_url", "approved",
      "rates", "creator_type", "availability", "available_for_remote",
      "tags", "content_types", "languages",
    ];

    const payload: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in fields) payload[key] = fields[key];
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lumeya_creators?id=eq.${id}`,
      {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    const data = await res.json();

    // Fire-and-forget email notification when creator is approved
    if (fields.approved === true) {
      const creatorRes = await fetch(
        `${SUPABASE_URL}/rest/v1/lumeya_creators?id=eq.${id}&select=display_name,email`,
        { headers }
      );
      const creators = await creatorRes.json();
      if (creators[0]?.email) {
        fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "creator_approved",
            data: {
              creatorName: creators[0].display_name,
              creatorEmail: creators[0].email,
              platformUrl: "https://lumeya-connect.vercel.app",
            },
          }),
        }).catch(() => {}); // fire and forget
      }
    }

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

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lumeya_creators?id=eq.${id}`,
      {
        method: "DELETE",
        headers: { ...headers, Prefer: "return=representation" },
      }
    );
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
