# Structure Follow-Up Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete test-only systems wrappers, formalize the remaining `ui/app` thin-wrapper surface, and remove UI rendering responsibility from the class domain facade.

**Architecture:** Move tests to canonical owners first, then delete wrapper files. Keep feature wrapper config aligned with actual code and narrow the class domain facade to behavior plus view-model generation only.

**Tech Stack:** JavaScript, Vitest, repository guardrail scripts

---

### Task 1: Lock Follow-Up Cleanup With Failing Tests

**Files:**
- Modify: `tests/system_compat_reexports.test.js`
- Modify: `tests/feature_structure_guardrails.test.js`
- Modify: `tests/class_mechanics.test.js`
- Modify: `tests/class_progression_system.test.js`
- Modify: `tests/class_progression_bonuses.test.js`
- Modify: `tests/codex_records_system.test.js`
- Modify: `tests/game_state_core_methods.test.js`
- Modify: `tests/save_system_outbox.test.js`
- Modify: `tests/shared_save_public.test.js`
- Modify: `tests/thematic_relics.test.js`

- [ ] Step 1: Update tests to expect deleted systems wrappers and the absence of `getSpecialUI` on `ClassMechanics`.
- [ ] Step 2: Run the focused tests and confirm they fail for the expected reasons.

### Task 2: Delete Test-Only Systems Wrappers

**Files:**
- Delete: `game/systems/class_progression_system.js`
- Delete: `game/systems/codex_records_system.js`
- Delete: `game/systems/item_system.js`
- Delete: `game/systems/inscription_system.js`
- Delete: `game/systems/set_bonus_system.js`
- Delete: `game/systems/save_system.js`
- Delete: `game/systems/save_migrations.js`
- Delete: `game/systems/save/save_outbox_metrics.js`
- Delete: `game/systems/save/save_outbox_queue.js`
- Delete: `game/systems/save/save_repository.js`

- [ ] Step 1: Remove the wrappers once all tests use canonical imports.
- [ ] Step 2: Re-run the focused wrapper tests and confirm green.

### Task 3: Formalize `ui/app` Thin Wrappers

**Files:**
- Modify: `config/quality/feature_structure_targets.json`
- Modify: `tests/feature_structure_guardrails.test.js`

- [ ] Step 1: Add `ui/app` to configured thin-wrapper directories.
- [ ] Step 2: Verify the guardrails still pass with recursive thin-wrapper scanning.

### Task 4: Narrow Class Domain Responsibilities

**Files:**
- Modify: `game/domain/class/class_mechanics.js`
- Test: `tests/class_mechanics.test.js`

- [ ] Step 1: Remove the domain-level `getSpecialUI` renderer path from `ClassMechanics`.
- [ ] Step 2: Run the class mechanics tests to confirm behavior and view-model support still pass.

### Task 5: Verify

**Files:**
- No code changes

- [ ] Step 1: Run the focused Vitest files for this batch.
- [ ] Step 2: Run `npm run lint`.
- [ ] Step 3: Run `npm run test:full`.
- [ ] Step 4: Run `npm run audit:structure`.
- [ ] Step 5: Run `npm run audit:transition-surfaces`.
