"use server";

import { revalidatePath as rp } from "next/cache";

export async function revalidatePaths(paths: string[]) {
  for (const p of paths) {
    try {
      rp(p);
    } catch {
      // In Next.js 15+, revalidatePath() is not permitted during a React Server Component render pass.
      // Silently catching here allows actions to safely execute during page rendering (e.g. payment confirmation)
      // while preserving normal cache revalidation when actions are invoked from client triggers.
    }
  }
}

/**
 * Hard-refreshes the entire website cache across all pages and layouts
 */
export async function hardRevalidateAllAction(): Promise<{
  success: boolean;
  message: string;
  timestamp: string;
}> {
  try {
    // Invalidate the root layout - purges full route/page cache hierarchy
    rp("/", "layout");

    // Explicitly revalidate all known key endpoints
    const routesToPurge = [
      "/",
      "/packages",
      "/packages/buy",
      "/booking",
      "/bookings",
      "/gallery",
      "/policy",
      "/privacy",
      "/privacy-policy",
      "/school-policy",
      "/admin",
      "/admin/bookings",
      "/admin/slots",
      "/admin/slots/new",
      "/admin/packages",
      "/admin/packages/new",
      "/admin/purchased-packages",
      "/admin/transactions",
      "/admin/config",
      "/admin/faqs",
      "/admin/gallery",
    ];

    for (const route of routesToPurge) {
      try {
        rp(route, "page");
      } catch {}
    }

    const time = new Date().toLocaleTimeString("en-CA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return {
      success: true,
      message: "Full website cache successfully purged (revalidatePath('/', 'layout')).",
      timestamp: time,
    };
  } catch (error: any) {
    console.error("hardRevalidateAllAction error:", error);
    return {
      success: false,
      message: error?.message || "Failed to purge cache.",
      timestamp: new Date().toLocaleTimeString(),
    };
  }
}
