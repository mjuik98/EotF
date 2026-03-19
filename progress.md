Original prompt: 우리 프로젝트 코드를 분석하고, 단순 코드 정리가 아니라 프로젝트 전체 관점에서 구조 개선안을 제시하고, 모듈화/책임 분리/관심사 분리/구조화/공통 로직 일원화/의존성 관리/상태 흐름 정리/유지보수성과 확장성 향상을 목표로 점진적으로 구현한다.

# Progress Summary

This file keeps only the current truth. Historical batch logs were intentionally deleted.

## Current State

- Project status: playable prototype
- Main priority: structural refactor and regression prevention over net-new feature work
- Working direction:
  - grow `feature-local application/domain/state/presentation/platform` ownership
  - shrink compat-heavy surfaces in `game/ui/*`, `game/app/*`, `game/state/*`, `game/combat/*`, and `game/systems/*`
  - keep `game/core/*` focused on orchestration only
- Source-of-truth docs:
  - `docs/architecture_boundaries.md`
  - `docs/architecture_refactoring_plan.md`
  - `docs/metrics/*`
- Latest structural move in progress:
  - `game/systems/event_manager.js` now routes to `game/features/event/application/event_manager_compat.js`
  - `game/combat/combat_lifecycle.js`, `game/combat/death_handler.js`, and `game/combat/turn_manager.js` now route to feature-owned compat facades under `game/features/combat/application/*`
  - `game/combat/card_methods.js`, `game/combat/combat_methods.js`, `game/combat/damage_system.js`, and `game/combat/damage_system_helpers.js` now also route to feature-owned canonical files under `game/features/combat/application/*`
  - compat allowlist is now empty; scanned compat surfaces are thin re-export shims only

## Current Validation Standard

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run deps:map` when dependency flow or ownership changes

Browser-level smoke for UI work:

1. Start the app.
2. Click `#mainStartBtn`.
3. Confirm the character select panel renders correctly.
4. Check for new console or page errors.

Optional deeper smoke:

- `npm run smoke:reward`

## Current Focus

- Continue moving real implementation inward to canonical feature/shared/platform owners.
- Keep compat paths thin and stable for existing callers.
- Reduce legacy global access outside `game/platform/legacy/*`.
- Reduce direct state mutation and accidental cross-layer imports.
- Preserve title -> character select -> run/combat/reward flow while refactoring.

## Current Risks

- Compat surfaces still create wide fan-out and make ownership easy to regress.
- Some browser/runtime flows remain sensitive to boundary changes.
- Bundle size and chunk boundaries still need attention after structural moves.
- Composition/bootstrap code can regain feature-specific knowledge if not guarded.

## Current Workspace Note

The current worktree contains validated changes around compat guardrails, combat/reward presentation ownership, feature public surfaces, browser effect compatibility, combat/event compat-facade ownership inversion, a new feature-level contract seam under `game/features/*/ports/public_contract_capabilities.js`, facade-first binding consumption in core binding entrypoints, grouped combat application consumption in legacy `GAME.*` commands, grouped run-rule consumption in shared/browser compat flows, direct feature-owned screen/reward compat re-exports, a tighter gameplay/event manual chunk split, and new feature-local state command seams for screen navigation and combat card state updates. Browser smoke, lint, tests, build, and `deps:map` are green after the latest contract-seam, compat-hop, binding-facade, grouped public-surface cleanup, state-command cleanup, and bundle-boundary batches.

## Next Actions

1. Continue collapsing remaining multi-hop compat files in `game/ui/*` and `game/presentation/*` into direct feature-owned re-exports.
2. Keep reducing low-level named-export consumption from `features/*/public.js`; core/legacy entrypoints should prefer grouped facade members (`bindings`, `application`, `contracts`, `runtime`, `rules`) or direct feature-owned compat re-exports when the caller only needs a single canonical file.
3. Keep `TurnManager` and similar compat facades lazy-initialized when they sit on feature public-surface import paths to avoid circular module init regressions.
4. Continue shrinking runtime-only fallback paths inside feature-owned combat helpers, especially legacy/browser lookups that still bypass explicit ports.
5. Expand feature-local state command cleanup beyond reward/ui/combat-card flows so more dispatch entry points stop living in application/runtime helpers.

## Latest Notes

