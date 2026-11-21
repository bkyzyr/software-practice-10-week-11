import { mockAdapter } from './mockAdapter';
import type {
  ExplainAdapter,
  ExplainInput,
  ExplainResult,
  SafeExplainInput,
} from './types';
import { validateExplainInput, validateExplanation } from './validate';

export const DEFAULT_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export function fallbackText(i: Pick<ExplainInput, 'roomLabel' | 'startTime' | 'endTime' | 'isAvailable' | 'reasonCode'>): string {
  const status = i.isAvailable ? 'Available' : 'Not available';
  return `Status: ${status} (${i.reasonCode}) for ${i.roomLabel}, ${i.startTime} - ${i.endTime}. A detailed explanation is not available right now.`;
}

export async function explainAvailability(
  rawInput: unknown,
  adapter: ExplainAdapter = mockAdapter,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<ExplainResult> {
  const checked = validateExplainInput(rawInput);
  if (!checked.ok) return { ok: false, error: checked.error };

  const v = checked.value;
  // userNote is untrusted user text and is deliberately NOT sent to the adapter.
  const safe: SafeExplainInput = {
    roomLabel: v.roomLabel,
    startTime: v.startTime,
    endTime: v.endTime,
    isAvailable: v.isAvailable,
    reasonCode: v.reasonCode,
  };

  try {
    const out = await withTimeout(adapter.explain(safe), timeoutMs);
    if (validateExplanation(out?.explanation, safe)) {
      return {
        ok: true,
        explanation: out.explanation.trim(),
        source: adapter.name,
        usedFallback: false,
      };
    }
  } catch {
    // timeout, network error or adapter error: fall through to the fallback
  }
  return {
    ok: true,
    explanation: fallbackText(safe),
    source: 'fallback',
    usedFallback: true,
  };
}