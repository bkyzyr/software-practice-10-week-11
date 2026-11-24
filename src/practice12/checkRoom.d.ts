export declare const MAX_DURATION_MINUTES: number;

export declare const REASON: {
  OK: "OK";
  INVALID_START: "INVALID_START";
  PAST_START: "PAST_START";
  INVALID_DURATION: "INVALID_DURATION";
  DURATION_TOO_LONG: "DURATION_TOO_LONG";
  BLOCKED: "BLOCKED";
  OVERLAP: "OVERLAP";
};

export declare function checkRoomAvailability(args: {
  start: string | Date;
  durationMinutes: number | string;
  blocked?: boolean;
  bookings?: { id: string; start: string | Date; end: string | Date }[];
  now?: string | Date;
}): { available: boolean; reasonCode: string; message: string };
