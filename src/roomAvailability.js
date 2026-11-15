import { checkSlot } from "./availabilityAdapter.js";

// Room-aware wrapper around the existing checkSlot().
// It passes ONLY the selected room's own bookings and blocked status,
// so one room's bookings can never affect another room's result.
export function checkRoomSlot(room, { startMin, endMin, nowMin }) {
  return checkSlot({
    startMin,
    endMin,
    blocked: room.blocked,
    bookings: room.bookings,
    nowMin,
  });
}