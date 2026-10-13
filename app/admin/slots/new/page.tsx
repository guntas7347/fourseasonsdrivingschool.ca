"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { createBatchSlotsAction } from "@/lib/actions/slots";
import { useForm } from "@/lib/useForm";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Car,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface SlotConfigFields {
  fromTime: string;
  toTime: string;
  durationMins: string;
  breakMins: string;
  instructor: string;
}

const DEFAULT_CONFIG: SlotConfigFields = {
  fromTime: "08:30",
  toTime: "17:00",
  durationMins: "90",
  breakMins: "15",
  instructor: "Gary S. (Senior ICBC Trainer)",
};

interface GeneratedSlot {
  tempId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  instructor: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Helper: Format 24h "HH:MM" to "hh:mm AM/PM"
function formatTo12Hour(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

// Helper: Add minutes to 24h "HH:MM"
function addMinutes(time24: string, mins: number): string {
  const [hStr, mStr] = time24.split(":");
  const totalMins = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + mins;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export default function AdminAdvancedNewSlotsPage() {
  const router = useRouter();

  // Config inputs managed via useForm as requested
  const { form, handleChange, setFields } = useForm<SlotConfigFields>(DEFAULT_CONFIG);

  // Multi-date selection state (safe static fallback for SSR)
  const [selectedDates, setSelectedDates] = useState<string[]>(["2026-10-16", "2026-10-17"]);

  // Calendar view month state (safe static fallback for SSR)
  const [viewDate, setViewDate] = useState<Date>(new Date(2026, 9, 1));

  // Initialize client-side current date on mount to comply with Next 16 prerender
  useEffect(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day1 = String(d.getDate()).padStart(2, "0");
    const day2 = String(d.getDate() + 1).padStart(2, "0");
    setSelectedDates([`${y}-${m}-${day1}`, `${y}-${m}-${day2}`]);
    setViewDate(new Date(y, d.getMonth(), 1));
  }, []);

  // Generated slot boxes grouped by date: { [dateStr]: GeneratedSlot[] }
  const [slotsByDate, setSlotsByDate] = useState<Record<string, GeneratedSlot[]>>({});

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Multi-date toggle
  const toggleDateSelection = (dateStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr].sort()
    );
  };

