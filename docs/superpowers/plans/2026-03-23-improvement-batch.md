# Improvement Batch Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the current architectural lint failure, split a large title browser panel into smaller focused modules, replace a brittle structure-only guardrail with behavioral coverage, and add a default browser smoke check to the local quality pipeline.

**Architecture:** Keep canonical ownership under `game/features/*` and `game/platform/*`, preserve existing compat entrypoints, and refactor by extraction rather than relocation. New browser helpers stay close to the title feature, direct global timer access is replaced with injected runtime deps, and quality changes reuse existing smoke scripts instead of adding a second browser harness.

**Tech Stack:** JavaScript ESM, Vitest, Playwright smoke scripts, Vite build pipeline

---

## Chunk 1: Run Panel Timer Boundary

### Task 1: Remove direct global timer access from map next-nodes panels

**Files:**
- Modify: `game/features/run/presentation/browser/map_ui_next_nodes_render_panels.js`
- Test: `tests/item_detail_surface_contract_usage.test.js`

- [ ] Add a failing test that asserts the map next-nodes panel does not reference `globalThis.setTimeout` or `globalThis.clearTimeout`.
- [ ] Run `npm test -- tests/item_detail_surface_contract_usage.test.js` and confirm the new assertion fails for the expected file.
- [ ] Update the panel runtime to resolve timers from injected deps or browser handles without falling back to direct `globalThis.*`.
- [ ] Re-run `npm test -- tests/item_detail_surface_contract_usage.test.js` and confirm it passes.

## Chunk 2: Character Select Info Panel Split

### Task 2: Extract panel markup helpers from the title info panel

**Files:**
- Create: `game/features/title/platform/browser/character_select_info_panel_markup.js`
- Modify: `game/features/title/platform/browser/character_select_info_panel.js`
- Test: `tests/character_select_info_panel.test.js`

- [ ] Add a failing test that imports the extracted markup module and covers the roadmap/play-style/featured-card helper behavior currently embedded in the large panel file.
- [ ] Run `npm test -- tests/character_select_info_panel.test.js` and confirm the new test fails because the module does not exist yet.
- [ ] Move pure markup/data helpers into the new module and wire the main panel to import them without changing rendered output.
- [ ] Re-run `npm test -- tests/character_select_info_panel.test.js` and confirm it passes.

### Task 3: Extract panel interaction wiring from the title info panel

**Files:**
- Create: `game/features/title/platform/browser/character_select_info_panel_interactions.js`
- Modify: `game/features/title/platform/browser/character_select_info_panel.js`
- Test: `tests/character_select_info_panel.test.js`

- [ ] Add a failing test that exercises extracted interaction helpers for tab activation and loadout save-state transitions.
- [ ] Run `npm test -- tests/character_select_info_panel.test.js` and confirm the new test fails for the expected missing export or behavior.
- [ ] Move interaction/event binding logic into a focused module while keeping `renderCharacterInfoPanel` as the public entrypoint.
- [ ] Re-run `npm test -- tests/character_select_info_panel.test.js` and confirm it passes.

## Chunk 3: Guardrail Strategy Cleanup

### Task 4: Replace a brittle file-structure test with behavioral ownership coverage

**Files:**
- Modify: `tests/character_select_runtime_file_structure.test.js`
- Modify: `tests/character_select_ui_facade.test.js`

- [ ] Add a failing behavioral assertion that proves the title runtime delegates through the canonical title runtime surface rather than asserting specific helper import paths.
- [ ] Run `npm test -- tests/character_select_runtime_file_structure.test.js tests/character_select_ui_facade.test.js` and confirm the new assertion fails first.
- [ ] Rewrite the brittle structure-only test into a capability/delegation test that survives internal helper extraction.
- [ ] Re-run `npm test -- tests/character_select_runtime_file_structure.test.js tests/character_select_ui_facade.test.js` and confirm both pass.

## Chunk 4: Quality Pipeline Smoke

### Task 5: Add a default character-select smoke step to the local quality command

**Files:**
- Modify: `package.json`
- Create: `scripts/run_character_select_smoke.mjs`
- Modify: `tests/combat_ui_smoke_scripts.test.js`

- [ ] Add a failing test that expects a reusable `smoke:character-select` script and expects the local `quality` script to run it before build.
- [ ] Run `npm test -- tests/combat_ui_smoke_scripts.test.js` and confirm the new assertions fail.
- [ ] Add the wrapper script and update `package.json` so the local quality flow runs the character select smoke and existing build/test steps.
- [ ] Re-run `npm test -- tests/combat_ui_smoke_scripts.test.js` and confirm it passes.

## Chunk 5: Batch Verification

### Task 6: Verify the batch end to end

**Files:**
- Verify only

- [ ] Run focused tests for each touched area.
- [ ] Run `npm run lint` and confirm the direct global access violation is gone.
- [ ] Run `npm test` and confirm the full suite passes.
- [ ] Run `npm run build`.
- [ ] Run `npm run quality`.
