# Combat Hover Card Side Panel Design

Date: 2026-03-23
Status: Draft approved for planning

## Goal

Redesign the combat hand-card hover UI so it reads as an enlarged version of the in-hand card instead of a generic tooltip, while preserving room for contextual rules and keyword explanations.

The redesign should improve:

- first-pass readability
- continuity between hand card and hover card
- optional access to deeper effect explanations

without turning every hover into a permanently expanded two-panel layout.

## Problem

The current hover card is implemented as a compact tooltip panel with vertically stacked content and a separate small secondary tooltip. This creates three problems:

1. The hover card does not feel like the same object as the card in hand.
2. The most important information is crowded into the upper half while the lower half carries excess empty space.
3. Supplemental explanations can only appear in a small tooltip form factor, which is weak for effects that need a clearer explanation surface.

Relevant code today:

- `index.html`
- `css/styles.css`
- `game/features/combat/presentation/browser/tooltip_ui.js`
- `game/features/combat/presentation/browser/tooltip_card_render_ui.js`

## Design Principles

1. The hover card should be a card first and a tooltip second.
2. The hover state should preserve the hand card's identity and information order.
3. The main hover surface should optimize for reading the card itself.
4. Supplemental explanations should appear only on explicit user interest, not by default.
5. The base interaction should remain visually calm and predictable.

## Chosen Direction

Use a real card enlargement for the main hover surface and a conditional side explanation panel for secondary information.

The default hover state shows only the enlarged card. A side panel appears only when the user hovers a specific interactive element inside that enlarged card, such as a highlighted keyword, effect badge, or prediction detail.

This keeps the primary reading flow focused while still allowing richer explanations when needed.

## Main Hover Card Layout

The main hover card should preserve the hand card's structural identity with a readability-focused scale increase.

Target order:

1. top-center: rarity label
2. top-right: cost badge
3. upper-middle: icon
4. center: card name
5. mid-body: description
6. lower-body: optional prediction or support info
7. bottom: card type label

Layout rules:

- keep the card silhouette and overall ratio aligned with the hand card
- increase size and spacing without changing the card into a generic info box
- keep title, icon, and cost center-oriented like the hand card
- switch description and prediction content to left alignment for faster scanning
- reduce the visual weight of inner framing so the outer card frame stays dominant

## Description Alignment and Hierarchy

The body copy should become a reading surface rather than a decorative center block.

Rules:

- card name stays centered
- description text becomes left-aligned
- prediction or calculated combat output also becomes left-aligned
- line length and line height should be tuned for quick scanning over multiple lines
- typography contrast should favor legibility over ornamental styling

This creates a split hierarchy:

- the card face remains expressive and card-like
- the text block behaves like a compact tactical information panel

## Side Explanation Panel

The current secondary tooltip should evolve into a clearer side explanation panel.

Default behavior:

- hidden when the enlarged card first appears
- shown only when hovering an interactive explanation target inside the main hover card
- positioned to the right of the card by default
- positioned to the left when screen bounds would clip the panel on the right

Eligible triggers include:

- highlighted effect keywords in the description
- type or mechanic badges
- prediction-detail fragments when they expose derived effects

The side panel should contain:

- a short title
- a concise explanation paragraph
- optional numeric interpretation when needed

The panel is secondary. It should never compete with the main card for attention when inactive.

## Interaction Model

Hover interaction should work in two stages.

Stage 1:

- hover a hand card
- show the enlarged hover card only

Stage 2:

- hover an interactive target inside the enlarged card
- show the side explanation panel

Exit behavior:

- leaving the trigger target hides only the side panel
- leaving the card hover area hides both the main hover card and the side panel

This keeps the interaction understandable and avoids forcing a two-column read path on every card.

## Rendering and Structure Direction

The current tooltip markup should be refactored toward a card-structured DOM instead of a flat stacked tooltip.

Recommended shape:

- root hover card container
- header zone for rarity and cost
- visual/title zone for icon and name
- body copy zone for description
- support zone for prediction or computed notes
- footer zone for card type

The side explanation panel should remain a separate positioned element but be treated as part of the hover-card system rather than an unrelated small tooltip.

Implementation should favor:

- explicit semantic sections
- reusable classes aligned with existing combat card styling where practical
- minimal duplication of card-state styling rules

## Positioning Behavior

The current tooltip positioning logic assumes a narrow, fixed tooltip box. The new card enlargement and side panel require more robust bounds handling.

Rules:

- place the enlarged hover card beside the source card when possible
- keep the card fully within the viewport vertically and horizontally
- anchor the side panel to the hover card, not the original hand-card element
- choose right-side or left-side panel placement based on available space
- avoid overlap that obscures the hovered card's core content

## Testing Strategy

Add or update tests in three layers.

### Render structure tests

Validate that the hover card exposes the intended sections and no longer behaves as a flat center-stacked tooltip.

### Interaction tests

Validate that:

- hovering a hand card shows only the enlarged hover card
- hovering a keyword or explanation target shows the side panel
- leaving the trigger hides the side panel without immediately collapsing the main hover card
- leaving the card hover state hides both surfaces

### Browser smoke

Confirm in the browser that:

- the hover card reads as an enlarged hand card
- description text is left-aligned and easier to scan
- the side panel appears only on secondary hover targets
- left/right fallback positioning works near screen edges
- no console or page errors appear

## Non-Goals

The following are out of scope unless a direct blocker appears:

- redesigning gameplay rules or card metadata
- making every card show a permanent side explanation panel
- adding large cinematic hover motion or complex 3D tilt
- redesigning non-combat card surfaces to match this interaction in the same batch

## Risks

1. The current highlighted-description rendering may not yet expose stable keyword targets for side-panel interactions.
2. Reusing hand-card visuals too literally could keep cramped spacing if the hover variant does not get its own typography and spacing adjustments.
3. Positioning complexity increases once the side panel anchors to a larger card surface rather than a narrow tooltip box.

## Success Criteria

The work is successful when:

- the hover card is immediately recognizable as an enlarged version of the hand card
- the main card remains readable without opening any secondary explanation
- supplemental explanations appear only when the user asks for them through direct hover intent
- the side panel feels like part of the same hover system rather than a separate floating tooltip
- hover interactions remain stable near viewport edges
