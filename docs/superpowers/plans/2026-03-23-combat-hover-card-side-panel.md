# Combat Hover Card Side Panel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework combat hand-card hover into a true enlarged card with left-aligned readable body copy and a keyword-driven side panel that appears only on secondary hover intent.

**Architecture:** Keep `HandCardCloneUI` as the primary combat hand-card hover system and extend it rather than reviving the old fixed tooltip path for hand cards. Reuse the shared hover card frame for structure and state styling, then add a hover-only mechanics badge row plus a docked side panel controller so supplemental explanations remain opt-in.

**Tech Stack:** JavaScript, Vitest, Vite, Playwright smoke script, repository CSS in `css/styles.css`

---

## Chunk 1: File Map And Execution Order

### Planned File Responsibilities

**Modify:**

- `game/features/combat/presentation/browser/card_ui.js`
  Stop routing hand-card hover through `showTooltipHandler` for unplayable cards and always attach the clone-based hover path.
- `game/features/combat/presentation/browser/card_clone_ui.js`
  Own hover lifecycle, secondary-hover panel open/close behavior, and viewport-safe clone/panel placement.
- `game/features/combat/presentation/browser/card_clone_render_ui.js`
  Build the enlarged hover card shell, hover-only support sections, and side-panel DOM hooks.
- `game/features/combat/presentation/browser/combat_card_frame_ui.js`
  Expose hover-specific frame sections and support left-aligned hover body content without changing hand-card structure.
- `game/features/combat/presentation/browser/card_clone_runtime_ui.js`
  Expand runtime positioning so the enlarged card and docked side panel stay within viewport bounds.
- `game/features/combat/presentation/browser/combat_copy.js`
  Rework keyword-panel helpers so hover cards can render inline mechanic triggers and a conditional side panel from the same combat keyword map.
- `css/styles.css`
  Replace center-stacked hover copy styling with enlarged-card styling, hover support rows, hidden-by-default side panel, and left/right dock placement states.

**Test:**

- `tests/card_ui.test.js`
- `tests/card_clone_render_ui.test.js`
- `tests/card_clone_ui.test.js`
- `tests/card_clone_runtime_ui.test.js`
- `tests/combat_card_frame_ui.test.js`

---

### Task 1: Lock The Hover Regression Targets With Tests

**Files:**
- Modify: `tests/card_ui.test.js`
- Modify: `tests/card_clone_render_ui.test.js`
- Modify: `tests/card_clone_ui.test.js`
- Modify: `tests/card_clone_runtime_ui.test.js`
- Modify: `tests/combat_card_frame_ui.test.js`

- [ ] **Step 1: Add a failing `card_ui` test that renders an unplayable hand card and asserts `HandCardCloneUI.attachToCard(...)` still receives it**

Expected assertion shape:

```js
expect(attachToCardSpy).toHaveBeenCalledWith(
  expect.anything(),
  'heavy_blow',
  data.cards.heavy_blow,
  expect.objectContaining({ canPlay: false, displayCost: 3 }),
  expect.objectContaining({ doc }),
);
```

- [ ] **Step 2: Add a failing `card_clone_render_ui` test that expects hover clones to render a hover-only mechanics trigger row and a keyword panel that is present but inactive by default**

Expected checks:

```js
expect(clone.children.some((child) => child.className === 'card-hover-mechanics')).toBe(true);
expect(clone.children.find((child) => child.className === 'card-clone-keyword-panel')?.dataset?.open).toBe('false');
```

- [ ] **Step 3: Add a failing `combat_card_frame_ui` test that expects hover descriptions to use the hover-readable variant classes instead of the old centered tooltip-style text block**

Expected checks:

```js
expect(desc.className).toContain('card-desc-hover');
expect(desc.className).toContain('card-desc-hover-readable');
```

- [ ] **Step 4: Add a failing `card_clone_ui` interaction test that enters a clone, hovers a mechanics trigger, and asserts the side panel opens and stays open while moving from trigger to panel**

Expected checks:

```js
expect(keywordPanel.dataset.open).toBe('true');
expect(layer.children).toContain(clone);
```

- [ ] **Step 5: Add a failing `card_clone_runtime_ui` test that forces the clone near the right edge and asserts the docked side panel flips to the left instead of overflowing**

Expected checks:

```js
expect(clone.dataset.keywordPlacement).toBe('left');
```

- [ ] **Step 6: Run the focused test set and confirm at least the new hover assertions fail**

Run:

```bash
npx vitest run tests/card_ui.test.js tests/card_clone_render_ui.test.js tests/card_clone_ui.test.js tests/card_clone_runtime_ui.test.js tests/combat_card_frame_ui.test.js
```

