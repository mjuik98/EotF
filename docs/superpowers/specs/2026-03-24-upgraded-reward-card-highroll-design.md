# Upgraded Reward Card High-Roll Design

## Goal

Make combat victory card rewards occasionally feel exceptional by allowing a single upgraded card to appear as a lucky high-roll in the three-card reward set.

## Scope

This change is intentionally narrow. It only affects combat reward card choices and keeps the existing reward flow, card rarity mix, and reward claiming behavior intact.

## Design

### 1. Draw the normal reward set first

The reward system should keep drawing the same base cards it already would for combat rewards. This preserves the current rarity distribution and avoids creating a separate upgraded-card reward table.

### 2. Upgrade at most one drawn card

After the base reward set is created, the system may convert one drawn base card into its upgraded variant through `upgradeMap`. If no drawn card has a valid upgraded variant, the set stays unchanged.

This is a lucky high-roll, not a baseline expectation, so the outcome must remain capped at one upgraded card per reward screen.

### 3. Limit the behavior to three-card combat rewards

The requested behavior targets the standard post-combat three-card choice. Boss and mini-boss reward layouts should remain unchanged for now so the new behavior does not overlap with existing higher-tier reward identity.

### 4. Use conservative odds

Use a lower chance for normal combat rewards and a somewhat higher chance for elite combat rewards, while still keeping the outcome occasional rather than routine.

## Validation

- Add a failing test for standard combat rewards producing at most one upgraded card.
- Add a failing test for elite combat rewards using the same cap.
- Run focused reward UI tests.
- Run `npm test`.
