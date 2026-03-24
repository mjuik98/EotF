# Map Relic Detail Parity Design

## Goal

Make the region-select relic hover panel use the same full detail layout as the combat relic hover panel, including always-expanded set bonus rows when the hovered relic belongs to a set.

## Scope

This change stays focused on region-select relic detail behavior and layout parity. It does not redesign relic data, tooltip copy, or combat relic interactions. It should preserve the existing hover, pin, dismiss, and inline fallback behavior in the map UI while replacing the compact detail presentation with the combat-style presentation.

## Design

### 1. Reuse the combat detail variant in the map relic surface

The region-select relic detail runtime currently hard-codes the shared item detail surface to the `compact` variant. The combat relic rail already uses the shared `combat` variant, and that variant renders the full set section cleanly with enough spacing for set member rows and bonus rows.

The map relic detail runtime should switch from `compact` to `combat` in both:

- `applyItemDetailPanelStyles(...)`
- `createManagedItemDetailSurface(...)`

This keeps the content renderer shared and avoids introducing a map-only copy of the combat panel layout.

### 2. Widen the floating map relic panel to fit the combat-style detail

The current map floating panel layout assumes a `240px` detail width. That is too narrow for the combat-style panel and causes the set bonus area to feel cramped. The floating layout constants in `game/features/run/presentation/browser/map_relic_detail_layout.js` should be updated to fit the combat panel width so the region-select panel can show the full set bonus list without truncation pressure.

The inline fallback should remain unchanged in behavior:

- use floating-left when the viewport is wide enough and there is enough room on the left,
- fall back to inline when the left side is too narrow.

Only the target width and associated placement math should change.

### 3. Keep the map-specific interaction model, but align the visual outcome

The map relic panel should keep its existing interaction rules:

- hover opens the detail,
- moving between slot and panel respects the hover-safe delay,
- click pins the panel,
- outside click or `Escape` dismisses it,
- narrow layouts still collapse to inline.

What changes is the rendered panel variant and resulting information density, not the interaction contract.

### 4. Validation and regression coverage

Update focused map relic detail tests so they assert the new full-detail outcome rather than the compact-only layout. In particular, the map UI tests should cover:

- a set relic opening with the localized set name,
- set member rows rendering,
- set bonus rows rendering in the region-select panel,
- floating placement still working with the wider panel,
- inline fallback still triggering when left-side room is insufficient.

Keep the existing combat relic tests untouched unless a shared renderer change forces expectation updates.

## Risks

- A wider floating panel may shift vertical placement expectations in map relic tests and may need updated top calculations.
- If the widened panel pushes the viewport math too far, the map UI could fall back to inline more often than intended on mid-width screens.
- Because map and combat will now share the same detail variant, future visual tweaks to the combat panel will also affect the map panel unless a separate variant is reintroduced.

## Validation

- Add failing map relic detail tests before implementation.
- Run focused Vitest coverage for map relic detail and shared item detail surfaces.
- Run `npm run build`.
- Run `npm run smoke:character-select`.