- Split `game/shared/state/game_state_runtime_methods.js` into explicit attach paths:
  - `attachCoreGameStateRuntimeMethods(target)` now attaches only common/player methods.
  - `attachCombatGameStateRuntimeMethods(target)` now attaches combat/card helpers separately.
  - `attachGameStateRuntimeMethods(target, { includeCombat })` remains as the transitional combined helper.
- `game/core/game_state.js` now attaches core and combat runtime methods in two explicit steps, which makes the boundary visible at the canonical `GS` construction site instead of hiding it behind one mixed helper.
- `game/core/game_state_core_methods.js` now re-exports only `CoreGameStateRuntimeMethods` as `GameStateCoreMethods`; compat callers using the "core" alias no longer silently receive combat/card helpers.
- Added regression coverage for the new boundary:
  - `tests/game_state_core_methods.test.js` now asserts `GameStateCoreMethods` exposes `addLog` but not `playCard`, `drawCards`, or `dealDamage`.
  - `tests/core_store_public.test.js` now asserts the core-only attach path omits combat methods until the combat attach helper is called.
- Validation after the runtime-method attach split batch:
  - `npm run lint` PASS
  - `npm test` PASS (`427 files / 1030 tests`)
  - `npm run build` PASS
  - `npm run deps:map` PASS (`1137 nodes, 1236 edges`)
  - Browser smoke PASS via Playwright client against `http://127.0.0.1:4180`: `#mainStartBtn` opened character select, screenshots under `output/web-game/shot-{0,1,2}.png`, and `state-{0,1,2}.json` showed `panels: ["characterSelect"]` with no captured error file.
- Next structural target after this batch:
  - move remaining `drawCards` and any residual combat/card behavior callers off direct `GS` method assumptions
  - then stop attaching combat/card runtime helpers to `GS` by default outside explicit compat paths

- Latest strong-boundary cleanup batch finished the remaining public-surface and bundle-boundary cleanup:
  - Removed grouped `create*FeatureFacade` exports from `game/features/{codex,event,reward,title,ui}/ports/public_surface.js`; feature public surfaces now expose only narrower capability builders and compat-safe named exports.
  - `tests/feature_public_export_allowlist.test.js` now guards every feature public surface against new broad `create*FeatureFacade` exports.
  - `vite.config.js` keeps focused manual chunks for `ui-combat`, `ui-event`, and `ui-reward`; `ui-title` chunking was intentionally removed because title character-select runtime still depends on combat tooltip ports, and the attempted split produced a Rollup circular chunk warning (`ui-title -> ui-combat -> ui-title`).
  - This keeps the build warning-free without rewriting title/combat runtime ownership just to satisfy chunking.
- Validation after the final boundary + chunk cleanup batch:
  - `npm run lint` PASS
  - `npm test` PASS (`442 files / 1080 tests`)
  - `npm run build` PASS
  - `npm run deps:map` PASS (`1232 nodes, 1289 edges`)
  - Browser smoke PASS via Playwright client against `http://127.0.0.1:4182`: `#mainStartBtn` opened character select, screenshots under `output/web-game/arch-boundary-batch-smoke-final/shot-{0,1,2}.png`, and `state-{0,1,2}.json` all showed `panels: ["characterSelect"]` with no captured `errors-*.json` file.

