"use client";

import React, { useEffect, useState } from "react";
import {
  getAuthConfigAction,
  addAllowedGmailAction,
  removeAllowedGmailAction,
} from "@/lib/actions/config";
import {
  getGoogleReviewsMetaAction,
  syncGoogleReviewsAction,
} from "@/lib/googleReviews";
import { useForm } from "@/lib/useForm";
import { auth } from "@/lib/firebase/googleLogin";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  UserCheck,
  RefreshCw,
  Star,
  Clock,
  RotateCw,
} from "lucide-react";
import HardRefreshButton from "@/components/admin/HardRefreshButton";

interface AddEmailFormFields {
  newEmail: string;
}

export default function AdminConfigPage() {
  const [allowedGmails, setAllowedGmails] = useState<string[]>([]);
  const [reviewsMeta, setReviewsMeta] = useState<{
    lastUpdated: string | null;
    count: number;
    isStale: boolean;
    daysSinceUpdate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncingReviews, setSyncingReviews] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const currentUserEmail = auth.currentUser?.email?.toLowerCase() || "";

  // Form using useForm
  const { form, handleChange, resetFormFields } = useForm<AddEmailFormFields>({
    newEmail: "",
  });

  const loadConfig = async () => {
    try {
      setLoading(true);
      const [config, meta] = await Promise.all([
        getAuthConfigAction(),
        getGoogleReviewsMetaAction(),
      ]);
      setAllowedGmails(config.allowedGmails || []);
      setReviewsMeta(meta);
    } catch (err) {
      console.error("Failed to load auth config:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSyncReviews = async () => {
    try {
      setSyncingReviews(true);
      setFeedback(null);
      const res = await syncGoogleReviewsAction(true);
      if (res.success) {
        const meta = await getGoogleReviewsMetaAction();
        setReviewsMeta(meta);
        setFeedback({
          type: "success",
          message: `Synchronized ${res.count} Google Reviews to Firestore (source: ${res.source}).`,
        });
      } else {
        setFeedback({
          type: "error",
          message: "Failed to sync Google reviews.",
        });
      }
    } catch (err: any) {
      console.error("Error syncing reviews:", err);
      setFeedback({
        type: "error",
        message: err?.message || "An error occurred while syncing Google reviews.",
      });
    } finally {
      setSyncingReviews(false);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.newEmail.trim()) {
      setFeedback({ type: "error", message: "Please enter an email address." });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await addAllowedGmailAction(form.newEmail.trim());

      if (res.success && res.allowedGmails) {
        setAllowedGmails(res.allowedGmails);
        resetFormFields();
        setFeedback({
          type: "success",
          message: `Successfully added ${form.newEmail.trim()} to authorized admin logins.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to add email.",
        });
      }
    } catch (err: any) {
      console.error("Error adding email:", err);
      setFeedback({
        type: "error",
        message: err?.message || "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveEmail = async (email: string) => {
    if (email === currentUserEmail) {
      if (!confirm(`Warning: You are currently signed in as "${email}". Removing your own email will revoke your admin access upon re-login. Continue?`)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to revoke admin access for "${email}"?`)) {
        return;
      }
    }

    try {
      setRemovingEmail(email);
      setFeedback(null);
      const res = await removeAllowedGmailAction(email);

      if (res.success && res.allowedGmails) {
        setAllowedGmails(res.allowedGmails);
        setFeedback({
          type: "success",
          message: `Removed ${email} from authorized admin logins.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to remove email.",
        });
      }
    } catch (err: any) {
      console.error("Error removing email:", err);
      setFeedback({
        type: "error",
        message: err?.message || "An error occurred.",
      });
    } finally {
      setRemovingEmail(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Admin Authentication Policy</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
            Google Login Authorization Whitelist
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage which Google/Gmail accounts are authorized to access the Admin Portal.
            Any unauthorized user attempting to sign in with Google will be immediately rejected, signed out, and redirected to the public homepage.
          </p>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`rounded-xl border p-4 text-xs font-medium flex items-center gap-2.5 ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Add Email Form (Using useForm) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-900">Authorize New Admin Gmail</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Enter the Google/Gmail address of an instructor or administrator who should have access.
          </p>

          <form onSubmit={handleAddEmail} className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                id="newEmail"
                name="newEmail"
                required
                value={form.newEmail}
                onChange={handleChange}
                placeholder="instructor@gmail.com"
                className="block w-full rounded-xl border border-zinc-200 pl-10 pr-3.5 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition disabled:opacity-50 shrink-0"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>Add Authorized Gmail</span>
            </button>
          </form>
        </div>

        {/* Currently Authorized List */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Authorized Gmail Accounts</h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                {allowedGmails.length} account{allowedGmails.length === 1 ? "" : "s"} currently permitted
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
            </div>
          ) : allowedGmails.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No specific emails configured. All logins are restricted.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-zinc-100">
              {allowedGmails.map((email) => {
                const isCurrent = email === currentUserEmail;
                return (
                  <div
                    key={email}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-900 font-mono">
                            {email}
                          </span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <UserCheck className="h-3 w-3" />
                              <span>Current Session</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400">Full Administrator Privileges</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      disabled={removingEmail === email || allowedGmails.length <= 1}
                      title={
                        allowedGmails.length <= 1
                          ? "Cannot delete the only admin"
                          : "Remove Authorization"
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-40 self-end sm:self-auto"
                    >
                      {removingEmail === email ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      <span>Revoke Access</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Security note */}
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3 text-xs text-amber-900">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Strict Security Protocol:</strong> Only emails in this whitelist are permitted to log in with Google. If someone attempts to log in with an unauthorized Google account, Firebase will immediately sign them out and redirect them to the public homepage (<code>/</code>).
            </p>
          </div>
        </div>

        {/* GOOGLE REVIEWS FIRESTORE CACHE & CRON CONFIG */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                <h2 className="text-base font-bold text-zinc-950">
                  Google Reviews Firestore Cache &amp; 10-Day Sync
                </h2>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Google Reviews are permanently stored in Firestore (<code>settings/google_reviews</code>).
                They automatically refresh when older than 10 days, or on-demand via the button below or cron jobs.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncReviews}
              disabled={syncingReviews}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition disabled:opacity-50 shrink-0"
            >
              {syncingReviews ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>{syncingReviews ? "Syncing..." : "Sync Reviews Now"}</span>
            </button>
          </div>

          {/* Status metrics grid */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Cached Reviews Count
              </span>
              <span className="mt-1 text-2xl font-black text-zinc-900 block">
                {reviewsMeta?.count ?? 0} Reviews
              </span>
              <span className="text-[11px] text-zinc-400">Stored in Firestore</span>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Last Synchronized
              </span>
              <span className="mt-1 text-sm font-bold text-zinc-900 block truncate">
                {reviewsMeta?.lastUpdated
                  ? new Date(reviewsMeta.lastUpdated).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Never synchronized"}
              </span>
              <span className="text-[11px] text-zinc-400">
                {reviewsMeta?.lastUpdated
                  ? `${reviewsMeta.daysSinceUpdate} day(s) ago`
                  : "Pending initialization"}
              </span>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                10-Day Refresh Policy
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                {reviewsMeta?.isStale ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    <Clock className="h-3 w-3" />
                    <span>Stale (&gt;10 days)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Fresh &amp; Up to Date</span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Auto-updates if &gt; 10 days old
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-500 space-y-1">
            <p>
              <strong>Automated Cron Endpoint:</strong> <code>/api/cron/sync-reviews</code> (configured in <code>vercel.json</code> to trigger periodically, or callable via GitHub Actions / cron-job.org).
            </p>
          </div>
        </div>

        {/* Full Website Cache & Revalidation Section */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <RotateCw className="h-4 w-4 text-emerald-600" />
                <span>Full Website Cache Revalidation</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Purges Next.js Partial Prerendering (PPR), Incremental Static Regeneration (ISR), and router caches using <code>revalidatePath(&quot;/&quot;, &quot;layout&quot;)</code>.
              </p>
            </div>
            <HardRefreshButton variant="dashboard" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 space-y-1">
              <span className="font-bold text-zinc-900 block">Scope</span>
              <p className="text-zinc-600">Root layout (&quot;/&quot;) plus all nested pages and dynamic routes.</p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 space-y-1">
              <span className="font-bold text-zinc-900 block">When to Use</span>
              <p className="text-zinc-600">After creating packages, modifying slots, or updating school policies.</p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3.5 space-y-1">
              <span className="font-bold text-zinc-900 block">Speed</span>
              <p className="text-zinc-600">Immediate server-side cache invalidation with instant client re-fetch.</p>
            </div>
          </div>
        </div>
      </div>
  );
}