Expected:

- FAIL on the new unplayable-clone assertion
- FAIL on the missing mechanics row / closed-by-default panel assertions
- FAIL on the side-panel placement assertion

- [ ] **Step 7: Commit the red test baseline**

```bash
git add tests/card_ui.test.js tests/card_clone_render_ui.test.js tests/card_clone_ui.test.js tests/card_clone_runtime_ui.test.js tests/combat_card_frame_ui.test.js
git commit -m "test: lock combat hover card side panel regressions"
```

---

### Task 2: Unify Hand-Card Hover Entry Onto The Clone Path

**Files:**
- Modify: `game/features/combat/presentation/browser/card_ui.js`
- Modify: `game/features/combat/presentation/browser/card_clone_ui.js`
- Test: `tests/card_ui.test.js`
- Test: `tests/card_clone_ui.test.js`

- [ ] **Step 1: Remove the `!canPlay` tooltip-only hand-card branch in `card_ui.js` and always call `HandCardCloneUI.attachToCard(...)`**

Target change:

```js
HandCardCloneUI.attachToCard(el, cardId, card, {
  displayCost: cost,
  canPlay,
  anyFree,
  totalDisc,
  energy: gs.player.energy,
}, { doc, descriptionUtils });
```

- [ ] **Step 2: Update `HandCardCloneUI.attachToCard(...)` so it no longer returns early for `!canPlay` and instead uses the same enlarged card path with disabled visual state intact**

- [ ] **Step 3: Preserve existing card click/drag behavior while making hover preview availability independent from playability**

- [ ] **Step 4: Re-run the focused `card_ui` and `card_clone_ui` tests**

Run:

```bash
npx vitest run tests/card_ui.test.js tests/card_clone_ui.test.js
```

Expected:

- PASS for the new unplayable hover attachment case
- PASS for existing playable hover lifecycle behavior

- [ ] **Step 5: Commit the hand-hover entrypoint unification**

```bash
git add game/features/combat/presentation/browser/card_ui.js game/features/combat/presentation/browser/card_clone_ui.js tests/card_ui.test.js tests/card_clone_ui.test.js
git commit -m "feat: unify combat hand hover on clone previews"
```

---

## Chunk 2: Hover Card Structure, Mechanics Triggers, And Docked Panel

### Task 3: Rebuild The Hover Card As A Readable Enlarged Card

**Files:**
- Modify: `game/features/combat/presentation/browser/combat_card_frame_ui.js`
- Modify: `game/features/combat/presentation/browser/card_clone_render_ui.js`
- Modify: `css/styles.css`
- Test: `tests/combat_card_frame_ui.test.js`
- Test: `tests/card_clone_render_ui.test.js`

- [ ] **Step 1: Extend `populateCombatCardFrame(...)` with a hover-readable body variant so hover cards keep the shared order but can opt into left-aligned body copy and support rows**

Implementation target:

```js
const desc = doc.createElement('div');
desc.className = [
  'card-desc',
  variant === 'hover' ? 'card-desc-hover card-desc-hover-readable' : '',
].filter(Boolean).join(' ');
```

- [ ] **Step 2: In `card_clone_render_ui.js`, add a hover-only mechanics trigger row between description and type using `resolveCombatKeywordTooltips(card)` data**

Implementation target:

```js
const mechanicsRow = doc.createElement('div');
mechanicsRow.className = 'card-hover-mechanics';
```

- [ ] **Step 3: Keep the card face hierarchy intact**

Rules to implement:

- rarity tag top-center
- cost badge top-right
- icon and name centered
- description left-aligned
- prediction/support info left-aligned
- type label remains bottom-most

- [ ] **Step 4: Update `css/styles.css` so hover cards read like enlarged hand cards rather than centered tooltips**

Required style changes:

- enlarge hover width/height using the existing clone silhouette
- switch `.card-desc-hover` to left alignment
- add spacing for support/mechanics rows
- soften inner framing so the outer card remains dominant

- [ ] **Step 5: Re-run the focused render tests**

Run:

```bash
npx vitest run tests/combat_card_frame_ui.test.js tests/card_clone_render_ui.test.js
```

Expected:

- PASS for hover-readable frame classes
- PASS for mechanics trigger row presence

- [ ] **Step 6: Commit the enlarged-card structure update**

```bash
git add game/features/combat/presentation/browser/combat_card_frame_ui.js game/features/combat/presentation/browser/card_clone_render_ui.js css/styles.css tests/combat_card_frame_ui.test.js tests/card_clone_render_ui.test.js
git commit -m "feat: restyle combat hover cards as readable enlarged cards"
```

---

