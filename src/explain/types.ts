export type ReasonCode =
  | "AVAILABLE"
  | "OVERLAP"
  | "ROOM_BLOCKED"
  | "INVALID_TIME"
  | "PAST_TIME";

export interface ExplainInput {
  roomLabel: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reasonCode: ReasonCode;
  userNote?: string;
}

export interface ExplainPayload {
  roomLabel: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reasonCode: ReasonCode;
}

export interface ExplainAdapter {
  name: string;
  explain(input: ExplainPayload): Promise<{ explanation: unknown }>;
}
