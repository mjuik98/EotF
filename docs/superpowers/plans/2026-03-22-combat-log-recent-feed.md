# Combat Log Recent Feed Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the left-side always-visible combat log with a compact recent combat feed above the action bar while preserving the full battle chronicle log.

**Architecture:** Keep `gs.combat.log` as the single log source, add a small selector/formatter layer for recent-feed eligibility, and render two presentation views from the same data: the compact feed and the full chronicle. Avoid broad combat HUD refactors; limit changes to combat overlay markup, combat log presentation helpers, reset hooks, and focused tests.

**Tech Stack:** Vite app, browser-side JavaScript modules, existing combat HUD presentation layer, Vitest, CSS in `css/styles.css`

---

## File Map

- Modify: `index.html`
  - Add the recent-feed container near the combat action bar and stop treating the left-side log as the primary visible combat feedback surface.
- Modify: `css/styles.css`
  - Remove or neutralize the old left-fixed combat-log presentation and add compact recent-feed styles plus responsive rules.
- Modify: `game/features/combat/presentation/browser/combat_hud_log_ui.js`
  - Split responsibilities between full-log rendering and recent-feed rendering, keeping DOM code thin.
- Create: `game/features/combat/presentation/browser/combat_recent_feed_selector.js`
  - Hold recent-feed filtering, trimming, and formatting/compression rules so they can be unit tested without DOM setup.
- Modify: `game/features/combat/presentation/browser/combat_hud_ui.js`
  - Continue calling the combat-log updater, but through the updated presentation helper that now renders both surfaces.
- Modify: `game/features/combat/presentation/browser/combat_start_render_ui.js`
  - Clear the new recent-feed container when combat DOM resets.
- Modify: `game/features/combat/presentation/browser/hud_effects_ui.js`
  - Clear the recent-feed container during combat UI reset paths.
- Test: `tests/combat_recent_feed_selector.test.js`
  - Cover recent-feed filtering and capacity rules.
- Modify: `tests/combat_hud_log_ui.test.js`
  - Cover recent-feed DOM rendering and coexistence with the full log surface.
- Modify: `tests/combat_start_render_ui.test.js`
  - Verify reset logic clears the new feed container.
- Modify: `tests/hud_effects_ui.test.js`
  - Verify combat UI reset clears the new feed container.

## Chunk 1: Recent Feed Selection Rules

### Task 1: Add focused tests for recent-feed eligibility

**Files:**
- Create: `tests/combat_recent_feed_selector.test.js`
- Reference: `docs/superpowers/specs/2026-03-22-combat-log-recent-feed-design.md`

- [ ] **Step 1: Write the failing test for include/exclude rules**

```js
import { describe, expect, it } from 'vitest';
import { selectRecentCombatFeedEntries } from '../game/features/combat/presentation/browser/combat_recent_feed_selector.js';

describe('combat_recent_feed_selector', () => {
  it('keeps card-result entries and excludes system and enemy-turn noise', () => {
    const entries = [
      { id: 'sys', msg: '⚔️ 전투 시작!', type: 'system' },
      { id: 'turn', msg: '── 턴 1 ──', type: 'turn-divider' },
      { id: 'card', msg: '🃏 [강타] → 슬라임: 12 피해', type: 'card-log' },
      { id: 'enemy', msg: '⚔️ 적 → 플레이어: 7 피해', type: 'damage' },
    ];

    expect(selectRecentCombatFeedEntries(entries)).toEqual([
      expect.objectContaining({ id: 'card' }),
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/combat_recent_feed_selector.test.js`
Expected: FAIL because `combat_recent_feed_selector.js` does not exist yet.

- [ ] **Step 3: Expand the failing tests for capacity and fallback source behavior**

```js
it('keeps only the latest 3 eligible entries', () => {
  const entries = [
    { id: '1', msg: '🃏 [베기] → 슬라임: 4 피해', type: 'card-log' },
    { id: '2', msg: '🃏 [방호] : 방어막 +6', type: 'buff' },
    { id: '3', msg: '✨ 공명 폭발: 10 피해!', type: 'echo' },
    { id: '4', msg: '🃏 [응급 처치]: 5 회복', type: 'card-log' },
  ];

  expect(selectRecentCombatFeedEntries(entries).map((entry) => entry.id)).toEqual(['2', '3', '4']);
});
```

- [ ] **Step 4: Run the tests again to confirm the selector contract is still failing**

Run: `npm test -- tests/combat_recent_feed_selector.test.js`
Expected: FAIL with missing export or assertion failures.

- [ ] **Step 5: Commit the test-only scaffold**

```bash
git add tests/combat_recent_feed_selector.test.js
git commit -m "test: define recent combat feed selector behavior"
```

### Task 2: Implement the selector with minimal metadata assumptions

