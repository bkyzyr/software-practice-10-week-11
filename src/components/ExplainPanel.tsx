import { useState } from "react";
import { Info, Lightbulb, ShieldCheck, AlertTriangle } from "lucide-react";
import { explainAvailability, FALLBACK_EXPLANATION } from "@/explain/explainAvailability";
import type { ExplainAdapter, ExplainInput } from "@/explain/types";
import { mockAdapter } from "@/explain/mockAdapter";

const MAX_NOTE = 200;

type ExplainPanelProps = {
  roomLabel: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reasonCode: string;
  confirmedStatusText: string;
  adapter?: ExplainAdapter;
};

export default function ExplainPanel({
  roomLabel,
  startTime,
  endTime,
  isAvailable,
  reasonCode,
  confirmedStatusText,
  adapter = mockAdapter,
}: ExplainPanelProps) {
  const [note, setNote] = useState("");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleExplain() {
    setLoading(true);
    const input: ExplainInput = {
      roomLabel,
      startTime,
      endTime,
      isAvailable,
      reasonCode: reasonCode as ExplainInput["reasonCode"],
      ...(note.trim() ? { userNote: note.trim() } : {}),
    };
    const result = await explainAvailability(input, adapter);
    setExplanation(result.explanation);
    setUsedFallback(result.usedFallback);
    setLoading(false);
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        Explain availability
      </h4>

      <label
        htmlFor="explain-note"
        className="mt-3 block text-sm font-medium text-slate-700"
      >
        Optional note (not sent anywhere, {MAX_NOTE} characters max)
      </label>
      <textarea
        id="explain-note"
        rows={2}
        maxLength={MAX_NOTE}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. I need the room right before a lecture"
        className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <p className="mt-1 text-right text-xs text-slate-400">
        {note.length}/{MAX_NOTE}
      </p>

      <button
        type="button"
        onClick={handleExplain}
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Lightbulb className="h-4 w-4" />
        {loading ? "Explaining…" : "Explain availability"}
      </button>

      {explanation !== null && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Confirmed status (rule engine)
            </p>
            <p className="mt-1.5 text-sm text-emerald-800">{confirmedStatusText}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Info className="h-4 w-4" />
              Generated explanation (demo, not a booking confirmation)
            </p>
            <p className="mt-1.5 text-sm text-slate-700">{explanation}</p>
            {usedFallback && explanation === FALLBACK_EXPLANATION && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                The standard message is shown.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
