// Pure filtering logic. Returns a NEW array and never mutates the catalog.
// Blocked rooms are intentionally not hidden: they still match the requirements,
// and the availability check reports them as unavailable (F3).

// Blank or invalid attendee values mean "no capacity filter".
export function parseAttendees(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text === "") return null;
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function filterRooms(rooms, criteria = {}) {
  const minCapacity = parseAttendees(criteria.attendees);
  const required = Array.isArray(criteria.equipment) ? criteria.equipment : [];

  return rooms.filter((room) => {
    const capacityOk = minCapacity === null || room.capacity >= minCapacity; // F1
    const equipmentOk = required.every((item) => room.equipment.includes(item)); // F2
    return capacityOk && equipmentOk;
  });
}