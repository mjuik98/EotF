# Domain Elimination Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the remaining `game/domain/*` modules into canonical `game/shared/*` or `game/features/*` ownership, isolate browser/global player effects away from shared logic, and reduce a small slice of broad test `public.js` imports while preserving behavior.

**Architecture:** Cross-feature helpers (`audio`, `class`) move into `game/shared/*`, combat-turn policy/helpers move into `game/features/combat/domain/turn/*`, and event rest/shop builders move into `game/features/event/domain/*`. Tests first lock the old `game/domain/*` paths as removed and verify callers point at canonical owners before code moves happen.

**Tech Stack:** JavaScript, Vitest, repository guardrail scripts

---

### Task 1: Lock Canonical Ownership With Failing Tests

**Files:**
- Modify: `tests/system_compat_reexports.test.js`
- Modify: `tests/state_flow_boundary_contracts.test.js`
- Modify: `tests/architecture_refactor_guardrails.test.js`
- Modify: `tests/audio_event_helpers.test.js`
- Modify: `tests/class_mechanics.test.js`

- [ ] Step 1: Extend compat tests to require the remaining `game/domain/*` files to disappear once callers are updated.
- [ ] Step 2: Update boundary tests to expect canonical `shared` and feature-domain import paths instead of `game/domain/*`.
- [ ] Step 3: Move direct tests for audio/class helpers to the new canonical paths.
- [ ] Step 4: Run the focused tests and confirm they fail for missing files or old import paths.

### Task 2: Move Cross-Feature Audio and Class Helpers Into `shared`

**Files:**
- Create: `game/shared/audio/audio_event_helpers.js`
- Create: `game/shared/audio/helpers/attack_audio_helpers.js`
- Create: `game/shared/audio/helpers/audio_event_core.js`
- Create: `game/shared/audio/helpers/event_audio_helpers.js`
- Create: `game/shared/audio/helpers/reaction_audio_helpers.js`
- Create: `game/shared/audio/helpers/status_audio_helpers.js`
- Create: `game/shared/audio/helpers/ui_audio_helpers.js`
- Create: `game/shared/class/class_mechanic_rules.js`
- Create: `game/shared/class/class_mechanics.js`
- Create: `game/shared/class/class_trait_view_model.js`
- Modify: feature/core/platform callers that still import `game/domain/audio/*` or `game/domain/class/*`
- Delete: `game/domain/audio/*`
- Delete: `game/domain/class/*`

- [ ] Step 1: Add the shared canonical files with the existing behavior preserved.
- [ ] Step 2: Rewrite all imports and tests to the shared canonical locations.
- [ ] Step 3: Delete the old `game/domain/audio/*` and `game/domain/class/*` files.
- [ ] Step 4: Run focused audio/class tests and affected guardrails.

### Task 3: Move Combat Turn Policies and Event Builders Into Feature Ownership

**Files:**
- Create: `game/features/combat/domain/turn/start_player_turn_policy.js`
- Create: `game/features/combat/domain/turn/end_player_turn_policy.js`
- Create: `game/features/combat/domain/turn/enemy_effect_resolver.js`
- Create: `game/features/combat/domain/turn/infinite_stack_buffs.js`
- Create: `game/features/combat/domain/turn/turn_manager_helpers.js`
- Create: `game/features/combat/domain/turn/turn_state_mutators.js`
- Create: `game/features/event/domain/rest/build_rest_options.js`
- Create: `game/features/event/domain/shop/build_shop_config.js`
- Modify: combat/event callers and tests that still reference `game/domain/combat/*` or `game/domain/event/*`
- Delete: `game/domain/combat/turn/*`
- Delete: `game/domain/event/*`

- [ ] Step 1: Add the feature-owned canonical files with behavior unchanged.
- [ ] Step 2: Rewrite runtime and test imports to the new feature-domain locations.
- [ ] Step 3: Delete the old `game/domain/combat/turn/*` and `game/domain/event/*` files.
- [ ] Step 4: Run focused combat/event tests and boundary guardrails.

### Task 4: Push Shared Player Browser/Global Effects Behind Legacy/Platform Adapters

**Files:**
- Modify: `game/shared/player/player_runtime_effects.js`
- Modify: any new/existing adapter file needed under `game/platform/legacy/*` or `game/platform/browser/*`
- Test: affected player/runtime tests

- [ ] Step 1: Replace direct `window` and ad-hoc global lookups in shared player runtime effects with injected collaborators or a dedicated adapter boundary.
- [ ] Step 2: Keep shared logic pure enough that browser/global access lives outside the shared module.
- [ ] Step 3: Run focused player/runtime tests.

### Task 5: Narrow a Small Slice of Broad Test Public Imports

**Files:**
- Modify: selected tests currently importing root `game/features/*/public.js`

- [ ] Step 1: Move touched tests to narrower capability or canonical module imports where those entry points already exist.
- [ ] Step 2: Keep runtime code unchanged unless a missing narrow entry point is required.
- [ ] Step 3: Re-run the touched tests.

### Task 6: Verify

**Files:**
- Modify: generated manifests/artifacts only if scripts require updates

- [ ] Step 1: Run focused Vitest slices for the moved modules.
- [ ] Step 2: Run `npm run test:manifest`.
- [ ] Step 3: Run `npm run lint`.
- [ ] Step 4: Run `npm run deps:map:check`.
- [ ] Step 5: Run `npm run audit:structure`.
- [ ] Step 6: Run `npm run audit:transition-surfaces`.
- [ ] Step 7: Run `npm run test:full`.