**Files:**
- Create: `game/features/combat/presentation/browser/combat_recent_feed_selector.js`
- Test: `tests/combat_recent_feed_selector.test.js`

- [ ] **Step 1: Write the minimal selector implementation**

```js
const MAX_RECENT_COMBAT_FEED = 3;
const EXCLUDED_TYPES = new Set(['system', 'turn-divider']);

function isRecentFeedEligible(entry) {
  if (!entry?.msg || EXCLUDED_TYPES.has(entry.type)) return false;
  if (entry.type === 'card-log' || entry.type === 'buff' || entry.type === 'echo') return true;
  return false;
}

export function selectRecentCombatFeedEntries(logEntries = []) {
  return logEntries.filter(isRecentFeedEligible).slice(-MAX_RECENT_COMBAT_FEED);
}
```

- [ ] **Step 2: Refine the implementation to match the spec, not just the first passing shape**

Implementation notes:
- Exclude enemy attack lines that happen to use `damage` type.
- Include clearly player-triggered non-card entries only when the message/source can be attributed.
- Keep formatting/compression logic here if it is needed for DOM rendering, but keep it pure.

- [ ] **Step 3: Run selector tests and make them pass**

Run: `npm test -- tests/combat_recent_feed_selector.test.js`
Expected: PASS

- [ ] **Step 4: Run related log UI tests to catch integration assumptions**

Run: `npm test -- tests/combat_hud_log_ui.test.js`
Expected: PASS or fail only for expected API changes to be handled in Chunk 2.

- [ ] **Step 5: Commit the selector implementation**

```bash
git add game/features/combat/presentation/browser/combat_recent_feed_selector.js tests/combat_recent_feed_selector.test.js
git commit -m "feat: add recent combat feed selector"
```

## Chunk 2: HUD Integration And Reset Behavior

### Task 3: Add HUD markup for the recent feed

**Files:**
- Modify: `index.html`
- Reference: `docs/superpowers/specs/2026-03-22-combat-log-recent-feed-design.md`

- [ ] **Step 1: Add a new recent-feed container above the action buttons**

```html
<div class="recent-combat-feed" id="recentCombatFeed" aria-live="polite"></div>
<div class="combat-actions">
```

- [ ] **Step 2: Decide the old `combatLog` shell treatment with the smallest viable markup change**

Use one of these approaches:
- keep `#combatLog` in DOM for compatibility but hide/de-emphasize it in combat HUD CSS
- or move it out of the visible arena if tests and reset hooks remain straightforward

Do not remove it blindly before checking all reset and rendering call sites.

- [ ] **Step 3: Run the most local tests that depend on combat start/reset markup assumptions**

Run: `npm test -- tests/combat_start_render_ui.test.js`
Expected: PASS or fail only for the new feed-reset expectation added later in this chunk.

- [ ] **Step 4: Commit the markup change**

```bash
git add index.html
git commit -m "feat: add recent combat feed container"
```

### Task 4: Update combat log presentation helpers to render the feed

**Files:**
- Modify: `game/features/combat/presentation/browser/combat_hud_log_ui.js`
- Modify: `game/features/combat/presentation/browser/combat_hud_ui.js`
- Modify: `tests/combat_hud_log_ui.test.js`

- [ ] **Step 1: Write failing DOM tests for the recent feed container**

Add coverage for:
- rendering recent-feed entries into `#recentCombatFeed`
- keeping only the latest 3 eligible entries
- clearing the feed when no eligible entries remain
- leaving full-log behavior intact for `#combatLog`

Example assertion shape:

```js
expect(doc.getElementById('recentCombatFeed').children).toHaveLength(3);
expect(doc.getElementById('recentCombatFeed').children[2].textContent).toContain('응급 처치');
expect(doc.getElementById('combatLog').children.length).toBeGreaterThan(0);
```

- [ ] **Step 2: Run the targeted DOM test file and confirm failure**

Run: `npm test -- tests/combat_hud_log_ui.test.js`
Expected: FAIL because the recent feed container is not rendered yet.

- [ ] **Step 3: Implement minimal DOM support in `combat_hud_log_ui.js`**

Implementation constraints:
- Keep pure filtering/selection logic in `combat_recent_feed_selector.js`
- Keep `updateCombatLog(...)` as the public entrypoint if possible to avoid touching runtime wiring
- Render both surfaces from the same `logEntries` input
- Scroll only the full log surface if that behavior still applies

- [ ] **Step 4: Update `combat_hud_ui.js` only if the public API must change**

Preferred outcome:
- keep `CombatHudUI.updateCombatLog(deps)` unchanged
- keep runtime subscriber wiring untouched

- [ ] **Step 5: Run DOM tests until they pass**

Run: `npm test -- tests/combat_hud_log_ui.test.js`
Expected: PASS

