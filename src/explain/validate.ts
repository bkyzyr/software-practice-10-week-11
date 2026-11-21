import { REASON_CODES, type ExplainInput, type ReasonCode } from './types';

export const MAX_LABEL_LENGTH = 60;
export const MAX_NOTE_LENGTH = 200;
export const MAX_EXPLANATION_LENGTH = 240;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export type ValidationResult =
  | { ok: true; value: ExplainInput }
  | { ok: false; error: string };

function fail(error: string): ValidationResult {
  return { ok: false, error };
}

export function validateExplainInput(raw: unknown): ValidationResult {
  if (typeof raw !== 'object' || raw === null) {
    return fail('Input must be an object.');
  }
  const r = raw as Record<string, unknown>;

  const label = typeof r.roomLabel === 'string' ? r.roomLabel.trim() : '';
  if (!label) return fail('Room label is required.');
  if (label.length > MAX_LABEL_LENGTH) {
    return fail(`Room label must be at most ${MAX_LABEL_LENGTH} characters.`);
  }

  if (typeof r.startTime !== 'string' || !TIME_RE.test(r.startTime)) {
    return fail('Start time must be in HH:MM format.');
  }
  if (typeof r.endTime !== 'string' || !TIME_RE.test(r.endTime)) {
    return fail('End time must be in HH:MM format.');
  }
  if (typeof r.isAvailable !== 'boolean') {
    return fail('isAvailable must be a boolean.');
  }
  if (
    typeof r.reasonCode !== 'string' ||
    !(REASON_CODES as readonly string[]).includes(r.reasonCode)
  ) {
    return fail('Unknown reason code.');
  }
  if (r.isAvailable !== (r.reasonCode === 'AVAILABLE')) {
    return fail('isAvailable does not match the reason code.');
  }

  let note: string | undefined;
  if (r.userNote !== undefined) {
    if (typeof r.userNote !== 'string') return fail('Note must be text.');
    note = r.userNote.trim();
    if (note.length > MAX_NOTE_LENGTH) {
      return fail(`Note must be at most ${MAX_NOTE_LENGTH} characters.`);
    }
  }

  return {
    ok: true,
    value: {
      roomLabel: label,
      startTime: r.startTime,
      endTime: r.endTime,
      isAvailable: r.isAvailable,
      reasonCode: r.reasonCode as ReasonCode,
      userNote: note,
    },
  };
}

const CONTRADICTS_UNAVAILABLE =
  /\b(is|are) (now )?(available|free)\b|\bcan be booked\b|\byou can book\b/i;
const CONTRADICTS_AVAILABLE =
  /\bnot available\b|\bunavailable\b|\bblocked\b|\boverlap|\bcannot\b|\bcan't\b/i;

export function validateExplanation(
  text: unknown,
  input: Pick<ExplainInput, 'startTime' | 'endTime' | 'isAvailable'>,
): text is string {
  if (typeof text !== 'string') return false;
  const t = text.trim();
  if (!t || t.length > MAX_EXPLANATION_LENGTH) return false;

  const sentences = t.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0);
  if (sentences.length > 2) return false;

  const times = t.match(/\b\d{1,2}:\d{2}\b/g) ?? [];
  if (times.some((x) => x !== input.startTime && x !== input.endTime)) {
    return false;
  }

  if (input.isAvailable) {
    if (CONTRADICTS_AVAILABLE.test(t)) return false;
  } else if (CONTRADICTS_UNAVAILABLE.test(t)) {
    return false;
  }
  return true;
}