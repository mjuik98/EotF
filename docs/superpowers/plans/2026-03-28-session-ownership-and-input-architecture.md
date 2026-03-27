# Session Ownership And Input Architecture Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce canonical `shared input`, `frontdoor`, `run_session`, and `combat_session` ownership without breaking the current playable browser flows.

**Architecture:** Implement the refactor as three incremental batches. Batch 1 creates the shared input layer and routes in-run hotkeys through `run_session`; Batch 2 creates `frontdoor` as the canonical start/end-of-run surface; Batch 3 creates `combat_session` as the owner of combat-only interaction seams. Existing `title`, `ui`, `run`, and `combat` files remain in place until imports are migrated, but each batch must move real call sites behind the new session entrypoints.

**Tech Stack:** JavaScript ES modules, Vite, Vitest, Playwright smoke scripts, repository guardrail scripts, generated dependency-map outputs.

---

## Chunk 1: Preflight And Shared Input Foundation

### Task 1: Preflight isolation and workspace inventory

**Files:**
- Modify: `docs/superpowers/plans/2026-03-28-session-ownership-and-input-architecture.md`

- [ ] **Step 1: Create an isolated worktree before code edits**

Run: `git worktree add .worktrees/feat-session-ownership-input -b feat/session-ownership-input`

Expected: new worktree created on a fresh branch so unrelated dirty files in the main workspace are not mixed into execution.

- [ ] **Step 2: Re-read the current session/input hotspots in the isolated worktree**

Run: `sed -n '1,220p' game/features/ui/presentation/browser/help_pause_ui_runtime.js`

Run: `sed -n '1,220p' game/features/ui/presentation/browser/help_pause_hotkeys_runtime_ui.js`

Run: `sed -n '1,220p' game/features/ui/presentation/browser/settings_ui_runtime.js`

Run: `sed -n '1,220p' game/features/codex/presentation/browser/codex_ui_runtime.js`

Expected: confirm the live keyboard paths still match the design assumptions before editing.

- [ ] **Step 3: Record the current verification baseline**

Run: `npm test`

Run: `npm run test:guardrails`

Run: `npm run smoke:browser`

Expected: all commands pass before starting the migration branch.

### Task 2: Add canonical shared input scaffolding

**Files:**
- Create: `game/shared/input/input_action_ids.js`
- Create: `game/shared/input/input_binding_resolver.js`
- Create: `game/shared/input/keyboard_to_action.js`
- Create: `game/shared/input/public.js`
- Test: `tests/input_action_ids.test.js`
- Test: `tests/input_binding_resolver.test.js`
- Test: `tests/keyboard_to_action.test.js`
- Test: `tests/shared_input_public.test.js`

- [ ] **Step 1: Write the failing shared-input tests**

Add tests that assert:

- `input_action_ids.js` exports stable action names:
  - `confirm`
  - `cancel`
  - `pause`
  - `help`
  - `deckView`
  - `codex`
  - `endTurn`
  - `echoSkill`
  - `drawCard`
  - `targetCycle`
- `input_binding_resolver.js` reads defaults and persisted values via `SettingsManager`
- `keyboard_to_action.js` maps `KeyboardEvent.code` to the resolved action
- `public.js` re-exports only the shared input surface

Run: `npx vitest run tests/input_action_ids.test.js tests/input_binding_resolver.test.js tests/keyboard_to_action.test.js tests/shared_input_public.test.js`

Expected: FAIL because the new shared-input files do not exist yet.

- [ ] **Step 2: Implement `input_action_ids.js`**

Add one canonical constant table plus named exports, for example:

```js
export const INPUT_ACTION_IDS = Object.freeze({
  CONFIRM: 'confirm',
  CANCEL: 'cancel',
  PAUSE: 'pause',
  HELP: 'help',
  DECK_VIEW: 'deckView',
  CODEX: 'codex',
  END_TURN: 'endTurn',
  ECHO_SKILL: 'echoSkill',
  DRAW_CARD: 'drawCard',
  TARGET_CYCLE: 'targetCycle',
});
```

Keep this file free of browser or settings logic.

