import { describe, it, expect } from "vitest";
import { checkAvailability } from "../src/availability.js";

const NOW = "2026-11-02T08:00:00Z";

const room = () => ({ id: "R101", blocked: false });

const bookings = () => [
  { id: "B2", start: "2026-11-02T13:00:00Z", end: "2026-11-02T14:00:00Z" },
  { id: "B1", start: "2026-11-02T10:00:00Z", end: "2026-11-02T11:00:00Z" },
];

const req = (s, e) => ({
  start: `2026-11-02T${s}:00Z`,
  end: `2026-11-02T${e}:00Z`,
});

describe("AC1: invalid range and past", () => {
  it("T01 rejects start == end", () => {
    const r = checkAvailability(req("15:00", "15:00"), bookings(), room(), NOW);
    expect(r).toEqual({ available: false, reason: "INVALID_RANGE" });
  });

  it("T02 rejects start > end", () => {
    const r = checkAvailability(req("16:00", "15:00"), bookings(), room(), NOW);
    expect(r).toEqual({ available: false, reason: "INVALID_RANGE" });
  });

  it("T03 rejects request in the past", () => {
    const r = checkAvailability(req("07:00", "07:30"), bookings(), room(), NOW);
    expect(r).toEqual({ available: false, reason: "PAST" });
  });
});

describe("AC2: max duration 120 minutes", () => {
  it("T04 allows exactly 120 minutes", () => {
    const r = checkAvailability(req("15:00", "17:00"), bookings(), room(), NOW);
    expect(r).toEqual({ available: true, reason: "OK" });
  });

  it("T05 rejects 121 minutes", () => {
    const r = checkAvailability(req("15:00", "17:01"), bookings(), room(), NOW);
    expect(r).toEqual({ available: false, reason: "TOO_LONG" });
  });
});

describe("AC3: blocked room", () => {
  it("T06 rejects blocked room", () => {
    const blocked = { id: "R101", blocked: true };
    const r = checkAvailability(req("15:00", "16:00"), bookings(), blocked, NOW);
    expect(r).toEqual({ available: false, reason: "BLOCKED" });
  });
});

describe("AC4: overlaps vs touching endpoints", () => {
  it("T07 rejects partial overlap (10:30-11:30)", () => {
    const r = checkAvailability(req("10:30", "11:30"), bookings(), room(), NOW);
    expect(r).toEqual({ available: false, reason: "OVERLAP" });
  });

  it("T08 rejects request inside a booking (10:15-10:45)", () => {
    const r = checkAvailability(req("10:15", "10:45"), bookings(), room(), NOW);
    expect(r).toEqual({ available: false, reason: "OVERLAP" });
  });

  it("T09 rejects request that wraps a booking (09:30-11:30)", () => {
    const r = checkAvailability(req("09:30", "11:30"), bookings(), room(), NOW);
    expect(r).toEqual({ available: false, reason: "OVERLAP" });
  });

  it("T10 allows touching END of a booking (11:00-12:00)", () => {
    const r = checkAvailability(req("11:00", "12:00"), bookings(), room(), NOW);
    expect(r).toEqual({ available: true, reason: "OK" });
  });

  it("T11 allows touching START of a booking (09:00-10:00)", () => {
    const r = checkAvailability(req("09:00", "10:00"), bookings(), room(), NOW);
    expect(r).toEqual({ available: true, reason: "OK" });
  });

  it("T12 allows gap between two bookings (12:00-13:00)", () => {
    const r = checkAvailability(req("12:00", "13:00"), bookings(), room(), NOW);
    expect(r).toEqual({ available: true, reason: "OK" });
  });
});

describe("AC5: no mutation of booking data", () => {
  it("T13 does not change the bookings array", () => {
    const data = bookings();
    const before = JSON.stringify(data);
    checkAvailability(req("15:00", "16:00"), data, room(), NOW);
    expect(JSON.stringify(data)).toBe(before);
  });
});
