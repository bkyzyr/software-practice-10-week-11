import { validateExplainInput, validateExplanation } from "./validate";
import type { ExplainAdapter, ExplainInput, ExplainPayload } from "./types";

const TIMEOUT_MS = 3000;

export const FALLBACK_EXPLANATION =
  "The standard availability message is shown because the explanation service is unavailable.";

export type ExplainResult =
  | { explanation: string; usedFallback: false; adapterName: string }
  | { explanation: string; usedFallback: true; adapterName: string };

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Adapter timed out after ${ms} ms`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function explainAvailability(
  input: ExplainInput,
  adapter: ExplainAdapter,
): Promise<ExplainResult> {
  const checked = validateExplainInput(input);
  if (!checked.valid) {
    return {
      explanation: FALLBACK_EXPLANATION,
      usedFallback: true,
      adapterName: adapter.name,
    };
  }

  // The note is for display only and is never sent to the adapter.
  const { userNote: _userNote, ...payload } = input as ExplainInput & {
    userNote?: string;
  };
  const adapterInput: ExplainPayload = payload;

  try {
    const response = await withTimeout(adapter.explain(adapterInput), TIMEOUT_MS);
    const check = validateExplanation(response.explanation, input);
    if (!check.valid) {
      return {
        explanation: FALLBACK_EXPLANATION,
        usedFallback: true,
        adapterName: adapter.name,
      };
    }
    return {
      explanation: response.explanation as string,
      usedFallback: false,
      adapterName: adapter.name,
    };
  } catch {
    return {
      explanation: FALLBACK_EXPLANATION,
      usedFallback: true,
      adapterName: adapter.name,
    };
  }
}
