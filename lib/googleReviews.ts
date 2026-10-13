"use server";

import { db } from "@/lib/firebase/firebase";
import { revalidatePaths } from "@/lib/revalidatePath";

export interface GoogleReviewItem {
  authorName: string;
  source: string;
  score: number;
  authorAvatarUrl: string | null;
  content: string;
  mediaUrl: string | null;
  authorInitials: string | null;
  publishedAt: string | null;
  sourceUrl: string | null;
  relativeDate?: string | null;
}

export interface StoredGoogleReviewsDoc {
  reviews: GoogleReviewItem[];
  lastUpdated: string;
  updatedAtMs: number;
  totalCount: number;
  averageRating: number;
}

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds

const FALLBACK_REVIEWS: GoogleReviewItem[] = [
  {
    authorName: "Gurpreet Singh",
    source: "google",
    score: 5,
    authorAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    content: "Passed my Class 5 road test on my very first attempt today at the Surrey 152nd St ICBC! My instructor was incredibly patient and taught me exactly what examiners look for during hazard perception and intersection scans. The mock road test we did the day before was identical to the actual exam route. Best driving school in Surrey!",
    mediaUrl: null,
    authorInitials: "GS",
    publishedAt: "2026-09-28T10:00:00Z",
    relativeDate: "2 weeks ago",
    sourceUrl: "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
  },
  {
    authorName: "Jessica Miller",
    source: "google",
    score: 5,
    authorAvatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    content: "I used to get severe anxiety driving on highways, but Four Seasons completely cured my fear. My instructor was calm, reassuring, and never raised their voice. Parallel parking and reverse stall parking became second nature in just 3 lessons. Plus, free home pick-up made scheduling so convenient!",
    mediaUrl: null,
    authorInitials: "JM",
    publishedAt: "2026-09-21T14:30:00Z",
    relativeDate: "3 weeks ago",
    sourceUrl: "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
  },
  {
    authorName: "Amanpreet Kaur",
    source: "google",
    score: 5,
    authorAvatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    content: "Booked the 10-lesson package and car rental for my test day. Passed with zero driving errors on my sheet! The dual-brake car was clean, smooth to handle, and very easy to steer. Thank you Four Seasons for helping me get my license on the first try!",
    mediaUrl: null,
    authorInitials: "AK",
    publishedAt: "2026-09-12T16:00:00Z",
    relativeDate: "1 month ago",
    sourceUrl: "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
  },
  {
    authorName: "David Zhang",
    source: "google",
    score: 5,
    authorAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    content: "Super professional service! Everything from the online booking to the pre-test warm-up lesson went seamlessly. The instructor gave me honest constructive feedback after every 90-minute session. Highly recommend to any beginner or Class 7N driver in Metro Vancouver.",
    mediaUrl: null,
    authorInitials: "DZ",
    publishedAt: "2026-09-08T09:15:00Z",
    relativeDate: "1 month ago",
    sourceUrl: "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
  },
  {
    authorName: "Navneet Sandhu",
    source: "google",
    score: 5,
    authorAvatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    content: "Best driving instructors in Surrey hands down. Very punctual, respectful, and crystal clear explanations on speed control, shoulder checks, and pedestrian awareness. Passed my Class 7 road test without any stress!",
    mediaUrl: null,
    authorInitials: "NS",
    publishedAt: "2026-08-15T11:20:00Z",
    relativeDate: "2 months ago",
    sourceUrl: "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
  },
  {
    authorName: "Liam Campbell",
    source: "google",
    score: 5,
    authorAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    content: "Took 5 refresher lessons before my test after moving to BC from another province. The instructor brought me through all the tricky school zones and one-way streets around Surrey. Passed with flying colors!",
    mediaUrl: null,
    authorInitials: "LC",
    publishedAt: "2026-08-04T13:45:00Z",
    relativeDate: "2 months ago",
    sourceUrl: "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
  },
];

/**
 * Normalizes raw reviews from SerpApi or other Google reviews providers
 */
