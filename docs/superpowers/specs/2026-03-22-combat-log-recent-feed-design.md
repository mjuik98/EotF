# Combat Log Recent Feed Design

## Goal

Reposition combat feedback so the player reads the result of their action near the combat action bar instead of scanning the left side of the screen.

The design splits combat logging into:

- a compact `recent combat feed` shown above the action bar during combat
- the existing full `battle chronicle` opened from `전투 기록 (L)`

## Confirmed Product Direction

- Remove the left-side always-visible combat log as the primary combat feedback anchor.
- Add a fixed recent feed above the combat action bar.
- Keep the recent feed small and stable: show the latest 3 entries on desktop and allow 2 entries on narrow screens.
- The recent feed is for player-driven results only.
- The full combat history remains available through the existing battle chronicle overlay.
- Recent feed lines should include the action name when available, not only the raw result.

## UX Summary

### Recent Combat Feed

- Position: directly above the combat action bar, centered with the existing action cluster.
- Visibility: always visible during combat, but compact.
- Capacity: 3 lines by default.
- Content format: `action/source -> key result`
- Examples:
  - `강타 -> 슬라임 12 피해`
  - `응급 처치 -> 6 회복`
  - `방호 태세 -> 방어막 +8`
  - `독 바르기 -> 슬라임 중독 3턴`

### Battle Chronicle

- The `전투 기록 (L)` overlay remains the complete log surface.
- System logs, enemy-turn detail, and broader turn context stay here.
- The recent feed is not a replacement for long-form combat history.

## Scope

### In Scope

- Add a compact recent feed container in the combat HUD.
- Derive recent feed entries from the existing combat log stream.
- Filter entries so the recent feed only reflects player-triggered action outcomes.
- Preserve full logging for the battle chronicle overlay.
- Remove or disable the current left-side always-visible combat log presentation.

### Out of Scope

- Rewriting all combat log production across the combat system.
- Changing the battle chronicle overlay interaction model.
- Refactoring unrelated combat HUD layout surfaces.
- Changing the canonical combat log storage shape unless required for minimal metadata support.

## Architecture

### Data Model

Keep `gs.combat.log` as the single source of truth for combat logging.

The design adds a derived presentation layer instead of a second persistent log store:

- `full log view`: existing `gs.combat.log`
- `recent feed view`: filtered and sliced projection of `gs.combat.log`

This keeps logging behavior centralized and avoids divergence between two log stores.

### Presentation Ownership

- HTML shell changes belong in combat overlay markup.
- Styling belongs in combat HUD CSS.
- Feed rendering belongs in the combat presentation browser layer.
- Filtering and line selection should be isolated from DOM mutation so it can be unit tested independently.

Recommended ownership:

- `index.html`: recent feed container placement near the action bar
- `css/styles.css`: recent feed layout and responsive behavior
- `game/features/combat/presentation/browser/combat_hud_log_ui.js`: split or delegate between full-log rendering and recent-feed rendering
- optional helper module under `game/features/combat/presentation/browser/`: recent feed filtering and formatting rules

## Filtering Rules

### Include

Show entries that communicate the direct result of a player-initiated action:

- card attack results
- card heal results
- card shield results
- card-applied status or buff results
- active player skill results such as echo skill output
- other explicit player-triggered effects when the source can be named clearly

### Exclude

Do not show entries that create noise or dilute the action-to-result loop:

- combat start and turn divider lines
- target selection helper logs
- enemy attacks and enemy-turn automatic resolution
- poison, burn, doom, and similar automatic tick logs
- verbose chained follow-up logs when they repeat the same outcome already shown by a primary player result
- generic system lines with no direct player action relevance

### Compression Rules

- Prefer one primary line per player action.
- Allow one secondary line only when an additional result is materially important and not redundant.
- If an entry already includes action naming, reuse it.
- If the source action has no card name, use the most specific available source label such as `에코 스킬`, item name, or trait name.

## UI Behavior

- New entries push older entries upward.
- The recent feed shows only the newest visible entries after filtering.
- If no recent-feed-eligible entries exist, the container should collapse visually or stay unobtrusive.
- On narrow layouts, reduce the feed to 2 visible lines rather than letting it crowd the hand/action area.
- The feed should not rely on hover to reveal its core content.

## Error Handling And Edge Cases

- Multi-hit cards should prefer a single representative line unless multiple outcomes must be shown for clarity.
- Effects without a card context should still display if they are player-triggered and can be attributed to a specific source.
- Automatic enemy and environment logs should never displace recent player action feedback from the feed.
- If the feed filter yields no entries after a combat start, the UI should remain stable without placeholders that distract from gameplay.
- Existing full-log behavior must remain intact even if the recent feed cannot render.

## Testing Strategy

### Unit Tests

- verify recent feed filtering includes player-driven card results
- verify recent feed filtering excludes system, turn-divider, and enemy-turn lines
- verify recent feed capacity trimming keeps only the latest 3 filtered entries
- verify fallback source labeling for non-card player-triggered actions when applicable

### UI Tests

- verify the combat HUD renders recent feed entries into the new container
- verify older entries are trimmed correctly
- verify the left-side always-visible combat log no longer acts as the primary presentation surface
- verify the battle chronicle overlay still receives the full combat history

### Smoke Validation

For implementation handoff, validate:

- `npm test`
- `npm run lint`
- `npm run build`
- browser smoke: click `#mainStartBtn`, enter combat, use a card, confirm recent feed updates near the action bar, and confirm no console/page errors

## Implementation Notes

- Favor a small behavior-preserving change set.
- Reuse the current combat log event flow instead of introducing a new event bus path.
- Keep filtering logic separate from the battle chronicle logic so both views stay understandable.
- Avoid broad CSS refactors; only move the user’s primary combat feedback anchor.

## Open Implementation Choice

If the current log stream does not expose enough metadata to reliably distinguish player-driven results from noisy follow-up logs, add only the minimum metadata necessary to support recent-feed filtering. Do not redesign the entire combat log schema as part of this work.
