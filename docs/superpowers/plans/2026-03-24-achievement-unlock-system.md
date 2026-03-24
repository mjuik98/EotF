# Achievement Unlock System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build phase-1 achievement and content unlock infrastructure, wire it into run outcomes, and gate run curses through the new unlock state.

**Architecture:** Keep progression causes and runtime availability separate. Store achievement progress in `meta.achievements`, resolved content availability in `meta.contentUnlocks`, and expose shared query helpers so run setup can gate curses without embedding achievement logic. Start with run-completed and boss-defeated triggers, then keep relic and card support as definition-level and query-level infrastructure only.

**Tech Stack:** JavaScript ES modules, Vitest, Vite browser runtime, existing run feature state and presentation modules

---

## Chunk 1: Progression State and Definitions

### Task 1: Add default progression containers to run meta

**Files:**
- Modify: `game/features/run/domain/run_rules_meta.js`
- Modify: `tests/run_rules_preview_meta.test.js`
- Modify: `tests/run_config_state_commands.test.js`

- [ ] **Step 1: Write the failing meta initialization test**

Add a test to `tests/run_rules_preview_meta.test.js` that verifies `RunRules.ensureMeta(meta)` creates the new containers and preserves legacy run unlocks:

```js
it('initializes achievement and content unlock containers', () => {
  const meta = {
    runCount: 1,
    unlocks: { ascension: true, endless: false },
    runConfig: { ascension: 0, endless: false, curse: 'none', disabledInscriptions: [] },
  };

  RunRules.ensureMeta(meta);

  expect(meta.achievements).toEqual({
    version: 1,
    states: {},
  });
  expect(meta.contentUnlocks).toEqual({
    version: 1,
    curses: {},
    relics: {},
    cards: { shared: {} },
  });
  expect(meta.unlocks.ascension).toBe(true);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- tests/run_rules_preview_meta.test.js`

Expected: FAIL because `meta.achievements` and `meta.contentUnlocks` do not exist yet.

- [ ] **Step 3: Implement meta normalization**

Update `game/features/run/domain/run_rules_meta.js` so `ensureRunMeta(...)` creates and normalizes:

```js
if (!meta.achievements || typeof meta.achievements !== 'object') {
  meta.achievements = { version: 1, states: {} };
}
if (!Number.isFinite(meta.achievements.version)) meta.achievements.version = 1;
if (!meta.achievements.states || typeof meta.achievements.states !== 'object') {
  meta.achievements.states = {};
}

if (!meta.contentUnlocks || typeof meta.contentUnlocks !== 'object') {
  meta.contentUnlocks = { version: 1, curses: {}, relics: {}, cards: { shared: {} } };
}
if (!Number.isFinite(meta.contentUnlocks.version)) meta.contentUnlocks.version = 1;
if (!meta.contentUnlocks.curses || typeof meta.contentUnlocks.curses !== 'object') meta.contentUnlocks.curses = {};
if (!meta.contentUnlocks.relics || typeof meta.contentUnlocks.relics !== 'object') meta.contentUnlocks.relics = {};
if (!meta.contentUnlocks.cards || typeof meta.contentUnlocks.cards !== 'object') {
  meta.contentUnlocks.cards = { shared: {} };
}
if (!meta.contentUnlocks.cards.shared || typeof meta.contentUnlocks.cards.shared !== 'object') {
  meta.contentUnlocks.cards.shared = {};
}
```

Keep this normalization additive only. Do not fold it into `meta.unlocks`.

- [ ] **Step 4: Add a focused run-config compatibility test**

Extend `tests/run_config_state_commands.test.js` with a case that loads a preset containing a now-locked or unknown curse and expects fallback to `'none'`:

```js
it('falls back to none when loading an unavailable curse preset', () => {
  const meta = createMeta();
  meta.runConfigPresets[0] = {
    id: 'preset-1',
    name: 'Locked curse',
    config: { ascension: 0, endless: false, curse: 'blood_moon', disabledInscriptions: [] },
  };

  const loaded = loadRunConfigPreset(meta, 0, { curses: { none: {} } });

  expect(loaded.curse).toBe('none');
});
```

