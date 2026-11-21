import type { ExplainInput, ReasonCode } from "./types";

const REASON_CODES: readonly ReasonCode[] = [
  "AVAILABLE",
  "OVERLAP",
  "ROOM_BLOCKED",
  "INVALID_TIME",
  "PAST_TIME",
];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const TIME_TOKEN_PATTERN = /\b\d{1,2}:\d{2}\b/g;
const MAX_ROOM_LABEL = 60;
const MAX_NOTE = 200;
const MAX_EXPLANATION = 240;
const MAX_SENTENCES = 2;

export type Validation = { valid: true } | { valid: false; errors: string[] };

function matchesReason(isAvailable: boolean, reasonCode: ReasonCode): boolean {
  return isAvailable ? reasonCode === "AVAILABLE" : reasonCode !== "AVAILABLE";
}

export function validateExplainInput(input: unknown): Validation {
  if (typeof input !== "object" || input === null) {
    return { valid: false, errors: ["Input must be an object."] };
  }
  const i = input as Partial<ExplainInput>;
  const errors: string[] = [];

  if (typeof i.roomLabel !== "string" || i.roomLabel.trim().length === 0) {
    errors.push("roomLabel must be a non-empty string.");
  } else if (i.roomLabel.length > MAX_ROOM_LABEL) {
    errors.push(`roomLabel must be at most ${MAX_ROOM_LABEL} characters.`);
  }

  for (const key of ["startTime", "endTime"] as const) {
    const value = i[key];
    if (typeof value !== "string" || !TIME_PATTERN.test(value)) {
      errors.push(`${key} must be a time in HH:MM format.`);
    }
  }

  if (typeof i.isAvailable !== "boolean") {
    errors.push("isAvailable must be a boolean.");
  }

  if (!i.reasonCode || !REASON_CODES.includes(i.reasonCode)) {
    errors.push("reasonCode is unknown.");
  } else if (
    typeof i.isAvailable === "boolean" &&
    !matchesReason(i.isAvailable, i.reasonCode)
  ) {
    errors.push("isAvailable does not match reasonCode.");
  }

  if (i.userNote !== undefined) {
    if (typeof i.userNote !== "string") {
      errors.push("userNote must be a string.");
    } else if (i.userNote.length > MAX_NOTE) {
      errors.push(`userNote must be at most ${MAX_NOTE} characters.`);
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

function claimsAvailability(text: string): {
  claimsAvailable: boolean;
  claimsNotAvailable: boolean;
} {
  const t = ` ${text.toLowerCase().replace(/isn't|is not|aren't|are not/g, "isn't")} `;
  const claimsNotAvailable =
    /\bunavailable\b|\bisn't\s+available\b|\bcannot\s+be\s+booked\b/.test(t);
  const claimsAvailable = /\bavailable\b/.test(t) && !claimsNotAvailable;
  return { claimsAvailable, claimsNotAvailable };
}

export function validateExplanation(
  explanation: unknown,
  input: Pick<ExplainInput, "startTime" | "endTime" | "isAvailable">,
): Validation {
  if (typeof explanation !== "string" || explanation.trim().length === 0) {
    return { valid: false, errors: ["Explanation must be a non-empty string."] };
  }

  const errors: string[] = [];

  if (explanation.length > MAX_EXPLANATION) {
    errors.push(`Explanation must be at most ${MAX_EXPLANATION} characters.`);
  }

  const sentences = explanation
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
  if (sentences.length > MAX_SENTENCES) {
    errors.push(`Explanation must have at most ${MAX_SENTENCES} sentences.`);
  }

  const tokens = explanation.match(TIME_TOKEN_PATTERN) ?? [];
  const allowed = new Set([input.startTime, input.endTime]);
  if (tokens.some((t) => !allowed.has(t))) {
    errors.push("Explanation may only mention the requested start and end times.");
  }

  const { claimsAvailable, claimsNotAvailable } = claimsAvailability(explanation);
  if (input.isAvailable && claimsNotAvailable) {
    errors.push("Explanation contradicts the confirmed available status.");
  }
  if (!input.isAvailable && claimsAvailable) {
    errors.push("Explanation contradicts the confirmed unavailable status.");
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
