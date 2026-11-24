import { describe, it, expect } from "vitest";
import { checkRoomAvailability } from "../src/practice12/checkRoom.js";

const NOW = new Date("2026-11-24T09:00:00+05:00");
const BOOKINGS = [
  { id: "B1", start: "2026-12-01T10:00:00+05:00", end: "2026-12-01T11:00:00+05:00" },
  { id: "B2", start: "2026-12-01T13:00:00+05:00", end: "2026-12-01T14:30:00+05:00" },
];

const run = (overrides) =>
  checkRoomAvailability({ blocked: false, bookings: BOOKINGS, now: NOW, ...overrides });

describe("Practice 12 shared tests", () => {
  it("T1: valid free interval is available", () => {
    const r = run({ start: "2026-12-01T11:30:00+05:00", durationMinutes: 30 });
    expect(r.available).toBe(true);
    expect(r.reasonCode).toBe("OK");
  });

  it("T2: overlap with an existing booking is unavailable", () => {
    const r = run({ start: "2026-12-01T10:30:00+05:00", durationMinutes: 60 });
    expect(r.available).toBe(false);
    expect(r.reasonCode).toBe("OVERLAP");
  });

  it("T3: blocked room is unavailable", () => {
    const r = run({ start: "2026-12-01T11:30:00+05:00", durationMinutes: 30, blocked: true });
    expect(r.available).toBe(false);
    expect(r.reasonCode).toBe("BLOCKED");
  });

  it("T4: duration 0 gives a validation error", () => {
    const r = run({ start: "2026-12-01T11:30:00+05:00", durationMinutes: 0 });
    expect(r.available).toBe(false);
    expect(r.reasonCode).toBe("INVALID_DURATION");
  });

  it("T5: duration 121 gives a validation error", () => {
    const r = run({ start: "2026-12-01T15:00:00+05:00", durationMinutes: 121 });
    expect(r.available).toBe(false);
    expect(r.reasonCode).toBe("DURATION_TOO_LONG");
  });

  it("T6: past start time gives a validation error", () => {
    const r = run({ start: "2026-01-01T09:00:00+05:00", durationMinutes: 30 });
    expect(r.available).toBe(false);
    expect(r.reasonCode).toBe("PAST_START");
  });

  it("T7: adjacent non-overlapping interval is available", () => {
    const r = run({ start: "2026-12-01T11:00:00+05:00", durationMinutes: 60 });
    expect(r.available).toBe(true);
    expect(r.reasonCode).toBe("OK");
  });

  it("T8: bookings are unchanged after checks", () => {
    const before = JSON.stringify(BOOKINGS);
    run({ start: "2026-12-01T11:30:00+05:00", durationMinutes: 30 });
    run({ start: "2026-12-01T10:30:00+05:00", durationMinutes: 60 });
    run({ start: "bad input", durationMinutes: 30 });
    expect(JSON.stringify(BOOKINGS)).toBe(before);
  });
});
