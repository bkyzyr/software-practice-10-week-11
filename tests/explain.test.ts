import { describe, it, expect, vi } from "vitest";
import { validateExplainInput, validateExplanation } from "../src/explain/validate";
import { mockAdapter } from "../src/explain/mockAdapter";
import { explainAvailability } from "../src/explain/explainAvailability";
import { mapReason } from "../src/explain/mapReason";
import type { ExplainAdapter, ExplainInput } from "../src/explain/types";

const baseInput = (overrides: Partial<ExplainInput> = {}): ExplainInput => ({
  roomLabel: "Room 101",
  startTime: "10:00",
  endTime: "11:00",
  isAvailable: true,
  reasonCode: "AVAILABLE",
  ...overrides,
});

describe("validateExplainInput", () => {
  it("accepts a valid input", () => {
    const r = validateExplainInput(baseInput());
    expect(r.ok).toBe(true);
  });

  it("rejects empty input object", () => {
    const r = validateExplainInput({});
    expect(r.ok).toBe(false);
  });

  it("rejects non-string or empty roomLabel", () => {
    expect(validateExplainInput(baseInput({ roomLabel: "" })).ok).toBe(false);
    expect(validateExplainInput(baseInput({ roomLabel: 42 as unknown as string })).ok).toBe(false);
  });

  it("rejects roomLabel longer than 60 chars", () => {
    expect(validateExplainInput(baseInput({ roomLabel: "x".repeat(61) })).ok).toBe(false);
  });

  it("rejects times not in HH:MM format", () => {
    expect(validateExplainInput(baseInput({ startTime: "25:00" })).ok).toBe(false);
    expect(validateExplainInput(baseInput({ endTime: "10:0" })).ok).toBe(false);
  });

  it("rejects non-boolean isAvailable", () => {
    expect(
      validateExplainInput(baseInput({ isAvailable: "yes" as unknown as boolean })).ok,
    ).toBe(false);
  });

  it("rejects unknown reasonCode", () => {
    expect(
      validateExplainInput(baseInput({ reasonCode: "MAYBE" as ExplainInput["reasonCode"] })).ok,
    ).toBe(false);
  });

  it("rejects isAvailable that does not match reasonCode", () => {
    expect(
      validateExplainInput(baseInput({ isAvailable: true, reasonCode: "OVERLAP" })).ok,
    ).toBe(false);
    expect(
      validateExplainInput(baseInput({ isAvailable: false, reasonCode: "AVAILABLE" })).ok,
    ).toBe(false);
  });

  it("rejects userNote longer than 200 chars", () => {
    expect(validateExplainInput(baseInput({ userNote: "y".repeat(201) })).ok).toBe(false);
  });
});

describe("validateExplanation", () => {
  const status = { startTime: "10:00", endTime: "11:00", isAvailable: true };

  it("accepts a matching explanation mentioning only the requested times", () => {
    expect(
      validateExplanation("Room is available from 10:00 to 11:00.", status),
    ).toBe(true);
  });

  it("rejects empty explanations", () => {
    expect(validateExplanation("", status)).toBe(false);
  });

  it("rejects explanations over 240 chars", () => {
    expect(validateExplanation("x".repeat(241), status)).toBe(false);
  });

  it("rejects more than two sentences", () => {
    expect(
      validateExplanation("One. Two. Three.", status),
    ).toBe(false);
  });

  it("rejects times other than the requested ones", () => {
    expect(
      validateExplanation("Room is available from 09:00 to 11:00.", status),
    ).toBe(false);
  });

  it("rejects an explanation contradicting the status", () => {
    expect(
      validateExplanation("The room is not available at that time.", status),
    ).toBe(false);
    expect(
      validateExplanation("The room is available.", { ...status, isAvailable: false }),
    ).toBe(false);
  });
});

const adapter = (impl: ExplainAdapter["explain"]): ExplainAdapter => ({
  name: "test",
  explain: impl,
});

