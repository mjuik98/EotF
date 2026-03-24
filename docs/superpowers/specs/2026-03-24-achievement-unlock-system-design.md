# Achievement Unlock System Design

## Goal

Add a progression system that can unlock curses, relics, and cards from player achievements without narrowing the baseline early-game build pool too aggressively.

The system should support three policies from the start:

- mixed content exposure
- mixed account-wide and class-scoped unlocks
- mixed progression conditions, with simple cumulative goals first and explicit challenge goals later

## Scope

Phase 1 should fully support curse unlocks and create reusable infrastructure for relic and card unlocks.

Phase 1 includes:

- achievement state storage
- content unlock state storage
- achievement and unlockable definition tables
- trigger-based achievement evaluation
- curse visibility and selection gating in run setup
- save compatibility for existing meta state

Phase 1 does not need to include:

- a dedicated achievements screen
- runtime unlock toast UI
- full relic pool gating
- full card reward pool gating

## Recommended Architecture

### 1. Separate achievement state from content unlock state

Use `meta.achievements` for progress and completion state, and `meta.contentUnlocks` for actual unlocked content.

This keeps the cause of progression separate from the runtime answer needed by UI and content generation. Systems that need to know whether a curse, relic, or card is available should read `contentUnlocks` rather than re-evaluating achievement conditions.

Keep `meta.unlocks` limited to run-system feature gates such as ascension and endless mode.

### 2. Use definition-driven progression

Add two pure definition layers:

- achievement definitions
- unlockable definitions

Achievement definitions describe:

- trigger
- condition
- scope
- rewards

Unlockable definitions describe:

- content type
- content id
- visibility before unlock
- scope
- required achievements

This allows the same progression infrastructure to support curses first, then relics and cards later.

### 3. Use trigger-based partial evaluation

Do not evaluate every achievement on every state change.

Instead, route relevant gameplay events into a progression evaluator and only check achievements that listen to that trigger. Recommended phase-1 triggers are:

- `run_completed`
- `boss_defeated`
- `item_acquired`
- `card_acquired`

This keeps the system cheap and easier to reason about.

### 4. Gate content through shared query helpers

Content consumers should not embed achievement logic directly.

Add shared helpers such as:

- `isContentUnlocked(meta, query)`
- `getContentVisibility(meta, query)`
- `getUnlockedContent(meta, query)`

Run setup, reward generation, shops, and event rewards should all use these helpers instead of custom unlock checks.

## Meta State Shape

Recommended save shape:

```js
meta: {
  unlocks: {
    ascension: true,
    endless: false,
  },
  achievements: {
    version: 1,
    states: {
      first_victory: {
        unlocked: true,
        unlockedAt: 1712345678901,
        progress: 1,
      },
      boss_hunter_1: {
        unlocked: false,
        progress: 2,
      },
    },
  },
  contentUnlocks: {
    version: 1,
    curses: {
      blood_moon: {
        unlocked: true,
        unlockedAt: 1712345678901,
        source: 'boss_hunter_1',
      },
    },
    relics: {},
    cards: {
      shared: {},
      swordsman: {},
    },
  },
}
```

Rules for this structure:

- keep `version` fields for migration safety
- never reuse achievement ids or unlockable ids
- use account-wide unlocks for curses
- allow account-wide and class-scoped unlocks for relics and cards
- use numeric `progress` fields by default in phase 1

## Definitions

### Achievement definition shape

```js
const ACHIEVEMENTS = {
  first_victory: {
    id: 'first_victory',
    trigger: 'run_completed',
    category: 'run',
    scope: 'account',
    condition: { type: 'victories', count: 1 },
    rewards: [
      { type: 'unlock', contentType: 'curse', contentId: 'blood_moon' },
    ],
  },
};
```

### Unlockable definition shape

```js
const UNLOCKABLES = {
  curses: {
    blood_moon: {
      id: 'blood_moon',
      scope: 'account',
      requires: ['first_victory'],
      visibleBeforeUnlock: true,
    },
  },
  relics: {},
  cards: {},
};
```

The unlockable layer gives content systems a stable source of truth for visibility and eligibility without coupling them to achievement logic.

## Runtime Flow

Recommended runtime flow:

```text
gameplay event
-> progress recorder updates stored counters or records
-> achievement evaluator checks definitions for that trigger
-> newly completed achievements are persisted
-> unlock resolver updates contentUnlocks
-> UI or gameplay systems refresh their local view if needed
```

Use a split between:

- progress recording
- achievement completion evaluation
- content unlock resolution

This makes duplicate reward prevention and testing easier.

## Content Gating Policy

### Curses

Show locked curses in the run setup UI, but disable selection and show their unlock conditions.

This makes the long-term progression goals visible and suits curses better than hiding them entirely.

### Relics

Default to hidden in runtime generation until unlocked. Optionally expose selected special relics as locked-visible in future meta or codex UI, but do not require that in phase 1.

### Cards

Keep the baseline deckbuilding pool broadly available. Reserve unlock gates for experimental, signature, or higher-tier cards rather than for core class kits.

## Phase 1 Rollout

### 1. Meta initialization

Extend run meta initialization to create default `achievements` and `contentUnlocks` containers and normalize old saves safely.

### 2. Definition modules

Add domain definitions for achievements and unlockables under a feature-owned progression boundary.

### 3. Evaluation and unlock use cases

Add pure helpers to:

- record trigger progress
- evaluate achievement completion
- resolve content unlocks from newly completed achievements

### 4. Run outcome integration

Connect run completion and boss-clear data to the evaluator through the run outcome flow.

### 5. Curse gating integration

Update run setup curse rendering and selection so locked curses remain visible but cannot be chosen.

### 6. Future expansion hooks

Expose shared gating helpers so relic and card content pools can adopt the system without redesigning the storage format.

## Initial Achievement Set

Use a narrow initial set that relies on state already available or easy to add:

- `first_victory`
  - unlocks one additional curse
- `boss_hunter_1`
  - requires several boss kills
  - unlocks one additional curse
- `cursed_conqueror_1`
  - requires a victory while any curse is active
  - unlocks a higher-difficulty curse

This creates a clear early progression arc without introducing a large UI or content burden.

## Risks

### 1. Save compatibility

Existing saves will not have the new progression containers. Initialization must backfill them safely and avoid overwriting valid legacy data.

### 2. Invalid stored selections

Old presets or saved run configs may reference content that is no longer valid or is now locked. Run config normalization must fall back to a valid value such as `none` for curses.

### 3. Duplicate resolution

Run outcome flows can already have idempotency concerns. Achievement rewards and content unlock resolution must not double-apply when the same completion path is processed twice.

### 4. Scope creep

If relic and card gating are implemented immediately, phase 1 will expand too far. Keep phase 1 focused on shared infrastructure plus curse unlock UX.

## Validation

- Add tests for meta initialization and legacy save normalization.
- Add tests for achievement completion on run-completed and boss-defeated triggers.
- Add tests for unlock resolution populating `contentUnlocks`.
- Add tests for locked curses remaining visible but unselectable in run setup.
- Add tests for invalid or locked stored curse selections falling back safely.
- Run `npm test`.
- Run `npm run test:guardrails`.
- Run `npm run build` once UI gating is implemented.
- Perform a browser smoke check for run setup rendering and console errors.
