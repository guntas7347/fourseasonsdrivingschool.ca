"use client";

import React, { useState } from "react";
import { RotateCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { hardRevalidateAllAction } from "@/lib/revalidatePath";
import { useRouter } from "next/navigation";

interface HardRefreshButtonProps {
  variant?: "dashboard" | "sidebar" | "compact";
  className?: string;
}

export default function HardRefreshButton({
  variant = "dashboard",
  className = "",
}: HardRefreshButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const router = useRouter();

  const handleHardRefresh = async () => {
    if (loading) return;
    setLoading(true);
    setStatus("idle");

    try {
      const res = await hardRevalidateAllAction();
      if (res.success) {
        setStatus("success");
        setLastRefreshed(res.timestamp);
        // Refresh client route state to ensure immediate UI sync
        router.refresh();
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Hard refresh failed:", err);
      setStatus("error");
    } finally {
      setLoading(false);
      // Auto-reset state after 4 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 4000);
    }
  };

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={handleHardRefresh}
        disabled={loading}
        title="Hard refresh website cache: revalidatePath('/*', 'layout')"
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200/90 bg-zinc-50/70 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 active:scale-[0.98] disabled:opacity-60 ${className}`}
      >
        <div className="flex items-center gap-2">
          <RotateCw
            className={`h-3.5 w-3.5 text-emerald-600 ${
              loading ? "animate-spin" : ""
            }`}
          />
          <span>
            {loading
              ? "Purging Cache..."
              : status === "success"
              ? "Cache Purged!"
              : "Purge Site Cache"}
          </span>
        </div>
        {status === "success" ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <span className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-[9px] font-mono text-zinc-600">
            PPR
          </span>
        )}
      </button>
    );
  }

  // Dashboard variant
  return (
    <div className="relative inline-flex flex-col items-end">
      <button
        type="button"
        onClick={handleHardRefresh}
        disabled={loading}
        title="Purges all Next.js ISR, Partial Prerendering and revalidatePath caches across the whole site"
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-75 ${
          status === "success"
            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
            : status === "error"
            ? "border-red-300 bg-red-50 text-red-800"
            : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50"
        } ${className}`}
      >
        <RotateCw
          className={`h-4 w-4 ${
            loading
              ? "animate-spin text-emerald-600"
              : status === "success"
              ? "text-emerald-600"
              : "text-emerald-700"
          }`}
        />
        <span>
          {loading
            ? "Refreshing Site Cache..."
            : status === "success"
            ? "Cache Refreshed!"
            : status === "error"
            ? "Refresh Failed"
            : "Hard Refresh Cache"}
        </span>

        {status === "success" && (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        )}
      </button>

      {lastRefreshed && (
        <span className="absolute -bottom-5 right-0 text-[10px] text-zinc-400 whitespace-nowrap">
          Last purged: {lastRefreshed}
        </span>
      )}
    </div>
  );
}