- Routed cross-feature browser loader access through feature `public.js` surfaces for codex, run, and ui settings loaders instead of direct `platform/browser/*` imports from sibling features.
- Restored `CodexUI` to `game/platform/browser/composition/build_screen_primary_modules.js` through `game/features/codex/public.js`.
- Simplified `game/features/codex/platform/browser/ensure_codex_browser_modules.js` to reuse the primary codex browser module catalog directly now that `CodexUI` is registered on the primary screen surface.
- Added `game/features/*/ports/public_contract_capabilities.js` as a lighter public contract seam and switched both feature facades and `game/core/deps/contracts/create_feature_contract_capabilities.js` to use it instead of reaching into `ports/contracts/*` directly.
- Collapsed extra compat hops for `game/ui/screens/{event_ui,event_ui_runtime_helpers,reward_ui}.js` so those entries now re-export directly from feature-owned browser modules instead of bouncing through `game/presentation/screens/*`.
- Replaced raw dispatch literals in `game/features/reward/state/reward_state_commands.js` with feature-local named constants so reward state flow is less stringly-typed without increasing cross-layer coupling.
- Added grouped facade helpers on combat/event/ui feature roots (`application`, `bindings`, `compat`) and moved core binding consumers to those grouped surfaces instead of importing low-level named exports from `public.js` directly.
- `game/core/bindings/{combat_bindings,title_settings_bindings,canvas_bindings,ui_bindings,event_reward_bindings_runtime}.js` now resolve feature behavior through `create<Feature>FeatureFacade()` first, which narrows the number of places that need to know individual public export names.
- Added grouped public-surface access for combat application and run rules so more non-feature consumers can stop importing low-level named exports directly from `game/features/*/public.js`.
- `game/platform/legacy/game_api/{combat_commands,player_draw_commands}.js` now route through `CombatPublicSurface.application`, which reduces legacy knowledge of combat feature internals to a single grouped seam.
- `game/platform/legacy/run_rules_compat.js`, `game/domain/run/region_service.js`, `game/shared/state/player_runtime_methods.js`, and `game/platform/browser/composition/build_core_run_system_modules.js` now consume run rule behavior through `RunPublicSurface.rules`.
- `game/{core,app}/system/screen_service.js` now re-export directly from `game/features/ui/application/screen_navigation_use_case.js` instead of routing through `game/features/ui/public.js`, which removes an unnecessary feature-root hop for a narrow compat seam.
- `game/ui/screens/reward_ui_screen_runtime.js` now re-exports directly from `game/features/reward/application/show_reward_screen_runtime.js` instead of routing through the reward feature root.
- `EventPublicSurface` and `RewardPublicSurface` now expose grouped capability fields (`application`, `contracts`, `runtime`, `moduleCapabilities`) so future consumers can migrate off flat named exports without widening compat surfaces again.
- `vite.config.js` now splits `event` into its own manual chunk and keeps `combat + title + reward` together in `ui-gameplay`; this drops the gameplay chunk below the warning threshold (`645.78 kB`) while avoiding the wider multi-chunk warning set from more aggressive splitting.
- Added `game/features/ui/state/screen_state_commands.js` and `game/features/combat/state/card_state_commands.js`, then moved screen-change, card-draw, and player-energy reducer dispatches behind those feature-owned state commands so `application/*` knows less about raw action names.
- Extended `game/features/combat/state/card_state_commands.js` to cover enemy damage, player shield, player damage, and enemy status reducers, then routed `damage_system_runtime_helpers.js` and `damage_system_compat.js` through those state commands as well.
- `game/features/{title,ui}/app/*` now resolve codex/run/settings browser loaders through grouped feature facades (`createCodexFeatureFacade().browserModules`, `createRunFeatureFacade().browserModules`, `createUiFeatureFacade().browserModules`) instead of pulling flat loader exports from sibling feature roots.
- `game/platform/browser/composition/build_core_run_system_modules.js`, `game/domain/run/region_service.js`, `game/shared/state/player_runtime_methods.js`, and `game/platform/legacy/run_rules_compat.js` now resolve run rules/runtime through `createRunFeatureFacade()` instead of reaching into `RunPublicSurface` directly.
- `game/platform/legacy/game_api/{combat_commands,player_draw_commands}.js` now resolve combat application capabilities lazily through `createCombatFeatureFacade()` so the legacy API keeps the grouped seam without reintroducing import-time initialization cycles.
- Validation after this batch:
  - `npm run lint` PASS
  - `npm run deps:map` PASS
  - `npm test` PASS (`424 files / 1007 tests`)
  - `npm run build` PASS
  - Browser smoke PASS via Playwright client against `http://127.0.0.1:4173`: `#mainStartBtn` opened character select, screenshots under `output/web-game/shot-{0,1,2}.png`, and `output/web-game/state-{0,1,2}.json` showed `panels: [\"characterSelect\"]` with no smoke failure output.
  - Build no longer reports the previous `ui-gameplay` size warning; current gameplay chunk is `644.71 kB`.
  - Build still reports one circular chunk warning between `ui-event` and `ui-gameplay`; that reflects an existing feature dependency cycle which is not yet untangled.
