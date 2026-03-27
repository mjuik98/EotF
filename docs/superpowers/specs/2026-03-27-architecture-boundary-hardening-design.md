# Architecture Boundary Hardening Design

> Scope: incremental refactoring only. Preserve runtime behavior while reducing architectural leakage in the most unstable paths.

## Goal

Harden feature boundaries around three hotspots that currently blur responsibilities:

1. save status presentation ownership
2. title settings cross-feature browser imports
3. combat lifecycle application/browser leakage

## Design

The repository already follows a feature-first modular monolith shape, but several runtime paths still mix use-case logic, browser adapters, and wide public surfaces. This batch does not attempt a rewrite. It tightens the highest-signal boundaries and adds guardrails so future work trends in the same direction.

### 1. Save Status Presentation

- Move the save-status toast presenter out of `game/shared/save/*` into `game/platform/browser/notifications/*`.
- Keep `shared/save` focused on save policy, outbox state, storage binding, and notification registration.
- Update composition code to import the presenter from platform/browser directly.

### 2. Title Settings Browser Module Imports

- Replace the broad `game/features/ui/public.js` import in title settings actions with the narrower `game/features/ui/ports/public_browser_modules.js`.
- This reduces accidental access to unrelated UI public surfaces from title/browser code.

### 3. Combat Lifecycle Application Purity

- Remove direct `document`, `window`, and `console.*` usage from `game/features/combat/application/combat_lifecycle_facade.js`.
- Keep the application workflow dependent on injected runtime dependencies only.
- Allow `deps.win` as an injected adapter object when needed, but do not fall back to browser globals from inside the application module.
- Replace feature-crossing audio helper imports with injected callbacks or engine methods already available in runtime deps.

## Verification

- Add or update guardrail tests for:
  - save presenter location
  - narrowed title settings import surface
  - no browser global fallbacks inside combat lifecycle application
- Run targeted tests first, then broader architecture/fast suite verification as time allows.
