# Combat UI And Echo Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the combat echo-skill kill flow, align stage relic details with the combat relic detail panel pattern, restore missing hover rarity styling on cloned hand cards, and move the recent combat feed away from the crowded center-bottom area.

**Architecture:** Keep the existing combat/state architecture intact and make narrow changes in the presentation and runtime layers only. Use regression tests to pin each bug or UI contract before touching production code, then implement the smallest behavior-preserving fix per area.

**Tech Stack:** JavaScript, Vitest, Playwright smoke script, Vite, repository CSS in `css/styles.css`

---

### Task 1: Lock The Regressions With Tests

**Files:**
- Modify: `tests/damage_system_facade.test.js`
- Modify: `tests/map_ui_next_nodes_relic_panel.test.js`
- Modify: `tests/combat_relic_rail_ui.test.js`

- [ ] **Step 1: Write a failing runtime-area damage regression test**
- [ ] **Step 2: Write a failing stage relic panel test asserting list rows no longer duplicate effect text**
- [ ] **Step 3: Write a failing CSS contract test for clone rarity tag styling and recent feed placement**
- [ ] **Step 4: Run the focused tests and confirm they fail for the expected reasons**

### Task 2: Fix Echo Skill Multi-Kill Flow

**Files:**
- Modify: `game/features/combat/application/damage_system_facade.js`
- Test: `tests/damage_system_facade.test.js`

- [ ] **Step 1: Replace the indirect `this.dealDamage(...)` dependency in `dealDamageAll` with the facade’s own bound runtime path**
- [ ] **Step 2: Re-run the focused damage-system test and confirm it passes**

### Task 3: Unify Stage Relic Detail Behavior

**Files:**
- Modify: `game/features/run/presentation/browser/map_ui_next_nodes_render_panels.js`
- Test: `tests/map_ui_next_nodes_relic_panel.test.js`

- [ ] **Step 1: Remove duplicated inline relic summary text from stage list rows**
- [ ] **Step 2: Keep hover/focus/click-driven detail panel behavior intact**
- [ ] **Step 3: Re-run the focused stage relic test and confirm it passes**

### Task 4: Restore Clone Hover Rarity Styling And Reposition Recent Feed

**Files:**
- Modify: `css/styles.css`
- Test: `tests/combat_relic_rail_ui.test.js`

- [ ] **Step 1: Add clone-specific rarity tag color selectors that mirror hand card rarity styling**
- [ ] **Step 2: Move the recent combat feed to a right-side fixed region that avoids the relic rail**
- [ ] **Step 3: Re-run the focused CSS contract test and confirm it passes**

### Task 5: Verify End To End

**Files:**
- Modify: none

- [ ] **Step 1: Run the focused Vitest suite for touched behavior**
- [ ] **Step 2: Run `npm run build` because the changes are user-visible browser UI/runtime work**
- [ ] **Step 3: Run the combat smoke script against the local Vite server**
- [ ] **Step 4: Report results with exact commands and outcomes**
