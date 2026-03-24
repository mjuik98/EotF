# Structure Simplification Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining low-value compat aliases, shrink the `game/domain` and `game/systems` transitional roots again, and split two oversized shared files into focused helper modules without changing behavior.

**Architecture:** Treat the remaining `game/systems/*` files and `game/domain/combat/*` compat files as dead aliases and replace them with direct imports from canonical feature/shared owners. Keep public APIs stable while extracting pure helper logic out of large files so the main entry files become orchestration-only shells.

**Tech Stack:** JavaScript, Vitest, repository guardrail scripts

---

## Chunk 1: Delete Remaining Systems And Domain Compat Aliases

### Task 1: Lock Alias Removal With Failing Tests

**Files:**
- Modify: `tests/system_compat_reexports.test.js`
- Modify: `tests/state_flow_boundary_contracts.test.js`
- Modify: `tests/event_manager_item_shop_cache.test.js`
- Modify: `tests/event_manager_resolution_flags.test.js`
- Modify: `tests/event_merchant_resolution.test.js`
- Modify: `tests/event_resonance_choice_limit.test.js`
- Modify: `tests/relic_price_verification.test.js`
- Modify: `tests/rest_site_upgrade_button.test.js`
- Modify: `tests/run_rules_preview_meta.test.js`
- Modify: `tests/run_rules_regions.test.js`

- [ ] Step 1: Update tests to expect direct canonical imports instead of `game/systems/*` and `game/domain/combat/public_combat_runtime_capabilities.js`.
- [ ] Step 2: Run the focused Vitest files and confirm failure comes from files that still exist or sources that still reference compat paths.

### Task 2: Delete The Remaining Compat Files

**Files:**
- Modify: `game/features/combat/application/death_flow_runtime_support.js`
- Modify: `game/features/combat/application/play_card_service.js`
- Modify: `game/features/combat/application/run_enemy_turn_use_case.js`
- Modify: `game/domain/combat/turn/end_player_turn_policy.js`
- Modify: `game/domain/combat/turn/start_player_turn_policy.js`
- Delete: `game/domain/combat/public_combat_runtime_capabilities.js`
- Delete: `game/domain/combat/resolve_active_region_id.js`
- Delete: `game/systems/event_manager.js`
- Delete: `game/systems/run_rules.js`
- Delete: `game/systems/run_rules_curses.js`
- Delete: `game/systems/run_rules_difficulty.js`
- Delete: `game/systems/run_rules_meta.js`
- Delete: `game/systems/run_rules_regions.js`

- [ ] Step 1: Point combat runtime support directly at canonical data/audio/run-rule modules.
- [ ] Step 2: Update tests and any remaining consumers to import from canonical feature/shared owners.
- [ ] Step 3: Delete the compat files once no callers remain.
- [ ] Step 4: Run the focused alias-removal tests and confirm green.

## Chunk 2: Split Oversized Shared Files Into Focused Helpers

### Task 3: Extract Item Detail Panel Helpers

**Files:**
- Create: `game/shared/ui/item_detail/item_detail_panel_variants.js`
- Create: `game/shared/ui/item_detail/item_detail_markup.js`
- Modify: `game/shared/ui/item_detail/item_detail_panel_ui.js`
- Modify: `tests/item_detail_surface_ui.test.js`
- Modify: `tests/item_detail_panel_ui.test.js`

- [ ] Step 1: Add tests that directly cover variant resolution and shared markup helpers.
- [ ] Step 2: Run those tests and confirm failure because the helper modules do not exist yet.
- [ ] Step 3: Extract panel variant and markup helpers into focused modules while keeping the main UI file as orchestration.
- [ ] Step 4: Re-run the item-detail test slice and confirm green.

### Task 4: Extract Class Loadout Preset Helpers

**Files:**
- Create: `game/shared/progression/class_loadout_preset_catalog.js`
- Create: `game/shared/progression/class_loadout_preset_helpers.js`
- Modify: `game/shared/progression/class_loadout_preset_use_case.js`
- Modify: `tests/class_loadout_preset_use_case.test.js`

- [ ] Step 1: Add tests that directly cover preset summary/eligibility helper behavior.
- [ ] Step 2: Run those tests and confirm failure because the helper modules do not exist yet.
- [ ] Step 3: Move static catalog and pure preset helper functions out of the use-case file.
- [ ] Step 4: Re-run the preset tests and confirm green.

## Chunk 3: Verify

### Task 5: Full Validation

**Files:**
- No code changes

- [ ] Step 1: Run focused Vitest coverage for the touched files.
- [ ] Step 2: Run `npm run lint`.
- [ ] Step 3: Run `npm run deps:map` and `npm run deps:map:check`.
- [ ] Step 4: Run `npm run audit:structure`.
- [ ] Step 5: Run `npm run audit:transition-surfaces`.
- [ ] Step 6: Run `npm run test:full`.
