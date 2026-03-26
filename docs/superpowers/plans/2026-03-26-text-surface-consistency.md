# Text Surface Consistency Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align card/tooltip/description text rendering, keyword palette behavior, and keyboard accessibility across the remaining inconsistent UI surfaces.

**Architecture:** Keep the existing `DescriptionUtils.highlight` and tooltip modules, but route the remaining outliers through the same description classes and accessibility hooks. Prefer localized, behavior-preserving edits in the existing presentation modules and CSS selectors rather than broad refactors.

**Tech Stack:** JavaScript, Vitest, CSS

---

### Task 1: Add regression coverage for the remaining exceptions

**Files:**
- Modify: `tests/class_trait_panel_ui.test.js`
- Modify: `tests/reward_ui_option_renderers.test.js`
- Modify: `tests/character_select_info_panel_helpers.test.js`
- Modify: `tests/combat_enemy_status_badges_ui.test.js`
- Modify: `tests/hud_panel_sections_localization.test.js`
- Modify: `tests/class_select_tooltip_ui.test.js`
- Modify: `tests/map_ui_full_map.test.js`
- Modify: `tests/map_ui_full_map_render.test.js`
- Modify: `tests/combat_hud_feedback.test.js`
- Create: `tests/status_effects_ui_accessibility.test.js`
- Create: `tests/event_ui_card_discard.test.js`

- [ ] Write failing tests for focus/blur tooltip parity, aria-label fixes, safe tooltip rendering, reward fallback highlighting, localized map/shop copy, and extended `kw-*` palette selectors.
- [ ] Run the targeted test set and confirm the new assertions fail for the expected reasons.

### Task 2: Implement accessibility and rendering fixes

**Files:**
- Modify: `game/features/combat/presentation/browser/status_effects_ui.js`
- Modify: `game/features/combat/presentation/browser/combat_enemy_status_badges_ui.js`
- Modify: `game/features/combat/presentation/browser/combat_enemy_card_sections_ui.js`
- Modify: `game/features/combat/presentation/browser/class_trait_panel_ui.js`
- Modify: `game/features/combat/presentation/browser/hud_panel_sections.js`
- Modify: `game/features/run/platform/browser/register_run_entry_bindings.js`
- Modify: `game/features/reward/presentation/browser/reward_ui_option_renderers.js`
- Modify: `game/features/title/platform/browser/character_select_info_panel_interactions.js`
- Modify: `game/features/title/platform/browser/class_select_tooltip_ui.js`
- Modify: `game/features/event/presentation/browser/event_ui_card_discard.js`
- Modify: `game/features/run/presentation/browser/map_ui_full_map_render_layout.js`
- Modify: `game/features/run/presentation/browser/map_ui_full_map.js`
- Modify: `game/features/combat/presentation/browser/combat_hud_feedback.js`
- Modify: `game/features/combat/presentation/browser/combat_enemy_card_ui.js`

- [ ] Add focusable semantics and focus/blur handlers where tooltip hosts were hover-only.
- [ ] Route remaining description outliers through shared classes or `DomSafe.setHighlightedText`.
- [ ] Replace the remaining English visible fallback copy with Korean strings.
- [ ] Make class-select tooltip title rendering safe without relying on whole-template `innerHTML`.

### Task 3: Extend shared CSS coverage for remaining keyword tokens

**Files:**
- Modify: `css/styles.css`
- Modify: `css/codex_v3.css`
- Modify: `css/character_select_layout.css`

- [ ] Extend surface-specific `kw-*` selector coverage to include newer tokens (`kw-num`, `kw-debuff`, `kw-special`, `kw-chain`, `kw-crit`, `kw-trigger`) where shared overrides were still missing.
- [ ] Move the `[세트:...]` highlight block off the inline style path so typography and palette stay controlled by CSS.

### Task 4: Verify the fixes

**Files:**
- Test: `tests/class_trait_panel_ui.test.js`
- Test: `tests/reward_ui_option_renderers.test.js`
- Test: `tests/character_select_info_panel_helpers.test.js`
- Test: `tests/combat_enemy_status_badges_ui.test.js`
- Test: `tests/hud_panel_sections_localization.test.js`
- Test: `tests/class_select_tooltip_ui.test.js`
- Test: `tests/map_ui_full_map.test.js`
- Test: `tests/map_ui_full_map_render.test.js`
- Test: `tests/combat_hud_feedback.test.js`
- Test: `tests/status_effects_ui_accessibility.test.js`
- Test: `tests/event_ui_card_discard.test.js`

- [ ] Run the targeted Vitest command for the modified surfaces.
- [ ] Run a broader verification command if the targeted suite is clean.