  const selectNextNDays = (daysCount: number) => {
    const list: string[] = [];
    const base = new Date();
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      list.push(`${y}-${m}-${day}`);
    }
    setSelectedDates(list);
  };

  // Generate Slots for Selected Dates
  const handleGenerateSlots = () => {
    if (selectedDates.length === 0) {
      setErrorMsg("Please select at least one date on the calendar.");
      return;
    }

    setErrorMsg(null);
    const duration = parseInt(form.durationMins, 10) || 90;
    const gap = parseInt(form.breakMins, 10) || 15;

    // Calculate time intervals from fromTime to toTime
    const intervals: Array<{ start12: string; end12: string }> = [];
    let current = form.fromTime;
    const [toH, toM] = form.toTime.split(":").map(Number);
    const toTotal = toH * 60 + toM;

    while (true) {
      const [curH, curM] = current.split(":").map(Number);
      const curTotal = curH * 60 + curM;
      if (curTotal + duration > toTotal) break;

      const end = addMinutes(current, duration);
      intervals.push({
        start12: formatTo12Hour(current),
        end12: formatTo12Hour(end),
      });

      current = addMinutes(end, gap);
    }

    if (intervals.length === 0) {
      setErrorMsg("No slots could be generated between the From and To time for that duration.");
      return;
    }

    // Build new slots for each selected date
    const updatedMap: Record<string, GeneratedSlot[]> = { ...slotsByDate };

    selectedDates.forEach((dateStr) => {
      const newSlotsForDate: GeneratedSlot[] = intervals.map((int, idx) => ({
        tempId: `${dateStr}-${int.start12}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        date: dateStr,
        startTime: int.start12,
        endTime: int.end12,
        duration: `${duration} mins`,
        instructor: form.instructor,
      }));

      updatedMap[dateStr] = newSlotsForDate;
    });

    setSlotsByDate(updatedMap);
  };

  // Generate standard presets: 5 standard driving lesson shifts
  const handleGenerateStandardShifts = () => {
    if (selectedDates.length === 0) {
      setErrorMsg("Please select at least one date on the calendar first.");
      return;
    }

    setErrorMsg(null);
    const standardIntervals = [
      { start: "08:30 AM", end: "10:00 AM" },
      { start: "10:30 AM", end: "12:00 PM" },
      { start: "01:00 PM", end: "02:30 PM" },
      { start: "03:00 PM", end: "04:30 PM" },
      { start: "05:00 PM", end: "06:30 PM" },
    ];

    const updatedMap: Record<string, GeneratedSlot[]> = { ...slotsByDate };

    selectedDates.forEach((dateStr) => {
      updatedMap[dateStr] = standardIntervals.map((int, idx) => ({
        tempId: `${dateStr}-${int.start}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        date: dateStr,
        startTime: int.start,
        endTime: int.end,
        duration: "90 mins",
        instructor: form.instructor,
      }));
    });

    setSlotsByDate(updatedMap);
  };

  // Remove individual slot box via cross (x)
  const handleRemoveSingleSlot = (dateStr: string, slotId: string) => {
    setSlotsByDate((prev) => {
      const dateSlots = prev[dateStr] || [];
      const filtered = dateSlots.filter((s) => s.tempId !== slotId);
      if (filtered.length === 0) {
        const copy = { ...prev };
        delete copy[dateStr];
        return copy;
      }
      return {
        ...prev,
        [dateStr]: filtered,
      };
    });
  };

  // Remove entire date from list
  const handleRemoveDateSlots = (dateStr: string) => {
    setSlotsByDate((prev) => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
  };

  // Total count of slot boxes ready to be added
  const totalSlotsCount = useMemo(() => {
    return Object.values(slotsByDate).reduce((acc, curr) => acc + curr.length, 0);
  }, [slotsByDate]);

  // Submit and write all slots to Firebase in batch
  const handleConfirmAndAddSlots = async () => {
    if (totalSlotsCount === 0) {
      setErrorMsg("Please generate at least one slot box before confirming.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const flattenedSlots = Object.values(slotsByDate).flat();

      const payload = flattenedSlots.map((s) => ({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.duration,
        instructor: s.instructor,
        status: "available" as const,
      }));

      const res = await createBatchSlotsAction(payload);

      if (res.success) {
        router.push("/admin/slots");
      } else {
        setErrorMsg(res.error || "Failed to save slots in database.");
      }
    } catch (err: any) {
      console.error("Batch slot creation error:", err);
      setErrorMsg(err?.message || "An error occurred while creating slots.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar Day Matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNum: null, dateStr: "" });
    }

    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const y = viewYear;
      const m = String(viewMonth + 1).padStart(2, "0");
      const d = String(dayNum).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      days.push({ dayNum, dateStr });
    }

    return days;
  }, [viewYear, viewMonth]);

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        {/* Navigation back */}
        <Link
          href="/admin/slots"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Lesson Slots</span>
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
            Advanced Lesson Slot Creator
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Select multiple calendar dates, customize shift timings and durations, and manage visual slot boxes.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TOP CONFIGURATION GRID: 1. Multi-Date Calendar & 2. Shift Timing Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1. MULTI-DATE CALENDAR (Left, 6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Step 1: Select Target Dates ({selectedDates.length})
                </h3>
              </div>

              {/* Month navigation */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(viewYear, viewMonth - 1, 1))}
                  className="p-1 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-bold text-zinc-800 px-1">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(viewYear, viewMonth + 1, 1))}
                  className="p-1 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Quick date shortcuts */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => selectNextNDays(7)}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100"
              >
                + Next 7 Days
              </button>
              <button
                type="button"
                onClick={() => selectNextNDays(14)}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100"
              >
                + Next 14 Days
              </button>
              <button
                type="button"
                onClick={() => setSelectedDates([])}
                className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100"
              >
                Clear All
              </button>
            </div>

            {/* Calendar weekday labels */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              {WEEKDAY_NAMES.map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>

            {/* Calendar days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((item, index) => {
                if (!item.dayNum) {
                  return <div key={`empty-${index}`} className="h-9" />;
                }

                const isSelected = selectedDates.includes(item.dateStr);

                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => toggleDateSelection(item.dateStr)}
                    className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition ${
                      isSelected
                        ? "bg-zinc-900 text-white shadow-xs font-bold ring-2 ring-emerald-500"
                        : "bg-zinc-50/70 text-zinc-800 hover:bg-zinc-100"
                    }`}
                  >
                    <span>{item.dayNum}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-zinc-400">
              * Click multiple dates to toggle them on/off.
            </p>
          </div>

          {/* 2. TIMING & INSTRUCTOR CONTROLS (Right, 6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Step 2: Timings, Duration &amp; Instructor
                </h3>
              </div>
            </div>

            {/* From & To Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fromTime" className="block text-xs font-semibold text-zinc-700">
                  From Time (24h)
                </label>
                <input
                  type="time"
                  id="fromTime"
                  name="fromTime"
                  value={form.fromTime}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="toTime" className="block text-xs font-semibold text-zinc-700">
                  To Time (24h)
                </label>
                <input
                  type="time"
                  id="toTime"
                  name="toTime"
                  value={form.toTime}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Duration & Gap */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="durationMins" className="block text-xs font-semibold text-zinc-700">
                  Slot Duration
                </label>
                <select
                  id="durationMins"
                  name="durationMins"
                  value={form.durationMins}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none"
                >
                  <option value="90">90 minutes (Standard)</option>
                  <option value="60">60 minutes</option>
                  <option value="120">120 minutes (2 Hours)</option>
                  <option value="45">45 minutes (Road Test)</option>
                </select>
              </div>

              <div>
                <label htmlFor="breakMins" className="block text-xs font-semibold text-zinc-700">
                  Break / Buffer
                </label>
                <select
                  id="breakMins"
                  name="breakMins"
                  value={form.breakMins}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none"
                >
                  <option value="15">15 minutes break</option>
                  <option value="0">0 minutes (Back-to-back)</option>
                  <option value="30">30 minutes break</option>
                </select>
              </div>
            </div>

            {/* Instructor */}
            <div>
              <label htmlFor="instructor" className="block text-xs font-semibold text-zinc-700">
                Assigned Instructor
              </label>
              <select
                id="instructor"
                name="instructor"
                value={form.instructor}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none"
              >
                <option value="Gary S. (Senior ICBC Trainer)">
                  Gary S. (Senior ICBC Trainer)
                </option>
                <option value="Paul D. (Defensive Specialist)">
                  Paul D. (Defensive Specialist)
                </option>
                <option value="Manpreet K. (Patient & Friendly)">
                  Manpreet K. (Patient &amp; Friendly)
                </option>
              </select>
            </div>

            {/* Generate Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleGenerateSlots}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
                <span>Generate for Selected Dates</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateStandardShifts}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition"
                title="Generates standard 5 shifts: 8:30-10:00, 10:30-12:00, 1:00-2:30, 3:00-4:30, 5:00-6:30"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Standard 5 Shifts Preset</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. VISUAL BUTTON-SHAPED SLOTS BOXES (Grouped by Date with Cross 'X' to Remove) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                Step 3: Review &amp; Remove Slot Boxes
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Each button-shaped box represents an available slot. Click the cross &apos;✕&apos; on any box to remove that specific time.
              </p>
            </div>

            <span className="self-start sm:self-auto rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              {totalSlotsCount} slot{totalSlotsCount === 1 ? "" : "s"} ready to add
            </span>
          </div>

          {Object.keys(slotsByDate).length === 0 ? (
            <div className="py-12 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
              <Clock className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
              <p className="text-xs font-medium">No slot boxes generated yet.</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Select dates on the calendar above and click &quot;Generate for Selected Dates&quot;.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(slotsByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([dateStr, dateSlots]) => (
                  <div
                    key={dateStr}
                    className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition"
                  >
                    {/* Date Row Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-emerald-600" />
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900">
                          {dateStr}
                        </h4>
                        <span className="text-[11px] text-zinc-500 font-medium">
                          ({dateSlots.length} slot{dateSlots.length === 1 ? "" : "s"})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDateSlots(dateStr)}
                        className="text-[11px] font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove Date</span>
                      </button>
                    </div>

                    {/* Button-Shaped Slot Boxes with Cross (X) */}
                    <div className="flex flex-wrap gap-2.5">
                      {dateSlots.map((slot) => (
                        <div
                          key={slot.tempId}
                          className="group inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-900 shadow-xs hover:border-zinc-400 transition"
                        >
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-zinc-400" />
                            <span>
                              {slot.startTime} – {slot.endTime}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-normal">
                              ({slot.duration})
                            </span>
                          </div>

                          {/* Cross (X) Button to remove this slot box */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSingleSlot(dateStr, slot.tempId)}
                            className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-red-100 hover:text-red-600 transition"
                            title="Remove this slot"
                            aria-label={`Remove slot ${slot.startTime} on ${dateStr}`}
                          >
                            <X className="h-3 w-3 stroke-[2.5]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 4. CONFIRM AND ADD SLOTS OPTION AT BOTTOM (Exact Request!) */}
        <div className="sticky bottom-4 z-20 rounded-2xl border border-zinc-200 bg-white/95 p-4 sm:p-5 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-zinc-900">
              Ready to Publish Instructor Schedule?
            </p>
            <p className="text-xs text-zinc-500">
              Total {totalSlotsCount} slot box{totalSlotsCount === 1 ? "" : "es"} across{" "}
              {Object.keys(slotsByDate).length} date(s) will be created with real Firebase document IDs.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/admin/slots"
              className="w-1/2 sm:w-auto rounded-xl border border-zinc-200 px-4 py-3 text-center text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleConfirmAndAddSlots}
              disabled={submitting || totalSlotsCount === 0}
              className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-zinc-800 transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              )}
              <span>
                {submitting
                  ? "Adding Slots..."
                  : `Confirm & Add ${totalSlotsCount} Slots`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
