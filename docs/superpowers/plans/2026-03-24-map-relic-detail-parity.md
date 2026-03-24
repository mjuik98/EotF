# Map Relic Detail Parity Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the region-select relic hover panel use the same always-expanded detail layout as the combat relic panel, including visible set bonus rows.

**Architecture:** Reuse the existing shared item detail renderer instead of creating a map-only panel. Switch the map relic detail runtime from the `compact` variant to the `combat` variant, then widen the map floating layout so the larger shared panel still places cleanly and falls back inline when space is insufficient.

**Tech Stack:** JavaScript, Vitest, Vite

---

## Chunk 1: Lock the New Region-Select Detail Outcome

### Task 1: Update the map relic detail panel tests first

**Files:**
- Modify: `tests/map_ui_next_nodes_relic_panel.test.js`

- [ ] Step 1: Add a failing expectation in the hover-open test that the region-select detail panel renders at least one set bonus row for a set relic.
- [ ] Step 2: Change the existing width expectation from the compact floating width to the combat-style floating width.
- [ ] Step 3: Add a failing expectation that the set section still shows the localized set name and owned/member rows together with the bonus rows.
- [ ] Step 4: Run `npm test -- tests/map_ui_next_nodes_relic_panel.test.js`.
- [ ] Step 5: Confirm the new expectations fail because the map runtime still uses the compact detail presentation.

### Task 2: Update the map relic layout unit tests first

**Files:**
- Modify: `tests/map_relic_detail_layout.test.js`

- [ ] Step 1: Update the floating width expectation to match the combat-style detail width target.
- [ ] Step 2: If placement math changes, add a failing expectation for the new inline-versus-floating threshold that protects the wider panel.
- [ ] Step 3: Run `npm test -- tests/map_relic_detail_layout.test.js`.
- [ ] Step 4: Confirm the new expectations fail for the current layout constants.

## Chunk 2: Switch the Map Detail Surface to the Combat Presentation

### Task 3: Use the combat variant in the map relic detail runtime

**Files:**
- Modify: `game/features/run/presentation/browser/map_ui_next_nodes_relic_detail_surface.js`
- Modify: `game/features/run/presentation/browser/map_ui_next_nodes_render_panels.js`

- [ ] Step 1: Change the map relic detail surface styling call from `compact` to `combat`.
- [ ] Step 2: Change the managed detail surface variant from `compact` to `combat` so the shared renderer outputs the full combat-style structure.
- [ ] Step 3: Keep the existing hover-safe delay, pin, dismiss, and title-hint behavior unchanged.
- [ ] Step 4: Run `npm test -- tests/map_ui_next_nodes_relic_panel.test.js`.
- [ ] Step 5: Confirm the focused map relic panel test now passes or isolate any remaining failure to layout math only.

### Task 4: Widen floating placement for the larger panel

**Files:**
- Modify: `game/features/run/presentation/browser/map_relic_detail_layout.js`
- Test: `tests/map_relic_detail_layout.test.js`
- Test: `tests/map_ui_next_nodes_relic_panel.test.js`

- [ ] Step 1: Increase the floating detail width constant so it can comfortably hold the combat-style panel.
- [ ] Step 2: Re-check the floating-left placement rule so it only activates when the wider panel actually fits on the left side.
- [ ] Step 3: Preserve the existing inline fallback and top clamping behavior.
- [ ] Step 4: Run `npm test -- tests/map_relic_detail_layout.test.js tests/map_ui_next_nodes_relic_panel.test.js`.
- [ ] Step 5: Confirm both focused test files pass.

## Chunk 3: Regression Verification

### Task 5: Re-run shared item detail coverage

**Files:**
- No code changes

- [ ] Step 1: Run `npm test -- tests/item_detail_panel_ui.test.js tests/item_detail_surface_ui.test.js`.
- [ ] Step 2: Confirm the shared renderer still passes with both compact and combat variants.

### Task 6: Run repository-required verification for this UI change

**Files:**
- No code changes

- [ ] Step 1: Run `npm run build`.
- [ ] Step 2: Run `npm run smoke:character-select`.
- [ ] Step 3: If map relic behavior touches wider runtime assumptions, run `npm test`.
- [ ] Step 4: Review the output for zero test failures, successful build completion, and smoke output with no reported errors.
