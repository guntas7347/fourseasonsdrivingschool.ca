import { NextRequest, NextResponse } from "next/server";
import { syncGoogleReviewsAction } from "@/lib/googleReviews";

/**
 * Scheduled Cron Endpoint to update Google Reviews
 * Compatible with Vercel Cron, GitHub Actions, and external cron services (cron-job.org)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is configured, enforce security
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const searchParamKey = req.nextUrl.searchParams.get("key");
      if (searchParamKey !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
      }
    }

    // Force update if query param force=true is passed, otherwise update if > 10 days old
    const force = req.nextUrl.searchParams.get("force") === "true";
    const result = await syncGoogleReviewsAction(force);

    return NextResponse.json({
      success: result.success,
      message: "Google reviews cron synchronization finished.",
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Cron sync-reviews error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to execute cron sync",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
