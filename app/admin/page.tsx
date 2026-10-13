"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminStatsAction, AdminStats } from "@/lib/actions/stats";
import { BookingItem } from "@/lib/actions/bookings";
import {
  BookOpen,
  Calendar,
  Package,
  DollarSign,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Car,
  User,
  Loader2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getAdminStatsAction();
        setStats(res);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
        {/* Page Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Overview of lessons, packages, appointments, and driving school metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/packages/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>New Package</span>
            </Link>
            <Link
              href="/admin/slots/new"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-xs transition hover:bg-zinc-50"
            >
              <Plus className="h-4 w-4 text-emerald-600" />
              <span>Add Time Slot</span>
            </Link>
          </div>
        </div>

        {/* STATS CARDS */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Stat 1 */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Total Bookings
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <BookOpen className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-zinc-950">
                    {stats?.totalBookings ?? 0}
                  </span>
                  <p className="mt-1 text-xs text-zinc-500">Recorded appointments</p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Available Slots
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-zinc-950">
                    {stats?.activeSlotsCount ?? 0}
                  </span>
                  <p className="mt-1 text-xs text-zinc-500">Open for students</p>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Active Packages
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                    <Package className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-zinc-950">
                    {stats?.packagesCount ?? 0}
                  </span>
                  <p className="mt-1 text-xs text-zinc-500">Pricing options</p>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Est. Revenue
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-zinc-950">
                    ${stats?.totalRevenue?.toLocaleString() ?? 0}
                  </span>
                  <p className="mt-1 text-xs text-zinc-500">From student bookings</p>
                </div>
              </div>
            </div>

            {/* RECENT BOOKINGS TABLE */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Recent Student Bookings</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Latest appointment requests submitted via the online registration portal.
                  </p>
                </div>
                <Link
                  href="/admin/bookings"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <span>View All Bookings</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-4 overflow-x-auto">
                {!stats?.recentBookings || stats.recentBookings.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400 text-sm">
                    No bookings recorded yet. New student registrations will appear here.
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        <th className="pb-3">Student Name</th>
                        <th className="pb-3">Phone &amp; Email</th>
                        <th className="pb-3">Package</th>
                        <th className="pb-3">Appointment Slot</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {stats.recentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-50/60 transition">
                          <td className="py-3.5 font-semibold text-zinc-900">
                            {b.firstName} {b.lastName}
                            <span className="block text-[11px] font-normal text-zinc-500">
                              {b.licenseClass} ({b.licenseNumber || "No LDL"})
                            </span>
                          </td>
                          <td className="py-3.5 text-xs text-zinc-600">
                            <div>{b.phone}</div>
                            <div className="text-[11px] text-zinc-400">{b.email}</div>
                          </td>
                          <td className="py-3.5 text-xs font-medium text-emerald-800">
                            {b.packageName}
                            <span className="block text-[11px] text-zinc-500">{b.packagePrice}</span>
                          </td>
                          <td className="py-3.5 text-xs text-zinc-700">
                            <div className="font-semibold">{b.slotDate}</div>
                            <div className="text-[11px] text-zinc-500">{b.slotTime}</div>
                          </td>
                          <td className="py-3.5">
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                              {b.paymentStatus === "paid" ? "Paid" : "Confirmed"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
  );
}
