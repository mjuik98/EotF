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
- Feature roots are now guarded by `docs/metrics/feature_structure_targets.json`.
  `public.js` is the only allowed root file and canonical top-level dirs are `application`, `domain`, `state`, `presentation`, `platform`, `ports`.
  Existing `app`, `bindings`, `contracts`, `modules`, `runtime`, and feature-local `ui` dirs remain transitional and feature-specific allowlisted only.

The boundary policy is stored in `docs/architecture_policy.json`.

## Dependency Direction

- `game/core/*` should stay orchestration-only and avoid feature/business logic.
- `game/features/*/app` should coordinate use cases, not own browser globals or direct legacy calls.
- `game/features/*/presentation` should adapt app outputs into UI-facing payloads.
- `game/features/*/platform` and `game/platform/browser/*` own `window`, `document`, canvas, timers, storage, and audio bindings.
- `game/platform/legacy/*` is the only place where new `GAME.*` / `window.*` compatibility exposure should be added.
- `game/app/*`, `game/ui/*`, and `game/presentation/*` are compat surfaces during the transition.
- `game/combat/*` and `game/state/*` are also treated as frozen compat surfaces for new implementation.
  New implementation should land under feature/shared/platform ownership; compat paths should remain thin re-exports unless explicitly allowlisted.
- Feature-internal transitional dirs (`app`, `bindings`, `contracts`, `runtime`, `modules`, `ui`) should only survive as compat wrappers.
  Public facades, binding roots, and composition wiring should prefer canonical ownership under `application`, `state`, `presentation`, `platform`, and `ports`.
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
- Run outcome state mutation ownership now lives in `game/features/run/state/run_outcome_state_commands.js`.
  `game/state/commands/run_outcome_commands.js` should remain a thin compat re-export only.
- Shared state/codex/progression helpers now belong under `game/shared/{state,codex,progression}/*`.
  Feature slices should import those shared paths directly; `game/app/shared/*` and `game/app/codex/*` remain compat-only.
- Cross-feature feature imports should use `game/features/<feature>/public.js` or `game/features/<feature>/ports/*` only.
  Feature implementation should not reach into another feature's `application/`, `presentation/`, or `platform/` internals directly.
- `game/core/deps/contracts/*` should consume feature contract builders through feature `public.js` or `game/features/<feature>/ports/public_contract_capabilities.js` facades only.
  Core contract builders must not reach into feature-internal `ports/contracts/*` modules directly.
- Combat card/end-turn services and event shop/choice services now belong under `game/features/{combat,event}/application/*`.
  `game/app/{combat,event}/*_service.js` should remain thin re-exports only.
- Screen-shell and codex top-level facades now belong under `game/features/ui/presentation/browser/*` and `game/features/codex/presentation/browser/*`.
  `game/ui/screens/{screen_ui,ending_screen_ui,story_ui,meta_progression_ui,help_pause_ui,settings_ui,codex_ui}.js` should remain thin re-exports only, and `game/platform/browser/composition/build_screen_{primary,overlay}_modules.js` should compose through feature public facades.
- Screen-shell helper/runtime ownership is also moving inward.
  `game/features/ui/presentation/browser/{screen_ui*,settings_ui*,story_ui*}.js` now owns those extracted browser helpers, while compat files in `game/ui/screens/` with the same prefixes should remain thin re-exports only.
- Pause/help and ending-screen browser ownership now follows the same rule.
  `game/features/ui/presentation/browser/{help_pause_*,ending_*}.js` owns those helpers and runtimes, while matching files in `game/ui/screens/` should remain thin compat re-exports only.
- Meta progression and codex browser ownership now follows the same rule.
  `game/features/ui/presentation/browser/meta_progression_ui*.js` and `game/features/codex/presentation/browser/codex_ui*.js` own those helpers and runtimes, while matching files in `game/ui/screens/` should remain thin compat re-exports only.
- Title/run/combat top-level browser facades now belong under `game/features/{title,run,combat}/presentation/browser/*`.
  Compat entry files in `game/ui/title/*`, `game/ui/run/*`, `game/ui/combat/*`, `game/ui/cards/*`, and `game/presentation/combat/combat_turn_ui.js` should remain thin re-exports only, while `game/features/*/platform/browser/*_browser_modules.js` should compose through feature-local presentation facades.
- Run browser helper ownership is also moving inward.
  `game/features/run/presentation/browser/{run_mode_*,run_return_*}.js` now owns the run-mode and run-return browser helpers, while compat files in `game/ui/run/` with the same prefixes should remain thin re-exports only.
- Bootstrap orchestration should converge on `entry -> register -> init`.
  `game/core/bootstrap/{create_bootstrap_entry,register_bootstrap_bindings,init_bootstrap_runtime}.js` is the canonical flow; older step-builder files should stay thin orchestration shims only.
- Title browser helper ownership is also moving inward.
  `game/features/title/presentation/browser/{title_canvas_*,run_end_screen_*,level_up_popup_*,intro_cinematic_*,game_canvas_setup_ui_*,game_boot_ui*}.js` and `game/features/title/platform/browser/character_select_*.js` now own those browser helpers, while matching files in `game/ui/title/` should remain thin compat re-exports only.
- Combat browser helper ownership now follows the same rule.
  `game/features/combat/presentation/browser/*` now owns combat/cards/hud browser helpers and runtimes, while matching files in `game/ui/combat/`, `game/ui/cards/`, and `game/ui/hud/` should remain thin compat re-exports only.
- Title browser helper ownership is also moving inward:
  `game/features/title/platform/browser/*` now owns class-select and character-select helper modules, while compat files such as `game/ui/title/{class_select_buttons_ui,class_select_selection_ui,class_select_tooltip_ui,character_select_audio,character_select_bindings,character_select_flow,character_select_modal,character_select_summary_replay}.js` should stay thin re-exports only.
- Root-level title and run browser event bindings now follow the same rule.
  `game/features/{title,run}/platform/browser/{register_title_bindings,register_run_entry_bindings}.js` own the active DOM binding logic, while `game/features/{title,run}/ui/*` should remain thin compat wrappers only.
- Shared browser-only transition effects belong under `game/platform/browser/*`.
  `game/ui/effects/echo_ripple_transition.js` should remain a thin compat re-export to `game/platform/browser/effects/echo_ripple_transition.js`.
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
  - `scripts/check-feature-structure.mjs`
  - `scripts/check-compat-surface.mjs`
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
