# Run Preset And Ending Progression UX Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose preset management actions in the run-settings UI and surface newly earned achievements on the ending screen.

**Architecture:** Keep runtime ownership inside the existing feature roots. Extend run preset rendering/bindings to reveal already-supported runtime actions, and enrich ending payload/rendering with achievement metadata sourced from meta progression definitions.

**Tech Stack:** JavaScript, Vitest, Vite browser UI modules

---

## Chunk 1: Run Preset UX

### Task 1: Lock the desired preset UI with tests

**Files:**
- Modify: `tests/run_mode_ui_render_sections.test.js`
- Modify: `tests/run_mode_ui_runtime.test.js`
- Modify: `tests/run_mode_ui.test.js`

- [ ] **Step 1: Write failing tests for filled-slot actions and dialog copy**
- [ ] **Step 2: Run targeted tests and confirm they fail for missing UI/behavior**
- [ ] **Step 3: Implement minimal rendering/runtime changes**
- [ ] **Step 4: Re-run targeted tests and confirm they pass**

### Task 2: Implement preset management rendering and handlers

**Files:**
- Modify: `game/features/run/presentation/browser/run_mode_ui_presets_render.js`
- Modify: `game/features/run/presentation/browser/run_mode_ui_runtime.js`
- Modify: `game/features/run/presentation/browser/run_mode_ui_bindings.js`

- [ ] **Step 1: Add explicit filled-slot actions (`load`, `delete`) and clearer helper copy**
- [ ] **Step 2: Keep the selected-slot summary aligned with existing runtime state**
- [ ] **Step 3: Preserve current save dialog flow while improving overwrite context**
- [ ] **Step 4: Run targeted tests for run preset UI/runtime**

## Chunk 2: Ending Progression Visibility

### Task 3: Lock achievement payload/rendering with tests

**Files:**
- Modify: `tests/ending_screen_helpers.test.js`
- Modify: `tests/ending_screen_render_helpers.test.js`
- Modify: `tests/achievement_definitions.test.js`

- [ ] **Step 1: Write failing tests for achievement presentation metadata**
- [ ] **Step 2: Write failing tests for ending payload and rendering**
- [ ] **Step 3: Run targeted tests and confirm they fail**
- [ ] **Step 4: Implement minimal code to pass**

### Task 4: Implement ending achievement summaries

**Files:**
- Modify: `game/features/meta_progression/domain/achievement_definitions.js`
- Modify: `game/features/meta_progression/public.js`
- Modify: `game/features/ui/presentation/browser/ending_screen_helpers.js`
- Modify: `game/features/ui/presentation/browser/ending_screen_render_helpers.js`

- [ ] **Step 1: Add stable player-facing achievement metadata**
- [ ] **Step 2: Map run-outcome achievement ids into ending payload cards**
- [ ] **Step 3: Render the achievement section only when present**
- [ ] **Step 4: Re-run targeted ending/meta progression tests**

## Chunk 3: Verification

### Task 5: Full verification

**Files:**
- No code changes expected unless regressions appear

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run smoke:browser` for a browser sanity check**
- [ ] **Step 4: Fix any regressions and re-run affected checks**