- [ ] **Step 5: Run both focused tests to verify they pass**

Run: `npm test -- tests/run_rules_preview_meta.test.js tests/run_config_state_commands.test.js`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add tests/run_rules_preview_meta.test.js tests/run_config_state_commands.test.js game/features/run/domain/run_rules_meta.js
git commit -m "feat: add achievement unlock meta containers"
```

### Task 2: Define achievements, unlockables, and shared query helpers

**Files:**
- Create: `game/features/meta_progression/domain/achievement_definitions.js`
- Create: `game/features/meta_progression/domain/unlockable_definitions.js`
- Create: `game/features/meta_progression/domain/content_unlock_queries.js`
- Create: `tests/content_unlock_queries.test.js`
- Create: `tests/achievement_definitions.test.js`

- [ ] **Step 1: Write the failing definition and query tests**

Create `tests/achievement_definitions.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../game/features/meta_progression/domain/achievement_definitions.js';
import { UNLOCKABLES } from '../game/features/meta_progression/domain/unlockable_definitions.js';

describe('achievement definitions', () => {
  it('declares the initial curse unlock achievements', () => {
    expect(ACHIEVEMENTS.first_victory.trigger).toBe('run_completed');
    expect(ACHIEVEMENTS.boss_hunter_1.trigger).toBe('boss_defeated');
    expect(UNLOCKABLES.curses.blood_moon.requires).toEqual(['first_victory']);
  });
});
```

Create `tests/content_unlock_queries.test.js`:

```js
import { describe, expect, it } from 'vitest';
import {
  getContentVisibility,
  isContentUnlocked,
} from '../game/features/meta_progression/domain/content_unlock_queries.js';

