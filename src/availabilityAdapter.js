import { checkAvailability } from "@/availability";

const BOOKING_DATE = "2026-11-04";
const MINUTES_PER_DAY = 1440;
const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

export function parseTimeLabel(label) {
  const match = TIME_PATTERN.exec(label.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

function minutesToIso(min) {
  return new Date(Date.parse(`${BOOKING_DATE}T00:00:00Z`) + min * 60000).toISOString();
}

function isValidMinute(min) {
  return Number.isInteger(min) && min >= 0 && min <= MINUTES_PER_DAY;
}

export function checkSlot({ startMin, endMin, blocked, bookings, nowMin }) {
  if (!isValidMinute(startMin) || !isValidMinute(endMin)) {
    return { available: false, reason: "MALFORMED" };
  }

  const request = { start: minutesToIso(startMin), end: minutesToIso(endMin) };
  const isoBookings = bookings.map((b) => ({
    id: b.id,
    start: minutesToIso(b.startMin),
    end: minutesToIso(b.endMin),
  }));

  return checkAvailability(request, isoBookings, { blocked }, minutesToIso(nowMin));
}
