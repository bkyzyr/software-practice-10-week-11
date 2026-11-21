import type { ExplainAdapter, ExplainPayload } from "./types";

const REASON_TEXT: Record<ExplainPayload["reasonCode"], string> = {
  AVAILABLE: "is free for the requested time",
  OVERLAP: "already has a booking overlapping the requested time",
  ROOM_BLOCKED: "is blocked and cannot be booked",
  INVALID_TIME: "received an invalid time range",
  PAST_TIME: "was requested in the past",
};

// Demo adapter: builds a one-sentence explanation from structured data only.
// No network calls, no API keys.
export const mockAdapter: ExplainAdapter = {
  name: "mock",
  explain(input: ExplainPayload): Promise<{ explanation: unknown }> {
    const sentence =
      `Room ${input.roomLabel} ${REASON_TEXT[input.reasonCode]} ` +
      `(${input.startTime} to ${input.endTime}).`;
    return Promise.resolve({ explanation: sentence });
  },
};
