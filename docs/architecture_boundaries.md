# Architecture Boundaries

This project uses explicit layer boundaries and quality gates to keep growth manageable.

## Layer Model

1. `engine/`, `data/`
2. `game/core/`, `game/systems/`, `game/combat/`, `game/utils/`
3. `game/ui/`

The boundary policy is stored in `docs/architecture_policy.json`.

## Dependency Direction

- `game/ui/*` may depend on core/systems/combat/utils/engine/data.
- `game/systems/*`, `game/combat/*`, and `game/utils/*` must not import `game/ui/*`.
- `game/core/*` must not import `game/ui/*` except composition root files:
  - `game/core/main.js`
  - `game/core/event_bindings.js`
  - `game/core/init_sequence.js`
  - `game/core/deps_factory.js`
  - `game/core/bindings/*`
- `game/ui/*` must not import composition-root entry files:
  - `game/core/main.js`
  - `game/core/event_bindings.js`
- `engine/*` and `data/*` must not import `game/ui/*`.

## State Mutation Rule

- State changes should enter through `GS.dispatch(action, payload)`.
- Reducers in `game/core/state_actions.js` are the preferred mutation point.
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
- `npm run deps:map`
  - writes `docs/metrics/dependency_map.json`
  - writes `docs/metrics/dependency_map.md`

## Baseline Maintenance

When a deliberate architectural expansion is approved, update baselines in the same PR:

- `node scripts/check-window-usage.mjs --write-baseline`
- `node scripts/check-state-mutations.mjs --write-baseline`
- `node scripts/check-import-coupling.mjs --write-baseline`
- `node scripts/check-content-data.mjs --write-baseline`
- `npm run deps:map`
