import { describe, it, expect } from "vitest";
import { ROOMS } from "../src/rooms.js";
import { filterRooms, parseAttendees } from "../src/roomFilters.js";

const ids = (rooms) => rooms.map((r) => r.id);

function deepFreeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

describe("parseAttendees", () => {
  it("parses a positive number", () => {
    expect(parseAttendees("25")).toBe(25);
  });

  it("treats blank or invalid input as no filter", () => {
    for (const bad of ["", "  ", "abc", "0", "-3", null, undefined]) {
      expect(parseAttendees(bad)).toBeNull();
    }
  });
});

describe("F1: capacity filter", () => {
  it("accepts a room with exactly the requested capacity (30 attendees)", () => {
    expect(ids(filterRooms(ROOMS, { attendees: "30" }))).toEqual(["R101", "R103"]);
  });

  it("rejects a room with insufficient capacity (31 attendees)", () => {
    expect(ids(filterRooms(ROOMS, { attendees: "31" }))).toEqual(["R103"]);
  });

  it("returns all rooms when attendees is blank", () => {
    expect(ids(filterRooms(ROOMS, { attendees: "" }))).toEqual(ids(ROOMS));
  });
});

describe("F2: equipment filter", () => {
  it("requires ALL selected equipment items", () => {
    expect(ids(filterRooms(ROOMS, { equipment: ["Projector", "Whiteboard"] }))).toEqual([
      "R101",
      "R103",
    ]);
  });

  it("works with a single required item", () => {
    expect(ids(filterRooms(ROOMS, { equipment: ["Computers"] }))).toEqual(["R102"]);
  });

  it("rejects a room that is missing one of the required items", () => {
    expect(ids(filterRooms(ROOMS, { equipment: ["Projector", "Computers"] }))).toEqual(["R102"]);
  });

  it("combines capacity and equipment filters", () => {
    expect(ids(filterRooms(ROOMS, { attendees: "12", equipment: ["Whiteboard"] }))).toEqual([
      "R101",
      "R103",
      "R105",
    ]);
  });
});

describe("F4: no matching rooms", () => {
  it("returns an empty list when capacity is too high", () => {
    expect(filterRooms(ROOMS, { attendees: "500" })).toEqual([]);
  });

  it("returns an empty list when no room has every required item", () => {
    expect(filterRooms(ROOMS, { equipment: ["Microphone", "Computers"] })).toEqual([]);
  });
});

describe("AC5: filtering does not mutate the catalog", () => {
  it("works on frozen data and leaves it unchanged", () => {
    const frozen = deepFreeze(JSON.parse(JSON.stringify(ROOMS)));
    const snapshot = JSON.stringify(frozen);
    expect(() => filterRooms(frozen, { attendees: "20", equipment: ["Projector"] })).not.toThrow();
    expect(JSON.stringify(frozen)).toBe(snapshot);
  });
});