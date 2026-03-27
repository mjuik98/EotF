# Architecture Stabilization Design

**Goal:** Reduce hidden coupling in runtime-critical paths without a rewrite by tightening boundaries around save infrastructure, workflow UI orchestration, and transitional feature surfaces.

## Scope

This design intentionally targets high-risk seams that are already causing architectural drift:

- Save infrastructure currently mixes persistence, retry, error handling, and UI feedback.
- Several feature `application` workflows import `presentation` or browser/platform modules directly.
- Transitional feature `app/*` wrappers remain in place and should stay as compat-only surfaces, not canonical runtime entrypoints.

This pass will not remove legacy compatibility surfaces wholesale. It will convert the most important runtime paths to clearer seams while preserving behavior.

## Chosen Approach

Use a pragmatic modular-monolith refinement:

- Keep `core` and feature ownership intact.
- Introduce explicit UI/infrastructure ports at workflow boundaries.
- Preserve existing compat wrappers, but stop increasing their responsibility.
- Add guardrails and focused tests so the new boundaries stay stable.

## Design Decisions

### 1. Save infrastructure split

`game/shared/save/save_system.js` should remain responsible for save policy, queue state, and persistence coordination only.

- Save status rendering will be treated as an injected notification concern.
- `game/platform/storage/save_adapter.js` will only talk to storage and error reporting.
- DOM-driven notification behavior will move behind a runtime notifier/presenter seam.

### 2. Workflow UI ports

Workflow orchestration files under feature `application` should not assemble DOM presenters directly.

Pilot conversions:

- `game/features/event/application/workflows/event_choice_flow.js`
- `game/features/reward/application/workflows/show_reward_screen_workflow.js`
- `game/features/run/application/create_maze_runtime.js`

Each will receive an explicit UI/runtime port object that the browser-facing layer composes.

### 3. Transitional wrapper policy

Feature-local `app/*` wrappers remain for compatibility, but canonical runtime/test imports should move toward `application`, `platform`, or explicit runtime/public surfaces.

This pass will not delete wrappers because repository guardrail tests intentionally preserve them as thin compat surfaces.

### 4. Logging and operational consistency

Touched runtime files should prefer repository logging/error abstractions over ad hoc `console.*` calls when behavior allows.

## Expected Outcomes

- Save infrastructure becomes testable without DOM.
- Browser notification/UI concerns become replaceable.
- Selected workflows gain explicit seams for unit tests and future renderer changes.
- Transitional surfaces remain stable but less central.
- The refactor becomes incremental rather than speculative.
