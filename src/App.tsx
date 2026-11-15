import { useMemo, useState } from "react";
import {
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Ban,
  Timer,
  Users,
} from "lucide-react";
import { parseTimeLabel } from "@/availabilityAdapter";
import { ROOMS as ROOM_CATALOG, ALL_EQUIPMENT } from "@/rooms";
import { filterRooms } from "@/roomFilters";
import { checkRoomSlot } from "@/roomAvailability";

type Booking = {
  id: string;
  startMin: number;
  endMin: number;
};

type Room = {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  bookings: Booking[];
};

const ROOMS: Room[] = ROOM_CATALOG;
const NOW_MIN = 540; // 09:00

function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const MALFORMED_MESSAGE = "Please enter both a start time and an end time.";

const UNAVAILABLE_MESSAGES: Record<string, string> = {
  MALFORMED: MALFORMED_MESSAGE,
  INVALID_RANGE: "The end time must be after the start time.",
  PAST: `The start time must be later than the current time (${minutesToLabel(
    NOW_MIN,
  )}).`,
  BLOCKED: "This room is currently blocked and cannot be booked.",
  TOO_LONG: "The maximum booking length is 120 minutes.",
  OVERLAP: "Overlaps an existing booking.",
};

type Status = "idle" | "available" | "unavailable";

const RESULT_STYLES = {
  available: { box: "border-emerald-200 bg-emerald-50", text: "text-emerald-700" },
  unavailable: { box: "border-rose-200 bg-rose-50", text: "text-rose-700" },
} as const;

type TimeFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function TimeField({ id, label, placeholder, value, error, onChange }: TimeFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 block w-full min-w-0 rounded-xl border bg-white px-3 py-3 text-base text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
            : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export default function App() {
  const [startLabel, setStartLabel] = useState("");
  const [endLabel, setEndLabel] = useState("");
  const [attendees, setAttendees] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [resultReason, setResultReason] = useState<string>("");
  const [resultRoomId, setResultRoomId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    start?: string;
    end?: string;
  }>({});

  // F1 + F2: rooms that satisfy the selected requirements.
  const visibleRooms = useMemo(
    () => filterRooms(ROOMS, { attendees, equipment }) as Room[],
    [attendees, equipment],
  );

  // The selected room is derived from the filtered list, so a room that no longer
  // matches the filters is automatically deselected.
  const selectedRoom = visibleRooms.find((r) => r.id === selectedRoomId) ?? null;

  // Sorted COPY of the selected room's own bookings (original data is never mutated).
  const sortedBookings = useMemo(
    () =>
      selectedRoom
        ? [...selectedRoom.bookings].sort((a, b) => a.startMin - b.startMin)
        : [],
    [selectedRoom],
  );

  // A result is shown only for the room it was calculated for (no stale results).
  const showResult =
    status !== "idle" && selectedRoom !== null && resultRoomId === selectedRoom.id;

  function resetResult() {
    setStatus("idle");
    setResultReason("");
    setResultRoomId(null);
  }

  function handleStartChange(value: string) {
    setStartLabel(value);
    resetResult();
    setFieldErrors((e) => ({ ...e, start: undefined }));
  }

  function handleEndChange(value: string) {
    setEndLabel(value);
    resetResult();
    setFieldErrors((e) => ({ ...e, end: undefined }));
  }

  function handleAttendeesChange(value: string) {
    setAttendees(value);
    resetResult();
  }

  function toggleEquipment(item: string) {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
    resetResult();
  }

  function clearInputs() {
    setStartLabel("");
    setEndLabel("");
    setFieldErrors({});
    resetResult();
  }

  function runCheck(room: Room, reportFieldErrors: boolean) {
    const start = parseTimeLabel(startLabel);
    const end = parseTimeLabel(endLabel);

    if (start === null || end === null) {
      if (reportFieldErrors) {
        setFieldErrors({
          start: start === null ? MALFORMED_MESSAGE : undefined,
          end: end === null ? MALFORMED_MESSAGE : undefined,
        });
      }
      resetResult();
      return;
    }

    setFieldErrors({});

    // Uses only the chosen room's own bookings and blocked status.
    const result = checkRoomSlot(room, {
      startMin: start,
      endMin: end,
      nowMin: NOW_MIN,
    });

    setResultRoomId(room.id);
    if (!result.available) {
      setStatus("unavailable");
      setResultReason(UNAVAILABLE_MESSAGES[result.reason]);
      return;
    }

    setStatus("available");
    setResultReason(
      `${room.name} is available for booking from ${minutesToLabel(
        start,
      )} to ${minutesToLabel(end)} (${end - start} min).`,
    );
  }

  // F5: changing the selected room refreshes the availability result
  // (when a valid time range has already been entered).
  function handleSelectRoom(room: Room) {
    setSelectedRoomId(room.id);
    runCheck(room, false);
  }

  function handleCheck() {
    if (selectedRoom) runCheck(selectedRoom, true);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-emerald-600">
            <CalendarCheck className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Smart Campus
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Room Availability Checker
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Find a room that fits your needs and check whether it is free for your
            chosen time slot.
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            <span>Current time: {minutesToLabel(NOW_MIN)}</span>
          </div>
        </header>

        {/* Requirements (filters) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            1. Your requirements
          </h3>
          <div className="mt-4">
            <label
              htmlFor="attendees"
              className="block text-sm font-medium text-slate-700"
            >
              Number of attendees
            </label>
            <input
              id="attendees"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 20"
              value={attendees}
              onChange={(e) => handleAttendeesChange(e.target.value)}
              className="mt-1.5 block w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:max-w-xs"
            />
          </div>
          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-slate-700">
              Required equipment (room must have all selected items)
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALL_EQUIPMENT.map((item: string) => {
                const checked = equipment.includes(item);
                return (
                  <label
                    key={item}
                    className={`inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      checked
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEquipment(item)}
                      className="h-4 w-4"
                    />
                    {item}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </section>

        {/* Matching rooms */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            2. Matching rooms
          </h3>
          <p className="mt-1 text-sm text-slate-500" aria-live="polite">
            {visibleRooms.length} of {ROOMS.length} rooms match
          </p>

          {visibleRooms.length === 0 ? (
            <div
              role="status"
              className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
            >
              No rooms match your requirements. Try fewer attendees or fewer
              equipment items.
            </div>
          ) : (
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {visibleRooms.map((room) => {
                const selected = room.id === selectedRoomId;
                return (
                  <li key={room.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleSelectRoom(room)}
                      className={`w-full rounded-xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        selected
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2 font-semibold text-slate-900">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        {room.name}
                      </span>
                      <span className="mt-1.5 flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4" />
                        Capacity: {room.capacity}
                      </span>
                      <span className="mt-1 block text-sm text-slate-600">
                        {room.equipment.join(", ")}
                      </span>
                      {room.blocked && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                          <Ban className="h-3 w-3" />
                          Blocked
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Booking check form */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            3. Check a time slot
          </h3>

          {selectedRoom ? (
            <div className="mt-2">
              <p className="text-sm font-medium text-slate-700">
                Selected room: {selectedRoom.name}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Existing bookings today
              </p>
              {sortedBookings.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No bookings.</p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {sortedBookings.map((b) => (
                    <li
                      key={b.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-700"
                    >
                      <CalendarCheck className="h-3.5 w-3.5" />
                      {minutesToLabel(b.startMin)} - {minutesToLabel(b.endMin)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Select a room above to check its availability.
            </p>
          )}

          <p className="mt-4 text-sm text-slate-500">
            Enter times as HH:MM (24-hour). Maximum duration is 2 hours and start
            must be after the current time.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TimeField
              id="start-time"
              label="Start time"
              placeholder="09:30"
              value={startLabel}
              error={fieldErrors.start}
              onChange={handleStartChange}
            />
            <TimeField
              id="end-time"
              label="End time"
              placeholder="10:30"
              value={endLabel}
              error={fieldErrors.end}
              onChange={handleEndChange}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCheck}
              disabled={!selectedRoom}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <CalendarCheck className="h-4 w-4" />
              Check availability
            </button>
            <button
              type="button"
              onClick={clearInputs}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 sm:w-auto"
            >
              Clear
            </button>
          </div>
        </section>

        {/* Result */}
        {showResult && (
          <section className="mt-5">
            <div
              role="status"
              className={`rounded-2xl border p-5 shadow-sm ${RESULT_STYLES[status as "available" | "unavailable"].box}`}
            >
              <div className="flex items-start gap-3">
                {status === "available" ? (
                  <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-rose-600" />
                )}
                <div className="min-w-0">
                  <p
                    className={`text-lg font-bold ${RESULT_STYLES[status as "available" | "unavailable"].text}`}
                  >
                    {status === "available" ? "Available" : "Unavailable"}
                  </p>
                  <p
                    className={`mt-1 text-sm ${RESULT_STYLES[status as "available" | "unavailable"].text}`}
                  >
                    {resultReason}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer hint */}
        <footer className="mt-8 flex flex-wrap items-start gap-2 text-xs text-slate-400">
          <Timer className="h-3.5 w-3.5" />
          <span>
            Max 2 hours per booking. Times touching an existing booking at the
            endpoint are allowed.
          </span>
        </footer>
      </div>
    </div>
  );
}