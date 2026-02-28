# Scaling Playbook

This document defines the implementation path for scaling architecture work.

## 1) Modularization

Implemented:
- Dependency contracts in `game/core/deps_factory.js`
- Layer policy in `docs/architecture_policy.json`
- Architecture gate in `scripts/check-architecture.mjs`
- Dependency visibility report in `docs/metrics/dependency_map.md`

Next:
- Reduce `game/core/main.js` fan-out by introducing per-domain composition modules
- Split large `game/core/game_state_core_methods.js` into domain files

## 2) Separation (Layering)

Implemented:
- Layer model and boundary documentation in `docs/architecture_boundaries.md`
- Explicit composition-root allowlist for UI wiring
- Growth guard for cross-layer import count (`check-import-coupling`)

Next:
- Move cross-domain helpers from `data/*` into dedicated adapters in `game/systems/*`

## 3) Synchronization

Implemented:
- Event normalization and contract validation in `game/core/event_contracts.js`
- Event dedupe window support in `game/core/event_bus.js`
- Dispatch correlation fields (`dispatchId`, `ts`) emitted from `GS.dispatch`

Next:
- Add idempotency keys to high-risk UI actions
- Add retry-safe outbox flow for persistence side effects

## 4) Standardization

Implemented:
- Central runtime config: `game/core/app_config.js`
- Central error catalog: `game/core/error_codes.js`
- Central error reporting: `game/core/error_reporter.js`
- Structured logger prefixing and levels: `game/utils/logger.js`

Next:
- Replace remaining direct `console.*` calls with `Logger`/`reportError`
- Add user-facing error code mapping table

## 5) CI and Contract Gates

Implemented:
- `npm run lint` now checks architecture, state mutation growth, window usage growth, event contract integrity, and import coupling growth.
- Existing `quality-gate` workflow already runs `lint`, `test`, and `build`.

Next:
- Add a CI job artifact upload for dependency map diff

## 6) Operational Metrics

Implemented:
- Import coupling baseline: `docs/metrics/import_coupling_baseline.json`
- Dependency graph export: `docs/metrics/dependency_map.json`

Next:
- Add runtime event counters for top action frequency and error-rate trend
