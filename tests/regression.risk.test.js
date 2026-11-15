import { describe, it, expect } from "vitest";
import { checkAvailability } from "../src/availability.js";
const NOW = "2026-11-02T08:00:00Z";
const room = () => ({ id: "R101", blocked: false });
const bookings = () => [
  { id: "B1", start: "2026-11-02T10:00:00Z", end: "2026-11-02T11:00:00Z" },
];
describe("R9: malformed date input must never be reported as available", () => {
  it("rejects an invalid start string", () => {
    const r = checkAvailability(
      { start: "not-a-date", end: "2026-11-02T15:00:00Z" },
      bookings(),
      room(),
      NOW,
    );
    expect(r.available).toBe(false);
  });
  it("rejects an invalid end string", () => {
    const r = checkAvailability(
      { start: "2026-11-02T15:00:00Z", end: "not-a-date" },
      bookings(),
      room(),
      NOW,
    );
    expect(r.available).toBe(false);
  });
  it("rejects a missing start value", () => {
    const r = checkAvailability(
      { start: undefined, end: "2026-11-02T15:00:00Z" },
      bookings(),
      room(),
      NOW,
    );
    expect(r.available).toBe(false);
  });
  it("rejects an invalid current time", () => {
    const r = checkAvailability(
      { start: "2026-11-02T15:00:00Z", end: "2026-11-02T16:00:00Z" },
      bookings(),
      room(),
      "not-a-date",
    );
    expect(r.available).toBe(false);
  });
  it("still accepts a valid free slot", () => {
    const r = checkAvailability(
      { start: "2026-11-02T15:00:00Z", end: "2026-11-02T16:00:00Z" },
      bookings(),
      room(),
      NOW,
    );
    expect(r).toEqual({ available: true, reason: "OK" });
  });
});