- [ ] **Step 3: Implement `input_binding_resolver.js`**

Wrap `SettingsManager` access behind a narrow API:

- `getInputBindingCode(actionId, fallback)`
- `getInputBindingMap()`
- `isInputActionBoundTo(event, actionId, fallback)`

Use the existing settings key names so no save-data migration is required.

- [ ] **Step 4: Implement `keyboard_to_action.js`**

Add pure helpers such as:

- `resolveKeyboardAction(event, bindingMap)`
- `resolveKeyboardActionFromSettings(event)`

Return `null` when the event does not match a known action. Do not mutate the event.

- [ ] **Step 5: Implement `public.js` and run the focused tests**

Run: `npx vitest run tests/input_action_ids.test.js tests/input_binding_resolver.test.js tests/keyboard_to_action.test.js tests/shared_input_public.test.js`

Expected: PASS.

### Task 3: Add run-session scaffolding and route the help/pause hotkey entry through shared input

**Files:**
- Create: `game/features/run_session/application/handle_run_input_action.js`
- Create: `game/features/run_session/platform/browser/run_session_hotkey_runtime.js`
- Create: `game/features/run_session/public.js`
- Modify: `game/features/ui/presentation/browser/help_pause_ui_runtime.js`
- Modify: `game/features/ui/presentation/browser/help_pause_hotkeys_runtime_ui.js`
- Modify: `game/features/ui/public.js`
- Test: `tests/run_session_public.test.js`
- Test: `tests/run_session_hotkey_runtime.test.js`
- Modify: `tests/help_pause_hotkeys_runtime_ui.test.js`
- Modify: `tests/help_pause_ui_runtime.test.js`

- [ ] **Step 1: Write the failing run-session tests**

Add tests that prove:

- `run_session/public.js` exposes the run-session hotkey entrypoint
- `handle_run_input_action.js` toggles help, pause, deck view, and codex based on normalized action IDs
- `run_session_hotkey_runtime.js` converts `keydown` events into shared input actions before delegating

Run: `npx vitest run tests/run_session_public.test.js tests/run_session_hotkey_runtime.test.js tests/help_pause_hotkeys_runtime_ui.test.js tests/help_pause_ui_runtime.test.js`

Expected: FAIL because `run_session` does not exist yet.

- [ ] **Step 2: Implement `handle_run_input_action.js`**

Move the branching logic that currently lives in `handleGlobalHotkey(...)` behind action-based handling:

- `cancel` delegates to the existing escape/modal-close logic
- `help`, `deckView`, `codex` keep existing mode/policy checks
- combat-allowed actions continue to respect `runHotkeyState.allowsCombatHotkeys`

Keep modal-priority logic in one place. Do not duplicate the old `KeyboardEvent.code` checks here.

- [ ] **Step 3: Implement `run_session_hotkey_runtime.js`**

Create a browser-facing adapter that:

- ignores rebinding mode
- resolves the current binding map
- turns a `keydown` event into an action with `resolveKeyboardActionFromSettings(...)`
- delegates to `handleRunInputAction(...)`

- [ ] **Step 4: Update `help_pause_ui_runtime.js` to call the run-session adapter**

Replace the direct key-code table in `handleGlobalHotkey(...)` with a thin adapter call into `run_session`.

Preserve existing helpers such as:

- `handleEscapeHotkey(...)`
- `cycleNextTarget(...)`
- `getRunHotkeyState(...)`
- `hasBlockingGameplayModal(...)`

The goal is not to delete them yet, only to stop `help_pause_ui_runtime.js` from being the canonical keyboard interpreter.

- [ ] **Step 5: Update `game/features/ui/public.js` with a compatibility re-export**

Re-export the new run-session hotkey entrypoint from `ui/public.js` only if existing tests still import through `ui/public.js`. Keep the compat surface thin and document it in the test names.

- [ ] **Step 6: Run the focused tests**

Run: `npx vitest run tests/run_session_public.test.js tests/run_session_hotkey_runtime.test.js tests/help_pause_hotkeys_runtime_ui.test.js tests/help_pause_ui_runtime.test.js`

Expected: PASS.

