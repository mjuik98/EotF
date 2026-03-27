# Progression Roadmap, History, And Save Recovery Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the next unlock roadmap, preserve recent progression summaries for browsing, and make save recovery status visible to the player.

**Architecture:** Add small query helpers inside meta progression, store lightweight recent class summaries alongside the existing replay queue, and reuse current run settings, character info, and save status presenter surfaces rather than creating a new standalone screen.

**Tech Stack:** JavaScript, Vitest, Vite browser UI modules

---

## Chunk 1: Roadmap Queries

### Task 1: Add failing tests for unlock roadmap view models

**Files:**
- Create or modify: `tests/unlock_roadmap_queries.test.js`
- Modify: `tests/run_mode_ui_render_sections.test.js`
- Modify: `tests/character_select_info_panel.test.js`

- [ ] **Step 1: Write failing tests for account/class roadmap query output**
- [ ] **Step 2: Write failing render assertions for run settings and character info**
- [ ] **Step 3: Run the targeted tests and verify they fail**

### Task 2: Implement roadmap queries and renderers

**Files:**
- Create: `game/features/meta_progression/domain/unlock_roadmap_queries.js`
- Modify: `game/features/meta_progression/public.js`
- Modify: `game/features/run/presentation/browser/run_mode_ui_summary_render.js`
- Modify: `game/features/run/presentation/browser/run_mode_ui_render.js`
- Modify: `game/features/title/application/load_character_select_use_case.js`
- Modify: `game/features/title/platform/browser/character_select_info_panel.js`
- Modify: `game/features/title/platform/browser/character_select_info_panel_sections.js`

- [ ] **Step 1: Build small roadmap query helpers from achievements + unlockables**
- [ ] **Step 2: Render account roadmap in run settings**
- [ ] **Step 3: Render account/class roadmap in character info**
- [ ] **Step 4: Re-run targeted roadmap tests**

## Chunk 2: Progression History

### Task 3: Add failing tests for recent summary persistence

**Files:**
- Modify: `tests/class_progression_system.test.js`
- Modify: `tests/character_select_info_panel.test.js`

- [ ] **Step 1: Write failing tests for recent summary storage and display**
- [ ] **Step 2: Run the targeted tests and verify they fail**

### Task 4: Implement recent summary history

**Files:**
- Modify: `game/features/title/domain/class_progression/meta_persistence.js`
- Modify: `game/features/title/domain/class_progression/class_progression_awards.js`
- Modify: `game/features/title/application/load_character_select_use_case.js`
- Modify: `game/features/title/platform/browser/character_select_info_panel.js`
- Modify: `game/features/title/platform/browser/character_select_info_panel_sections.js`

- [ ] **Step 1: Persist capped recent summaries alongside pending queue**
- [ ] **Step 2: Pass history data into character info presentation**
- [ ] **Step 3: Render recent run history and pending count**
- [ ] **Step 4: Re-run targeted progression history tests**

## Chunk 3: Save Recovery Visibility

### Task 5: Add failing tests for enriched save recovery messaging

**Files:**
- Modify: `tests/save_status_presenter.test.js`
- Modify: `tests/save_system_outbox.test.js`

- [ ] **Step 1: Write failing tests for queue depth and retry timing**
- [ ] **Step 2: Run the targeted tests and verify they fail**

### Task 6: Implement enriched save recovery status

**Files:**
- Modify: `game/shared/save/save_status_presenter.js`
- Modify: `game/shared/save/save_system.js`

- [ ] **Step 1: Enrich save status payloads with outbox metrics**
- [ ] **Step 2: Render concise queue/retry recovery copy**
- [ ] **Step 3: Re-run targeted save status tests**

## Chunk 4: Verification

### Task 7: Full verification

**Files:**
- No code changes expected unless regressions appear

- [ ] **Step 1: Run targeted Vitest suites touched by the batch**
- [ ] **Step 2: Run `npm test`**
- [ ] **Step 3: Run `npm run lint`**
- [ ] **Step 4: Run `npm run build`**
- [ ] **Step 5: Run `npm run smoke:browser`**