describe('content unlock queries', () => {
  it('reports locked-visible curses before unlock', () => {
    const meta = {
      contentUnlocks: { curses: {}, relics: {}, cards: { shared: {} } },
    };

    expect(isContentUnlocked(meta, { type: 'curse', id: 'blood_moon' })).toBe(false);
    expect(getContentVisibility(meta, { type: 'curse', id: 'blood_moon' })).toBe('locked-visible');
  });
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `npm test -- tests/achievement_definitions.test.js tests/content_unlock_queries.test.js`

Expected: FAIL because the new modules do not exist yet.

- [ ] **Step 3: Add definition modules**

Create `game/features/meta_progression/domain/achievement_definitions.js`:

```js
export const ACHIEVEMENTS = Object.freeze({
  first_victory: {
    id: 'first_victory',
    trigger: 'run_completed',
    category: 'run',
    scope: 'account',
    condition: { type: 'victories', count: 1 },
    rewards: [{ type: 'unlock', contentType: 'curse', contentId: 'blood_moon' }],
  },
  boss_hunter_1: {
    id: 'boss_hunter_1',
    trigger: 'boss_defeated',
    category: 'boss',
    scope: 'account',
    condition: { type: 'boss_kills', count: 3 },
    rewards: [{ type: 'unlock', contentType: 'curse', contentId: 'grave_toll' }],
  },
  cursed_conqueror_1: {
    id: 'cursed_conqueror_1',
    trigger: 'run_completed',
    category: 'challenge',
    scope: 'account',
    condition: { type: 'cursed_victories', count: 1 },
    rewards: [{ type: 'unlock', contentType: 'curse', contentId: 'void_oath' }],
  },
});
```

Keep the first implementation intentionally small. Do not add relic or card entries yet.

Create `game/features/meta_progression/domain/unlockable_definitions.js`:

```js
export const UNLOCKABLES = Object.freeze({
  curses: {
    blood_moon: { id: 'blood_moon', scope: 'account', requires: ['first_victory'], visibleBeforeUnlock: true },
    grave_toll: { id: 'grave_toll', scope: 'account', requires: ['boss_hunter_1'], visibleBeforeUnlock: true },
    void_oath: { id: 'void_oath', scope: 'account', requires: ['cursed_conqueror_1'], visibleBeforeUnlock: true },
  },
  relics: {},
  cards: {},
});
```

- [ ] **Step 4: Add shared query helpers**

Create `game/features/meta_progression/domain/content_unlock_queries.js`:

```js
import { UNLOCKABLES } from './unlockable_definitions.js';

function getUnlockBucket(meta, type) {
  return meta?.contentUnlocks?.[`${type}s`] || {};
}

export function isContentUnlocked(meta, { type, id, classId } = {}) {
  if (!type || !id) return false;
  if (type === 'card' && classId) {
    return !!meta?.contentUnlocks?.cards?.[classId]?.[id]?.unlocked;
  }
  return !!getUnlockBucket(meta, type)[id]?.unlocked;
}

export function getContentVisibility(meta, { type, id, classId } = {}) {
  const definition = type === 'card' && classId
    ? UNLOCKABLES.cards?.[id]
    : UNLOCKABLES[`${type}s`]?.[id];
  if (!definition) return 'hidden';
  if (isContentUnlocked(meta, { type, id, classId })) return 'visible';
  return definition.visibleBeforeUnlock ? 'locked-visible' : 'hidden';
}
```

Add `getUnlockedContent(...)` in the same file if another task needs list filtering immediately; otherwise stub it now only if tests require it.

- [ ] **Step 5: Run the focused tests to verify they pass**

Run: `npm test -- tests/achievement_definitions.test.js tests/content_unlock_queries.test.js`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add tests/achievement_definitions.test.js tests/content_unlock_queries.test.js game/features/meta_progression/domain/achievement_definitions.js game/features/meta_progression/domain/unlockable_definitions.js game/features/meta_progression/domain/content_unlock_queries.js
git commit -m "feat: add achievement and unlock definitions"
```

## Chunk 2: Evaluation, Integration, and Curse Gating

### Task 3: Add trigger-based progression evaluation and unlock resolution

**Files:**
- Create: `game/features/meta_progression/application/evaluate_achievement_trigger.js`
- Create: `game/features/meta_progression/application/apply_content_unlock_rewards.js`
- Create: `tests/evaluate_achievement_trigger.test.js`

- [ ] **Step 1: Write the failing evaluator tests**

Create `tests/evaluate_achievement_trigger.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { evaluateAchievementTrigger } from '../game/features/meta_progression/application/evaluate_achievement_trigger.js';

describe('evaluate achievement trigger', () => {
  it('unlocks first_victory from a run-completed victory event', () => {
    const meta = {
      achievements: { version: 1, states: {} },
      contentUnlocks: { version: 1, curses: {}, relics: {}, cards: { shared: {} } },
      progress: { victories: 1, bossKills: {} },
    };

    const result = evaluateAchievementTrigger(meta, 'run_completed', {
      kind: 'victory',
      runConfig: { curse: 'none' },
    });

    expect(result.newlyUnlockedAchievements).toEqual(['first_victory']);
    expect(result.newlyUnlockedContent).toEqual([
      { type: 'curse', id: 'blood_moon', source: 'first_victory' },
    ]);
    expect(meta.achievements.states.first_victory.unlocked).toBe(true);
    expect(meta.contentUnlocks.curses.blood_moon.unlocked).toBe(true);
  });
});
```

Add a second test for `boss_defeated` that increments toward `boss_hunter_1` without unlocking until the third kill.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- tests/evaluate_achievement_trigger.test.js`

Expected: FAIL because the evaluator module does not exist yet.

- [ ] **Step 3: Implement evaluator and reward applier**

Create `game/features/meta_progression/application/apply_content_unlock_rewards.js`:

```js
export function applyContentUnlockRewards(meta, rewards = [], achievementId, now = Date.now()) {
  const unlocked = [];
  for (const reward of rewards) {
    if (reward?.type !== 'unlock') continue;
    const bucket = meta.contentUnlocks?.[`${reward.contentType}s`];
    if (!bucket || bucket[reward.contentId]?.unlocked) continue;
    bucket[reward.contentId] = {
      unlocked: true,
      unlockedAt: now,
      source: achievementId,
    };
    unlocked.push({ type: reward.contentType, id: reward.contentId, source: achievementId });
  }
  return unlocked;
}
```

Create `game/features/meta_progression/application/evaluate_achievement_trigger.js`:

```js
import { ACHIEVEMENTS } from '../domain/achievement_definitions.js';
import { applyContentUnlockRewards } from './apply_content_unlock_rewards.js';

function isAchievementSatisfied(meta, definition, context = {}) {
  switch (definition.condition.type) {
    case 'victories':
      return Number(meta?.progress?.victories || 0) >= definition.condition.count && context.kind === 'victory';
    case 'boss_kills':
      return Number(context.totalBossKills || 0) >= definition.condition.count;
    case 'cursed_victories':
      return context.kind === 'victory' && context.runConfig?.curse && context.runConfig.curse !== 'none';
    default:
      return false;
  }
}

export function evaluateAchievementTrigger(meta, trigger, context = {}) {
  const newlyUnlockedAchievements = [];
  const newlyUnlockedContent = [];

  for (const definition of Object.values(ACHIEVEMENTS)) {
    if (definition.trigger !== trigger) continue;
    const state = meta.achievements.states[definition.id] || { unlocked: false, progress: 0 };
    meta.achievements.states[definition.id] = state;
    if (state.unlocked) continue;
    if (!isAchievementSatisfied(meta, definition, context)) continue;

    state.unlocked = true;
    state.unlockedAt = Date.now();
    state.progress = definition.condition.count;
    newlyUnlockedAchievements.push(definition.id);
    newlyUnlockedContent.push(
      ...applyContentUnlockRewards(meta, definition.rewards, definition.id, state.unlockedAt),
    );
  }

  return { newlyUnlockedAchievements, newlyUnlockedContent };
}
```

Keep condition handling narrow. Do not prematurely generalize beyond the initial three achievements.

- [ ] **Step 4: Run the focused tests to verify they pass**

Run: `npm test -- tests/evaluate_achievement_trigger.test.js`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/evaluate_achievement_trigger.test.js game/features/meta_progression/application/evaluate_achievement_trigger.js game/features/meta_progression/application/apply_content_unlock_rewards.js
git commit -m "feat: add achievement trigger evaluator"
```

### Task 4: Wire progression evaluation into run outcome handling

**Files:**
- Modify: `game/features/run/application/run_rule_outcome.js`
- Modify: `game/features/run/state/run_outcome_state_commands.js`
- Create: `tests/run_rule_outcome_progression.test.js`

- [ ] **Step 1: Write the failing run-outcome integration test**

Create `tests/run_rule_outcome_progression.test.js`:

```js
import { describe, expect, it, vi } from 'vitest';
import { finalizeRunOutcome } from '../game/features/run/application/run_rule_outcome.js';

describe('run outcome progression integration', () => {
  it('evaluates run_completed achievements after a victory', () => {
    const gs = {
      _runOutcomeCommitted: false,
      currentRegion: 0,
      runConfig: { ascension: 0, endless: false, curse: 'none', disabledInscriptions: [] },
      worldMemory: {},
      stats: { _runStartTs: 0, _regionStartTs: 0, regionClearTimes: {} },
      meta: {
        unlocks: { ascension: true, endless: false },
        worldMemory: {},
        runCount: 1,
        achievements: { version: 1, states: {} },
        contentUnlocks: { version: 1, curses: {}, relics: {}, cards: { shared: {} } },
        progress: { victories: 0, failures: 0, echoShards: 0, totalDamage: 0, bossKills: {} },
      },
    };

    finalizeRunOutcome('victory', {}, { gs, saveSystem: { saveMeta: vi.fn(), clearSave: vi.fn() } });

    expect(gs.meta.achievements.states.first_victory.unlocked).toBe(true);
    expect(gs.meta.contentUnlocks.curses.blood_moon.unlocked).toBe(true);
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- tests/run_rule_outcome_progression.test.js`

Expected: FAIL because run outcome does not invoke the progression evaluator yet.

- [ ] **Step 3: Implement the integration**

In `game/features/run/application/run_rule_outcome.js`, import the evaluator and run it after progress has been recorded:

```js
import { evaluateAchievementTrigger } from '../../meta_progression/application/evaluate_achievement_trigger.js';

// after recordRunVictory/recordRunDefeat and before persistRunOutcomeMeta(deps)
evaluateAchievementTrigger(gs.meta, 'run_completed', {
  kind,
  runConfig: gs.runConfig,
  totalBossKills: Object.values(gs.meta.progress?.bossKills || {}).reduce((sum, count) => sum + (Number(count) || 0), 0),
});
```

In `game/features/run/state/run_outcome_state_commands.js`, keep `recordVictoryProgress` and `recordDefeatProgress` responsible only for numeric progress bookkeeping. If boss kill totals are not tracked cleanly yet, add a small helper rather than overloading the evaluator.

- [ ] **Step 4: Add a second test for cursed victory**

Extend `tests/run_rule_outcome_progression.test.js`:

```js
it('unlocks cursed_conqueror_1 after a cursed victory', () => {
  // same setup, but runConfig.curse = 'tax'
  expect(gs.meta.achievements.states.cursed_conqueror_1.unlocked).toBe(true);
  expect(gs.meta.contentUnlocks.curses.void_oath.unlocked).toBe(true);
});
```

- [ ] **Step 5: Run the focused tests to verify they pass**

Run: `npm test -- tests/run_rule_outcome_progression.test.js tests/run_rules_preview_meta.test.js`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add tests/run_rule_outcome_progression.test.js game/features/run/application/run_rule_outcome.js game/features/run/state/run_outcome_state_commands.js
git commit -m "feat: evaluate unlock achievements on run outcome"
```

### Task 5: Gate run curses through content visibility and unlock state

**Files:**
- Modify: `game/features/run/presentation/browser/run_mode_ui_render.js`
- Modify: `game/features/run/presentation/browser/run_mode_ui.js`
- Modify: `game/features/run/state/run_config_state_commands.js`
- Create: `tests/run_mode_curse_unlock_gating.test.js`

- [ ] **Step 1: Write the failing curse gating tests**

Create `tests/run_mode_curse_unlock_gating.test.js`:

```js
import { describe, expect, it, vi } from 'vitest';
import { RunModeUI } from '../game/features/run/presentation/browser/run_mode_ui.js';
import { renderOptionGrid } from '../game/features/run/presentation/browser/run_mode_ui_render.js';

describe('run mode curse unlock gating', () => {
  it('renders locked-visible curses as disabled options', () => {
    const created = [];
    const doc = {
      createElement: vi.fn(() => {
        const node = {
          type: '',
          className: '',
          dataset: {},
          disabled: false,
          setAttribute: vi.fn(),
          appendChild: vi.fn(),
          innerHTML: '',
        };
        created.push(node);
        return node;
      }),
    };
    const container = { innerHTML: '', appendChild: vi.fn() };

    renderOptionGrid(container, [
      { id: 'blood_moon', name: '핏빛 월식', desc: '...', visibility: 'locked-visible', unlockHint: '첫 승리 필요' },
    ], 'none', 'curse', doc);

    expect(created[0].disabled).toBe(true);
    expect(created[0].innerHTML).toContain('첫 승리 필요');
  });
});
```

Add a second test that `RunModeUI.selectCurse(...)` refuses to select a locked curse and leaves `meta.runConfig.curse` unchanged.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- tests/run_mode_curse_unlock_gating.test.js`

Expected: FAIL because render and selection code do not understand visibility or lock state yet.

- [ ] **Step 3: Implement render-time lock state**

Update `game/features/run/presentation/browser/run_mode_ui_render.js` so `renderOptionGrid(...)` respects optional fields on each option:

```js
const isLockedVisible = opt.visibility === 'locked-visible';
card.disabled = isLockedVisible;
card.className += isLockedVisible ? ' locked' : '';
card.setAttribute('aria-disabled', isLockedVisible ? 'true' : 'false');
card.innerHTML = `
  <div class="rm-opt-check">✓</div>
  <div class="rm-opt-icon">${opt.icon || '*'}</div>
  <div class="rm-opt-name">${opt.name}${opt.isNew ? '<span class="rm-new-badge">NEW</span>' : ''}</div>
  <div class="rm-opt-desc">${opt.desc || ''}</div>
  ${isLockedVisible ? `<div class="rm-opt-lock">${opt.unlockHint || '해금 필요'}</div>` : ''}
`;
```

Do not hide locked-visible curses. Only disable them.

- [ ] **Step 4: Implement selection guard**

Update `game/features/run/presentation/browser/run_mode_ui.js` and `game/features/run/state/run_config_state_commands.js` so a locked curse cannot be selected:

```js
export function selectRunCurse(meta, runRules, id, options = {}) {
  const cfg = ensureRunConfigMeta(meta);
  if (!cfg) return null;
  const curse = runRules?.curses?.[id];
  if (!curse) {
    cfg.curse = 'none';
    return cfg.curse;
  }
  if (options.isUnlocked && !options.isUnlocked({ type: 'curse', id })) {
    return cfg.curse;
  }
  cfg.curse = id;
  return cfg.curse;
}
```

Pass `isContentUnlocked(meta, { type: 'curse', id })` from `RunModeUI.selectCurse(...)`.

- [ ] **Step 5: Add render mapping for curse definitions**

When building the curse option list in `renderPanel(...)`, map raw curse definitions into UI entries with `visibility` and `unlockHint` fields using the shared content query helpers and unlockable definitions.

Use a helper if necessary:

```js
const curseItems = Object.values(runRules.curses || {})
  .filter((curse) => getContentVisibility(meta, { type: 'curse', id: curse.id }) !== 'hidden')
  .map((curse) => ({
    ...curse,
    visibility: getContentVisibility(meta, { type: 'curse', id: curse.id }),
    unlockHint: getUnlockRequirementLabel('curse', curse.id),
  }));
```

Keep this mapping in the run feature or a shared progression presenter helper. Do not teach `renderOptionGrid(...)` how achievements work.

- [ ] **Step 6: Run the focused tests to verify they pass**

Run: `npm test -- tests/run_mode_curse_unlock_gating.test.js tests/run_mode_ui.test.js tests/run_config_state_commands.test.js`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add tests/run_mode_curse_unlock_gating.test.js tests/run_mode_ui.test.js tests/run_config_state_commands.test.js game/features/run/presentation/browser/run_mode_ui_render.js game/features/run/presentation/browser/run_mode_ui.js game/features/run/state/run_config_state_commands.js
git commit -m "feat: gate run curses behind achievement unlocks"
```

### Task 6: Run full verification and perform browser smoke check

**Files:**
- No code changes required unless verification exposes regressions

- [ ] **Step 1: Run the logic and guardrail suites**

Run: `npm test`

Expected: PASS

Run: `npm run test:guardrails`

Expected: PASS

- [ ] **Step 2: Run the build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 3: Perform a browser smoke check**

Run: `npm run dev`

Then verify manually in the browser:

- click `#mainStartBtn`
- confirm character select renders
- open the run setup panel
- confirm locked curses are visible with unlock text
- confirm locked curses cannot be selected
- confirm no console errors appear

- [ ] **Step 4: Commit verification-only fallout if needed**

If verification required code or test fixes:

```bash
git add <fixed-files>
git commit -m "fix: resolve achievement unlock verification issues"
```

- [ ] **Step 5: Prepare handoff summary**

Summarize:

- which achievements were implemented
- which curses were gated
- which future hooks exist for relics and cards
- which commands were run and their outcomes
