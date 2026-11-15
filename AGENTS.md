# AGENTS.md

## Project
Smart Campus room availability checker. A catalog of fictional rooms; one selected room is checked at a time, fictional bookings, fixed current time. The app only decides whether a requested time slot is available.

## Project structure
- Booking rules: pure availability function (separate module, no UI code).
- UI: displays the result and feedback on desktop and mobile.
- Fixtures: fictional booking data (must never be mutated).
- Tests: regression tests for the booking rules.

## Constraints
- Preserve acceptance criteria AC1–AC6:
  - AC1: reject start >= end and past requests.
  - AC2: reject durations longer than 120 minutes.
  - AC3: reject a blocked room.
  - AC4: reject overlaps; allow bookings that only touch at endpoints.
  - AC5: do not mutate booking data.
  - AC6: keep clear desktop/mobile feedback.
- No backend, no login, no database, no booking creation.
- Do not change the existing UI appearance or fixture data.

## Engineering rules
- Prefer pure functions and minimal changes.
- Use at most 2 justified patterns. If a pattern is not justified, explain why and skip it.
- Do not use Singleton, Factory or class hierarchies without a concrete need.
- Do not mutate booking fixtures; keep responsive UI feedback.
- Do not weaken or delete existing test assertions.

## Verification
- Run existing tests and add focused regression tests.
- Report changed files, rationale and test evidence (command, output, passed/failed count).
- Check the UI at desktop and narrow/mobile width.

## Forbidden scope changes
- No new features, no new dependencies unless absolutely required, no redesign.

## Safe commands
- npm test, npm run lint, npm run typecheck, npm run build, git status, git diff
- Any other command requires human approval.

## Forbidden actions
- No deployment or publishing, no calls to external production services.
- No secrets, API keys or .env contents in code, logs or chat; no real personal data.
- No deleting files outside the task; no force-push; no merge to main.

## Review gates
- Work on a separate branch. Run npm test and npm run build before proposing acceptance and attach the real output.
- Never claim a command was run unless its real output is attached.
- A human must approve the diff before any merge.
- Keep AC1-AC6 and F1-F5 unchanged.