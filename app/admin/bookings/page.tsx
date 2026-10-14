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
  AlertCircle,
  FileSpreadsheet,
  CreditCard,
} from "lucide-react";

const PAGE_SIZE = 20;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Filtered bookings based on search
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase();
    return bookings.filter(
      (b) =>
        `${b.firstName} ${b.lastName}`.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        (b.slotDate && b.slotDate.includes(q)) ||
        (b.packageName && b.packageName.toLowerCase().includes(q)) ||
        b.id.toLowerCase().includes(q) ||
        (b.paymentIntentId && b.paymentIntentId.toLowerCase().includes(q))
    );
  }, [bookings, searchQuery]);

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
      "Payment ID",
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
      "Payment Status",
      "Road Test Booked",
      "Road Test Details",
      "Notes",
    ];

    const rows = currentItems.map((b) => [
      b.id,
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
      b.paymentStatus === "paid"
        ? "Paid"
        : b.paymentStatus === "pay_on_arrival"
        ? "Cash on Spot"
        : "Pending (Dev)",
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
            Complete record of student registrations, lesson reservations, and payment confirmations.
          </p>
        </div>

        {/* Action Button: Export to Excel (CSV) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={currentItems.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 hover:border-zinc-400 disabled:opacity-50 transition active:scale-95"
            title="Export current page table data to Excel CSV"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Export to Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by student, email, phone, date..."
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
          <p className="mt-1 text-xs text-zinc-500">
            {searchQuery
              ? "No student bookings match your search query."
              : "When students complete their booking via the registration portal, their reservations will show here."}
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
                  <th className="px-5 py-3.5">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {currentItems.map((booking) => (
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

                    {/* Payment Status & Payment ID */}
                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            booking.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : booking.paymentStatus === "pay_on_arrival"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>
                            {booking.paymentStatus === "paid"
                              ? "Paid"
                              : booking.paymentStatus === "pay_on_arrival"
                              ? "Cash on Spot"
                              : "Confirmed"}
                          </span>
                        </span>

                        {booking.paymentIntentId ? (
                          <div>
                            <Link
                              href={`/admin/transactions?search=${encodeURIComponent(booking.paymentIntentId)}`}
                              title={`View Stripe Transaction ${booking.paymentIntentId}`}
                              className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-zinc-600 hover:text-emerald-700 bg-zinc-100 hover:bg-emerald-50 px-2 py-0.5 rounded border border-zinc-200 transition"
                            >
                              <CreditCard className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[120px]">{booking.paymentIntentId}</span>
                            </Link>
                          </div>
                        ) : booking.paymentStatus === "pay_on_arrival" ? (
                          <p className="text-[10px] text-zinc-400 font-medium">Cash on Arrival</p>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
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
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageSafe >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 transition"
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
