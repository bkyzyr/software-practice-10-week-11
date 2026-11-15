import { describe, it, expect } from "vitest";
import { ROOMS, ALL_EQUIPMENT } from "../src/rooms.js";

describe("room catalog", () => {
  it("contains at least four fictional rooms", () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
  });

  it("gives every room an id, name, capacity, equipment list, blocked status and bookings", () => {
    for (const room of ROOMS) {
      expect(typeof room.id).toBe("string");
      expect(typeof room.name).toBe("string");
      expect(Number.isInteger(room.capacity)).toBe(true);
      expect(Array.isArray(room.equipment)).toBe(true);
      expect(typeof room.blocked).toBe("boolean");
      expect(Array.isArray(room.bookings)).toBe(true);
    }
  });

  it("uses unique room ids", () => {
    expect(new Set(ROOMS.map((r) => r.id)).size).toBe(ROOMS.length);
  });

  it("keeps a separate bookings array for every room", () => {
    expect(new Set(ROOMS.map((r) => r.bookings)).size).toBe(ROOMS.length);
  });

  it("uses only equipment items that exist in the equipment list", () => {
    for (const room of ROOMS) {
      for (const item of room.equipment) {
        expect(ALL_EQUIPMENT).toContain(item);
      }
    }
  });

  it("includes at least one blocked room and keeps the original room fixture", () => {
    expect(ROOMS.some((r) => r.blocked)).toBe(true);
    const original = ROOMS.find((r) => r.id === "R101");
    expect(original.bookings).toEqual([{ id: "b1", startMin: 600, endMin: 660 }]);
  });
});