# Architecture Refactor Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce core architectural coupling around save UI, settings persistence, legacy player-state fallback, and one browser-bound run-start runtime seam without destabilizing the live browser game.

**Architecture:** Keep existing public APIs working while introducing clearer canonical ownership. New canonical modules will live under `game/platform/browser/*` or `game/features/*/presentation/browser/*`, and existing call sites will be migrated incrementally with thin compat shims left behind where needed.

**Tech Stack:** JavaScript ES modules, Vitest, Vite, repository guardrail tests

---

## Chunk 1: Save And Settings Boundaries

### Task 1: Separate save-status presentation from save persistence

**Files:**
- Create: `game/shared/save/save_status_presenter.js`
- Modify: `game/shared/save/save_system.js`
- Test: `tests/save_system_outbox.test.js`
- Test: `tests/save_status_presenter.test.js`

- [ ] Write failing tests for injected save-status presentation and standalone presenter behavior
- [ ] Run targeted tests and confirm failure
- [ ] Extract presenter code and delegate from `SaveSystem`
- [ ] Re-run targeted tests until green

### Task 2: Move settings persistence to platform/browser canonical ownership

**Files:**
- Create: `game/platform/browser/settings/settings_manager.js`
- Modify: `game/core/settings_manager.js`
- Modify: `game/features/ui/presentation/browser/settings_ui_runtime.js`
- Modify: `game/features/ui/presentation/browser/settings_ui_helpers.js`
- Modify: `game/features/ui/presentation/browser/settings_ui_keybinding_helpers.js`
- Modify: `game/features/ui/presentation/browser/settings_ui_apply_helpers.js`
- Modify: `game/features/ui/presentation/browser/help_pause_keybinding_helpers.js`
- Modify: `game/platform/browser/bindings/root_bindings.js`
- Modify: `vite.config.js`
- Test: `tests/settings_manager_platform_boundary.test.js`
- Test: existing settings-related tests

- [ ] Write failing structural tests for platform-owned settings manager
- [ ] Run targeted tests and confirm failure
- [ ] Add canonical platform settings module and keep core compat re-export
- [ ] Migrate direct consumers to the canonical path
- [ ] Re-run targeted tests until green

## Chunk 2: Legacy Boundary And Run Runtime Boundary

### Task 3: Remove the player-state legacy import cycle

**Files:**
- Modify: `game/platform/legacy/state/legacy_player_state_command_fallback.js`
- Test: `tests/legacy_player_state_commands.test.js`
- Test: `tests/player_state_legacy_cycle_guard.test.js`

- [ ] Write failing tests for direct dispatch-first fallback behavior and no shared-state import cycle
- [ ] Run targeted tests and confirm failure
- [ ] Refactor fallback module to depend on action types and legacy mutations instead of shared command module
- [ ] Re-run targeted tests until green

### Task 4: Move run-start transition runtime to browser presentation ownership

**Files:**
- Create: `game/features/run/presentation/browser/run_start_transition_runtime.js`
- Modify: `game/features/run/application/run_start_transition_runtime.js`
- Modify: `game/features/run/application/create_run_start_runtime.js`
- Modify: `game/features/run/application/run_start_gameplay_runtime.js`
- Modify: `tests/refactor_structure_guardrails.test.js`
- Test: `tests/run_start_transition_runtime_boundary.test.js`

- [ ] Write failing structural tests for the new canonical presentation-owned runtime path
- [ ] Run targeted tests and confirm failure
- [ ] Move the implementation, leave a compat re-export, and migrate imports
- [ ] Re-run targeted tests until green

## Chunk 3: Verification

### Task 5: Verify targeted and broader regression coverage

**Files:**
- Modify: none if green

- [ ] Run targeted Vitest suites for changed areas
- [ ] Run `npm test`
- [ ] Run `npm run test:guardrails`
- [ ] Run `npm run lint`
- [ ] Report any remaining risk honestly
