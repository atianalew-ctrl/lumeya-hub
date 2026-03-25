import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://xbgdynlutmosupfqafap.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZ2R5bmx1dG1vc3VwZnFhZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwOTM4NCwiZXhwIjoyMDg5MDg1Mzg0fQ.zfdL0QkL_5nmZeuC-LAsd50-UsAIgqiCsJiDY5rklXs";

const baseHeaders = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
};

async function countQuery(table: string, filter?: string): Promise<number> {
  try {
    const url = filter
      ? `${SUPABASE_URL}/rest/v1/${table}?select=id&${filter}`
      : `${SUPABASE_URL}/rest/v1/${table}?select=id`;
    const res = await fetch(url, {
      headers: {
        ...baseHeaders,
        Prefer: "count=exact",
        "Range-Unit": "items",
        Range: "0-0",
      },
    });
    const cr = res.headers.get("content-range");
    if (cr) {
      const total = cr.split("/")[1];
      return total === "*" ? 0 : parseInt(total) || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

async function fetchAll(table: string, select = "*", filter?: string): Promise<Record<string, unknown>[]> {
  try {
    const url = filter
      ? `${SUPABASE_URL}/rest/v1/${table}?select=${select}&${filter}`
      : `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;
    const res = await fetch(url, { headers: baseHeaders });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const daysParam = searchParams.get("days");
  const days = daysParam ? parseInt(daysParam) : 30;

  const now = new Date();
  const ago7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const ago30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ago30Cal = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();

  // Period filter based on ?days=
  const periodFilter = days > 0
    ? `created_at=gte.${new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()}`
    : undefined;

  const [
    totalCreators,
    approvedCreators,
    pendingCreators,
    totalOpportunities,
    openOpportunities,
    closedOpportunities,
    pendingOpportunities,
    totalCampaigns,
    pendingCampaigns,
    activeCampaigns,
    completedCampaigns,
    cancelledCampaigns,
    totalProfileViews,
    views7,
    views30,
    profileViewsPeriod,
    totalFeedPosts,
    photoFeedPosts,
    videoFeedPosts,
    totalSubmissions,
    totalApplications,
    pendingApplications,
    acceptedApplications,
    rejectedApplications,
    applicationsPeriod,
    totalWaitlist,
    payments,
    allOpportunities,
    creatorsByRegion,
    topCreators,
    newCreatorsPeriod,
  ] = await Promise.all([
    countQuery("lumeya_creators"),
    countQuery("lumeya_creators", "approved=eq.true"),
    countQuery("lumeya_creators", "approved=eq.false"),
    countQuery("opportunities"),
    countQuery("opportunities", "status=eq.open"),
    countQuery("opportunities", "status=eq.closed"),
    countQuery("opportunities", "status=eq.pending"),
    countQuery("campaigns"),
    countQuery("campaigns", "status=eq.pending"),
    countQuery("campaigns", "status=eq.active"),
    countQuery("campaigns", "status=eq.completed"),
    countQuery("campaigns", "status=eq.cancelled"),
    countQuery("profile_views"),
    countQuery("profile_views", `created_at=gte.${ago7}`),
    countQuery("profile_views", `created_at=gte.${ago30}`),
    periodFilter ? countQuery("profile_views", periodFilter) : countQuery("profile_views", `created_at=gte.${ago30}`),
    countQuery("feed_posts"),
    countQuery("feed_posts", "type=eq.photo"),
    countQuery("feed_posts", "type=eq.reel"),
    countQuery("campaign_submissions"),
    countQuery("applications"),
    countQuery("applications", "status=eq.pending"),
    countQuery("applications", "status=eq.accepted"),
    countQuery("applications", "status=eq.rejected"),
    periodFilter ? countQuery("applications", periodFilter) : countQuery("applications", `created_at=gte.${ago30}`),
    countQuery("brand_waitlist"),
    fetchAll("payments", "budget,platform_fee,creator_payout,status"),
    fetchAll("opportunities", "application_count"),
    fetchAll("lumeya_creators", "region", "approved=eq.true"),
    fetchAll("lumeya_creators", "id,display_name,followers", "approved=eq.true&order=followers.desc&limit=5"),
    periodFilter ? countQuery("lumeya_creators", periodFilter) : countQuery("lumeya_creators", `created_at=gte.${ago30Cal}`),
  ]);

  // Payment sums
  let totalBudget = 0;
  let totalPlatformFee = 0;
  let totalCreatorPayout = 0;
  let fundedPayments = 0;
  let releasedPayments = 0;
  let pendingPayments = 0;
  for (const p of payments) {
    totalBudget += Number(p.budget) || 0;
    totalPlatformFee += Number(p.platform_fee) || 0;
    totalCreatorPayout += Number(p.creator_payout) || 0;
    if (p.status === "funded") fundedPayments++;
    else if (p.status === "released") releasedPayments++;
    else pendingPayments++;
  }

  // Applications per opportunity
  let totalAppCount = 0;
  for (const o of allOpportunities) {
    totalAppCount += Number(o.application_count) || 0;
  }
  const avgAppsPerOpp = totalOpportunities > 0
    ? Math.round((totalAppCount / totalOpportunities) * 10) / 10
    : 0;

  // Region breakdown
  const regionMap: Record<string, number> = {};
  for (const c of creatorsByRegion) {
    const r = (c.region as string) || "Unknown";
    regionMap[r] = (regionMap[r] || 0) + 1;
  }
  const byRegion = Object.entries(regionMap)
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    period: { days },
    creators: {
      total: totalCreators,
      approved: approvedCreators,
      pending: pendingCreators,
      byRegion,
      topByFollowers: topCreators,
    },
    opportunities: {
      total: totalOpportunities,
      open: openOpportunities,
      closed: closedOpportunities,
      pending: pendingOpportunities,
      totalApplications: totalAppCount,
      avgApplications: avgAppsPerOpp,
    },
    campaigns: {
      total: totalCampaigns,
      byStatus: {
        pending: pendingCampaigns,
        active: activeCampaigns,
        completed: completedCampaigns,
        cancelled: cancelledCampaigns,
      },
    },
    payments: {
      totalBudget,
      totalPlatformFee,
      totalCreatorPayout,
      byStatus: {
        funded: fundedPayments,
        released: releasedPayments,
        pending: pendingPayments,
      },
    },
    profileViews: {
      total: totalProfileViews,
      last7days: views7,
      last30days: views30,
      period: profileViewsPeriod,
    },
    content: {
      total: totalFeedPosts + totalSubmissions,
      photos: photoFeedPosts,
      videos: videoFeedPosts,
      submissions: totalSubmissions,
    },
    applications: {
      total: totalApplications,
      period: applicationsPeriod,
      byStatus: {
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
      },
    },
    waitlist: {
      total: totalWaitlist,
    },
    growth: {
      newCreatorsPeriod,
    },
  });
}