### Task 4: Convert The Always-On Keyword Dock Into A Conditional Side Panel

**Files:**
- Modify: `game/features/combat/presentation/browser/combat_copy.js`
- Modify: `game/features/combat/presentation/browser/card_clone_render_ui.js`
- Modify: `game/features/combat/presentation/browser/card_clone_ui.js`
- Modify: `game/features/combat/presentation/browser/card_clone_runtime_ui.js`
- Modify: `css/styles.css`
- Test: `tests/card_clone_render_ui.test.js`
- Test: `tests/card_clone_ui.test.js`
- Test: `tests/card_clone_runtime_ui.test.js`

- [ ] **Step 1: Replace the current always-visible keyword tabs/panel builder with a helper that returns**

Required pieces:

- inline mechanics triggers inside the card
- a side panel element with `data-open="false"` on initial render
- one activation function that can switch the panel body to the hovered keyword

- [ ] **Step 2: Wire `card_clone_ui.js` hover events so mechanics-trigger `mouseenter` opens the side panel and panel `mouseleave` closes it without collapsing the whole clone**

Implementation target:

```js
trigger.addEventListener('mouseenter', () => openKeywordPanel(keywordKey));
panel.addEventListener('mouseleave', queuePanelHide);
```

- [ ] **Step 3: Update runtime placement so `cloneEl.__onClonePositionChange(...)` also sets `cloneEl.dataset.keywordPlacement` and keeps the panel anchored right-by-default with left fallback**

- [ ] **Step 4: Keep the primary clone visible while the pointer moves through this chain**

Required pointer path:

- source card
- enlarged clone
- mechanics trigger
- side panel

- [ ] **Step 5: Update CSS for the hidden/open panel states and left/right dock variations**

Required classes or state hooks:

- `.card-clone-keyword-panel[data-open="false"]`
- `.card-clone[data-keyword-placement="left"]`
- `.card-clone[data-keyword-placement="right"]`

- [ ] **Step 6: Re-run the focused interaction and runtime tests**

Run:

```bash
npx vitest run tests/card_clone_render_ui.test.js tests/card_clone_ui.test.js tests/card_clone_runtime_ui.test.js
```

Expected:

- PASS for closed-by-default panel
- PASS for trigger-to-panel hover persistence
- PASS for left-fallback placement near the viewport edge

- [ ] **Step 7: Commit the side-panel interaction layer**

```bash
git add game/features/combat/presentation/browser/combat_copy.js game/features/combat/presentation/browser/card_clone_render_ui.js game/features/combat/presentation/browser/card_clone_ui.js game/features/combat/presentation/browser/card_clone_runtime_ui.js css/styles.css tests/card_clone_render_ui.test.js tests/card_clone_ui.test.js tests/card_clone_runtime_ui.test.js
git commit -m "feat: add conditional side panel for combat hover cards"
```

---

## Chunk 3: Full Verification

### Task 5: Verify Hover Card Behavior End To End

**Files:**
- Modify: none

- [ ] **Step 1: Run the focused hover-card Vitest suite**

```bash
npx vitest run tests/card_ui.test.js tests/card_clone_render_ui.test.js tests/card_clone_ui.test.js tests/card_clone_runtime_ui.test.js tests/combat_card_frame_ui.test.js
```

Expected:

- PASS with no hover-card regressions

- [ ] **Step 2: Run the full repository test suite because hand-card hover is shared combat UI behavior**

```bash
npm test
```

Expected:

- PASS

- [ ] **Step 3: Run `npm run build` because the change is user-visible browser UI work**

```bash
npm run build
```

Expected:

- PASS

- [ ] **Step 4: Start a local Vite server if one is not already running**

```bash
npm run dev -- --host 127.0.0.1 --port 8000
```

Expected:

- local server available at `http://127.0.0.1:8000`

- [ ] **Step 5: Run the combat smoke script against that server**

```bash
SMOKE_URL=http://127.0.0.1:8000 npm run smoke:combat-ui
```

Expected:

- PASS
- output written under `output/web-game/refactor-smoke-combat-ui`

- [ ] **Step 6: Perform a manual browser spot-check on the exact UX this change targets**

Required checks:

- hover a playable hand card and confirm the enlarged card appears alone first
- hover a mechanics trigger inside the enlarged card and confirm the side panel opens
- hover an unplayable hand card and confirm it still uses the enlarged hover card instead of the old tooltip path
- move to a card near the right viewport edge and confirm the side panel flips left
- confirm no console or page errors after `#mainStartBtn` flow and character select render

- [ ] **Step 7: Report exact commands and outcomes, then commit the verification notes or final code batch**

```bash
git status --short
```