- [ ] **Step 6: Commit the presentation-layer update**

```bash
git add game/features/combat/presentation/browser/combat_hud_log_ui.js game/features/combat/presentation/browser/combat_hud_ui.js tests/combat_hud_log_ui.test.js
git commit -m "feat: render recent combat feed in hud"
```

### Task 5: Add styling for the new feed and retire the old primary anchor

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Add the compact recent-feed style block**

CSS requirements:
- position the feed above `.combat-actions`
- keep the feed compact, centered, and always visible during combat
- show up to 3 lines on standard screens
- reduce to 2 lines or tighter spacing on narrow screens
- preserve readable type contrast without dominating the screen

- [ ] **Step 2: Neutralize the old left-fixed `.combat-log` behavior**

Do not leave this behavior active:

```css
.combat-log {
  position: fixed;
  left: 20px;
  top: 50%;
}
```

Replace it with the minimum CSS needed so the old surface no longer competes as the main reading anchor.

- [ ] **Step 3: Run a build-safe verification of CSS/test coupling**

Run: `npm test -- tests/combat_hud_log_ui.test.js tests/combat_start_render_ui.test.js tests/hud_effects_ui.test.js`
Expected: PASS

- [ ] **Step 4: Commit the HUD styling**

```bash
git add css/styles.css
git commit -m "style: reposition combat feedback into recent feed"
```

### Task 6: Ensure combat reset paths clear the recent feed

**Files:**
- Modify: `game/features/combat/presentation/browser/combat_start_render_ui.js`
- Modify: `game/features/combat/presentation/browser/hud_effects_ui.js`
- Modify: `tests/combat_start_render_ui.test.js`
- Modify: `tests/hud_effects_ui.test.js`

- [ ] **Step 1: Add failing reset tests**

Add expectations that both reset paths clear `#recentCombatFeed`:

```js
expect(doc.getElementById('recentCombatFeed').textContent).toBe('');
```

- [ ] **Step 2: Run the reset-focused tests and confirm failure**

Run: `npm test -- tests/combat_start_render_ui.test.js tests/hud_effects_ui.test.js`
Expected: FAIL because reset logic only clears `#combatLog`.

- [ ] **Step 3: Implement minimal reset support**

Implementation rule:
- clear `#recentCombatFeed` alongside `#combatLog`
- do not change unrelated reset behavior

- [ ] **Step 4: Run the reset-focused tests again**

Run: `npm test -- tests/combat_start_render_ui.test.js tests/hud_effects_ui.test.js`
Expected: PASS

- [ ] **Step 5: Commit the reset-path fix**

```bash
git add game/features/combat/presentation/browser/combat_start_render_ui.js game/features/combat/presentation/browser/hud_effects_ui.js tests/combat_start_render_ui.test.js tests/hud_effects_ui.test.js
git commit -m "fix: clear recent combat feed on reset"
```

## Chunk 3: Full Verification And Handoff

### Task 7: Run repository validations required by the repo contract

**Files:**
- Verify only; no planned file edits

- [ ] **Step 1: Run targeted combat UI tests as a preflight**

Run:

```bash
npm test -- tests/combat_recent_feed_selector.test.js \
  tests/combat_hud_log_ui.test.js \
  tests/combat_start_render_ui.test.js \
  tests/hud_effects_ui.test.js
```

Expected: PASS

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run lint because this changes UI boundaries and state-flow-adjacent presentation**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: Run build because this is a user-visible browser change**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Run browser smoke validation**

Manual flow:
- start the app
- click `#mainStartBtn`
- confirm character select renders
- enter combat
- play a card
- confirm the recent feed updates above the action bar
- open `전투 기록 (L)` and confirm full history still exists
- confirm no console/page errors

- [ ] **Step 6: Commit the validated feature branch state**

```bash
git status --short
git add index.html css/styles.css \
  game/features/combat/presentation/browser/combat_recent_feed_selector.js \
  game/features/combat/presentation/browser/combat_hud_log_ui.js \
  game/features/combat/presentation/browser/combat_hud_ui.js \
  game/features/combat/presentation/browser/combat_start_render_ui.js \
  game/features/combat/presentation/browser/hud_effects_ui.js \
  tests/combat_recent_feed_selector.test.js \
  tests/combat_hud_log_ui.test.js \
  tests/combat_start_render_ui.test.js \
  tests/hud_effects_ui.test.js
git commit -m "feat: add recent combat feed"
```

## Notes For The Implementer

- Work in a clean, isolated write scope because this repository currently has unrelated local changes.
- Prefer preserving the existing `updateCombatLog` runtime wiring unless a test forces an API change.
- If selector rules become too brittle with current log message strings, add only the smallest metadata needed to disambiguate player-triggered results.
- Do not modify generated artifacts, config policy files, or unrelated title/character-select work while implementing this plan.
