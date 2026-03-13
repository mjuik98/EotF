# Architecture Refactoring Plan

This document keeps only the active refactoring plan. Detailed boundary rules live in `docs/architecture_boundaries.md`.

## Goal

Keep the project playable while moving ownership toward clear feature-local and shared modules. Prefer incremental extraction over broad rewrites.

## Target Shape

- `game/core/*`: bootstrap, composition, deps, runtime shell only
- `game/features/*`: canonical feature ownership
- `game/shared/*`: explicit cross-feature shared logic
- `game/platform/*`: browser, storage, and legacy adapters
- `game/ui/*`, `game/app/*`, `game/presentation/*`, `game/state/*`, `game/combat/*`, `game/systems/*`: compat or transitional surfaces only

## Active Priorities

1. Move touched implementations out of compat surfaces into `game/features/*`, `game/shared/*`, or `game/platform/*`.
2. Keep compat paths thin with re-exports, shims, or narrow facades only.
3. Reduce `game/core/*` knowledge of feature-specific UI/runtime details.
4. Route cross-feature access through `public.js` or `ports/*` boundaries.
5. Reduce legacy global access and direct state mutation.

## Guardrails

- Do not add new real implementation to compat surfaces unless the task is explicitly about migration scaffolding.
- Browser-only APIs belong in platform/browser or feature platform layers, not domain/application code.
- New `window.*` / `GAME.*` exposure belongs only in `game/platform/legacy/*`.
- State changes should go through reducer-driven flows or feature-owned state commands.
- Preserve behavior with tests and browser smoke checks while ownership moves.

## Done Criteria

- New ownership is clear and imports point at canonical modules.
- Old paths remain only if still needed as thin compat surfaces.
- `npm run lint` passes for boundary-related work.
- `npm test` passes for behavior changes.
- `npm run build` passes for substantial or user-visible changes.
- `npm run deps:map` is updated when dependency flow changes intentionally.