### Task 4: Adopt shared input in settings rebinding and codex modal key handling

**Files:**
- Modify: `game/features/ui/presentation/browser/settings_ui_runtime.js`
- Modify: `game/features/ui/presentation/browser/help_pause_keybinding_helpers.js`
- Modify: `game/features/codex/presentation/browser/codex_ui_runtime.js`
- Modify: `game/platform/browser/settings/settings_manager.js`
- Modify: `tests/settings_ui_runtime.test.js`
- Modify: `tests/settings_ui_keybinding_helpers.test.js`
- Modify: `tests/settings_manager.test.js`
- Modify: `tests/codex_ui_runtime.test.js`
- Test: `tests/codex_input_binding_runtime.test.js`

- [ ] **Step 1: Write the failing rebinding and codex tests**

Add coverage for:

- rebinding still persists to the existing settings keys
- shared input helpers can read back the rebound values
- codex popup escape and arrow navigation still work while the codex modal is open

Run: `npx vitest run tests/settings_ui_runtime.test.js tests/settings_ui_keybinding_helpers.test.js tests/settings_manager.test.js tests/codex_ui_runtime.test.js tests/codex_input_binding_runtime.test.js`

Expected: FAIL for any new shared-input assumptions not yet wired.

- [ ] **Step 2: Narrow the settings runtime onto shared input naming**

Keep the persisted schema in `SettingsManager`, but update helpers so the settings UI reads canonical action IDs from `game/shared/input/input_action_ids.js` or the resolver module rather than hard-coded strings spread across multiple files.

- [ ] **Step 3: Update codex runtime keyboard handling**

Keep codex popup-local navigation in `codex_ui_runtime.js`, but make the codex open/close action come from the shared-input path handled by `run_session`. The codex runtime itself should only care about popup-local keys like:

- `Escape`
- `ArrowLeft`
- `ArrowRight`

- [ ] **Step 4: Run the focused tests**

Run: `npx vitest run tests/settings_ui_runtime.test.js tests/settings_ui_keybinding_helpers.test.js tests/settings_manager.test.js tests/codex_ui_runtime.test.js tests/codex_input_binding_runtime.test.js`

Expected: PASS.

### Task 5: Register new tests and verify Batch 1 end-to-end

**Files:**
- Modify: `tests/test_suite_manifest.json` or manifest file updated by script
- Modify: `artifacts/dependency_map.json`
- Modify: `artifacts/dependency_map.md`

- [ ] **Step 1: Sync the test manifest after adding test files**

Run: `npm run test:manifest:write`

Expected: manifest updated to include new shared-input and session tests.

- [ ] **Step 2: Regenerate dependency-map outputs**

Run: `npm run deps:map`

Expected: generated artifacts updated to reflect new shared/session import paths.

- [ ] **Step 3: Run batch-level verification**

Run: `npm test`

Run: `npm run test:guardrails`

Run: `npm run lint`

Run: `npm run smoke:browser`

Expected: PASS across the fast suite, guardrails, lint, and browser smoke after Batch 1.

## Chunk 2: Frontdoor Session Migration

### Task 6: Create frontdoor session scaffolding

**Files:**
- Create: `game/features/frontdoor/application/create_frontdoor_session_actions.js`
- Create: `game/features/frontdoor/platform/browser/frontdoor_runtime_entry.js`
- Create: `game/features/frontdoor/public.js`
- Test: `tests/frontdoor_public.test.js`
- Test: `tests/frontdoor_runtime_entry.test.js`

- [ ] **Step 1: Write the failing frontdoor scaffold tests**

Assert that `frontdoor/public.js` is the coarse entrypoint for title-adjacent flows and that the browser runtime entry wires injected title/frontdoor deps rather than touching unrelated run-session internals directly.

Run: `npx vitest run tests/frontdoor_public.test.js tests/frontdoor_runtime_entry.test.js`

Expected: FAIL because the `frontdoor` feature does not exist yet.

- [ ] **Step 2: Implement the frontdoor coarse entrypoint**

Add a public surface that exposes:

- frontdoor session action creation
- browser runtime entry helpers

Do not expose broad `ui` or `run` barrels from this new public file.