- Follow-up batch completed the remaining `ui-event <-> ui-gameplay` circular chunk cleanup by introducing `game/features/event/ports/public_event_binding_surface.js` as the canonical event/reward binding seam, moving `game/core/bindings/event_reward_bindings_runtime.js` off `game/features/event/public.js`, and reclassifying event action/port/contract builder modules into the gameplay chunk so only event presentation/browser modules remain in `ui-event`.
- Updated `docs/architecture_policy.json` so the core event/reward binding rule still blocks `event` internals (`app/`, `ports/runtime/`, `ports/contracts/`, raw port helpers) while allowing the new public binding seam under `game/features/event/ports/public_event_binding_surface.js`.
- Validation after the circular-chunk cleanup batch:
  - `npm run lint` PASS
  - `npm run deps:map` PASS (`1112 nodes, 1199 edges`)
  - `npm test` PASS (`424 files / 1007 tests`)
  - `npm run build` PASS
  - Browser smoke PASS via Playwright client against `http://127.0.0.1:4173`; latest screenshots are `output/web-game/shot-{0,1,2}.png` dated Mar 13 22:43 and the latest `state-{0,1,2}.json` still show `panels: ["characterSelect"]`.
  - Build warning status: the previous `Circular chunk: ui-event -> ui-gameplay -> ui-event` warning is gone. Current chunk sizes are `ui-event 41.69 kB` and `ui-gameplay 648.33 kB`.
- New batch pushed the combat card command path fully into canonical feature ownership:
  - `game/features/combat/application/public_combat_command_actions.js` now owns `discardStateCard`, `drawStateCards`, and `playStateCard`.
  - `game/features/combat/app/game_state_card_actions.js` is back to a thin compat re-export.
  - `game/features/combat/application/card_methods_compat.js` now consumes the canonical application command surface directly instead of bouncing through the transitional `app/` path.
- Expanded combat feature-owned state command usage:
  - `game/features/combat/state/card_state_commands.js` now owns the card-discard reducer entry as well.
  - `game/features/combat/presentation/browser/combat_actions_runtime_ui.js` now changes energy through the combat state command seam instead of raw `GS.dispatch(...)`.
  - `game/platform/legacy/game_api/combat_commands.js` now resolves enemy damage through `createCombatFeatureFacade().application.applyEnemyDamageState`, keeping the legacy API on a single grouped combat seam without introducing a new legacy -> feature coupling edge.
- Tightened grouped public surfaces for the first-priority features:
  - `CombatPublicSurface`, `EventPublicSurface`, and `RewardPublicSurface` now keep the stable grouped capability fields while dropping the extra flat members from the frozen surface objects.
  - Backward-compatible named exports remain in place for callers that have not migrated yet.
- Normalized reward state flow around reducer-backed actions where available:
  - `game/features/reward/state/reward_state_commands.js` now uses shared `Actions` constants instead of local reward-only string literals for max HP / max energy growth.
  - Mini-boss heal/gold and blessing growth flows now prefer reducer dispatch when `state.dispatch` exists, with the previous direct-mutation fallback preserved for compatibility.
- Validation after the grouped-surface + state-command cleanup batch:
  - `npm run lint` PASS
  - `npm test` PASS (`424 files / 1008 tests`)
  - `npm run build` PASS
  - `npm run deps:map` PASS (`1112 nodes, 1199 edges`)
  - Browser smoke PASS via Playwright client against `http://127.0.0.1:4173`: `#mainStartBtn` opened character select, screenshots under `output/web-game/arch-refactor-plan-batch-20260313/shot-{0,1,2}.png`, and `state-{0,1,2}.json` all showed `panels: ["characterSelect"]` with no captured error logs.
  - Latest build chunk status: `ui-event 41.69 kB`, `ui-gameplay 648.66 kB`.
- New batch moved browser composition off feature-root module details and into explicit module-capability ports:
  - Added `game/features/{codex,ui,event,reward,title,run,combat}/ports/public_module_capabilities.js` so screen/title/run/combat composition builders can depend on a canonical module-capability seam instead of low-level exports from each feature root.
  - `game/platform/browser/composition/build_{screen_primary,screen_overlay,title_canvas,title_flow,run_map,run_flow,combat_core,combat_card,combat_hud}_modules.js` now import those capability builders directly from `ports/public_module_capabilities.js`.
  - `game/features/{codex,ui,event,reward,title,run,combat}/public.js` now consume the same module-capability seam internally, which keeps `public.js` as a grouped facade without forcing composition code to know its internal export layout.
- Reduced import-time coupling on the combat public surface:
  - `CombatPublicSurface` now exposes grouped members like `application`, `bindings`, `compat`, `contracts`, `moduleCapabilities`, and `runtime` through lazy getters, which avoids the import cycle that surfaced when module-capability ports began feeding composition and legacy registration paths.
  - Updated the affected public-surface and composition tests to mock the new `ports/public_module_capabilities.js` seam instead of the root feature facade.