describe("explainAvailability", () => {
  it("returns the adapter explanation for an available slot", async () => {
    const r = await explainAvailability(baseInput(), mockAdapter);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.usedFallback).toBe(false);
      expect(r.explanation).toContain("Room 101");
      expect(r.explanation).toContain("10:00");
    }
  });

  it("explains an overlap", async () => {
    const r = await explainAvailability(
      baseInput({ isAvailable: false, reasonCode: "OVERLAP" }),
      mockAdapter,
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.usedFallback).toBe(false);
      expect(r.explanation).toContain("overlap");
    }
  });

  it("explains a blocked room", async () => {
    const r = await explainAvailability(
      baseInput({ isAvailable: false, reasonCode: "ROOM_BLOCKED" }),
      mockAdapter,
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.usedFallback).toBe(false);
      expect(r.explanation).toContain("blocked");
    }
  });

  it("explains an invalid time", async () => {
    const r = await explainAvailability(
      baseInput({ isAvailable: false, reasonCode: "INVALID_TIME" }),
      mockAdapter,
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.usedFallback).toBe(false);
  });

  it("explains a past time", async () => {
    const r = await explainAvailability(
      baseInput({ isAvailable: false, reasonCode: "PAST_TIME" }),
      mockAdapter,
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.usedFallback).toBe(false);
      expect(r.explanation).toContain("passed");
    }
  });

  it("reports an error for invalid input", async () => {
    const r = await explainAvailability(
      baseInput({ startTime: "not-a-time" }),
      mockAdapter,
    );
    expect(r.ok).toBe(false);
  });

  it("uses the fallback when the adapter times out", async () => {
    const slow: ExplainAdapter = adapter(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ explanation: "late" }), 10_000);
        }),
    );
    vi.useFakeTimers();
    const pending = explainAvailability(baseInput(), slow);
    await vi.advanceTimersByTimeAsync(3_000);
    const r = await pending;
    vi.useRealTimers();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.usedFallback).toBe(true);
  });

  it("uses the fallback when the adapter throws", async () => {
    const failing = adapter(() => Promise.reject(new Error("boom")));
    const r = await explainAvailability(baseInput(), failing);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.usedFallback).toBe(true);
  });

  it("uses the fallback when the model output contradicts the status", async () => {
    const contradicting = adapter(() =>
      Promise.resolve({ explanation: "The room is not available at that time." }),
    );
    const r = await explainAvailability(baseInput(), contradicting);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.usedFallback).toBe(true);
  });

  it("never passes the userNote to the adapter", async () => {
    const spy = vi.fn(() =>
      Promise.resolve({ explanation: "Room is available from 10:00 to 11:00." }),
    );
    const spying = adapter(spy);
    await explainAvailability(baseInput({ userNote: "private thought" }), spying);
    const arg = spy.mock.calls[0][0] as { userNote?: string };
    expect("userNote" in arg).toBe(false);
    expect(arg.userNote).toBeUndefined();
  });
});

describe("mapReason", () => {
  it("maps checker reasons to reason codes", () => {
    expect(mapReason("OK", true)).toBe("AVAILABLE");
    expect(mapReason("OVERLAP", false)).toBe("OVERLAP");
    expect(mapReason("BLOCKED", false)).toBe("ROOM_BLOCKED");
    expect(mapReason("MALFORMED", false)).toBe("INVALID_TIME");
    expect(mapReason("INVALID_RANGE", false)).toBe("INVALID_TIME");
    expect(mapReason("TOO_LONG", false)).toBe("INVALID_TIME");
    expect(mapReason("PAST", false)).toBe("PAST_TIME");
  });

  it("derives a code when the checker has no reason", () => {
    expect(mapReason(undefined, true)).toBe("AVAILABLE");
    expect(mapReason(undefined, false)).toBe("INVALID_TIME");
  });
});
