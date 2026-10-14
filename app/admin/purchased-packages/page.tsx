"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getPackageOrdersAction, PackageOrderItem } from "@/lib/actions/packages";
import { exportToCsv } from "@/lib/exportCsv";
import {
  ShoppingBag,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Loader2,
  CheckCircle2,
  Clock,
  Package,
} from "lucide-react";

const PAGE_SIZE = 20;

export default function AdminPurchasedPackagesPage() {
  const [orders, setOrders] = useState<PackageOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await getPackageOrdersAction();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load purchased packages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  // Filtered orders based on search
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.packageName.toLowerCase().includes(q) ||
        o.orderId.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  // Pagination calculation
  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pageSafe = Math.min(currentPage, totalPages);
  const startIndex = (pageSafe - 1) * PAGE_SIZE;
  const currentItems = filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);

  // Handle CSV export of current page table data
  const handleExportCsv = () => {
    const headers = [
      "Order ID",
      "Date Purchased",
      "Student Name",
      "Email",
      "Phone",
      "City",
      "Package Name",
      "Price",
      "Lessons Count",
      "Preferred Start Date",
      "Payment Method",
      "Payment Status",
      "Notes",
    ];

    const rows = currentItems.map((o) => [
      o.orderId,
      new Date(o.createdAt).toLocaleString("en-CA"),
      o.customerName,
      o.email,
      o.phone,
      o.city || "Surrey",
      o.packageName,
      o.packagePrice,
      o.lessonsCount || 1,
      o.preferredStartDate || "Flexible",
      o.paymentMethod || "card",
      o.paymentStatus || "paid",
      o.additionalNotes || "",
    ]);

    exportToCsv("purchased_packages_page_" + pageSafe, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
            Purchased Packages
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            All driving lesson packages purchased by clients online and through management.
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
            placeholder="Search by student, email, phone, or package..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none transition"
          />
        </div>

        <div className="text-xs text-zinc-500 font-medium">
          Showing <strong>{currentItems.length}</strong> of <strong>{totalItems}</strong> packages (Page {pageSafe} of {totalPages})
        </div>
      </div>

      {/* Table / Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
          <p className="mt-3 text-xs font-semibold">Loading purchased packages...</p>
        </div>
      ) : totalItems === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300" />
          <h3 className="mt-3 text-base font-bold text-zinc-900">No Purchased Packages Found</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {searchQuery
              ? "No packages match your search query."
              : "When clients purchase packages online, their orders will appear here."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-3.5">Student / Contact</th>
                  <th className="px-5 py-3.5">Package Purchased</th>
                  <th className="px-5 py-3.5">Price &amp; Lessons</th>
                  <th className="px-5 py-3.5">Start Date &amp; City</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {currentItems.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                    {/* Student Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-xs">
                          {order.firstName?.[0] || order.customerName?.[0] || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-950 text-sm">
                            {order.customerName}
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-zinc-400" />
                            <span>{order.email}</span>
                          </p>
                          <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-zinc-400" />
                            <span>{order.phone}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Package Name */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{order.packageName}</span>
                        </span>
                        <p className="text-[10px] font-mono text-zinc-400">
                          Ref: #{order.orderId.slice(0, 10)}
                        </p>
                      </div>
                    </td>

                    {/* Price & Lessons */}
                    <td className="px-5 py-4">
                      <span className="font-extrabold text-zinc-950 text-sm">
                        {order.packagePrice}
                      </span>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {order.lessonsCount || 1} lesson session(s)
                      </p>
                    </td>

                    {/* Start Date & City */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-zinc-800">
                        {order.preferredStartDate ? order.preferredStartDate : "Flexible Start"}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {order.city || "Surrey"} {order.street ? `• ${order.street}` : ""}
                      </p>
                    </td>

                    {/* Payment Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{order.paymentStatus === "paid" ? "Paid (Card)" : "Pay on Arrival"}</span>
                      </span>
                    </td>

                    {/* Date Purchased */}
                    <td className="px-5 py-4 text-[11px] text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString("en-CA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
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
                Page {pageSafe} of {totalPages} ({totalItems} total orders)
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
