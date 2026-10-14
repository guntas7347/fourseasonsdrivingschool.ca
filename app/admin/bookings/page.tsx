"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getBookingsAction, BookingItem } from "@/lib/actions/bookings";
import { exportToCsv } from "@/lib/exportCsv";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  CreditCard,
  Globe,
  UserCheck,
  Filter,
} from "lucide-react";

const PAGE_SIZE = 20;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Online" | "Manual">("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        const res = await getBookingsAction();
        setBookings(res);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  // Compute status counts for the filter tabs
  const { onlineCount, manualCount } = useMemo(() => {
    let online = 0;
    let manual = 0;
    for (const b of bookings) {
      if (b.status === "Online") online++;
      else if (b.status === "Manual") manual++;
    }
    return { onlineCount: online, manualCount: manual };
  }, [bookings]);

  // Filter bookings based on status filter and search query
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Strict status check: only Online or Manual are ever shown
      const isOnline = b.status === "Online";
      const isManual = b.status === "Manual";
      if (!isOnline && !isManual) return false;

      // 2. Status tab filter
      if (statusFilter !== "all" && b.status !== statusFilter) {
        return false;
      }

      // 3. Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        `${b.firstName} ${b.lastName}`.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        (b.slotDate && b.slotDate.includes(q)) ||
        (b.packageName && b.packageName.toLowerCase().includes(q)) ||
        b.id.toLowerCase().includes(q) ||
        (b.paymentIntentId && b.paymentIntentId.toLowerCase().includes(q))
      );
    });
  }, [bookings, statusFilter, searchQuery]);

  // Pagination calculation: 20 per page
  const totalItems = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pageSafe = Math.min(currentPage, totalPages);
  const startIndex = (pageSafe - 1) * PAGE_SIZE;
  const currentItems = filteredBookings.slice(startIndex, startIndex + PAGE_SIZE);

  // Export current page table data to CSV
  const handleExportCsv = () => {
    const headers = [
      "Booking ID",
      "Booking Status",
      "Payment Transaction ID",
      "Date Created",
      "Student Name",
      "Email",
      "Phone",
      "Pickup Address",
      "License Class",
      "License Number",
      "License Expiry",
      "Lesson Date",
      "Lesson Time",
      "Lesson Type / Package",
      "Price",
      "Road Test Booked",
      "Road Test Details",
      "Notes",
    ];

    const rows = currentItems.map((b) => [
      b.id,
      b.status || (b.paymentIntentId ? "Online" : "Manual"),
      b.paymentIntentId || "N/A",
      new Date(b.createdAt).toLocaleString("en-CA"),
      `${b.firstName} ${b.lastName}`.trim(),
      b.email,
      b.phone,
      `${b.street || ""}, ${b.city || ""} ${b.postCode || ""}`.trim(),
      b.licenseClass,
      b.licenseNumber || "N/A",
      b.licenseExpiry || "N/A",
      b.slotDate,
      b.slotTime,
      b.packageName || "Driving Lesson",
      b.packagePrice || "N/A",
      b.bookedRoadTest === "yes" ? "Yes" : "No",
      b.bookedRoadTest === "yes"
        ? `${b.roadTestDate || "Date TBD"} at ${b.roadTestLocation || "Local ICBC"}`
        : "",
      b.additionalNotes || "",
    ]);

    exportToCsv("bookings_page_" + pageSafe, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
            Student Bookings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Verified reservations categorized into Online (Stripe payment completed) and Manual (booked via admin).
          </p>
        </div>

        {/* Action Button: Export to Excel (CSV) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={currentItems.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 hover:border-zinc-400 disabled:opacity-50 transition active:scale-95 cursor-pointer"
            title="Export current page table data to Excel CSV"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Export to Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Status Filter Tabs (Only Online and Manual) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-zinc-950 text-white shadow-xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            <span>All Bookings</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                statusFilter === "all" ? "bg-zinc-800 text-zinc-200" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {bookings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter("Online");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              statusFilter === "Online"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50/60"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Online</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                statusFilter === "Online"
                  ? "bg-emerald-700 text-emerald-100"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {onlineCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter("Manual");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              statusFilter === "Manual"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-blue-800 border border-blue-200 hover:bg-blue-50/60"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Manual</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                statusFilter === "Manual"
                  ? "bg-blue-700 text-blue-100"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {manualCount}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by student, email, phone, ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none transition"
            />
          </div>

          <div className="text-xs text-zinc-500 font-medium">
            Showing <strong>{currentItems.length}</strong> of <strong>{totalItems}</strong> bookings (Page {pageSafe} of {totalPages})
          </div>
        </div>
      </div>

      {/* Table / Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
          <p className="mt-3 text-xs font-semibold">Loading student bookings...</p>
        </div>
      ) : totalItems === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-300" />
          <h3 className="mt-3 text-base font-bold text-zinc-900">No Bookings Found</h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery
              ? "No student bookings match your search query."
              : statusFilter === "Online"
              ? "No online student bookings completed via Stripe yet."
              : statusFilter === "Manual"
              ? "No manual bookings recorded via admin yet."
              : "No valid student bookings found."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-3.5">Student / Contact</th>
                  <th className="px-5 py-3.5">Lesson Appointment</th>
                  <th className="px-5 py-3.5">Package / Lesson</th>
                  <th className="px-5 py-3.5">Pickup Location</th>
                  <th className="px-5 py-3.5">License</th>
                  <th className="px-5 py-3.5">Booking Status &amp; Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {currentItems.map((booking) => {
                  const isOnline = booking.status === "Online";

                  return (
                    <tr key={booking.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* Student Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-xs">
                            {booking.firstName?.[0] || booking.lastName?.[0] || "S"}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-950 text-sm">
                              {booking.firstName} {booking.lastName}
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                              <Mail className="h-3 w-3 text-zinc-400" />
                              <span>{booking.email}</span>
                            </p>
                            <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-zinc-400" />
                              <span>{booking.phone}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Lesson Appointment */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{booking.slotDate}</span>
                          </p>
                          <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-zinc-400" />
                            <span>{booking.slotTime}</span>
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400">
                            ID: #{booking.id.slice(0, 8)}
                          </p>
                        </div>
                      </td>

                      {/* Package / Lesson Name */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-zinc-900">
                          {booking.packageName || "Driving Lesson"}
                        </p>
                        <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                          {booking.packagePrice || "—"}
                        </p>
                        {booking.additionalNotes && (
                          <p className="text-[10px] text-zinc-500 italic max-w-xs line-clamp-1 mt-1">
                            &quot;{booking.additionalNotes}&quot;
                          </p>
                        )}
                      </td>

                      {/* Pickup Address */}
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-1.5 text-zinc-700">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-zinc-800">
                              {booking.street || "Address pending"}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {booking.city} {booking.postCode}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* License */}
                      <td className="px-5 py-4">
                        <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-800">
                          Class {booking.licenseClass}
                        </span>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          {booking.licenseNumber || "No LDL #"}
                        </p>
                      </td>

                      {/* Booking Status & Payment ID (ONLY 2 STATUSES: Online or Manual) */}
                      <td className="px-5 py-4">
                        {isOnline ? (
                          <div className="space-y-1.5">
                            {/* Status: Online */}
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              <Globe className="h-3 w-3 text-emerald-700" />
                              <span>Online</span>
                            </span>

                            {/* Payment Transaction ID below status */}
                            {booking.paymentIntentId ? (
                              <div>
                                <Link
                                  href={`/admin/transactions?search=${encodeURIComponent(booking.paymentIntentId)}`}
                                  title={`View Stripe Transaction: ${booking.paymentIntentId}`}
                                  className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-zinc-600 hover:text-emerald-700 bg-zinc-100 hover:bg-emerald-50 px-2 py-0.5 rounded border border-zinc-200 transition"
                                >
                                  <CreditCard className="h-3 w-3 text-emerald-600 shrink-0" />
                                  <span className="truncate max-w-[130px]">{booking.paymentIntentId}</span>
                                </Link>
                              </div>
                            ) : (
                              <p className="text-[10px] text-emerald-700 font-medium">
                                Stripe Payment Verified
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {/* Status: Manual */}
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                              <UserCheck className="h-3 w-3 text-blue-700" />
                              <span>Manual</span>
                            </span>

                            <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                              <span>Booked via Admin</span>
                              {booking.paymentMethod === "Cash on spot" && (
                                <span className="text-zinc-400 font-normal">&bull; Cash</span>
                              )}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3.5 bg-zinc-50/60">
              <span className="text-xs text-zinc-500 font-medium">
                Page {pageSafe} of {totalPages} ({totalItems} total bookings)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pageSafe <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageSafe >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