- [ ] **Step 3: Run the focused tests**

Run: `npx vitest run tests/frontdoor_public.test.js tests/frontdoor_runtime_entry.test.js`

Expected: PASS.

### Task 7: Move title, character-select, and continue entry behind frontdoor

**Files:**
- Modify: `game/features/title/public.js`
- Modify: `game/features/title/application/load_character_select_use_case.js`
- Modify: `game/features/title/application/create_character_select_runtime.js`
- Modify: `game/features/run/application/continue_loaded_run_use_case.js`
- Modify: `game/core/bootstrap/mount_character_select.js`
- Modify: `tests/load_character_select_use_case.test.js`
- Modify: `tests/character_select_ui_mount.test.js`
- Modify: `tests/continue_loaded_run_use_case.test.js`
- Modify: `tests/continue_run_use_case.test.js`

- [ ] **Step 1: Write the failing frontdoor-entry tests**

Add or update tests so the call sites expect `frontdoor/public.js` or `frontdoor_runtime_entry.js` to mediate:

- character select entry
- continue-run entry
- mount-time title flow wiring

Run: `npx vitest run tests/load_character_select_use_case.test.js tests/character_select_ui_mount.test.js tests/continue_loaded_run_use_case.test.js tests/continue_run_use_case.test.js`

Expected: FAIL after the import expectations are tightened.

- [ ] **Step 2: Refactor title/runtime entry call sites**

Update bootstrap and title-facing code so `frontdoor` becomes the canonical owner of:

- loading character select
- creating character-select runtime bindings
- continue-run entry handoff

Keep `game/features/title/*` as the implementation body where necessary, but make `frontdoor` the first import target for new runtime wiring.

- [ ] **Step 3: Keep `title/public.js` as a thin compatibility layer**

Reduce `title/public.js` to compatibility re-exports only. Avoid adding any new runtime responsibility there.

- [ ] **Step 4: Run the focused tests**

Run: `npx vitest run tests/load_character_select_use_case.test.js tests/character_select_ui_mount.test.js tests/continue_loaded_run_use_case.test.js tests/continue_run_use_case.test.js`

Expected: PASS.

### Task 8: Move run-end and ending entry ownership behind frontdoor

**Files:**
- Modify: `game/features/title/presentation/browser/run_end_screen_runtime.js`
- Modify: `game/features/title/presentation/browser/run_end_screen_ui.js`
- Modify: `game/features/ui/presentation/browser/ending_screen_runtime_helpers.js`
- Modify: `game/features/ui/presentation/browser/ending_screen_ui.js`
- Modify: `game/features/frontdoor/platform/browser/frontdoor_runtime_entry.js`
- Modify: `tests/run_end_screen_runtime.test.js`
- Modify: `tests/ending_screen_ui_runtime.test.js`
- Test: `tests/frontdoor_run_end_entry.test.js`

- [ ] **Step 1: Write the failing run-end ownership tests**

Add tests that assert the runtime entry for run-end/ending flows now starts from `frontdoor`.

Run: `npx vitest run tests/run_end_screen_runtime.test.js tests/ending_screen_ui_runtime.test.js tests/frontdoor_run_end_entry.test.js`

Expected: FAIL until the new entrypoint is wired.

- [ ] **Step 2: Refactor run-end and ending entry wiring**

Keep the existing rendering logic, but move ownership of the "start this overlay flow" seam behind `frontdoor_runtime_entry.js`.

This change should not alter the look or timing of the existing overlay.

- [ ] **Step 3: Run the focused tests**

Run: `npx vitest run tests/run_end_screen_runtime.test.js tests/ending_screen_ui_runtime.test.js tests/frontdoor_run_end_entry.test.js`

Expected: PASS.

### Task 9: Verify Batch 2 and refresh generated outputs

**Files:**
- Modify: `tests/test_suite_manifest.json` or manifest file updated by script
- Modify: `artifacts/dependency_map.json`
- Modify: `artifacts/dependency_map.md`

- [ ] **Step 1: Sync generated outputs**

Run: `npm run test:manifest:write`

Run: `npm run deps:map`

