import type { ExplainAdapter, SafeExplainInput } from './types';

function buildText(i: SafeExplainInput): string {
  const slot = `from ${i.startTime} to ${i.endTime}`;
  switch (i.reasonCode) {
    case 'AVAILABLE':
      return `${i.roomLabel} is free ${slot}, so you can book this slot.`;
    case 'OVERLAP':
      return `${i.roomLabel} is not available ${slot} because this time overlaps with an existing booking.`;
    case 'ROOM_BLOCKED':
      return `${i.roomLabel} is not available ${slot} because the room is blocked.`;
    case 'INVALID_TIME':
      return `The time range ${i.startTime} - ${i.endTime} is not valid, because the end time must be after the start time.`;
    case 'PAST_TIME':
      return `${i.roomLabel} cannot be booked ${slot} because that time has already passed.`;
    default:
      return `${i.roomLabel} status could not be explained.`;
  }
}

// MOCK adapter: no network, no API key. Same contract as a real server-side LLM adapter.
export const mockAdapter: ExplainAdapter = {
  name: 'mock',
  async explain(input) {
    return { explanation: buildText(input) };
  },
};