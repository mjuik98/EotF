# Title Menu Minimal Copy Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove title-menu subtitle copy, tighten the settings-to-quit transition, and keep the start action as the only prominent shaped CTA.

**Architecture:** Update the title screen markup and CSS in place rather than restructuring feature ownership. Lock the intended UI contract with regression tests and smoke expectations before changing the DOM so the copy removal is deliberate and reversible.

**Tech Stack:** HTML, CSS, Vitest, browser smoke scripts

---

## Chunk 1: Guardrails

### Task 1: Update the UI contract tests first

**Files:**
- Modify: `tests/player_facing_localization_regression.test.js`
- Modify: `scripts/title_meta_smoke_check.mjs`

- [ ] **Step 1: Write the failing assertions**
- [ ] **Step 2: Run the affected tests to verify failure**
- [ ] **Step 3: Keep only the expectations that should survive the new minimal title menu**
- [ ] **Step 4: Re-run the focused tests after implementation**

## Chunk 2: Title Menu UI

### Task 2: Remove subtitle rows and tighten utility spacing

**Files:**
- Modify: `index.html`
- Modify: `css/title_screen.css`

- [ ] **Step 1: Remove subtitle text nodes for start, run rules, codex, settings, and quit**
- [ ] **Step 2: Convert menu buttons to a single-row layout that still preserves icon, label, shortcut, and arrow**
- [ ] **Step 3: Reduce the gap between settings and quit while keeping quit visually secondary**
- [ ] **Step 4: Preserve the primary start-button treatment without promoting quit**

## Chunk 3: Verification

### Task 3: Run focused and full UI checks

**Files:**
- Verify: `tests/player_facing_localization_regression.test.js`
- Verify: `tests/game_boot_ui.test.js`
- Verify: `tests/title_bindings.test.js`

- [ ] **Step 1: Run focused title regression tests**
- [ ] **Step 2: Run title-related behavioral tests**
- [ ] **Step 3: Run `npm run build`**
- [ ] **Step 4: Run `npm run smoke:browser`**
- [ ] **Step 5: Capture a fresh title screen screenshot**
