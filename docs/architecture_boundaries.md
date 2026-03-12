# Architecture Boundaries

This project uses explicit layer boundaries and quality gates to keep growth manageable.

## Layer Model

Current target model:

1. `engine/`, `data/`
2. `game/core/` runtime shell only
3. `game/features/*` feature slices
4. `game/presentation/`, `game/ui/`
5. `game/platform/browser/`, `game/platform/legacy/`, `game/platform/storage/`

Practical note:

- The repository is still in transition, so legacy locations such as `game/app/`, `game/combat/`, `game/systems/`, and `game/state/` remain active.
- New feature work should prefer `game/features/<feature>/{app,state,presentation,platform}` over adding more logic to cross-cutting legacy folders.

The boundary policy is stored in `docs/architecture_policy.json`.

## Dependency Direction

- `game/core/*` should stay orchestration-only and avoid feature/business logic.
- `game/features/*/app` should coordinate use cases, not own browser globals or direct legacy calls.
- `game/features/*/presentation` should adapt app outputs into UI-facing payloads.
- `game/features/*/platform` and `game/platform/browser/*` own `window`, `document`, canvas, timers, storage, and audio bindings.
- `game/platform/legacy/*` is the only place where new `GAME.*` / `window.*` compatibility exposure should be added.
- `game/ui/*` may depend on core/systems/combat/utils/engine/data during the transition, but new UI-facing composition should prefer feature/presentation boundaries.
- `game/systems/*`, `game/combat/*`, and `game/utils/*` must not import `game/ui/*`.
- `game/core/*` must not import `game/ui/*` except composition root files:
  - `game/core/main.js`
  - `game/core/event_bindings.js`
  - `game/core/init_sequence.js`
  - `game/core/deps_factory.js`
  - `game/core/bindings/*`
- New UI-facing composition should live under `game/platform/browser/composition/*`.
- `game/core/composition/*` should stay as thin orchestration or re-export shims, not regain direct UI fan-out.
- `game/ui/*` must not import composition-root entry files:
  - `game/core/main.js`
  - `game/core/event_bindings.js`
- Screen navigation ownership lives in `game/features/ui/application/screen_navigation_use_case.js`.
  Compat paths in `game/core/system/` and `game/app/system/` should remain thin re-exports only.
- Event session/runtime service ownership lives in `game/features/event/application/event_service.js` and `game/features/event/state/event_session_store.js`.
  Compat paths in `game/app/event/` should remain thin re-exports only.
- Run/combat/title use-case ownership lives in `game/features/{run,combat,title}/application/*`.
  Compat paths in `game/app/{run,combat}/use_cases/` should remain thin re-exports only.
- Shared state/codex/progression helpers now belong under `game/shared/{state,codex,progression}/*`.
  Feature slices should import those shared paths directly; `game/app/shared/*` and `game/app/codex/*` remain compat-only.
- Combat card/end-turn services and event shop/choice services now belong under `game/features/{combat,event}/application/*`.
  `game/app/{combat,event}/*_service.js` should remain thin re-exports only.
- New legacy global exposure must go through `game/platform/legacy/*` builders instead of direct `window.*` or `GAME.*` expansion from unrelated layers.
- `engine/*` and `data/*` must not import `game/ui/*`.

## State Mutation Rule

- State changes should enter through `GS.dispatch(action, payload)`.
- Reducers in `game/core/state_actions.js` are the preferred mutation point.
- Feature-local state commands/use cases are the preferred migration path when extracting logic away from UI/runtime files.
- Direct mutations outside reducers are tracked by `scripts/check-state-mutations.mjs` with a baseline.

## Event Contract Rule

- Action events use namespaced keys (for example, `player:damage`).
- Event payloads are normalized and validated in `game/core/event_contracts.js`.
- Core events are defined in `CoreEvents` and must also be present in `EventContracts`.

## Standardization

- Runtime configuration is centralized in `game/core/app_config.js`.
- Error codes are centralized in `game/core/error_codes.js`.
- Structured runtime error reporting goes through `game/core/error_reporter.js`.
- Logging is centralized in `game/utils/logger.js`.

## Guardrail Commands

- `npm run lint`
  - `scripts/check-architecture.mjs`
  - `scripts/check-window-usage.mjs`
  - `scripts/check-state-mutations.mjs`
  - `scripts/check-event-contracts.mjs`
  - `scripts/check-import-coupling.mjs`
  - `scripts/check-content-data.mjs`
  - `scripts/check-asset-manifest.mjs`
- `npm run deps:map`
  - writes `docs/metrics/dependency_map.json`
  - writes `docs/metrics/dependency_map.md`
- `npm run deps:threshold`
  - compares dependency deltas against `docs/metrics/dependency_delta_thresholds.json`

## Baseline Maintenance

When a deliberate architectural expansion is approved, update baselines in the same PR:

- `node scripts/check-window-usage.mjs --write-baseline`
- `node scripts/check-state-mutations.mjs --write-baseline`
- `node scripts/check-import-coupling.mjs --write-baseline`
- `node scripts/check-content-data.mjs --write-baseline`
- `npm run deps:map`

## Target Maintenance

Target files are used for explicit caps (instead of passive growth-only baselines):

- `node scripts/check-window-usage.mjs --write-targets`
  - writes `docs/metrics/window_usage_targets.json`
- `node scripts/check-state-mutations.mjs --write-targets`
  - writes `docs/metrics/state_mutation_targets.json`
