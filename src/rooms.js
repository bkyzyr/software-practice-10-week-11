/** @typedef {{ id: string, startMin: number, endMin: number }} Booking */
/** @typedef {{ id: string, name: string, capacity: number, equipment: string[], blocked: boolean, bookings: Booking[] }} Room */

// Fictional data only. Times are minutes from midnight (600 = 10:00).
export const ALL_EQUIPMENT = [
  "Projector",
  "Whiteboard",
  "Computers",
  "Microphone",
  "Video conference",
];

/** @type {Room[]} */
export const ROOMS = [
  {
    id: "R101",
    name: "Room A-101",
    capacity: 30,
    equipment: ["Projector", "Whiteboard"],
    blocked: false,
    bookings: [{ id: "b1", startMin: 600, endMin: 660 }], // 10:00 - 11:00 (original fixture)
  },
  {
    id: "R102",
    name: "Computer Lab B-204",
    capacity: 24,
    equipment: ["Computers", "Projector"],
    blocked: false,
    bookings: [{ id: "b2", startMin: 720, endMin: 780 }], // 12:00 - 13:00
  },
  {
    id: "R103",
    name: "Lecture Hall C-001",
    capacity: 120,
    equipment: ["Projector", "Microphone", "Whiteboard"],
    blocked: false,
    bookings: [{ id: "b3", startMin: 840, endMin: 930 }], // 14:00 - 15:30
  },
  {
    id: "R104",
    name: "Meeting Room D-12",
    capacity: 10,
    equipment: ["Whiteboard", "Video conference"],
    blocked: true,
    bookings: [],
  },
  {
    id: "R105",
    name: "Studio E-5",
    capacity: 15,
    equipment: ["Whiteboard"],
    blocked: false,
    bookings: [{ id: "b4", startMin: 960, endMin: 1020 }], // 16:00 - 17:00
  },
];