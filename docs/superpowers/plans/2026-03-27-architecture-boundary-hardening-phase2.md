# Architecture Boundary Hardening Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the highest-value remaining boundary leaks after phase 1 without destabilizing runtime behavior.

**Architecture:** Keep the modular-monolith layout, but continue pulling feature logic out of `shared` reverse imports and stop application-layer modules from directly owning browser/global logging behavior. Prefer narrow ports and pure shared helpers over broad feature barrels.

**Tech Stack:** Vanilla JS, Vitest, Vite, browser smoke scripts

---

### Task 1: Shared Player Rule Decoupling

**Files:**
- Create: `game/shared/player/player_resource_rule_support.js`
- Modify: `game/shared/player/player_resource_use_cases.js`
- Test: `tests/player_resource_use_cases.test.js`

- [ ] Replace `features/run` imports in shared player resource methods with shared rule helpers.
- [ ] Preserve heal scaling and active-region behavior.
- [ ] Run targeted player resource tests.

### Task 2: Application Logging and Boundary Cleanup

**Files:**
- Modify: `game/features/title/application/character_select_actions.js`
- Modify: `game/features/run/application/run_rule_outcome.js`
- Modify: `game/features/event/application/workflows/event_choice_flow_error_handler.js`
- Modify: `game/features/run/application/create_run_start_runtime.js`
- Modify: `game/features/combat/application/start_combat_flow_use_case.js`
- Modify: `game/features/run/application/create_map_navigation_runtime.js`
- Modify: `game/features/combat/application/end_player_turn_use_case.js`
- Test: `tests/architecture_refactor_guardrails.test.js`

- [ ] Replace direct `console.*` use with logger/error-reporter style handling.
- [ ] Replace direct presentation imports in application where a port already exists.
- [ ] Run targeted tests and guardrails.

### Task 3: Shared Runtime/Platform Cleanup

**Files:**
- Modify: `game/shared/save/save_repository.js`
- Modify: `game/shared/player/player_ui_effects.js`
- Test: `tests/save_repository.test.js`
- Test: `tests/player_runtime_effects.test.js`

- [ ] Remove unnecessary browser-global fallback helpers from shared modules where dependency injection already exists.
- [ ] Keep behavior stable under current tests and browser smoke flows.

### Task 4: Full Verification

**Files:**
- Modify: `tests/refactor_structure_guardrails.test.js`
- Modify: `tests/architecture_refactor_guardrails.test.js`

- [ ] Run `npm test`
- [ ] Run `npm run test:guardrails`
- [ ] Run `npm run build`
- [ ] Run `npm run smoke:browser`
