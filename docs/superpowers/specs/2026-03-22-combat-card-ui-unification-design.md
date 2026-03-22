# Combat Card UI Unification Design

Date: 2026-03-22
Status: Draft approved for planning

## Goal

Unify the hand card UI and hover card UI so they read as the same card component in two presentation modes rather than two separate designs.

The baseline visual identity stays anchored to the current hand card. Improvements should increase:

- readability
- rarity recognition
- hover presentation quality

without changing the card's core layout language.

## Problem

The current combat hand card and hover clone use different render structures and different visual emphasis. This causes three issues:

1. The hover card does not feel like an enlarged view of the same object.
2. Visual state markers such as rarity, cost, and card type can drift between the two surfaces.
3. Design changes are likely to regress because the same concept is implemented twice.

Relevant code today:

- `game/features/combat/presentation/browser/combat_card_render_ui.js`
- `game/features/combat/presentation/browser/card_clone_render_ui.js`
- `game/features/combat/presentation/browser/card_ui.js`
- `game/features/combat/presentation/browser/card_clone_runtime_ui.js`

## Design Principles

1. Keep the hand card as the canonical visual identity.
2. Make the hover card an expanded view of the same card, not a different layout.
3. Use one shared information hierarchy across both variants.
4. Express rarity with a direct Korean label plus restrained accent styling.
5. Prefer restrained motion and lighting over dramatic tilt or heavy FX.

## Chosen Direction

Use a shared card frame with variant-level styling tokens.

This is not a pure CSS retheme of two separate components. It is also not a full immediate collapse into a single renderer if that would create unnecessary migration risk. The intended direction is:

- one shared render model for card structure and state
- one shared layout hierarchy for hand and hover
- variant-specific differences limited to size, spacing, readability, and subtle effects

## Layout Specification

Both hand cards and hover cards should preserve the same order and approximate placement of information:

1. top-left: quick command hotkey when applicable
2. top-center: rarity tag in Korean
3. top-right: energy cost
4. upper-middle: icon
5. center: card name
6. lower-middle: description
7. lower area: tag chips such as exhaust/persistent/instant
8. bottom: card type label

The hover card should keep this layout intact. It may gain more breathing room, but not a different composition.

## Rarity Expression

Rarity should be expressed by two coordinated signals:

1. a small top-center rarity tag
2. restrained border and accent treatment

The rarity tag text should be:

- `일반`
- `희귀`
- `전설`

The tag should stay visually subordinate to the card name and cost. Its job is fast recognition, not primary emphasis.

Rarity styling rules:

- Common: quiet neutral tag and minimal accent
- Rare: clearer accent color and slightly stronger edge treatment
- Legendary: strongest accent color and most visible but still restrained edge treatment

Heavy rarity-specific layout changes are out of scope.

## Hover Behavior

Hover should use a restrained enlargement approach.

Target behavior:

- maintain the same layout as the hand card
- enlarge the card moderately
- improve text readability through spacing and contrast
- increase shadow depth modestly
- keep tilt either removed or very small
- keep particles or glow subtle, and only stronger on rare or legendary cards

The hover card should feel more legible and more premium, not more theatrical.

## Component Architecture

Introduce a shared card frame path that both hand and hover rendering can use.

Recommended shape:

- shared frame builder or shared render model for card body structure
- `hand` variant
- `hover` variant

Shared responsibilities:

- rarity tag content and classing
- cost badge rendering
- icon, name, description, tags, type ordering
- state classes for playable, discounted, free, upgraded, rarity, type

Variant responsibilities:

- dimensions
- spacing scale
- typography scale
- hover-only shadow and surface emphasis
- hand-only hotkey visibility rules if needed

This may be implemented as:

- a shared `renderCardFrame(model, variant)` entrypoint, or
- a shared model builder plus thin hand/hover render wrappers

Either form is acceptable as long as the frame structure and state mapping are shared.

## Data and State Requirements

The unified frame must consume the same canonical card state for both hand and hover surfaces, including:

- `displayCost`
- `effectiveCost`
- `canPlay`
- `anyFree`
- `totalDiscount`
- `rarity`
- `type`
- `upgraded`

The recent cost-calculation centralization in `CardCostUtils` should remain the source of truth for display/playability state.

## Migration Plan

Implement in three steps:

1. Build the shared frame path and switch hand cards to it.
2. Move hover cards onto the same frame path with variant overrides only.
3. Add the visual polish layer: rarity tag, restrained hover shadow, readability tuning, and subtle rarity accents.

This staging keeps structure changes separate from visual polish and lowers regression risk.

## Testing Strategy

Add or update tests in three layers.

### Render structure tests

Validate that hand cards and hover cards expose the same key semantic sections:

- rarity tag
- cost
- icon
- name
- description
- tags
- type

### State rendering tests

Validate that both variants reflect the same state for:

- discounted cost
- free cost
- non-playable state
- upgraded state
- rarity classes

### Browser smoke

Confirm in the real browser that:

- hand card and hover card visibly read as the same design
- the top-center rarity tag renders in Korean
- hover enlargement keeps the same layout rather than switching composition
- cost, discount, and non-playable visuals remain correct
- no console or page errors appear

## Non-Goals

The following are not part of this design unless discovered as direct blockers:

- redesigning reward cards or title screen cards to match combat cards
- changing gameplay rules or card metadata semantics
- adding large cinematic hover motion
- introducing a rarity badge system without keeping the hand-card visual identity

## Risks

1. The current hover renderer may have special-case DOM or animation behavior that does not map cleanly to the shared frame.
2. A new rarity tag could visually compete with hotkey or cost badges if not kept small.
3. CSS drift may continue if structure is shared but styling remains split without clear variant tokens.

## Success Criteria

The work is successful when:

- a player can immediately recognize the hover card as an enlarged version of the hand card
- rarity is readable at a glance through the top-center Korean tag
- hover improves readability without changing the card's identity
- hand and hover surfaces no longer diverge in state presentation
- future card UI changes can be made through one shared frame path
