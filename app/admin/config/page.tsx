"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getAuthConfigAction,
  addAllowedGmailAction,
  removeAllowedGmailAction,
} from "@/lib/actions/config";
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
} from "lucide-react";

interface AddEmailFormFields {
  newEmail: string;
}

export default function AdminConfigPage() {
  const [allowedGmails, setAllowedGmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      const config = await getAuthConfigAction();
      setAllowedGmails(config.allowedGmails || []);
    } catch (err) {
      console.error("Failed to load auth config:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

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
    <AdminLayout>
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
      </div>
    </AdminLayout>
  );
}