Expected: both generated outputs reflect the new frontdoor files and tests.

- [ ] **Step 2: Run batch-level verification**

Run: `npm test`

Run: `npm run test:guardrails`

Run: `npm run lint`

Run: `npm run smoke:browser`

Expected: PASS after Batch 2.

## Chunk 3: Combat Session Migration

### Task 10: Create combat-session scaffolding

**Files:**
- Create: `game/features/combat_session/application/handle_combat_session_action.js`
- Create: `game/features/combat_session/platform/browser/combat_session_runtime.js`
- Create: `game/features/combat_session/public.js`
- Test: `tests/combat_session_public.test.js`
- Test: `tests/combat_session_runtime.test.js`

- [ ] **Step 1: Write the failing combat-session scaffold tests**

Assert that `combat_session/public.js` is the coarse entrypoint for combat-only interaction seams and that the runtime adapter delegates to injected combat deps instead of reaching across unrelated features.

Run: `npx vitest run tests/combat_session_public.test.js tests/combat_session_runtime.test.js`

Expected: FAIL because `combat_session` does not exist yet.

- [ ] **Step 2: Implement the combat-session scaffolding**

Expose only the combat-session runtime entry and the combat action handler from the new public surface.

- [ ] **Step 3: Run the focused tests**

Run: `npx vitest run tests/combat_session_public.test.js tests/combat_session_runtime.test.js`

Expected: PASS.

### Task 11: Move target-cycle and combat-only hotkeys behind combat_session

**Files:**
- Modify: `game/features/ui/presentation/browser/help_pause_hotkeys_runtime_ui.js`
- Modify: `game/features/ui/presentation/browser/help_pause_ui_runtime.js`
- Modify: `game/features/combat/presentation/browser/card_target_ui.js`
- Modify: `game/features/combat/public.js`
- Modify: `tests/help_pause_hotkeys_runtime_ui.test.js`
- Modify: `tests/card_target_ui.test.js`
- Test: `tests/combat_session_target_cycle.test.js`

- [ ] **Step 1: Write the failing combat-hotkey tests**

Add coverage for:

- target cycle action dispatch
- end-turn, draw-card, echo-skill routing through the combat-session entry
- no regression in combat-only gating when overlays or modals are active

Run: `npx vitest run tests/help_pause_hotkeys_runtime_ui.test.js tests/card_target_ui.test.js tests/combat_session_target_cycle.test.js`

Expected: FAIL until the combat-session handoff exists.

- [ ] **Step 2: Implement `handle_combat_session_action.js`**

Move combat-only action handling behind normalized action IDs:

- `endTurn`
- `echoSkill`
- `drawCard`
- `targetCycle`
- numeric hand-slot actions if they are kept in this batch

Preserve the current modal/overlay blocking rules.

- [ ] **Step 3: Update the old hotkey runtime to delegate**

`help_pause_ui_runtime.js` should no longer be the owner of combat-only action behavior. It may still call into `combat_session` for compatibility, but the branching logic should live in the new session files.

- [ ] **Step 4: Run the focused tests**

Run: `npx vitest run tests/help_pause_hotkeys_runtime_ui.test.js tests/card_target_ui.test.js tests/combat_session_target_cycle.test.js`

Expected: PASS.

### Task 12: Move reward-transition trigger ownership behind combat_session

**Files:**
- Modify: `game/features/combat/application/run_end_combat_flow_use_case.js`
- Modify: `game/features/reward/ports/runtime/public_reward_runtime_surface.js`
- Modify: `game/features/combat_session/platform/browser/combat_session_runtime.js`
- Modify: `tests/combat_runtime_commands.test.js`
- Test: `tests/combat_session_reward_transition.test.js`

- [ ] **Step 1: Write the failing reward-transition tests**

Add a test that proves combat completion reaches reward/session transition through `combat_session`, not through a new ad hoc cross-feature UI import.

Run: `npx vitest run tests/combat_runtime_commands.test.js tests/combat_session_reward_transition.test.js`

Expected: FAIL until the new ownership seam exists.

- [ ] **Step 2: Refactor the combat-to-reward handoff**

