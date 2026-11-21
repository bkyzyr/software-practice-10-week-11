export const REASON_CODES = [
  'AVAILABLE',
  'OVERLAP',
  'ROOM_BLOCKED',
  'INVALID_TIME',
  'PAST_TIME',
] as const;

export type ReasonCode = (typeof REASON_CODES)[number];

export interface ExplainInput {
  roomLabel: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reasonCode: ReasonCode;
  userNote?: string;
}

export type SafeExplainInput = Omit<ExplainInput, 'userNote'>;

export interface ExplainAdapter {
  name: string;
  explain: (input: SafeExplainInput) => Promise<{ explanation: unknown }>;
}

export type ExplainResult =
  | { ok: true; explanation: string; source: string; usedFallback: boolean }
  | { ok: false; error: string };