"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { getPackageByIdAction, updatePackageAction } from "@/lib/actions/packages";
import { useForm } from "@/lib/useForm";
import {
  ArrowLeft,
  Loader2,
  DollarSign,
  CheckCircle2,
  Package,
} from "lucide-react";

interface EditPackageFormFields {
  name: string;
  numericPrice: string;
  duration: string;
  lessonsCount: string;
  description: string;
  featuresText: string;
  popular: boolean;
  showOnHomepage: boolean;
}

const INITIAL_FORM: EditPackageFormFields = {
  name: "",
  numericPrice: "",
  duration: "",
  lessonsCount: "1",
  description: "",
  featuresText: "",
  popular: false,
  showOnHomepage: false,
};

function EditPackageFormContent() {
  const router = useRouter();
  const params = useParams();
  const packageId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Using useForm as requested
  const { form, setFormFields, handleChange, setFields } =
    useForm<EditPackageFormFields>(INITIAL_FORM);

  useEffect(() => {
    async function fetchPackage() {
      if (!packageId) return;
      try {
        setLoading(true);
        const pkg = await getPackageByIdAction(packageId);
        if (pkg) {
          setFormFields({
            name: pkg.name || "",
            numericPrice: String(pkg.numericPrice || ""),
            duration: pkg.duration || "",
            lessonsCount: String(pkg.lessonsCount || 1),
            description: pkg.description || "",
            featuresText: (pkg.features || []).join("\n"),
            popular: Boolean(pkg.popular),
            showOnHomepage: Boolean(pkg.showOnHomepage),
          });
        } else {
          setErrorMsg("Package not found.");
        }
      } catch (err) {
        console.error("Error loading package:", err);
        setErrorMsg("Failed to load package data.");
      } finally {
        setLoading(false);
      }
    }
    fetchPackage();
  }, [packageId, setFormFields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.numericPrice) {
      setErrorMsg("Please fill in the package name and price.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const featuresArray = form.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const numericVal = parseFloat(form.numericPrice) || 0;

      const res = await updatePackageAction(packageId, {
        name: form.name,
        numericPrice: numericVal,
        price: `$${numericVal}`,
        duration: form.duration || "90 minutes",
        lessonsCount: parseInt(form.lessonsCount, 10) || 1,
        description: form.description,
        features: featuresArray,
        popular: Boolean(form.popular),
        showOnHomepage: Boolean(form.showOnHomepage || form.popular),
      });

      if (res.success) {
        router.push("/admin/packages");
      } else {
        setErrorMsg(res.error || "Failed to update package.");
      }
    } catch (err: any) {
      console.error("Update package error:", err);
      setErrorMsg(err?.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation back */}
      <Link
        href="/admin/packages"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Packages</span>
      </Link>

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
          Edit Driving Package
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Update pricing, lesson structure, or features for package ID:{" "}
          <span className="font-mono text-zinc-700">{packageId}</span>
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
        >
          {/* Package Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-zinc-900">
              Package Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Package Name"
              className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>

          {/* Pricing & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label htmlFor="numericPrice" className="block text-sm font-semibold text-zinc-900">
                Price (CAD $) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  id="numericPrice"
                  name="numericPrice"
                  required
                  min="0"
                  step="1"
                  value={form.numericPrice}
                  onChange={handleChange}
                  placeholder="525"
                  className="block w-full rounded-xl border border-zinc-200 pl-8 pr-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lessonsCount" className="block text-sm font-semibold text-zinc-900">
                Number of Lessons
              </label>
              <input
                type="number"
                id="lessonsCount"
                name="lessonsCount"
                min="1"
                value={form.lessonsCount}
                onChange={handleChange}
                className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-zinc-900">
                Total Duration Text
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 7.5 hours total"
                className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-zinc-900">
              Brief Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Description of the package..."
              className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>

          {/* Features (One per line) */}
          <div>
            <label htmlFor="featuresText" className="block text-sm font-semibold text-zinc-900">
              Included Features (One per line)
            </label>
            <textarea
              id="featuresText"
              name="featuresText"
              rows={4}
              value={form.featuresText}
              onChange={handleChange}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm font-mono text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition"
            />
          </div>

          {/* Homepage & Popular Visibility Options */}
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Homepage Visibility & Badges
            </h4>

            {/* Popular Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="popular"
                name="popular"
                checked={form.popular}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setFields({
                    popular: isChecked,
                    ...(isChecked ? { showOnHomepage: true } : {}),
                  });
                }}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <div>
                <label htmlFor="popular" className="text-sm font-semibold text-zinc-900 cursor-pointer">
                  Mark as &quot;Most Popular / Recommended&quot;
                </label>
                <p className="text-xs text-zinc-500">
                  Only 1 package in the entire database can be marked as popular. Selecting this will automatically unmark any other popular package and force it to show on the homepage center card.
                </p>
              </div>
            </div>

            {/* Show on Homepage Checkbox */}
            <div className="flex items-start gap-3 pt-1 border-t border-zinc-200/60">
              <input
                type="checkbox"
                id="showOnHomepage"
                name="showOnHomepage"
                disabled={form.popular}
                checked={form.popular ? true : form.showOnHomepage}
                onChange={(e) => setFields({ showOnHomepage: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 disabled:opacity-50"
              />
              <div>
                <label htmlFor="showOnHomepage" className="text-sm font-semibold text-zinc-900 cursor-pointer">
                  Show on Homepage (Max 3 Packages)
                </label>
                <p className="text-xs text-zinc-500">
                  Displays this package in the top 3 cards on the public homepage. Packages marked as &quot;Popular&quot; are automatically included.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-6">
            <Link
              href="/admin/packages"
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              )}
              <span>{submitting ? "Updating..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AdminEditPackagePage() {
  return (
    <AdminLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <EditPackageFormContent />
      </Suspense>
    </AdminLayout>
  );
}