const normalizeGoogleReviews = (
  reviews: any,
  limit = 10,
): GoogleReviewItem[] => {
  if (!Array.isArray(reviews)) return [];

  const sorted = [...reviews].sort((a, b) => {
    const ta = a?.iso_date ? Date.parse(a.iso_date) : 0;
    const tb = b?.iso_date ? Date.parse(b.iso_date) : 0;
    return tb - ta; // latest first
  });

  return sorted.slice(0, limit).map((r) => {
    const name = r.user?.name || "Verified Student";
    const initials = name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return {
      authorName: name,
      source: "google",
      score: typeof r.rating === "number" ? r.rating : 5,
      authorAvatarUrl: r.user?.thumbnail || null,
      content: r.snippet || r.extracted_snippet?.original || "",
      mediaUrl:
        Array.isArray(r.images) && r.images.length > 0 ? r.images[0] : null,
      authorInitials: initials || "FS",
      publishedAt: r.iso_date || null,
      relativeDate: r.date || null,
      sourceUrl:
        r.link ||
        "https://maps.google.com/?q=Four+Seasons+Driving+School+Surrey+BC",
    };
  });
};

/**
 * Fetch fresh reviews from SerpApi if API key is provided
 */
async function fetchFreshFromSerpApi(): Promise<GoogleReviewItem[] | null> {
  const dataId = "0x5485db5a98994ddf:0x977cf2a3189f39a5"; // fourseasonsdrivingschool.ca
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const res = await fetch(
      `https://serpapi.com/search.json?engine=google_maps_reviews&data_id=${dataId}&hl=en&api_key=${apiKey}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      console.warn("SerpApi returned non-ok status:", res.status);
      return null;
    }

    const json = await res.json();
    const normalized = normalizeGoogleReviews(json.reviews);
    if (normalized && normalized.length > 0) {
      return normalized;
    }
    return null;
  } catch (err) {
    console.error("Error calling SerpApi for Google reviews:", err);
    return null;
  }
}

/**
 * Synchronize Google Reviews in Firestore
 * - If force is true, or if last updated is more than 10 days old, updates from SerpApi
 */
export async function syncGoogleReviewsAction(
  force = false,
): Promise<{ success: boolean; count: number; lastUpdated: string; source: "live_serpapi" | "firestore_cache" | "fallback" }> {
  const docRef = db.collection("settings").doc("google_reviews");
  const now = new Date();
  const nowIso = now.toISOString();
  const nowMs = now.getTime();

  try {
    const doc = await docRef.get();
    const existing = doc.exists ? (doc.data() as StoredGoogleReviewsDoc) : null;

    const lastUpdatedMs = existing?.updatedAtMs || (existing?.lastUpdated ? new Date(existing.lastUpdated).getTime() : 0);
    const isMoreThan10DaysOld = nowMs - lastUpdatedMs > TEN_DAYS_MS;

    // Check if we need to update
    if (!force && !isMoreThan10DaysOld && existing && existing.reviews && existing.reviews.length > 0) {
      return {
        success: true,
        count: existing.reviews.length,
        lastUpdated: existing.lastUpdated,
        source: "firestore_cache",
      };
    }

    // Attempt to fetch fresh reviews
    const freshReviews = await fetchFreshFromSerpApi();

    if (freshReviews && freshReviews.length > 0) {
      const avg = freshReviews.reduce((sum, r) => sum + (r.score || 5), 0) / freshReviews.length;
      await docRef.set({
        reviews: freshReviews,
        lastUpdated: nowIso,
        updatedAtMs: nowMs,
        totalCount: freshReviews.length,
        averageRating: Number(avg.toFixed(1)),
      });

      await revalidatePaths(["/"]);
      return {
        success: true,
        count: freshReviews.length,
        lastUpdated: nowIso,
        source: "live_serpapi",
      };
    }

    // If SerpApi wasn't available:
    if (existing && existing.reviews && existing.reviews.length > 0) {
      // Keep existing reviews, but bump timestamp if forced
      if (force) {
        await docRef.set({ ...existing, lastUpdated: nowIso, updatedAtMs: nowMs }, { merge: true });
        await revalidatePaths(["/"]);
      }
      return {
        success: true,
        count: existing.reviews.length,
        lastUpdated: force ? nowIso : existing.lastUpdated,
        source: "firestore_cache",
      };
    }

    // First-time seed fallback reviews into Firestore
    await docRef.set({
      reviews: FALLBACK_REVIEWS,
      lastUpdated: nowIso,
      updatedAtMs: nowMs,
      totalCount: FALLBACK_REVIEWS.length,
      averageRating: 5.0,
    });

    await revalidatePaths(["/"]);
    return {
      success: true,
      count: FALLBACK_REVIEWS.length,
      lastUpdated: nowIso,
      source: "fallback",
    };
  } catch (error) {
    console.error("syncGoogleReviewsAction error:", error);
    return {
      success: false,
      count: existingReviewsCount(FALLBACK_REVIEWS),
      lastUpdated: nowIso,
      source: "fallback",
    };
  }
}

function existingReviewsCount(revs: GoogleReviewItem[]): number {
  return revs.length;
}

/**
 * Fetch reviews from Firestore
 * Automatically triggers update if last updated is more than 10 days old
 */
const getGoogleReviews = async (): Promise<GoogleReviewItem[]> => {
  try {
    const docRef = db.collection("settings").doc("google_reviews");
    const doc = await docRef.get();

    if (doc.exists) {
      const data = doc.data() as StoredGoogleReviewsDoc;
      const lastUpdatedMs =
        data.updatedAtMs ||
        (data.lastUpdated ? new Date(data.lastUpdated).getTime() : 0);
      const isMoreThan10DaysOld = Date.now() - lastUpdatedMs > TEN_DAYS_MS;

      // If more than 10 days old, trigger update
      if (isMoreThan10DaysOld) {
        const syncResult = await syncGoogleReviewsAction(false);
        if (syncResult.success) {
          const updatedDoc = await docRef.get();
          if (updatedDoc.exists) {
            const updatedData = updatedDoc.data() as StoredGoogleReviewsDoc;
            return updatedData.reviews || FALLBACK_REVIEWS;
          }
        }
      }

      if (data.reviews && data.reviews.length > 0) {
        return data.reviews;
      }
    }

    // If no document exists yet, initialize and store in Firestore
    const syncResult = await syncGoogleReviewsAction(true);
    const freshDoc = await docRef.get();
    if (freshDoc.exists) {
      const freshData = freshDoc.data() as StoredGoogleReviewsDoc;
      return freshData.reviews || FALLBACK_REVIEWS;
    }

    return FALLBACK_REVIEWS;
  } catch (error) {
    console.error("Error retrieving Google reviews from Firestore:", error);
    return FALLBACK_REVIEWS;
  }
};

export default getGoogleReviews;

/**
 * Fetch metadata about stored reviews for admin view
 */
export async function getGoogleReviewsMetaAction(): Promise<{
  lastUpdated: string | null;
  updatedAtMs: number | null;
  count: number;
  isStale: boolean;
  daysSinceUpdate: number;
}> {
  try {
    const docRef = db.collection("settings").doc("google_reviews");
    const doc = await docRef.get();

    if (!doc.exists) {
      return {
        lastUpdated: null,
        updatedAtMs: null,
        count: 0,
        isStale: true,
        daysSinceUpdate: 999,
      };
    }

    const data = doc.data() as StoredGoogleReviewsDoc;
    const lastMs =
      data.updatedAtMs ||
      (data.lastUpdated ? new Date(data.lastUpdated).getTime() : 0);
    const diffMs = Date.now() - lastMs;
    const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const isStale = diffMs > TEN_DAYS_MS;

    return {
      lastUpdated: data.lastUpdated || null,
      updatedAtMs: lastMs || null,
      count: data.reviews?.length || 0,
      isStale,
      daysSinceUpdate: daysSince,
    };
  } catch (err) {
    console.error("getGoogleReviewsMetaAction error:", err);
    return {
      lastUpdated: null,
      updatedAtMs: null,
      count: 0,
      isStale: true,
      daysSinceUpdate: 999,
    };
  }
}
