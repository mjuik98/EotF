# AGENTS.md

## Purpose

This file is the short working contract for coding agents in this repository. Keep it lean. Use linked docs for detail.

## Read First

- `progress.md`
- `docs/architecture_boundaries.md`
- `README.md`

## Core Rules

- Prefer small, behavior-preserving changes unless the task explicitly asks for refactoring.
- Read the touched area and nearby call paths before editing.
- Match existing local conventions.
- Do not touch unrelated files.
- Never claim validation passed unless you actually ran it.

## Architecture

- New implementation belongs under `game/features/<feature>/`.
- Treat `game/ui/`, `game/app/`, `game/combat/`, `game/state/`, and `game/systems/` as compat or transitional surfaces.
- Keep `game/core/` orchestration-only.
- Cross-feature imports should use `game/features/<feature>/public.js` or `ports/*`, not feature internals.
- New `window.*` / `GAME.*` exposure belongs only in `game/platform/legacy/*`.
- Browser runtime code must not use Node-only APIs.
- State changes should go through `GS.dispatch(...)` or feature-owned state commands, not new direct mutation.

## Validation

- Run `npm test` for logic and behavior changes.
- Run `npm run lint` for architecture, boundary, state-flow, global API, or data/content changes.
- Run `npm run build` for user-visible browser changes and before handoff on substantial work.
- Run `npm run deps:map` when dependency flow or ownership changes.
- For UI-affecting changes, do at least one browser smoke check:
  - click `#mainStartBtn`
  - confirm character select renders
  - check for console/page errors

## Careful Files

Only modify these when the task requires it:

- `.github/workflows/*`
- `scripts/*`
- `docs/metrics/*`
- `progress.md`
