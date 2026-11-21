import { useEffect, useRef, useState } from 'react';
import { explainAvailability } from '../explain/explainAvailability';
import type { ExplainInput, ExplainResult } from '../explain/types';

interface Props {
  input: ExplainInput;
}

export default function ExplainPanel({ input }: Props) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const requestId = useRef(0);

  const key = `${input.roomLabel}|${input.startTime}|${input.endTime}|${input.isAvailable}|${input.reasonCode}`;

  useEffect(() => {
    requestId.current += 1;
    setResult(null);
    setLoading(false);
  }, [key]);

  async function handleExplain() {
    const id = ++requestId.current;
    setLoading(true);
    const r = await explainAvailability({ ...input, userNote: note || undefined });
    if (id !== requestId.current) return;
    setResult(r);
    setLoading(false);
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded border border-slate-300 bg-white p-3">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Confirmed status (rule engine)
        </p>
        <p className="font-medium">
          {input.isAvailable ? 'Available' : 'Not available'} ({input.reasonCode})
        </p>
      </div>

      <label className="block text-sm">
        Optional note (max 200 characters)
        <input
          className="mt-1 w-full rounded border border-slate-300 p-2"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. I need the room for a study group"
        />
      </label>

      <button
        type="button"
        onClick={handleExplain}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? 'Explaining...' : 'Explain availability'}
      </button>

      {result && !result.ok && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {result.error}
        </p>
      )}

      {result && result.ok && (
        <div className="rounded border border-dashed border-amber-400 bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase text-amber-700">
            {result.usedFallback
              ? 'Standard message (explanation service unavailable)'
              : `Generated explanation (${result.source}, demo) - not a booking confirmation`}
          </p>
          <p className="text-sm">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}