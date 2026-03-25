# UI Text Surfaces Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align card/description/tooltip text rendering so equivalent text surfaces share the same highlight contract, palette, and focus-accessible tooltip behavior.

**Architecture:** First, make `DescriptionUtils.highlight` the canonical safe-highlighting path by escaping arbitrary markup and preserving only repository-owned formatting output. Then reconnect inconsistent UI surfaces to that path and normalize focus/hover tooltip wiring where the same content currently diverges by surface.

**Tech Stack:** JavaScript, Vitest, repository CSS in `css/styles.css` and `css/character_select_layout.css`

---

## Chunk 1: Highlight Contract

### Task 1: Lock in failing tests for safe highlighting

**Files:**
- Modify: `tests/description_utils_highlight.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run tests/description_utils_highlight.test.js`
- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run tests/description_utils_highlight.test.js`

### Task 2: Implement safe highlight contract and plain-text region copy

**Files:**
- Modify: `game/utils/description_utils.js`
- Modify: `data/regions.js`

- [ ] **Step 1: Escape arbitrary HTML before keyword transforms while preserving newline rendering**
- [ ] **Step 2: Add plain-text region rule markers that no longer depend on inline HTML**
- [ ] **Step 3: Re-run the focused highlight test**
  Run: `npx vitest run tests/description_utils_highlight.test.js`

## Chunk 2: Surface Parity

### Task 3: Lock in failing tests for event/reward/map/tooltip parity

**Files:**
- Modify: `tests/event_ui_card_discard.test.js`
- Modify: `tests/reward_ui_option_renderers.test.js`
- Modify: `tests/tooltip_general_ui.test.js`
- Modify: `tests/map_ui_next_nodes_render.test.js`

- [ ] **Step 1: Add failing assertions for shared highlight usage and safe tooltip rendering**
- [ ] **Step 2: Run the targeted tests to verify they fail**
  Run: `npx vitest run tests/event_ui_card_discard.test.js tests/reward_ui_option_renderers.test.js tests/tooltip_general_ui.test.js tests/map_ui_next_nodes_render.test.js`

### Task 4: Implement event/reward/map/general-tooltip fixes

**Files:**
- Modify: `game/features/event/presentation/browser/event_ui_card_discard.js`
- Modify: `game/features/reward/presentation/browser/reward_ui_option_renderers.js`
- Modify: `game/features/combat/presentation/browser/tooltip_general_ui.js`
- Modify: `game/features/run/presentation/browser/map_bottom_dock.js`

- [ ] **Step 1: Route exception descriptions through the shared highlight path**
- [ ] **Step 2: Make tooltip HTML generation owned by the tooltip layer, not callers**
- [ ] **Step 3: Keep map bottom rule copy readable without stripping the semantic marker**
- [ ] **Step 4: Re-run the targeted tests**
  Run: `npx vitest run tests/event_ui_card_discard.test.js tests/reward_ui_option_renderers.test.js tests/tooltip_general_ui.test.js tests/map_ui_next_nodes_render.test.js`

## Chunk 3: Character Select / Deck Focus Parity

### Task 5: Lock in failing tests for keyboard tooltip parity

**Files:**
- Modify: `tests/class_select_buttons_ui.test.js`
- Modify: `tests/character_select_info_panel.test.js`
- Modify: `tests/character_select_info_panel_helpers.test.js`
- Modify: `tests/deck_modal_render_ui.test.js`
- Modify: `tests/class_select_tooltip_ui.test.js`

- [ ] **Step 1: Add failing assertions for focus-triggered tooltip wiring and shared description styling**
- [ ] **Step 2: Run the targeted tests to verify they fail**
  Run: `npx vitest run tests/class_select_buttons_ui.test.js tests/character_select_info_panel.test.js tests/character_select_info_panel_helpers.test.js tests/deck_modal_render_ui.test.js tests/class_select_tooltip_ui.test.js`

### Task 6: Implement focus/hover parity and reduce description-style drift

**Files:**
- Modify: `game/features/title/platform/browser/class_select_buttons_ui.js`
- Modify: `game/features/title/platform/browser/character_select_info_panel_interactions.js`
- Modify: `game/features/combat/presentation/browser/deck_modal_render_ui.js`
- Modify: `game/features/title/platform/browser/class_select_tooltip_ui.js`
- Modify: `game/features/title/platform/browser/character_select_modal.js`
- Modify: `css/styles.css`
- Modify: `css/character_select_layout.css`

- [ ] **Step 1: Add focus/blur handlers wherever matching hover tooltip behavior exists**
- [ ] **Step 2: Ensure focusable targets have keyboard-friendly semantics**
- [ ] **Step 3: Move duplicated description typography from inline styles into shared CSS where possible**
- [ ] **Step 4: Re-run the targeted tests**
  Run: `npx vitest run tests/class_select_buttons_ui.test.js tests/character_select_info_panel.test.js tests/character_select_info_panel_helpers.test.js tests/deck_modal_render_ui.test.js tests/class_select_tooltip_ui.test.js`

## Chunk 4: Validation

### Task 7: Run verification commands for touched runtime/UI surfaces

**Files:**
- Modify: none

- [ ] **Step 1: Run focused test bundle**
  Run: `npx vitest run tests/description_utils_highlight.test.js tests/event_ui_card_discard.test.js tests/reward_ui_option_renderers.test.js tests/tooltip_general_ui.test.js tests/map_ui_next_nodes_render.test.js tests/class_select_buttons_ui.test.js tests/character_select_info_panel.test.js tests/character_select_info_panel_helpers.test.js tests/deck_modal_render_ui.test.js tests/class_select_tooltip_ui.test.js`
- [ ] **Step 2: Run fast suite**
  Run: `npm test`
- [ ] **Step 3: Run build because browser-visible UI changed**
  Run: `npm run build`

