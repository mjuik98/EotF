# Scaling Playbook

This document defines the implementation path for scaling architecture work.

## 1) Modularization

Implemented:
- Dependency contracts in `game/core/deps_factory.js`
- Dependency contract builders split by domain (`game/core/deps/contracts/*`)
- Layer policy in `docs/architecture_policy.json`
- Architecture gate in `scripts/check-architecture.mjs`
- Dependency visibility report in `docs/metrics/dependency_map.md`
- Composition registry split from entrypoint (`game/core/bindings/module_registry.js`)
- HUD module split for lower change surface:
  - `game/ui/hud/hud_effects_ui.js`
  - `game/ui/hud/hud_stats_ui.js`

Next:
- Continue splitting large UI screens (`map_ui`, `combat_ui`) into render/interaction/state modules

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
- Idempotency guard for high-risk UI actions (`run:start-game`, `run:enter-run`, reward claims, event resolves)
- Retry-safe persistence outbox with exponential backoff in `game/systems/save_system.js`
- Outbox telemetry (`queueDepth`, retry/success/failure counters) via `SaveSystem.getOutboxMetrics()`
- Event subscriber action-port injection to reduce direct `window` coupling (`game/core/event_subscribers.js`)

Next:
- Route remaining subscriber/bridge side effects through injected actions instead of globals

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
- `npm run lint` now checks architecture, window/document/globalThis targets, state mutation targets, event contracts, import coupling growth, content-data integrity, and asset-manifest integrity.
- `quality-gate` runs `lint`, `test:coverage`, and `build`.
- `quality-gate` uploads dependency-map artifacts (`dependency_map.json`, `dependency_map.md`) for each run.
- `quality-gate` posts/updates PR dependency-map diff summary comments.
- PRs run dependency-map threshold guard via `scripts/check-dependency-delta-threshold.mjs`.

Next:
- Raise coverage thresholds progressively after new integration tests are added

## 6) Operational Metrics

Implemented:
- Import coupling baseline: `docs/metrics/import_coupling_baseline.json`
- Dependency graph export: `docs/metrics/dependency_map.json`
- Runtime metrics for action frequency and error-rate trend in `game/core/runtime_metrics.js`
- Explicit quality cap files:
  - `docs/metrics/state_mutation_targets.json`
  - `docs/metrics/window_usage_targets.json`
  - `docs/metrics/dependency_delta_thresholds.json`

Next:
- Add periodic metrics snapshot logging/export for long-run balancing analysis
