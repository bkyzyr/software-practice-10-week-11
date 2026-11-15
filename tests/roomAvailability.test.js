import { describe, it, expect } from "vitest";
import { ROOMS } from "../src/rooms.js";
import { filterRooms } from "../src/roomFilters.js";
import { checkRoomSlot } from "../src/roomAvailability.js";

const NOW_MIN = 540; // 09:00
const room = (id) => ROOMS.find((r) => r.id === id);
const check = (id, startMin, endMin) =>
  checkRoomSlot(room(id), { startMin, endMin, nowMin: NOW_MIN });

function deepFreeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

describe("room isolation: availability uses only the chosen room's bookings", () => {
  it("R101 is busy at 10:00-11:00 (its own booking)", () => {
    expect(check("R101", 600, 660)).toEqual({ available: false, reason: "OVERLAP" });
  });

  it("R102 is free at 10:00-11:00 although R101 is booked then", () => {
    expect(check("R102", 600, 660)).toEqual({ available: true, reason: "OK" });
  });

  it("R102 is busy at 12:00-13:00 while R101 is free then", () => {
    expect(check("R102", 720, 780)).toEqual({ available: false, reason: "OVERLAP" });
    expect(check("R101", 720, 780)).toEqual({ available: true, reason: "OK" });
  });
});

describe("regression of AC1-AC4 on catalog rooms", () => {
  it("AC1: rejects a start in the past (08:00-09:00 when now is 09:00)", () => {
    expect(check("R105", 480, 540)).toEqual({ available: false, reason: "PAST" });
  });

  it("AC1: rejects a reversed interval", () => {
    expect(check("R105", 720, 660)).toEqual({ available: false, reason: "INVALID_RANGE" });
  });

  it("AC2: allows exactly 120 minutes and rejects 121 minutes", () => {
    expect(check("R102", 780, 900)).toEqual({ available: true, reason: "OK" });
    expect(check("R102", 780, 901)).toEqual({ available: false, reason: "TOO_LONG" });
  });

  it("AC4: touching a booking at its start or end is allowed", () => {
    expect(check("R102", 660, 720)).toEqual({ available: true, reason: "OK" }); // ends at booking start
    expect(check("R102", 780, 840)).toEqual({ available: true, reason: "OK" }); // starts at booking end
  });

  it("AC4: a real overlap is rejected", () => {
    expect(check("R102", 690, 750)).toEqual({ available: false, reason: "OVERLAP" });
  });
});

describe("F3: a blocked room is never available", () => {
  it("rejects a free slot in the blocked room R104", () => {
    expect(check("R104", 780, 840)).toEqual({ available: false, reason: "BLOCKED" });
  });

  it("rejects every blocked room in the catalog", () => {
    for (const r of ROOMS.filter((x) => x.blocked)) {
      expect(checkRoomSlot(r, { startMin: 780, endMin: 840, nowMin: NOW_MIN }).available).toBe(false);
    }
  });
});

describe("integration: filter -> select room -> check availability", () => {
  it("finds the computer lab for 20 attendees and checks its own bookings", () => {
    const matches = filterRooms(ROOMS, { attendees: "20", equipment: ["Computers"] });
    expect(matches.map((r) => r.id)).toEqual(["R102"]);
    expect(checkRoomSlot(matches[0], { startMin: 660, endMin: 720, nowMin: NOW_MIN }).available).toBe(true);
    expect(checkRoomSlot(matches[0], { startMin: 690, endMin: 750, nowMin: NOW_MIN }).reason).toBe("OVERLAP");
  });

  it("F5: switching rooms with the same time slot gives each room its own result", () => {
    const results = ["R101", "R102", "R103", "R101"].map((id) => check(id, 600, 660).reason);
    expect(results).toEqual(["OVERLAP", "OK", "OK", "OVERLAP"]);
  });
});

describe("AC5: checking rooms does not mutate catalog data", () => {
  it("works on frozen data and leaves bookings unchanged and in order", () => {
    const frozen = deepFreeze(JSON.parse(JSON.stringify(ROOMS)));
    const snapshot = JSON.stringify(frozen);
    for (const r of frozen) {
      expect(() => checkRoomSlot(r, { startMin: 630, endMin: 690, nowMin: NOW_MIN })).not.toThrow();
    }
    expect(JSON.stringify(frozen)).toBe(snapshot);
  });
});