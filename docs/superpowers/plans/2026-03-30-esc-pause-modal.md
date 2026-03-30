# ESC Pause Modal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the ESC pause modal so action grouping, copy, and visual hierarchy make run continuation and run exit decisions easier to scan.

**Architecture:** Keep the existing pause-menu runtime and modal frame APIs stable. Limit the change to the overlay builder, its CSS hooks, and the focused overlay test so the rest of the help/pause flow remains behavior-preserving.

**Tech Stack:** JavaScript, Vitest, repository CSS in `css/styles.css`

---

## Chunk 1: Pause Menu Contract

### Task 1: Lock in the new menu structure with failing tests

**Files:**
- Modify: `tests/help_pause_ui_pause_menu_overlay.test.js`

- [ ] **Step 1: Write failing assertions for the leave-actions section and revised labels**
- [ ] **Step 2: Run the focused test to verify it fails**
  Run: `npx vitest run tests/help_pause_ui_pause_menu_overlay.test.js`
- [ ] **Step 3: Write the minimal implementation to satisfy the new contract**
- [ ] **Step 4: Re-run the focused test to verify it passes**
  Run: `npx vitest run tests/help_pause_ui_pause_menu_overlay.test.js`

## Chunk 2: Overlay Structure And Styling

### Task 2: Implement the grouped pause layout and revised text

**Files:**
- Modify: `game/features/ui/presentation/browser/help_pause_ui_pause_menu_overlay.js`
- Modify: `game/features/ui/presentation/browser/help_pause_ui_dialog_overlays.js`
- Modify: `css/styles.css`

- [ ] **Step 1: Add the leave-actions container and section label**
- [ ] **Step 2: Update ambiguous button labels to explicit destination-based copy**
- [ ] **Step 3: Add compact styling for the new section and rebalance exit-action emphasis**
- [ ] **Step 4: Re-run the focused overlay test**
  Run: `npx vitest run tests/help_pause_ui_pause_menu_overlay.test.js`

## Chunk 3: Verification

### Task 3: Verify runtime safety for the changed pause surface

**Files:**
- Modify: none

- [ ] **Step 1: Run the focused pause-menu test**
  Run: `npx vitest run tests/help_pause_ui_pause_menu_overlay.test.js`
- [ ] **Step 2: Run the fast suite**
  Run: `npm test`
- [ ] **Step 3: Run the production build**
  Run: `npm run build`
- [ ] **Step 4: Run the browser smoke suite because the UI changed**
  Run: `npm run smoke:browser`
