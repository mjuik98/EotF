# Session Ownership And Input Architecture Design

> Scope: incremental runtime refactoring only. Preserve shipped behavior while moving ownership toward player-facing session boundaries.

## Goal

Reduce cross-feature coupling and scattered browser-input handling by introducing session-oriented ownership for frontdoor, run, and combat flows, plus one canonical shared input layer.

## Scope

This design targets runtime seams that currently slow feature work even when tests pass:

- `keydown` and modal-priority handling are spread across multiple browser runtime files.
- `title`, `ui`, `run`, and `combat` each own part of the same player-facing flows.
- public feature surfaces are numerous and fine-grained, which increases integration cost for small changes.

This pass does not rewrite game rules, replace the renderer, or remove compatibility surfaces wholesale.

## Chosen Approach

Use a staged ownership realignment rather than a single rewrite:

- define a target runtime shape around player-facing sessions
- introduce new canonical surfaces first
- move existing behavior behind those surfaces in small batches
- keep compatibility wrappers thin while imports gradually migrate

This keeps `npm test`, `npm run test:guardrails`, and `npm run smoke:browser` viable after each batch.

## Design

### 1. Session-oriented ownership

Ownership should follow the player experience instead of historical feature splits.

#### `frontdoor session`

Owns title-adjacent and run-entry flows:

- title screen
- character select
- intro and continue entry
- run-end return
- ending entry and return paths

`frontdoor` should not own in-run HUDs or run-time modal behavior.

#### `run session`

Owns run-level exploration and modal surfaces outside combat:

- map and run navigation
- pause and help overlays
- settings modal and keybinding entry
- codex open/close
- save/load entry points
- run-level recap and progression overlays

`run session` is the owner of "the player is currently in a run, but not resolving combat input."

#### `combat session`

Owns combat-only play surfaces:

- turn-level input handling
- target cycle behavior
- hand and energy interaction surfaces
- combat HUD interaction
- reward-transition triggers at combat exit

`combat session` should not need to know about title/frontdoor flows directly.

### 2. Shared input as a canonical layer

Introduce `game/shared/input/*` as the single ownership point for input actions and browser-key interpretation.

Responsibilities:

- define canonical action IDs such as `confirm`, `cancel`, `pause`, `deckView`, `codex`, and `targetCycle`
- resolve effective keybindings from saved settings
- convert browser keyboard events into normalized actions
- provide modal-safe helpers for action handling priority

This moves the project away from each UI runtime interpreting `KeyboardEvent.code` directly.

### 3. File structure

New canonical ownership should live under the existing repository rules:

- `game/shared/input/`
- `game/features/frontdoor/`
- `game/features/run_session/`
- `game/features/combat_session/`

Expected initial files:

- `game/shared/input/input_action_ids.js`
- `game/shared/input/input_binding_resolver.js`
- `game/shared/input/keyboard_to_action.js`
- `game/shared/input/public.js`
- `game/features/frontdoor/public.js`
- `game/features/run_session/public.js`
- `game/features/combat_session/public.js`

Existing features remain in place during migration:

- `game/features/title/*` becomes a shrinking implementation/compat area behind `frontdoor`
- `game/features/ui/*` loses session ownership over time and keeps only shared widgets or compat surfaces
- `game/features/run/*` and `game/features/combat/*` keep domain/state/application ownership unless a session-level surface truly belongs elsewhere

### 4. Public surface policy

New code should prefer a small number of coarse session entrypoints:

- `game/features/frontdoor/public.js`
- `game/features/run_session/public.js`
- `game/features/combat_session/public.js`
- `game/shared/input/public.js`

This design intentionally pushes against adding more narrow `public_*_capabilities.js` entrypoints unless a concrete boundary requires them.

## Migration Plan

### Batch 1: shared input plus run-session entry

Create the shared input layer and route the most scattered in-run keyboard paths through it first.

Primary targets:

- help/pause hotkeys
- settings keybinding flow
- codex open/close input
- run-level modal priority resolution

Behavior changes should be minimal. The point of the batch is ownership consolidation, not UX redesign.

### Batch 2: frontdoor session ownership

Create `frontdoor` as the canonical runtime entry surface for:

- title
- character select
- continue
- intro
- run-end return and ending entry

This separates "start/end of run" ownership from "during the run" ownership.

### Batch 3: combat session ownership

Move combat-only interaction surfaces behind `combat_session`, especially:

- combat hotkeys
- target cycle handling
- combat HUD interaction seams
- reward transition triggers

This makes combat feel like one surface in code, not a cross-feature composite.

## Risks

### 1. Input precedence drift

The highest-risk change is moving action resolution. `Escape`, pause, codex, and deck-view precedence may shift subtly if the order is not captured in tests.

### 2. Double ownership during migration

New session surfaces can coexist too long with old `title/ui/run/combat` paths. Each batch should migrate real imports, not only add wrappers.

### 3. Hidden visual regressions

State-based smoke checks can still miss HUD density, modal overlap, or playfield obstruction. Visual review remains necessary for representative screens.

## Verification

Each migration batch should prove three things:

1. input and modal-priority logic still behaves the same
2. architecture boundaries remain compliant
3. the player can still complete the critical browser flows

Required verification:

- `npm test`
- `npm run test:guardrails`
- `npm run smoke:browser`

Recommended additional review:

- representative screenshots for character select, map, combat HUD, and pause/settings overlays
- targeted tests for input action normalization and modal priority

## Non-Goals

This design does not:

- replace the current browser/canvas runtime stack
- move all domain/state modules into the new session features
- delete compat surfaces in one pass
- redesign the actual combat or progression rules

## Expected Outcomes

- shared input becomes the canonical owner of action interpretation
- frontdoor, run, and combat flows gain clearer session-level boundaries
- new runtime work can target a few coarse entrypoints instead of many narrow capability files
- future UI and playtest improvements become easier because session ownership matches what the player is doing
