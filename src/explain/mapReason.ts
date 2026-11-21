type CheckerReason = string;

const REASON_MAP: Record<string, "OVERLAP" | "ROOM_BLOCKED" | "INVALID_TIME" | "PAST_TIME"> = {
  OVERLAP: "OVERLAP",
  BLOCKED: "ROOM_BLOCKED",
  MALFORMED: "INVALID_TIME",
  INVALID_RANGE: "INVALID_TIME",
  TOO_LONG: "INVALID_TIME",
  PAST: "PAST_TIME",
};

// Maps the authoritative checker result to a ReasonCode without changing it.
// Unknown/missing reasons fall back to the closest code derived from availability.
export function mapReason(
  reason: CheckerReason | undefined | null,
  isAvailable: boolean,
): "AVAILABLE" | "OVERLAP" | "ROOM_BLOCKED" | "INVALID_TIME" | "PAST_TIME" {
  if (isAvailable) return "AVAILABLE";
  return REASON_MAP[reason ?? ""] ?? "INVALID_TIME";
}
