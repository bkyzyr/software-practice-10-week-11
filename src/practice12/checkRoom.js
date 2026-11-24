export const MAX_DURATION_MINUTES = 120;

export const REASON = {
  OK: "OK",
  INVALID_START: "INVALID_START",
  PAST_START: "PAST_START",
  INVALID_DURATION: "INVALID_DURATION",
  DURATION_TOO_LONG: "DURATION_TOO_LONG",
  BLOCKED: "BLOCKED",
  OVERLAP: "OVERLAP",
};

function toDate(value) {
  if (value instanceof Date) return value;
  if (typeof value !== "string" || value.trim() === "") return null;
  return new Date(value);
}

function result(available, reasonCode, message) {
  return { available, reasonCode, message };
}

export function checkRoomAvailability({
  start,
  durationMinutes,
  blocked = false,
  bookings = [],
  now = new Date(),
}) {
  const startDate = toDate(start);
  if (!startDate || Number.isNaN(startDate.getTime())) {
    return result(false, REASON.INVALID_START, "Please enter a valid start time, for example 2026-12-01T11:30.");
  }

  const nowDate = toDate(now) || new Date();
  if (startDate.getTime() <= nowDate.getTime()) {
    return result(false, REASON.PAST_START, "The start time must be in the future.");
  }

  const duration =
    typeof durationMinutes === "string" && durationMinutes.trim() !== ""
      ? Number(durationMinutes)
      : durationMinutes;
  if (typeof duration !== "number" || !Number.isInteger(duration)) {
    return result(false, REASON.INVALID_DURATION, "Duration must be a whole number of minutes.");
  }
  if (duration <= 0) {
    return result(false, REASON.INVALID_DURATION, "Duration must be greater than zero.");
  }
  if (duration > MAX_DURATION_MINUTES) {
    return result(false, REASON.DURATION_TOO_LONG, "Duration cannot be longer than 120 minutes.");
  }

  if (blocked) {
    return result(false, REASON.BLOCKED, "The room is blocked, so it cannot be booked.");
  }

  const endDate = new Date(startDate.getTime() + duration * 60000);
  const conflict = bookings.find((b) => {
    const bStart = new Date(b.start);
    const bEnd = new Date(b.end);
    return startDate < bEnd && endDate > bStart;
  });
  if (conflict) {
    return result(false, REASON.OVERLAP, "This time overlaps with the existing booking " + conflict.id + ".");
  }

  return result(true, REASON.OK, "The room is free for the selected time.");
}
