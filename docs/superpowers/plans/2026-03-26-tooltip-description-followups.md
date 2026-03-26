# Tooltip And Description Follow-Ups Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract shared tooltip trigger behavior, harden description-rendering contracts, and remove the current chunk-cycle warning source without regressing build budgets.

**Architecture:** Introduce a shared browser-safe tooltip trigger helper under `game/shared/ui/`, migrate repeated hover/focus bindings onto it, and codify rendering/chunk boundaries with source guardrail tests. Keep bundling changes narrow by explicitly routing the shared progression set-bonus modules into a dedicated shared chunk rather than broad refactors.

**Tech Stack:** JavaScript, Vite/Rollup manual chunking, Vitest

---

## Chunk 1: Tooltip Trigger Helper

### Task 1: Add failing helper/usage tests

**Files:**
- Create: `tests/tooltip_trigger_bindings.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**

### Task 2: Migrate repeated tooltip trigger surfaces

**Files:**
- Create: `game/shared/ui/tooltip/tooltip_trigger_bindings.js`
- Modify: `game/features/combat/presentation/browser/status_effects_ui.js`
- Modify: `game/features/combat/presentation/browser/combat_enemy_status_badges_ui.js`
- Modify: `game/features/combat/presentation/browser/class_trait_panel_ui.js`
- Modify: `game/features/combat/presentation/browser/hud_panel_sections.js`
- Modify: `game/features/reward/presentation/browser/reward_ui_option_renderers.js`
- Modify: `game/features/title/platform/browser/character_select_info_panel_interactions.js`

- [ ] **Step 1: Add failing source usage expectations**
- [ ] **Step 2: Run targeted tests and confirm failure**
- [ ] **Step 3: Implement helper and migrate surfaces**
- [ ] **Step 4: Re-run targeted tests**

## Chunk 2: Description Surface Contracts

### Task 3: Add failing source guardrails for highlighted/safe description rendering

**Files:**
- Create: `tests/text_surface_render_contracts.test.js`

- [ ] **Step 1: Write the failing source contract test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Align any remaining surfaces to the contract**
- [ ] **Step 4: Run the contract test and nearby regressions**

## Chunk 3: Chunk Warning Cleanup

### Task 4: Add failing manual chunk guardrail for shared set-bonus modules

**Files:**
- Modify: `tests/vite_chunking_guardrails.test.js`
- Modify: `vite.config.js`

- [ ] **Step 1: Add failing guardrail expectations for shared set-bonus chunk routing**
- [ ] **Step 2: Run the guardrail test to confirm failure**
- [ ] **Step 3: Update manual chunk logic with a dedicated shared progression chunk**
- [ ] **Step 4: Run build and confirm warning reduction plus budget pass**

## Chunk 4: Verification

### Task 5: Full verification

**Files:**
- Modify: `config/quality/test_suite_manifest.json` (only if manifest changed)

- [ ] **Step 1: Run focused tests for helper, contracts, and chunking**
- [ ] **Step 2: Run `npm test`**
- [ ] **Step 3: Run `npm run test:manifest`**
- [ ] **Step 4: Run `npm run smoke:character-select`**
- [ ] **Step 5: Run `npm run build`**
