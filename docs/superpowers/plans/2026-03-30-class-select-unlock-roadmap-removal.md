# Class Select Unlock Roadmap Removal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the unlock roadmap block from the class select summary tab so the screen keeps a stable aspect ratio without stripping core class-selection context.

**Architecture:** Keep progression data loading intact and limit the behavior change to the summary-tab presentation layer. Update the existing character-select presentation regression tests first, then delete the unused summary-roadmap markup helper and input wiring once the failing test proves the intended UI contract.

**Tech Stack:** JavaScript, Vitest, existing browser presentation helpers

---

## Chunk 1: Summary Tab Contract

### Task 1: Lock the new UI contract with tests

**Files:**
- Modify: `tests/character_select_info_panel.test.js`
- Test: `tests/character_select_info_panel.test.js`

- [ ] **Step 1: Write the failing test**

Adjust the summary-panel assertions so the render output no longer includes the `해금 로드맵` section title or the unlock roadmap entries that used to appear in that block.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/character_select_info_panel.test.js`
Expected: FAIL because the current summary-tab markup still renders the roadmap block and its entries.

## Chunk 2: Presentation Cleanup

### Task 2: Remove summary unlock-roadmap rendering

**Files:**
- Modify: `game/features/title/platform/browser/character_select_info_panel_sections.js`
- Modify: `game/features/title/platform/browser/character_select_info_panel.js`
- Test: `tests/character_select_info_panel.test.js`

- [ ] **Step 1: Remove the summary unlock-roadmap block**

Delete the summary-section markup for `해금 로드맵` and remove the helper that builds those rows if it becomes unused.

- [ ] **Step 2: Trim now-unused inputs**

Stop passing `unlockRoadmap` into the summary-section builder once the UI no longer renders it, while keeping the higher-level presentation contract stable for the rest of the runtime.

- [ ] **Step 3: Run the focused test**

Run: `npx vitest run tests/character_select_info_panel.test.js`
Expected: PASS

## Chunk 3: Verification

### Task 3: Run relevant regression checks

**Files:**
- Test: `tests/character_select_info_panel.test.js`
- Test: `tests/load_character_select_use_case.test.js`
- Test: `tests/character_select_mount_runtime.test.js`

- [ ] **Step 1: Run targeted verification**

Run: `npx vitest run tests/character_select_info_panel.test.js tests/load_character_select_use_case.test.js tests/character_select_mount_runtime.test.js`
Expected: PASS
