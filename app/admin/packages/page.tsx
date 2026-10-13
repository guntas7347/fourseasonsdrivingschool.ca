"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getPackagesAction,
  deletePackageAction,
  PackageItem,
} from "@/lib/actions/packages";
import {
  Plus,
  Package,
  Edit,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const res = await getPackagesAction();
      setPackages(res);
    } catch (err) {
      console.error("Failed to load packages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete package: "${name}"?`)) return;
    try {
      setDeletingId(id);
      await deletePackageAction(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete package error:", err);
      alert("Failed to delete package.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
              Training Packages
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage driving lesson packages, set prices, and update course offerings.
            </p>
          </div>

          <Link
            href="/admin/packages/new"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4 text-emerald-400" />
            <span>Create New Package</span>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : packages.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-zinc-300" />
            <h3 className="mt-3 text-base font-bold text-zinc-900">No Packages Found</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Get started by creating your first driving package with custom pricing.
            </p>
            <Link
              href="/admin/packages/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>Create Package</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:border-zinc-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {pkg.duration || `${pkg.lessonsCount} Lesson(s)`}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {pkg.popular && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Popular (Center)
                        </span>
                      )}
                      {pkg.showOnHomepage ? (
                        <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          On Homepage
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                          All Packages Only
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-2 text-lg font-bold text-zinc-900">{pkg.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-950">{pkg.price}</span>
                    <span className="text-xs text-zinc-500 font-medium">CAD</span>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-zinc-600 line-clamp-2">
                    {pkg.description}
                  </p>

                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-xs text-zinc-600">
                      {pkg.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                      {pkg.features.length > 3 && (
                        <li className="text-[11px] text-zinc-400 font-medium pl-5">
                          +{pkg.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                  <span className="text-[11px] text-zinc-400 font-mono">
                    ID: {pkg.id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/packages/${pkg.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                    >
                      <Edit className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(pkg.id, pkg.name)}
                      disabled={deletingId === pkg.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      {deletingId === pkg.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
