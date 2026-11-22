# Smart Campus Room Availability Checker

A small web app that shows whether a campus room is free for a chosen time slot and prevents conflicting bookings. Built with Vite, React and TypeScript, tested with Vitest.

## What it does

- Takes a room and a time slot (start and end time).
- Reports whether the room is available.
- Treats a slot as a half-open interval: 10:00-11:00 and 11:00-12:00 do not conflict.
- Rejects invalid input (for example, an end time before the start time).

## Requirements

- Node.js 18 or newer
- npm

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Vite prints a local address, usually http://localhost:5173.

## Test

```bash
npx vitest run
```

## Lint, type check and build

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run lint` currently prints a warning that the installed TypeScript version (5.6.x) is newer than the range officially supported by `@typescript-eslint`. Lint still completes without errors.

## Project structure

```
src/        application code (UI and availability logic)
tests/      Vitest tests
AGENTS.md   instructions and limits for AI coding agents
```

Business logic is kept separate from the UI. New availability rules go into the logic files, not into React components.

## Working with AI agents

Read `AGENTS.md` before using a coding agent on this repository. It lists the safe commands, the forbidden actions and the review rules.

## Known limitations

- There is no CI, so tests, lint and build have to be run by hand before merging.
- Bookings are not stored anywhere; data lives only in the running app.