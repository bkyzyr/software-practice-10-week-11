# Project memory

## Product intent & audience

- Vite + React web application; intent is production-grade, fully featured pages (specific product domain not yet stated).
- Audience unspecified; designs must feel polished and non-generic.

## Brand personality & voice

- Favors bespoke, "not cookie cutter" aesthetics over template-like output.
- Implicit expectation: production-worthy quality in both design and code.

## Visual design & UX direction

- Styling: Tailwind CSS utility classes.
- Icons: `lucide-react` (also used for logos); no other icon/UI-theme packages unless explicitly requested.
- Module imports: `@/` path alias → `src/` (avoid deep relative paths).
- React hooks available; JSX syntax expected.

## Decisions, constraints & rationale

- Checkpoint mechanism: tarball archives stored under `.checkpoints/` (project is not a git repo).
- Checkpoints exclude `node_modules`, `dist`, and the checkpoint folder itself; include source, tests, configs, `AGENTS.md`, and `.bolt/`.
- A regression risk test exists at `tests/regression.risk.test.js`.
- Bolt's Version History (header clock icon) is an additional restore option.

## Open questions & assumptions

- Core product purpose, feature set, and target audience still unstated.
- No specific color palette, typography scale, or layout system chosen yet.
- Accessibility and responsive breakpoints not explicitly defined (defer to sensible Tailwind defaults until specified).