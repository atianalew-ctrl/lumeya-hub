import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getOrCreateTestAccount(type: "brand" | "creator") {
  const email = type === "brand" ? "brand-preview@lumeya.com" : "creator-preview@lumeya.com";

  // Check if user already exists
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Error listing users:", listError);
  }

  let user = existingUsers?.users.find((u) => u.email === email);

  // If user doesn't exist, create one
  if (!user) {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-16), // Random password, won't be used
      email_confirm: true,
    });

    if (createError) {
      console.error("Error creating user:", createError);
      throw new Error("Failed to create test user");
    }

    user = newUser.user;

    // Also create profile record in lumeya_creators or brands table
    if (type === "creator") {
      await supabase.from("lumeya_creators").insert({
        id: user.id,
        display_name: "Preview Creator",
        email,
        approved: true,
        created_at: new Date().toISOString(),
      });
    } else {
      // For brands, insert into a brands table (create if needed)
      try {
        await supabase.from("brands").insert({
          id: user.id,
          email,
          name: "Preview Brand",
          subscription_status: "active",
          subscription_plan: "growth",
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        // Table might not exist, that's okay
        console.error("Error creating brand record:", err);
      }
    }
  }

  if (!user) {
    throw new Error("Failed to get or create test user");
  }

  return user;
}

async function generateMagicLink(email: string, redirectTo: string): Promise<string> {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error("Error generating magic link:", error);
    throw new Error("Failed to generate magic link");
  }

  if (!data?.properties?.action_link) {
    throw new Error("No action link in response");
  }

  return data.properties.action_link;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (!type || !["brand", "creator"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Get or create test account
    const user = await getOrCreateTestAccount(type);

    // Generate magic link
    const redirectTo =
      type === "brand"
        ? `https://lumeya-connect.vercel.app/dashboard`
        : `https://lumeya-connect.vercel.app/creator-dashboard`;

    const link = await generateMagicLink(user.email!, redirectTo);

    return NextResponse.json({ link });
  } catch (error) {
    console.error("Preview link error:", error);
    return NextResponse.json(
      { error: (error as any).message || "Failed to generate preview link" },
      { status: 500 }
    );
  }
}