- Validation after the module-capability port batch:
  - `npm run lint` PASS
  - `npm test` PASS (`424 files / 1008 tests`)
  - `npm run build` PASS
  - `npm run deps:map` PASS (`1119 nodes, 1206 edges`)
  - Browser smoke PASS via Playwright client against `http://127.0.0.1:4173`: `#mainStartBtn` opened character select, screenshots under `output/web-game/arch-refactor-module-ports-batch-20260314/shot-{0,1,2}.png`, and `state-{0,1,2}.json` all showed `panels: ["characterSelect"]` with no captured smoke error file.
  - Latest build chunk status: `ui-event 39.21 kB`, `ui-gameplay 648.31 kB`.
- New batch split more public capability seams so core/platform callers no longer need broad feature-root knowledge for run/combat/browser module access:
  - Added `game/features/combat/ports/public_{application,binding}_capabilities.js` and moved the combat root facade to consume them, so the canonical combat command surface now lives under `ports/public_*` while `game/features/combat/public.js` stays as a compatibility facade.
  - Added `game/features/run/ports/public_{binding,rule,browser_modules,system}_capabilities.js`; `public_system_capabilities.js` now bundles run rules + runtime for `game/platform/browser/composition/build_core_run_system_modules.js`, which keeps the composition entrypoint on a single public port without regrowing cross-layer coupling.
  - Added `game/features/{title,ui}/ports/public_binding_capabilities.js`, plus `game/features/{codex,run,ui}/ports/public_browser_modules.js`, then switched feature internals that only need browser loaders or rule helpers away from sibling feature root facades and onto those narrower ports.
- Reduced remaining cross-feature root hops inside features and legacy adapters:
  - `game/platform/legacy/game_api/{combat_commands,player_draw_commands}.js` now read combat commands from `game/features/combat/ports/public_application_capabilities.js`.
  - `game/{domain/run/region_service.js,platform/legacy/run_rules_compat.js,shared/state/player_runtime_methods.js}` now read run rule helpers from `game/features/run/ports/public_rule_capabilities.js`.
  - `game/features/combat/{application/combat_lifecycle_compat.js,application/death_flow_actions.js,domain/difficulty_scaler.js}` now use the same run rule port directly instead of reaching back through `game/features/run/public.js`.
  - `game/features/{ui,title}/app/*` now load codex/run/settings browser modules through `ports/public_browser_modules.js`, which narrows those cross-feature dependencies to the exact browser capability they need.
- Kept backward compatibility on feature root facades while shrinking their ownership:
  - `game/features/{combat,run,ui,codex}/public.js` now delegate to the new public ports internally and still re-export the legacy named symbols needed by compat tests and transitional callers.
  - `game/core/bindings/*` remain routed through grouped feature facades to satisfy existing architecture policy, but those facades now source their binding behavior from the new canonical public port files.
- Validation after the capability-port consolidation batch:
  - `npm run lint` PASS
  - `npm test` PASS (`424 files / 1008 tests`)
  - `npm run build` PASS
  - `npm run deps:map` PASS (`1129 nodes, 1221 edges`)
  - Browser smoke PASS via Playwright client against `http://127.0.0.1:4173`: `#mainStartBtn` opened character select, screenshots under `output/web-game/arch-refactor-capability-ports-batch-20260314/shot-{0,1,2}.png`, and `state-{0,1,2}.json` all showed `panels: ["characterSelect"]` with no captured smoke error file.
  - Latest coupling status: `Import coupling check passed (299 current, baseline 301)`.
  - Latest build chunk status: `ui-event 39.21 kB`, `ui-gameplay 555.86 kB`.
- New batch introduced a shared canonical player state-command seam for non-feature player mutations:
  - Added `game/shared/state/player_state_commands.js` and exported it through `game/shared/state/public.js`.
  - The new command surface now owns shared player-state helpers for heal, gold, max HP growth, max energy growth, explicit HP set, explicit energy set, energy delta, and status clearing.
  - The commands prefer reducer-backed dispatch for semantics that already exist (`PLAYER_HEAL`, `PLAYER_GOLD`, `PLAYER_MAX_HP_GROWTH`, `PLAYER_MAX_ENERGY_GROWTH`) and keep local fallback logic for exact state-setting semantics that do not yet have reducer actions.
