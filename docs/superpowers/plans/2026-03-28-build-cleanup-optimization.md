# Build Cleanup Optimization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove clearly stale or dummy runtime patterns and reduce build coupling by isolating shared deps-factory chunking from combat/overlay presentation chunks.

**Architecture:** Keep changes narrow and behavior-preserving. Treat Vite manual chunking as the primary build-performance lever, and remove the character-select tooltip's mock game-state dependency by threading real state through the existing binding path.

**Tech Stack:** Vite, Vitest, browser runtime JavaScript

---

### Task 1: Guardrail the chunk split

**Files:**
- Modify: `vite.config.js`
- Modify: `tests/vite_chunking_guardrails.test.js`

- [ ] **Step 1: Write the failing test**

Add expectations that deps-factory/core contract builder files resolve to a dedicated shared chunk.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/vite_chunking_guardrails.test.js`

- [ ] **Step 3: Write minimal implementation**

Route deps-factory/core deps contract files to a dedicated manual chunk and exclude that chunk from eager HTML preloads.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/vite_chunking_guardrails.test.js`

### Task 2: Remove tooltip dummy state

**Files:**
- Modify: `game/features/title/platform/browser/character_select_info_panel_tooltips.js`
- Modify: `game/features/title/platform/browser/character_select_info_panel_interactions.js`
- Modify: `game/features/title/platform/browser/character_select_info_panel.js`
- Modify: `tests/character_select_info_panel_helpers.test.js`

- [ ] **Step 1: Write the failing test**

Add an assertion that deck-card tooltip bindings forward the real `gs` object when available.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/character_select_info_panel_helpers.test.js`

- [ ] **Step 3: Write minimal implementation**

Thread `gs` through the panel interaction layer and pass it to the tooltip API instead of a local mock object.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/character_select_info_panel_helpers.test.js`

### Task 3: Verify build impact

**Files:**
- Verify only

- [ ] **Step 1: Run targeted guardrails**

Run: `npm test -- tests/vite_chunking_guardrails.test.js tests/character_select_info_panel_helpers.test.js`

- [ ] **Step 2: Run build**

Run: `npm run build`

- [ ] **Step 3: Run fast suite if touched behavior warrants it**

Run: `npm test`
