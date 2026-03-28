# Common Runtime Centralization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize repeated selector, browser-runtime, event-runtime, and save-status formatting logic without changing runtime behavior.

**Architecture:** Reuse existing canonical ownership instead of creating a new catch-all module. State selectors stay canonical in `game/core/store/selectors.js`, browser runtime access stays on shared runtime helpers and UI ports, event-specific dependency helpers collapse into the feature-local platform helper, and save/title retry formatting moves into a focused shared save formatter module.

**Tech Stack:** JavaScript ES modules, Vitest, existing guardrail architecture checks

---

## Chunk 1: Test Coverage For Centralization Targets

### Task 1: Lock shared runtime/browser helper behavior with tests

**Files:**
- Modify: `tests/runtime_deps.test.js`
- Test: `tests/runtime_deps.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `npm test -- tests/runtime_deps.test.js` and verify the new assertion fails for the expected missing/shared behavior**
- [ ] **Step 3: Implement the minimal runtime helper changes**
- [ ] **Step 4: Re-run `npm test -- tests/runtime_deps.test.js` and verify it passes**

### Task 2: Lock selector reuse and save formatting behavior with tests

**Files:**
- Modify: `tests/core_store_public.test.js`
- Modify: `tests/save_status_presenter.test.js`
- Add: `tests/save_status_formatters.test.js`

- [ ] **Step 1: Write failing tests that cover selector consumers and save/title formatter outputs**
- [ ] **Step 2: Run the targeted tests and verify the new assertions fail for the expected reasons**
- [ ] **Step 3: Implement the minimal shared selector/formatter changes**
- [ ] **Step 4: Re-run the targeted tests and verify they pass**

## Chunk 2: Runtime And Feature Refactor

### Task 3: Remove duplicated selectors and browser runtime helpers from consumers

**Files:**
- Modify: `game/features/run/state/run_outcome_state_commands.js`
- Modify: `game/shared/state/player_state_commands.js`
- Modify: `game/shared/state/player_state_legacy_mutations.js`
- Modify: `game/features/event/presentation/browser/event_ui_helpers.js`
- Modify: `game/features/run/presentation/browser/run_mode_ui_helpers.js`
- Modify: `game/features/title/application/ending_action_ports.js`
- Modify: `game/features/combat/platform/combat_turn_runtime_ports.js`
- Modify: `game/platform/browser/notifications/save_status_presenter.js`
- Modify: `game/platform/browser/notifications/save_runtime_notifications.js`

- [ ] **Step 1: Replace local selector/browser helper copies with canonical imports**
- [ ] **Step 2: Keep feature boundaries intact by using shared modules or public ports only**
- [ ] **Step 3: Run targeted tests covering each touched surface**

### Task 4: Introduce focused shared save formatter module and wire title/save consumers to it

**Files:**
- Add: `game/shared/save/save_status_formatters.js`
- Modify: `game/shared/save/public.js`
- Modify: `game/platform/browser/notifications/save_status_presenter.js`
- Modify: `game/features/title/presentation/browser/game_boot_ui_helpers.js`

- [ ] **Step 1: Add the shared formatter module with retry/elapsed/recovery helpers**
- [ ] **Step 2: Switch save-status presenter and title boot helpers to the shared module**
- [ ] **Step 3: Re-run targeted save/title tests**

## Chunk 3: Verification

### Task 5: Run focused regression and guardrail coverage

**Files:**
- Test: `tests/runtime_deps.test.js`
- Test: `tests/core_store_public.test.js`
- Test: `tests/save_status_presenter.test.js`
- Test: `tests/save_status_formatters.test.js`
- Test: `tests/player_state_commands.test.js`
- Test: `tests/refactor_structure_guardrails.test.js`

- [ ] **Step 1: Run focused Vitest targets for touched behavior**
- [ ] **Step 2: Run `npm run test:guardrails` if structural expectations changed**
- [ ] **Step 3: Fix any failures and re-run until green**