- Routed existing direct player mutations through that shared state-command seam:
  - `game/shared/progression/set_bonus_trigger_effects.js` now routes sanctuary max HP changes, machine/fortress/judgement energy gains, moon/titan revive HP writes, and sanctuary debuff cleanup through the shared player state commands instead of inline `player.*` mutation.
  - `game/shared/state/player_runtime_methods.js` now resets time-rift energy through `setPlayerEnergyState(...)` instead of assigning `this.player.energy = 0` directly.
  - `game/features/title/domain/class_progression/class_progression_runtime_effects.js` now applies run-start HP/gold/max-energy bonuses and the no-runtime-heal fallback through shared player state commands instead of open-coded player mutation.
- This batch intentionally did not force all player energy changes through `PLAYER_ENERGY` dispatch, because some legacy/set-bonus flows currently bypass `energy_gain` item hooks; the new shared state commands preserve that behavior while still centralizing ownership.
- Validation after the shared player state-command batch:
  - `npm run lint` PASS
  - `npm test` PASS (`425 files / 1010 tests`)
  - `npm run build` PASS
  - `npm run deps:map` PASS (`1130 nodes, 1225 edges`)
  - Browser smoke PASS via Playwright client against `http://127.0.0.1:4173`: `#mainStartBtn` opened character select, screenshots under `output/web-game/arch-refactor-player-state-commands-batch-20260314/shot-{0,1,2}.png`, and `state-{0,1,2}.json` all showed `panels: ["characterSelect"]` with no captured smoke error file.
  - Latest mutation status: `State mutation target check passed (123 current, target 134)`.
  - Latest coupling status: `Import coupling check passed (300 current, baseline 301)`.
  - Latest build chunk status: `ui-event 39.21 kB`, `ui-gameplay 557.19 kB`.
- New batch added a first-class store surface and a narrower bootstrap registry seam without breaking compat callers:
  - Added `game/core/store/{game_state,state_actions,selectors,public}.js` as the new canonical store-oriented entry surface for `GS`, reducers, and narrow selectors.
  - `game/core/bindings/module_registry.js` now exposes `featureScopes.{core,title,combat,run,screen}` so new bootstrap consumers can stop depending on the full flat module bag.
  - `game/core/bootstrap/{build_binding_ui_helpers,create_game_boot_ports,mount_character_select}.js` now prefer those scoped module views while preserving flat fallback behavior for existing callers and tests.
- Expanded reducer-backed player state entrypoints while preserving legacy behavior:
  - Added reducer action types for explicit energy adjust/set, explicit HP set, explicit max-energy set, and status clear in `game/core/state_action_types.js` and `game/core/state_reducers/player_reducers.js`.
  - `game/shared/state/player_state_commands.js` now routes through dispatch when the reducer path actually returns a result, and falls back to the prior direct mutation behavior when running against legacy/mock state objects that do not implement those reducers.
  - This keeps set-bonus and runtime helper behavior stable while shrinking the number of ad hoc player-mutation entrypoints.
- Added a narrower run state seam and reduced one legacy UI side effect:
  - Added `game/features/run/ports/public_state_capabilities.js` and exposed it through `game/features/run/public.js` so run outcome state commands now have a dedicated public capability surface.
  - `game/platform/legacy/game_api/combat_commands.js` no longer performs direct HUD enemy-HP refresh after enemy damage; the runtime now relies on the existing combat event subscriber/update flow instead of the legacy adapter mutating UI state directly.
- Validation after the store-surface + scoped-registry + player-entrypoint batch:
  - `npm run lint` PASS
  - `npm test` PASS (`427 files / 1016 tests`)
  - `npm run build` PASS
  - `npm run deps:map` PASS (`1136 nodes, 1230 edges`)
  - Browser smoke PASS via Playwright client against `http://127.0.0.1:4174`: `#mainStartBtn` opened character select, screenshots under `output/web-game/arch-refactor-state-registry-batch-20260314/shot-{0,1,2}.png`, and `state-{0,1,2}.json` all showed `panels: ["characterSelect"]` with no captured smoke error file.
  - Latest mutation status: `State mutation target check passed (109 current, target 134)`.
  - Latest coupling status: `Import coupling check passed (300 current, baseline 301)`.
  - Latest build chunk status: `ui-event 39.21 kB`, `ui-gameplay 558.96 kB`.