Keep the current reward screen behavior, but make the transition trigger originate from the combat-session runtime seam.

Do not pull reward rendering logic into `combat_session`.

- [ ] **Step 3: Run the focused tests**

Run: `npx vitest run tests/combat_runtime_commands.test.js tests/combat_session_reward_transition.test.js`

Expected: PASS.

### Task 13: Verify Batch 3 and tighten public-surface scope tests

**Files:**
- Modify: `tests/combat_public_surface_scope.test.js`
- Test: `tests/run_session_public_surface_scope.test.js`
- Test: `tests/frontdoor_public_surface_scope.test.js`
- Modify: `tests/test_suite_manifest.json` or manifest file updated by script
- Modify: `artifacts/dependency_map.json`
- Modify: `artifacts/dependency_map.md`

- [ ] **Step 1: Add scope tests for the new coarse entrypoints**

Keep the new public surfaces small and explicit. Follow the pattern already used in `tests/combat_public_surface_scope.test.js`.

Run: `npx vitest run tests/combat_public_surface_scope.test.js tests/run_session_public_surface_scope.test.js tests/frontdoor_public_surface_scope.test.js`

Expected: FAIL until the scope assertions match the new public APIs.

- [ ] **Step 2: Sync generated outputs**

Run: `npm run test:manifest:write`

Run: `npm run deps:map`

Expected: generated manifest and dependency-map files are up to date.

- [ ] **Step 3: Run full batch verification**

Run: `npm test`

Run: `npm run test:guardrails`

Run: `npm run lint`

Run: `npm run deps:map:check`

Run: `npm run smoke:browser`

Expected: PASS after Batch 3.

## Chunk 4: Final Cleanup, Review, And Integration

### Task 14: Remove accidental new ownership from legacy public barrels

**Files:**
- Modify: `game/features/title/public.js`
- Modify: `game/features/ui/public.js`
- Modify: `game/features/run/public.js`
- Modify: `game/features/combat/public.js`
- Modify: any call sites still importing new behavior through legacy public barrels

- [ ] **Step 1: Audit imports added during the migration**

Run: `rg -n "features/(title|ui|run|combat)/public.js|features/(frontdoor|run_session|combat_session)/public.js|shared/input/public.js" game tests`

Expected: identify which runtime and test imports still point at legacy public barrels.

- [ ] **Step 2: Move new runtime imports to the coarse session surfaces**

Change any new code added during this project so it imports from:

- `game/features/frontdoor/public.js`
- `game/features/run_session/public.js`
- `game/features/combat_session/public.js`
- `game/shared/input/public.js`

Leave legacy public barrels only as compatibility re-export layers where tests or untouched runtime still depend on them.

- [ ] **Step 3: Re-run targeted scope tests**

Run: `npx vitest run tests/combat_public_surface_scope.test.js tests/run_session_public_surface_scope.test.js tests/frontdoor_public_surface_scope.test.js tests/shared_input_public.test.js`

Expected: PASS.

### Task 15: Final repository verification and handoff

**Files:**
- Modify: `artifacts/dependency_map.json`
- Modify: `artifacts/dependency_map.md`
- Modify: `tests/test_suite_manifest.json` or manifest file updated by script

- [ ] **Step 1: Run the repository-level verification sweep**

Run: `npm run quality:sync`

Run: `npm test`

Run: `npm run test:guardrails`

Run: `npm run lint`

Run: `npm run build`

Run: `npm run deps:map:check`

Run: `npm run smoke:browser`

Expected: all commands pass with generated artifacts current.

- [ ] **Step 2: Inspect the final diff for ownership drift**

Run: `git diff --stat`

Run: `git diff -- game/shared/input game/features/frontdoor game/features/run_session game/features/combat_session`

Expected: the new ownership is concentrated in the planned directories, with legacy files reduced to compatibility or thin adapters.

- [ ] **Step 3: Commit in reviewable batches**

Suggested commit order:

1. `refactor: add shared input foundation`
2. `refactor: introduce frontdoor session ownership`
3. `refactor: introduce combat session ownership`
4. `test: tighten session public surface scope`

Expected: each commit leaves the repository in a passing state.
