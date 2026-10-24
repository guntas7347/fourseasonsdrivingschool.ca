/**
 * Utility functions for slot time manipulation and overlap detection.
 * Safe to use in both Client Components and Server Actions.
 */

export interface TimeInterval {
  startTime?: string;
  endTime?: string;
  time?: string;
  instructor?: string;
  date?: string;
}

/**
 * Extract clean startTime and endTime strings from a slot object or time string.
 * Handles: "08:30 AM – 10:00 AM", "8:30 AM - 10:00 AM", "08:30", etc.
 */
export function extractSlotTimes(slot: {
  startTime?: string;
  endTime?: string;
  time?: string;
}): { startTime: string; endTime: string } {
  let start = slot.startTime ? slot.startTime.trim() : "";
  let end = slot.endTime ? slot.endTime.trim() : "";

  if ((!start || !end) && slot.time) {
    const parts = slot.time.split(/[-–—]/);
    if (parts.length >= 2) {
      if (!start) start = parts[0].trim();
      if (!end) end = parts[1].trim();
    }
  }

  return { startTime: start, endTime: end };
}

/**
 * Parse 12-hour or 24-hour time string into total minutes from midnight (0 to 1439).
 * Handles: "8:30 AM", "08:30 AM", "12:00 PM", "12:00 AM", "17:00", "5:00 PM", etc.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes("PM");
  const isAM = cleaned.includes("AM");

  const timeOnly = cleaned.replace(/[^0-9:]/g, "").trim();
  const parts = timeOnly.split(":");
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  return h * 60 + m;
}

/**
 * Check if two time intervals on the same date overlap.
 * Intervals [startA, endA) and [startB, endB) overlap if startA < endB && startB < endA.
 */
export function doSlotsOverlap(
  slotA: { startTime?: string; endTime?: string; time?: string },
  slotB: { startTime?: string; endTime?: string; time?: string }
): boolean {
  const timesA = extractSlotTimes(slotA);
  const timesB = extractSlotTimes(slotB);

  if (!timesA.startTime || !timesA.endTime || !timesB.startTime || !timesB.endTime) {
    return false;
  }

  const startA = parseTimeToMinutes(timesA.startTime);
  const endA = parseTimeToMinutes(timesA.endTime);
  const startB = parseTimeToMinutes(timesB.startTime);
  const endB = parseTimeToMinutes(timesB.endTime);

  const adjustedEndA = endA <= startA ? endA + 1440 : endA;
  const adjustedEndB = endB <= startB ? endB + 1440 : endB;

  return startA < adjustedEndB && startB < adjustedEndA;
}

/**
 * Check if two slots have an instructor conflict.
 * If neither has an instructor or either is unassigned / chief instructor or they match, it conflicts.
 */
export function hasInstructorConflict(
  instructorA?: string,
  instructorB?: string
): boolean {
  const a = (instructorA || "").toLowerCase().trim();
  const b = (instructorB || "").toLowerCase().trim();
  if (!a || !b) return true; // Single fleet / default instructor
  return a === b;
}
