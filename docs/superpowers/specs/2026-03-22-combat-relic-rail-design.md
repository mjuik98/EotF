# Combat Relic Rail Design

Date: 2026-03-22
Topic: Expose current relics during combat without reusing the full stage-select sidebar as a permanent panel.

## Goal

Allow players to inspect owned relics during combat while preserving combat readability. The default presentation should be compact, always visible, and low-noise. Detailed relic information should remain available on demand.

## Scope

In scope:

- Add a compact relic summary rail to the combat HUD.
- Reuse existing combat item tooltip behavior for hover/focus.
- Add an on-demand detailed relic panel for combat.
- Prefer existing rendering and sorting behavior already used by combat HUD and run/map relic UIs.
- Support narrow-screen fallback behavior.

Out of scope:

- Redesigning the full combat HUD layout.
- Changing relic gameplay rules, triggers, or data shape.
- Replacing the stage-select relic panel implementation globally.
- Adding new persistent window or `window.*` APIs.

## Problem

The stage-select screen already exposes a useful `현재 유물` panel, but combat has higher information density. Copying that full right-side panel into combat as a permanently open surface would compete with enemy reads, hand evaluation, action buttons, and combat feedback.

Players still need better access to relic information during combat, especially for relics that affect card play, turn flow, combat start, or other immediate decisions.

## Recommendation

Adopt a compact combat-only `relic rail`:

- Default state: always-visible vertical icon rail on the right side of the combat HUD.
- Interaction:
  - Hover/focus on a relic icon shows the existing item tooltip.
  - Click toggles a detailed relic panel.
- Detailed panel:
  - Opens adjacent to the rail rather than occupying a permanent full-height sidebar.
  - Reuses current relic card styling and ordering rules where practical.
- Responsive behavior:
  - Desktop: right-side rail.
  - Narrow screens: convert to a bottom sheet or lower dock style expandable panel.

This keeps the information accessible while preserving combat focus.

## UX Design

### Default Layout

The combat overlay gets a narrow right-aligned rail with:

- a small title or count indicator such as `유물 3`
- one icon slot per relic
- a final affordance for opening the full detail panel if needed

The rail must remain compact enough to avoid competing with enemy cards or the hand overlay. The design should prioritize icon recognition first and text second.

### Detail Interaction

Detailed relic information is not shown by default. It appears only when a user explicitly opens it.

The detail panel should:

- anchor to the rail
- show relic name and short effect summary
- preserve rarity emphasis
- sort combat-relevant relics ahead of passive/non-immediate relics when possible

The panel should close when the user clicks the toggle again or leaves combat. It should not become a second permanently pinned HUD unless that behavior already exists in combat HUD conventions.

### Tooltip Behavior

The rail should not introduce a separate tooltip system. It should reuse existing `showItemTooltip` / `hideItemTooltip` wiring already used by combat item slots and run/map relic surfaces.

Keyboard focus should also trigger tooltip visibility where feasible for parity with pointer hover.

## Architecture

### Ownership

New combat-specific presentation belongs under `game/features/combat/presentation/browser/`.

Expected implementation pieces:

- combat HUD markup/shell extension for the relic rail container
- combat relic rail renderer/updater
- combat relic panel toggle behavior
- combat CSS additions in existing combat/HUD styles

If common sorting or summary logic is needed across map and combat relic displays, extract only thin shared helpers. Do not move combat rendering into run/map modules or import run/map presentation modules directly into combat.

### Existing Surfaces To Reuse

- `game/features/combat/presentation/browser/hud_panel_item_runtime_helpers.js`
  - already sorts items and wires item tooltips
- `game/features/combat/presentation/browser/hud_panel_sections.js`
  - already participates in HUD refresh orchestration
- `game/features/combat/presentation/browser/hud_update_ui.js`
  - already drives HUD updates
- `game/features/run/presentation/browser/map_ui_next_nodes_render_panels.js`
  - provides reference styling/behavior for detailed relic cards, but must not be imported into combat directly unless a narrow shared helper is extracted

### Proposed Structure

One reasonable structure:

- `combat_relic_rail_ui.js`
  - render/update compact rail
  - bind tooltip and click toggle behavior
- `combat_relic_panel_ui.js`
  - render/update expanded detail panel
- integration from existing HUD panel update flow

If the repository prefers keeping this in `hud_panel_item_runtime_helpers.js`, that is also acceptable as long as the file remains readable and the new logic stays clearly separated.

## Data Flow

1. Combat HUD refresh runs through existing `HudUpdateUI` flow.
2. The combat item panel update step reads `gs.player.items`.
3. Relics are sorted by existing rarity/order rules.
4. Compact rail renders icons from the sorted relic list.
5. Hover/focus events call existing tooltip methods.
6. Click toggles expanded detail state.
7. Expanded panel renders richer summaries using existing item data from `data.items`.

State for the expanded/collapsed panel should be UI-local DOM state or a combat UI module-local state flag. It should not create new gameplay state mutations.

## Error Handling

- Missing relic data should fail soft:
  - skip invalid entries or render a safe fallback icon/name
- Missing tooltip modules should not block rendering:
  - the rail still renders, but hover detail silently degrades
- Empty relic inventory should show a compact empty state or hide the rail entirely, depending on available space and clarity
- Combat end/reset must close or clear the detail panel to prevent stale DOM state

## Accessibility

- Icon slots should be focusable if they expose tooltip/detail behavior.
- Each icon slot should have an `aria-label` with relic name and short summary.
- The detail toggle should be keyboard-activatable.
- Desktop hover interactions must have a click/focus alternative.

## Responsive Behavior

Desktop:

- fixed right-side vertical rail
- detail panel expands leftward from the rail

Narrow screens:

- rail condenses into a horizontal strip or bottom toggle
- detail panel becomes a bottom sheet or lower dock section

The responsive mode should preserve access to the same tooltip/detail information without requiring precision hover.

## Validation Plan

Required validation after implementation:

- `npm test`
- `npm run lint`
- `npm run build`

Manual/browser checks:

- start game via `#mainStartBtn`
- enter combat
- confirm compact relic rail is visible during combat
- hover/focus on relic icon shows tooltip
- click toggles detail panel
- detail panel closes cleanly
- confirm no console/page errors
- confirm narrow-screen layout does not overlap core controls

## Risks

- Overloading the right edge of the combat layout if the rail is too wide
- Creating duplicate logic between combat item slots and relic rail rendering
- Detail panel fighting with existing hover HUD or other overlays
- Mobile/narrow-screen layout regressions if desktop-only assumptions leak into CSS

## Implementation Notes

- Prefer low-risk integration by extending current combat HUD update flow instead of introducing a new independent render loop.
- Keep the compact rail visually subordinate to enemies, hand cards, and action buttons.
- Avoid hand-editing unrelated generated artifacts or quality config.
- Do not claim validation passed unless all required commands are actually run.
