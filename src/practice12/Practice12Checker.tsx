import { useState } from "react";
import { CalendarCheck, Ban, CheckCircle2, XCircle } from "lucide-react";
import { checkRoomAvailability, REASON } from "./checkRoom.js";

const BOOKINGS = [
  { id: "B1", start: "2026-12-01T10:00:00+05:00", end: "2026-12-01T11:00:00+05:00" },
  { id: "B2", start: "2026-12-01T13:00:00+05:00", end: "2026-12-01T14:30:00+05:00" },
];

type CheckResult = {
  available: boolean;
  reasonCode: string;
  message: string;
};

export default function Practice12Checker() {
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  function handleCheck() {
    const durationMinutes = duration.trim() === "" ? NaN : Number(duration);
    const r = checkRoomAvailability({
      start,
      durationMinutes,
      blocked,
      bookings: BOOKINGS,
      now: new Date(),
    });
    setResult({ available: r.available, reasonCode: r.reasonCode, message: r.message });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <CalendarCheck className="h-4 w-4 text-emerald-600" />
        Practice 12: availability checker
      </h3>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="p12-start" className="block text-sm font-medium text-slate-700">
            Start time
          </label>
          <input
            id="p12-start"
            type="text"
            placeholder="2026-12-01T11:30"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1.5 block w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="p12-duration" className="block text-sm font-medium text-slate-700">
            Duration (minutes)
          </label>
          <input
            id="p12-duration"
            type="text"
            inputMode="numeric"
            placeholder="60"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1.5 block w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={blocked}
          onChange={(e) => setBlocked(e.target.checked)}
          className="h-4 w-4"
        />
        Room is blocked
      </label>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleCheck}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
        >
          <CalendarCheck className="h-4 w-4" />
          Check availability
        </button>
      </div>

      <div>
        {result ? (
          <div
            role="status"
            className={`mt-4 flex items-start gap-3 rounded-xl border p-4 ${
              result.available
                ? "border-emerald-200 bg-emerald-50"
                : "border-rose-200 bg-rose-50"
            }`}
          >
            {result.available ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" />
            )}
            <div>
              <p
                className={`font-bold ${
                  result.available ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {result.available ? "AVAILABLE" : "UNAVAILABLE"}
              </p>
              <p
                className={`mt-0.5 text-sm ${
                  result.available ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {result.message}
              </p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reason: {result.reasonCode}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Fictional bookings (read-only)
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {BOOKINGS.map((b) => (
            <li
              key={b.id}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-medium text-slate-700"
            >
              <Ban className="h-3.5 w-3.5 text-slate-400" />
              {b.id}: {b.start} - {b.end}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
