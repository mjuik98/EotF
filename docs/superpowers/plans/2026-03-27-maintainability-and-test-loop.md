# Maintainability And Test Loop Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce local verification cost and split several oversized runtime modules into smaller, behavior-preserving units.

**Architecture:** Keep behavior stable while moving repo-wide quality checks out of the fast loop and extracting focused helpers from `SaveSystem`, `DescriptionUtils`, and the combat damage facade. Prefer small internal modules plus regression tests over broad rewrites so the existing feature/public boundaries remain intact.

**Tech Stack:** JavaScript, Node.js scripts, Vitest

---

## Chunk 1: Fast Suite Slimming

### Task 1: Reclassify repo-wide guardrail tests out of the fast suite

**Files:**
- Modify: `config/quality/test_suite_manifest.json`
- Modify: `tests/quality_workflow_scripts.test.js`
- Modify: `tests/test_suite_manifest.test.js`
- Modify: `README.md`

- [ ] Step 1: Write failing tests that encode the new suite ownership for repository-wide quality tests.
- [ ] Step 2: Run the focused manifest/workflow tests and confirm they fail for the expected reason.
- [ ] Step 3: Update the manifest and docs so repo-wide quality checks live in `guardrails` instead of `fast`.
- [ ] Step 4: Re-run the focused tests and the slow-report command to verify the fast loop gets lighter without losing coverage.

## Chunk 2: Save System Decomposition

### Task 2: Extract SaveSystem outbox/read helpers behind focused modules

**Files:**
- Create: `game/shared/save/save_outbox_state.js`
- Create: `game/shared/save/save_readers.js`
- Modify: `game/shared/save/save_system.js`
- Modify: `tests/save_system_outbox.test.js`
- Modify: `tests/shared_save_public.test.js`

- [ ] Step 1: Add failing tests for any new module-level seams or preserved SaveSystem behavior that the extraction must keep.
- [ ] Step 2: Run the targeted save-system tests and confirm the new assertions fail before implementation.
- [ ] Step 3: Move outbox snapshot normalization/persistence and save preview reading into focused helpers while preserving the public `SaveSystem` surface.
- [ ] Step 4: Re-run the targeted save tests and confirm behavior matches the pre-refactor contract.

## Chunk 3: Description Highlight Pipeline

### Task 3: Replace the monolithic highlight routine with declarative rule helpers

**Files:**
- Create: `game/utils/description_highlight_rules.js`
- Create: `game/utils/description_highlight_runtime.js`
- Modify: `game/utils/description_utils.js`
- Modify: `tests/description_utils_highlight.test.js`

- [ ] Step 1: Add failing regression tests for ordering-sensitive highlight cases and placeholder safety.
- [ ] Step 2: Run the focused description tests and confirm they fail for the expected reason.
- [ ] Step 3: Extract the rule table/runtime helpers and make `DescriptionUtils.highlight` a thin orchestrator over the same output behavior.
- [ ] Step 4: Re-run the focused description tests and confirm the refactor stays green.

## Chunk 4: Damage Facade Decomposition

### Task 4: Split combat damage logging/effect handling out of the facade body

**Files:**
- Create: `game/features/combat/application/damage_system_effects.js`
- Create: `game/features/combat/application/damage_system_logging.js`
- Modify: `game/features/combat/application/damage_system_facade.js`
- Modify: `tests/damage_system_facade.test.js`
- Modify: `tests/play_card_service.test.js`

- [ ] Step 1: Add failing regression tests around damage logging/effect ordering that the extracted helpers must preserve.
- [ ] Step 2: Run the focused combat tests and confirm the new assertions fail before implementation.
- [ ] Step 3: Extract logging and side-effect helpers so the facade keeps orchestration and return values only.
- [ ] Step 4: Re-run the focused combat tests and confirm behavior and call ordering still match expectations.

## Chunk 5: Final Verification

### Task 5: Prove the full change set with fresh evidence

**Files:**
- Verify only

- [ ] Step 1: Run the focused tests for each touched area.
- [ ] Step 2: Run `npm test`.
- [ ] Step 3: Run `npm run lint`.
- [ ] Step 4: Run `npm run test:slow-report`.
- [ ] Step 5: Report actual results plus any remaining assumptions or residual risk.
