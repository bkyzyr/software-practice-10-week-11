export const MAX_DURATION_MIN = 120;

function toMs(value) {
  return new Date(value).getTime();
}

export function checkAvailability(request, bookings, room, now) {
  const start = toMs(request.start);
  const end = toMs(request.end);
  const nowMs = toMs(now);

  if (start >= end) return { available: false, reason: "INVALID_RANGE" };
  if (start < nowMs) return { available: false, reason: "PAST" };

  const durationMin = (end - start) / 60000;
  if (durationMin > MAX_DURATION_MIN) {
    return { available: false, reason: "TOO_LONG" };
  }

  if (room.blocked) return { available: false, reason: "BLOCKED" };

  for (const b of bookings) {
    const bs = toMs(b.start);
    const be = toMs(b.end);
    // Touching endpoints do not overlap.
    if (start < be && end > bs) {
      return { available: false, reason: "OVERLAP" };
    }
  }

  return { available: true, reason: "OK" };
}
