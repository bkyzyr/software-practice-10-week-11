import { describe, it, expect } from "vitest";
import { checkSlot, parseTimeLabel } from "../src/availabilityAdapter.js";

const NOW_MIN = 540;
const FIXTURE = [{ id: "b1", startMin: 600, endMin: 660 }];
const bookings = () => FIXTURE.map((b) => ({ ...b }));

const slot = (startMin, endMin, overrides = {}) =>
  checkSlot({ startMin, endMin, blocked: false, bookings: bookings(), nowMin: NOW_MIN, ...overrides });

describe("parseTimeLabel", () => {
  it("parses HH:MM into minutes", () => {
    expect(parseTimeLabel("10:30")).toBe(630);
  });

  it("rejects malformed labels", () => {
    expect(parseTimeLabel("9:5")).toBeNull();
    expect(parseTimeLabel("24:00")).toBeNull();
    expect(parseTimeLabel("")).toBeNull();
  });
});

describe("checkSlot: existing adapter behaviour", () => {
  it("rejects non-integer or out-of-day minutes explicitly", () => {
    const r = checkSlot({ startMin: 1.5, endMin: 700, blocked: false, bookings: bookings(), nowMin: 540 });
    expect(r).toEqual({ available: false, reason: "MALFORMED" });
  });

  it("allows a slot that touches an existing booking at its end", () => {
    const r = checkSlot({ startMin: 660, endMin: 720, blocked: false, bookings: bookings(), nowMin: 540 });
    expect(r).toEqual({ available: true, reason: "OK" });
  });

  it("reports an overlap with an existing booking", () => {
    const r = checkSlot({ startMin: 630, endMin: 690, blocked: false, bookings: bookings(), nowMin: 540 });
    expect(r).toEqual({ available: false, reason: "OVERLAP" });
  });

  it("does not change the fixture bookings", () => {
    const data = bookings();
    checkSlot({ startMin: 630, endMin: 690, blocked: false, bookings: data, nowMin: 540 });
    expect(data).toEqual(bookings());
  });
});

describe("AC1 regression: past time", () => {
  it("rejects a start earlier than the current time (08:00 when now is 09:00)", () => {
    expect(slot(480, 540)).toEqual({ available: false, reason: "PAST" });
  });
});

describe("AC1 regression: reversed interval", () => {
  it("rejects end before start (12:00 to 11:00)", () => {
    expect(slot(720, 660)).toEqual({ available: false, reason: "INVALID_RANGE" });
  });
});

describe("AC2 regression: duration limit", () => {
  it("rejects a 121-minute request (13:00 to 15:01)", () => {
    expect(slot(780, 901)).toEqual({ available: false, reason: "TOO_LONG" });
  });

  it("allows exactly 120 minutes (13:00 to 15:00)", () => {
    expect(slot(780, 900)).toEqual({ available: true, reason: "OK" });
  });
});

describe("AC3 regression: blocked room", () => {
  it("rejects any slot when the room is blocked", () => {
    expect(slot(780, 840, { blocked: true })).toEqual({ available: false, reason: "BLOCKED" });
  });
});

describe("AC4 regression: overlap and touching endpoints", () => {
  it("rejects a request that overlaps the fixture booking (10:30 to 11:30)", () => {
    expect(slot(630, 690)).toEqual({ available: false, reason: "OVERLAP" });
  });

  it("allows a request that touches the fixture booking at its start (09:00 to 10:00)", () => {
    expect(slot(540, 600)).toEqual({ available: true, reason: "OK" });
  });

  it("allows a request that touches the fixture booking at its end (11:00 to 12:00)", () => {
    expect(slot(660, 720)).toEqual({ available: true, reason: "OK" });
  });
});

describe("AC5 regression: fixtures are not mutated", () => {
  it("leaves the booking objects and their order unchanged after several checks", () => {
    const data = [
      { id: "b2", startMin: 780, endMin: 840 },
      { id: "b1", startMin: 600, endMin: 660 },
    ];
    const snapshot = JSON.parse(JSON.stringify(data));
    checkSlot({ startMin: 630, endMin: 690, blocked: false, bookings: data, nowMin: NOW_MIN });
    checkSlot({ startMin: 600, endMin: 660, blocked: false, bookings: data, nowMin: NOW_MIN });
    checkSlot({ startMin: 720, endMin: 760, blocked: false, bookings: data, nowMin: NOW_MIN });
    expect(data).toEqual(snapshot);
  });
});
