"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getTransactions, type Transaction, type TransactionType } from "@/lib/actions/transactions";
import { exportToCsv } from "@/lib/exportCsv";
import {
  DollarSign,
  CreditCard,
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Loader2,
  ShieldCheck,
  Receipt,
  Calendar,
  Undo2,
  ArrowDownLeft,
  Filter,
} from "lucide-react";

const PAGE_SIZE = 20;

function TransactionsTableInner() {
  const searchParams = useSearchParams();
  const initialSearchParam = searchParams.get("search") || "";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Filter: "succeeded" is default as requested!
  const [statusFilter, setStatusFilter] = useState<string>("succeeded");

  // Search state
  const [searchInput, setSearchInput] = useState(initialSearchParam);
  const [activeSearch, setActiveSearch] = useState(initialSearchParam);

  // Pagination state (stack of cursors)
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch transactions function
  const fetchPage = async (cursor?: string, searchId?: string, currentStatus = statusFilter) => {
    try {
      setLoading(true);
      setError(null);

      const res = await getTransactions(cursor, PAGE_SIZE, undefined, searchId, currentStatus);

      if (res.error && res.data.length === 0) {
        setError(res.error);
        setTransactions([]);
        setHasMore(false);
        setNextCursor(null);
      } else {
        setTransactions(res.data);
        setHasMore(res.hasMore);
        setNextCursor(res.nextCursor);
      }
    } catch (err: any) {
      console.error("Failed to load Stripe transactions:", err);
      setError(err?.message || "Failed to communicate with Stripe API.");
      setTransactions([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // When activeSearch or statusFilter changes, reset pagination and fetch
  useEffect(() => {
    setCursorStack([undefined]);
    setPageIndex(1);
    fetchPage(undefined, activeSearch || undefined, statusFilter);
  }, [activeSearch, statusFilter]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  // Handle Clear Search
  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
  };

  // Filter directly to a specific transaction (e.g. from refund row clicking its paymentId reference)
  const handleFilterToReference = (refId: string) => {
    setSearchInput(refId);
    setActiveSearch(refId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Next Page
  const handleNextPage = () => {
    if (!hasMore || !nextCursor || loading) return;

    const newStack = [...cursorStack, nextCursor];
    setCursorStack(newStack);
    setPageIndex((p) => p + 1);
    fetchPage(nextCursor, activeSearch || undefined, statusFilter);
  };

  // Handle Previous Page
  const handlePrevPage = () => {
    if (pageIndex <= 1 || loading) return;

    const newStack = cursorStack.slice(0, -1);
    const prevCursor = newStack[newStack.length - 1];
    setCursorStack(newStack);
    setPageIndex((p) => p - 1);
    fetchPage(prevCursor, activeSearch || undefined, statusFilter);
  };

  // Handle Refresh
  const handleRefresh = () => {
    const currentCursor = cursorStack[pageIndex - 1];
    fetchPage(currentCursor, activeSearch || undefined, statusFilter);
  };

  // Copy ID to clipboard
  const handleCopyId = (id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Export current page to CSV
  const handleExportCsv = () => {
    const headers = [
      "Type",
      "Transaction ID",
      "Reference ID",
      "Reference Type",
      "Amount",
      "Currency",
      "Status",
      "Date & Time",
      "Customer Name",
      "Customer Email",
      "Description",
      "Payment Method",
      "Card Brand",
      "Card Last 4",
      "Refund Reason",
      "Stripe Receipt URL",
    ];

    const rows = transactions.map((t) => [
      t.type.toUpperCase(),
      t.id,
      t.referenceId || "N/A",
      t.referenceType || "N/A",
      t.type === "refund" ? `-${(t.amount / 100).toFixed(2)}` : (t.amount / 100).toFixed(2),
      t.currency.toUpperCase(),
      t.status,
      new Date(t.created * 1000).toLocaleString("en-CA"),
      t.customerName || "N/A",
      t.customerEmail || "N/A",
      t.description || "Driving Lesson Payment",
      t.paymentMethod || "card",
      t.cardBrand || "N/A",
      t.cardLast4 ? `•••• ${t.cardLast4}` : "N/A",
      t.refundReason || "N/A",
      t.receiptUrl || "N/A",
    ]);

    exportToCsv(`stripe_ledger_page_${pageIndex}`, headers, rows);
  };

  // Ledger stats calculation
  const totalInflow = transactions
    .filter((t) => t.type === "payment" && t.status === "succeeded")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefundOutflow = transactions
    .filter((t) => t.type === "refund")
    .reduce((sum, t) => sum + t.amount, 0);

  const netRevenue = totalInflow - totalRefundOutflow;
  const paymentRowsCount = transactions.filter((t) => t.type === "payment").length;
  const refundRowsCount = transactions.filter((t) => t.type === "refund").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
              Transactions Ledger
            </h1>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              Live Stripe Ledger
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Real-time accounting ledger showing payments and refunds as separate rows with linked references.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-50 transition active:scale-95"
            title="Refresh transactions from Stripe"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-zinc-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={transactions.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 hover:border-zinc-400 disabled:opacity-50 transition active:scale-95"
            title="Export current page table data to Excel CSV"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Export to Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Page Net Revenue
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-950">
            ${(netRevenue / 100).toLocaleString("en-CA", { minimumFractionDigits: 2 })}
            <span className="text-xs font-medium text-zinc-400 ml-1.5">CAD</span>
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Gross inflow: ${(totalInflow / 100).toFixed(2)} | Refunds: -${(totalRefundOutflow / 100).toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Ledger Entries
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-zinc-950">
            {transactions.length}
            <span className="text-xs font-medium text-zinc-400 ml-1.5">rows</span>
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            {paymentRowsCount} payments &bull; {refundRowsCount} refunds
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Active Filter
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Filter className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-base font-bold text-zinc-950 capitalize flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{statusFilter.replace(/_/g, " ")}</span>
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            {statusFilter === "succeeded" ? "Showing settled customer transactions (default)" : "Custom status filter applied"}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-1 text-xs text-zinc-500 font-semibold mr-1">
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            <span>Filter by Status:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "succeeded", label: "Succeeded (Default)", dot: "bg-emerald-500" },
              { id: "all", label: "All Transactions", dot: "bg-zinc-400" },
              { id: "refund", label: "Refunds Only", dot: "bg-purple-500" },
              { id: "requires_payment_method", label: "Incomplete / Abandoned", dot: "bg-amber-500" },
              { id: "canceled", label: "Canceled", dot: "bg-red-500" },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-zinc-900 text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : tab.dot}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar for Payment Intent ID or Refund ID */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by Session ID (cs_...), Payment Intent (pi_...), or Refund (re_...)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-10 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none transition font-mono"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 rounded-md"
                title="Clear input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 transition active:scale-95"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search ID</span>
            </button>

            {activeSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                title="Reset search to all transactions"
              >
                <X className="h-3.5 w-3.5 text-zinc-400" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </form>

        {activeSearch && (
          <div className="flex items-center justify-between bg-zinc-50 rounded-xl px-3.5 py-2 border border-zinc-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-medium">Filtered by ID:</span>
              <code className="font-mono font-bold text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200">
                {activeSearch}
              </code>
            </div>
            <button
              onClick={handleClearSearch}
              className="text-[11px] font-semibold text-emerald-700 hover:underline"
            >
              Show all transactions &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Main Ledger Table */}
      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center shadow-xs">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-800" />
          <p className="mt-3 text-xs font-semibold text-zinc-600">
            Loading live transactions ledger from Stripe API...
          </p>
        </div>
      ) : error && transactions.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-xs">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
          <h3 className="mt-3 text-sm font-bold text-zinc-900">No Transaction Found</h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={handleClearSearch}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition"
          >
            <span>Reset Search</span>
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-xs">
          <CreditCard className="mx-auto h-12 w-12 text-zinc-300" />
          <h3 className="mt-3 text-base font-bold text-zinc-900">No Records Found</h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
            No transactions match the current filter &quot;{statusFilter}&quot;. Try switching to &quot;All Transactions&quot; or clearing your search.
          </p>
          {statusFilter !== "all" && (
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition"
            >
              <span>View All Statuses</span>
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-3.5">Type &amp; Transaction ID</th>
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Method / Details</th>
                  <th className="px-5 py-3.5">Date &amp; Time</th>
                  <th className="px-5 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {transactions.map((t) => {
                  const isPayment = t.type === "payment";
                  const isRefund = t.type === "refund";
                  const isSucceeded = t.status === "succeeded";
                  const isProcessing = t.status === "processing";
                  const isCanceled = t.status === "canceled";

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-zinc-50/80 transition-colors ${
                        isRefund ? "bg-purple-50/20" : ""
                      }`}
                    >
                      {/* Column 1: Type & Transaction ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* Type Badge */}
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              isPayment
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {isPayment ? (
                              <ArrowDownLeft className="h-3 w-3" />
                            ) : (
                              <Undo2 className="h-3 w-3" />
                            )}
                            <span>{isPayment ? "Payment" : "Refund"}</span>
                          </span>

                          {/* Monospace ID */}
                          <span
                            className="font-mono font-semibold text-zinc-900 select-all"
                            title={t.id}
                          >
                            {t.id}
                          </span>

                          {/* Copy button */}
                          <button
                            type="button"
                            onClick={() => handleCopyId(t.id)}
                            className="text-zinc-400 hover:text-zinc-800 p-0.5 rounded hover:bg-zinc-100 transition"
                            title={`Copy ${isPayment ? "Payment Intent" : "Refund"} ID`}
                          >
                            {copiedId === t.id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                        {/* Refund info badge on payment row */}
                        {isPayment && t.refunded && (
                          <div className="mt-1">
                            <span className="inline-block rounded bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 text-[10px] font-bold font-sans">
                              {t.amountRefunded >= t.amount
                                ? "Fully Refunded"
                                : `Partially Refunded ($${(t.amountRefunded / 100).toFixed(2)})`}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Column 2: Reference */}
                      <td className="px-5 py-4">
                        {isPayment ? (
                          t.referenceId ? (
                            <Link
                              href={
                                t.referenceType === "package"
                                  ? `/admin/purchased-packages`
                                  : `/admin/bookings?search=${encodeURIComponent(t.referenceId)}`
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200 transition"
                              title={`Go to associated ${t.referenceType === "package" ? "Package Order" : "Booking"} in Admin`}
                            >
                              <span>{t.referenceType === "package" ? "Package" : "Booking"}: #{t.referenceId.slice(0, 8)}</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          ) : (
                            <span className="text-[11px] text-zinc-400 italic">Direct Checkout</span>
                          )
                        ) : (
                          t.referenceId ? (
                            <button
                              type="button"
                              onClick={() => handleFilterToReference(t.referenceId!)}
                              className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100/70 px-2 py-0.5 rounded border border-purple-200 transition"
                              title="Click to filter to this original payment"
                            >
                              <span>Payment: {t.referenceId.slice(0, 14)}...</span>
                              <Search className="h-2.5 w-2.5" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-zinc-400 italic">Original Payment</span>
                          )
                        )}
                      </td>

                      {/* Column 3: Customer */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-zinc-900">
                          {t.customerName || "Customer"}
                        </p>
                        {t.customerEmail && (
                          <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5 font-sans">
                            <Mail className="h-3 w-3 text-zinc-400" />
                            <span>{t.customerEmail}</span>
                          </p>
                        )}
                      </td>

                      {/* Column 4: Amount */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`font-bold text-sm ${
                            isPayment ? "text-emerald-700" : "text-rose-700 font-mono"
                          }`}
                        >
                          {isPayment ? "+" : "-"}
                          {(t.amount / 100).toLocaleString("en-CA", {
                            style: "currency",
                            currency: t.currency.toUpperCase(),
                          })}
                        </span>
                      </td>

                      {/* Column 5: Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isSucceeded
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : isProcessing
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : isCanceled
                              ? "bg-red-50 text-red-800 border border-red-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {isSucceeded ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          <span className="capitalize">{t.status.replace(/_/g, " ")}</span>
                        </span>
                      </td>

                      {/* Column 6: Method / Details */}
                      <td className="px-5 py-4">
                        {isRefund && t.refundReason ? (
                          <div>
                            <span className="text-[11px] text-purple-900 font-medium capitalize">
                              Reason: {t.refundReason}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-zinc-700 font-medium">
                            <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="capitalize">
                              {t.cardBrand || t.paymentMethod || "Card"}
                            </span>
                            {t.cardLast4 && (
                              <span className="font-mono text-zinc-500 text-[11px]">
                                •••• {t.cardLast4}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 7: Date & Time */}
                      <td className="px-5 py-4 text-zinc-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-zinc-400" />
                          <span>
                            {new Date(t.created * 1000).toLocaleString("en-CA", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Column 8: Receipt */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {t.receiptUrl ? (
                          <a
                            href={t.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline bg-zinc-50 hover:bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200 transition"
                          >
                            <Receipt className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Receipt</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-200 px-5 py-3.5 bg-zinc-50/70 gap-3">
            <div className="text-xs text-zinc-500 font-medium">
              Showing <strong>{transactions.length}</strong> ledger records on Page{" "}
              <strong>{pageIndex}</strong> (Status: <strong>{statusFilter}</strong>)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={pageIndex <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-bold text-zinc-800 px-2">Page {pageIndex}</span>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={!hasMore || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 transition"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
          <p className="mt-3 text-xs font-semibold">Loading Stripe transactions ledger...</p>
        </div>
      }
    >
      <TransactionsTableInner />
    </Suspense>
  );
}
