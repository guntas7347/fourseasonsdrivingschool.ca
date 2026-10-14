"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Check,
  Car,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { getSlotsAction, getAvailableSlotDatesAction } from "@/lib/actions/slots";

export interface TimeSlot {
  id: string;
  time: string; // e.g. "08:30 AM – 10:00 AM"
  startTime: string;
  endTime: string;
  duration: string; // "90 mins"
  instructor?: string;
  available: boolean;
  type: "Regular" | "Peak" | "Weekend";
}

interface SlotCalendarProps {
  selectedDate: string; // Format: "YYYY-MM-DD"
  selectedSlot: TimeSlot | null;
  onSelectDate: (dateStr: string) => void;
  onSelectSlot: (slot: TimeSlot) => void;
}

// Generate realistic slots for any given date
function getSlotsForDate(dateStr: string): TimeSlot[] {
  if (!dateStr) return [];
  const [year, month, day] = dateStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Base schedule templates
  if (isWeekend) {
    return [
      {
        id: `${dateStr}-slot-1`,
        time: "09:00 AM – 10:30 AM",
        startTime: "09:00 AM",
        endTime: "10:30 AM",
        duration: "90 mins",
        instructor: "Gary S. (Senior ICBC Trainer)",
        available: true,
        type: "Weekend",
      },
      {
        id: `${dateStr}-slot-2`,
        time: "11:00 AM – 12:30 PM",
        startTime: "11:00 AM",
        endTime: "12:30 PM",
        duration: "90 mins",
        instructor: "Paul D. (Defensive Specialist)",
        available: day % 2 === 0, // Mock booked on some days
        type: "Weekend",
      },
      {
        id: `${dateStr}-slot-3`,
        time: "01:30 PM – 03:00 PM",
        startTime: "01:30 PM",
        endTime: "03:00 PM",
        duration: "90 mins",
        instructor: "Gary S. (Senior ICBC Trainer)",
        available: true,
        type: "Weekend",
      },
      {
        id: `${dateStr}-slot-4`,
        time: "03:30 PM – 05:00 PM",
        startTime: "03:30 PM",
        endTime: "05:00 PM",
        duration: "90 mins",
        instructor: "Manpreet K. (Patient & Friendly)",
        available: true,
        type: "Weekend",
      },
    ];
  }

  // Weekday schedule
  return [
    {
      id: `${dateStr}-slot-1`,
      time: "08:30 AM – 10:00 AM",
      startTime: "08:30 AM",
      endTime: "10:00 AM",
      duration: "90 mins",
      instructor: "Gary S. (Senior ICBC Trainer)",
      available: true,
      type: "Regular",
    },
    {
      id: `${dateStr}-slot-2`,
      time: "10:30 AM – 12:00 PM",
      startTime: "10:30 AM",
      endTime: "12:00 PM",
      duration: "90 mins",
      instructor: "Paul D. (Defensive Specialist)",
      available: true,
      type: "Regular",
    },
    {
      id: `${dateStr}-slot-3`,
      time: "01:00 PM – 02:30 PM",
      startTime: "01:00 PM",
      endTime: "02:30 PM",
      duration: "90 mins",
      instructor: "Manpreet K. (Patient & Friendly)",
      available: day % 3 !== 0, // Some booked
      type: "Regular",
    },
    {
      id: `${dateStr}-slot-4`,
      time: "03:00 PM – 04:30 PM",
      startTime: "03:00 PM",
      endTime: "04:30 PM",
      duration: "90 mins",
      instructor: "Gary S. (Senior ICBC Trainer)",
      available: true,
      type: "Peak",
    },
    {
      id: `${dateStr}-slot-5`,
      time: "05:00 PM – 06:30 PM",
      startTime: "05:00 PM",
      endTime: "06:30 PM",
      duration: "90 mins",
      instructor: "Paul D. (Defensive Specialist)",
      available: day % 4 !== 0,
      type: "Peak",
    },
  ];
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

export default function SlotCalendar({
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
}: SlotCalendarProps) {
  // Safe initial state for Next 16 prerender
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(2026, 9, 1); // October 2026 fallback
  });

  const [todayStr, setTodayStr] = useState<string>("2026-10-15");

  // Defer current client time calculation to avoid Next 16 prerender blocking
  useEffect(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const currentToday = `${year}-${month}-${day}`;
    setTodayStr(currentToday);

    if (!selectedDate) {
      onSelectDate(currentToday);
      setViewDate(new Date(year, d.getMonth(), 1));
    }
  }, [selectedDate, onSelectDate]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleJumpToToday = () => {
    const [y, m] = todayStr.split("-").map(Number);
    setViewDate(new Date(y, m - 1, 1));
    onSelectDate(todayStr);
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, dayNum);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, "0");
      const d = String(dayNum).padStart(2, "0");
      days.push({
        dateStr: `${y}-${m}-${d}`,
        dayNum,
        isCurrentMonth: false,
        isPast: `${y}-${m}-${d}` < todayStr,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const y = viewYear;
      const m = String(viewMonth + 1).padStart(2, "0");
      const d = String(dayNum).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: true,
        isPast: dateStr < todayStr,
      });
    }

    // Next month filler days to complete rows
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const nextDate = new Date(viewYear, viewMonth + 1, dayNum);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, "0");
      const d = String(dayNum).padStart(2, "0");
      days.push({
        dateStr: `${y}-${m}-${d}`,
        dayNum,
        isCurrentMonth: false,
        isPast: `${y}-${m}-${d}` < todayStr,
      });
    }

    return days;
  }, [viewYear, viewMonth, todayStr]);

  // Live available dates from Firestore
  const [liveDates, setLiveDates] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch all dates that have available slots in database
  useEffect(() => {
    async function loadLiveDates() {
      try {
        const dates = await getAvailableSlotDatesAction();
        setLiveDates(dates || []);
      } catch (err) {
        console.error("Failed to load live available slot dates:", err);
      }
    }
    loadLiveDates();
  }, [viewMonth, viewYear]);

  // Load database slots for active date
  const [dbSlots, setDbSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchDateSlots() {
      const targetDate = selectedDate || todayStr;
      if (!targetDate) return;
      try {
        setLoadingSlots(true);
        const slotsFromDb = await getSlotsAction(targetDate);
        if (isMounted && slotsFromDb) {
          setDbSlots(
            slotsFromDb.map((s) => ({
              id: s.id,
              time: s.time,
              startTime: s.startTime,
              endTime: s.endTime,
              duration: s.duration,
              instructor: s.instructor,
              available: s.status === "available",
              type: "Regular",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch slots from DB:", err);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }
    fetchDateSlots();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, todayStr]);

  // Available slots for the currently active selected date
  const availableSlots = useMemo(() => {
    // If database has any slots configured, show real live database slots
    if (liveDates.length > 0 || dbSlots.length > 0) {
      return dbSlots;
    }
    // Only if database has zero slots across all dates (fresh dev), fallback to template
    return getSlotsForDate(selectedDate || todayStr);
  }, [dbSlots, liveDates.length, selectedDate, todayStr]);

  // Formatted date string for header
  const formattedSelectedDate = useMemo(() => {
    const target = selectedDate || todayStr;
    if (!target) return "Select a Date";
    const [y, m, d] = target.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedDate, todayStr]);

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-3.5 sm:p-6 shadow-sm overflow-hidden">
      {/* Calendar Header / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-emerald-600 shrink-0" />
            <h4 className="text-sm sm:text-base font-bold text-zinc-900">
              Select Lesson Date &amp; Available Time Slot
            </h4>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time lesson schedule for Surrey &amp; Delta training cars.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
            Booked / Past
          </span>
        </div>
      </div>

      {/* Main Responsive Grid: Calendar on Left/Top, Slots on Right/Bottom */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CALENDAR COLUMN */}
        <div className="lg:col-span-6 flex flex-col">
          {/* Month / Year Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-zinc-900">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={handleJumpToToday}
                className="rounded-md border border-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 transition"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 active:scale-95 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 active:scale-95 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAY_NAMES.map((name) => (
              <span
                key={name}
                className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider py-1"
              >
                {name}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((item, index) => {
              const isSelected = item.dateStr === (selectedDate || todayStr);
              const isToday = item.dateStr === todayStr;
              const isDisabled = item.isPast || !item.isCurrentMonth;

              return (
                <button
                  key={`${item.dateStr}-${index}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelectDate(item.dateStr)}
                  className={`relative flex flex-col items-center justify-center rounded-xl p-1.5 sm:p-2 h-10 sm:h-12 text-xs font-medium touch-manipulation select-none transition-all ${
                    isSelected
                      ? "bg-zinc-900 text-white font-bold shadow-md shadow-zinc-950/20 scale-[1.02]"
                      : isDisabled
                      ? "text-zinc-300 bg-transparent cursor-not-allowed"
                      : "text-zinc-800 hover:bg-emerald-50 hover:text-emerald-950 active:scale-95 bg-zinc-50/70"
                  } ${isToday && !isSelected ? "ring-1.5 ring-emerald-600 font-bold" : ""}`}
                >
                  <span>{item.dayNum}</span>

                  {/* Indicator dot for available slots in current month */}
                  {!isDisabled && item.isCurrentMonth && (
                    <span
                      className={`mt-1 h-1.5 w-1.5 rounded-full ${
                        (liveDates.length > 0 ? liveDates.includes(item.dateStr) : true)
                          ? isSelected
                            ? "bg-emerald-400"
                            : "bg-emerald-500"
                          : "bg-transparent"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] text-zinc-400 text-center sm:text-left">
            * Dates with green dots have live available slots.
          </p>
        </div>

        {/* TIME SLOTS COLUMN */}
        <div className="lg:col-span-6 flex flex-col border-t lg:border-t-0 lg:border-l border-zinc-100 pt-6 lg:pt-0 lg:pl-8">
          {/* Header for slots */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Available Times (Live)
              </span>
              <h5 className="text-sm font-bold text-zinc-900">
                {formattedSelectedDate}
              </h5>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
              {availableSlots.filter((s) => s.available).length} open slots
            </span>
          </div>

          {/* Slots List / Grid */}
          <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {loadingSlots ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                <Clock className="h-6 w-6 animate-spin text-emerald-600 mb-2" />
                <p className="text-xs">Checking live slots...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                <CalendarIcon className="h-8 w-8 mb-2 stroke-1 text-zinc-300" />
                <p className="text-xs font-semibold text-zinc-700">No open slots on {formattedSelectedDate}</p>
                <p className="text-[11px] text-zinc-400 mt-1 max-w-xs">
                  Please choose a date marked with a green indicator to view available appointment times.
                </p>
              </div>
            ) : (
              availableSlots.map((slot) => {
                const isSlotSelected = selectedSlot?.id === slot.id;

                if (!slot.available) {
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 p-3 opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-500 line-through">
                            {slot.time}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            Dual-control training vehicle
                          </p>
                        </div>
                      </div>
                      <span className="rounded bg-zinc-200/80 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                        Reserved
                      </span>
                    </div>
                  );
                }

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    className={`w-full flex items-center justify-between rounded-xl p-3 sm:p-3.5 text-left touch-manipulation select-none transition-all ${
                      isSlotSelected
                        ? "border-2 border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600"
                        : "border border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.99]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isSlotSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {isSlotSelected ? (
                          <Check className="h-4 w-4 stroke-[2.5]" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-xs sm:text-sm font-bold ${
                              isSlotSelected ? "text-emerald-950" : "text-zinc-900"
                            }`}
                          >
                            {slot.time}
                          </p>
                          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                            {slot.duration}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                          <Car className="h-3 w-3 text-emerald-600 inline" />
                          <span>Dual-Control Training Vehicle</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                          isSlotSelected
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-zinc-900 text-white hover:bg-zinc-800"
                        }`}
                      >
                        {isSlotSelected ? "Selected" : "Choose"}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Active slot confirmation badge */}
          {selectedSlot && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Selected:</strong> {formattedSelectedDate} at{" "}
                  <strong>{selectedSlot.time}</strong>
                </span>
              </div>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800 font-semibold">
                Confirmed
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
