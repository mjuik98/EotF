# Title Meta And Recap Followups Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose the next achievement targets, enrich save-slot and preset summaries, strengthen ending recap copy, and surface deeper codex record context without changing save/runtime ownership.

**Architecture:** Reuse existing meta progression, recent-run, save preview, ending payload, and codex record data. Keep the work presentation-focused: add one small query helper in meta progression, then layer richer summaries onto title, run, ending, and codex surfaces without introducing new persistence formats.

**Tech Stack:** JavaScript, Vitest, Vite browser UI modules

---

## Chunk 1: Progression Queries And Title Surfaces

### Task 1: Lock achievement-roadmap and title-save UX with tests

**Files:**
- Modify: `tests/content_unlock_queries.test.js`
- Modify: `tests/title_save_slot_controls.test.js`
- Modify: `tests/game_boot_ui.test.js`

- [ ] **Step 1: Write failing tests for achievement roadmap output**
- [ ] **Step 2: Write failing tests for richer save-slot/archive rendering**
- [ ] **Step 3: Run targeted tests and confirm they fail**

### Task 2: Implement the query and title rendering changes

**Files:**
- Create: `game/features/meta_progression/domain/achievement_roadmap_queries.js`
- Modify: `game/features/meta_progression/public.js`
- Modify: `game/features/title/presentation/browser/game_boot_ui_helpers.js`

- [ ] **Step 1: Add a small roadmap helper for near-term achievement targets**
- [ ] **Step 2: Render the roadmap under the title archive using existing meta**
- [ ] **Step 3: Enrich save-slot buttons with preview metadata and queued state**
- [ ] **Step 4: Re-run targeted title/meta tests**

## Chunk 2: Run, Ending, And Codex Recap

### Task 3: Lock recap/detail polish with tests

**Files:**
- Modify: `tests/run_mode_ui_render_sections.test.js`
- Modify: `tests/ending_screen_helpers.test.js`
- Modify: `tests/ending_screen_render_helpers.test.js`
- Modify: `tests/codex_ui_popup_payloads.test.js`
- Modify: `tests/codex_ui_popup.test.js`

- [ ] **Step 1: Write failing tests for preset summary state copy**
- [ ] **Step 2: Write failing tests for ending progression recap pills**
- [ ] **Step 3: Write failing tests for richer codex popup record details**
- [ ] **Step 4: Run targeted tests and confirm they fail**

### Task 4: Implement the recap/detail polish

**Files:**
- Modify: `game/features/run/presentation/browser/run_mode_ui_helpers.js`
- Modify: `game/features/run/presentation/browser/run_mode_ui_presets_render.js`
- Modify: `game/features/ui/presentation/browser/ending_screen_helpers.js`
- Modify: `game/features/ui/presentation/browser/ending_screen_render_helpers.js`
- Modify: `game/features/codex/presentation/browser/codex_ui_popup_blocks.js`

- [ ] **Step 1: Add preset comparison/status helpers and render the richer inline summary**
- [ ] **Step 2: Add ending progression recap data and render it only when present**
- [ ] **Step 3: Extend codex record blocks with upgrade/ratio details already tracked in records**
- [ ] **Step 4: Re-run targeted recap/detail tests**

## Chunk 3: Verification

### Task 5: Full verification

**Files:**
- No code changes expected unless regressions appear

- [ ] **Step 1: Run the touched targeted Vitest files**
- [ ] **Step 2: Run `npm test`**
- [ ] **Step 3: Run `npm run test:guardrails`**
- [ ] **Step 4: Run `npm run lint`**
- [ ] **Step 5: Run `npm run build`**
- [ ] **Step 6: Run `npm run smoke:browser`**
