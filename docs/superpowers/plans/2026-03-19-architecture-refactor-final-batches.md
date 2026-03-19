# Architecture Refactor Final Batches Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the remaining public-surface, dependency-access, compat-boundary, and transitional-structure refactors without rewriting runtime behavior.

**Architecture:** Keep behavior stable while narrowing module entrypoints. Feature `public.js` files become thin facades over `ports/*`, legacy dependency getter usage moves into feature-owned contract maps, and remaining compat/transitional surfaces are reduced to explicit re-export shims or grouped subdirectories.

**Tech Stack:** ES modules, Vitest, Vite, ripgrep

---

## Chunk 1: Guardrails

### Task 1: Lock the remaining target structure in tests

**Files:**
- Modify: `tests/feature_public_surface_exports.test.js`
- Modify: `tests/feature_dep_accessor_boundaries.test.js`
- Modify: `tests/feature_structure_guardrails.test.js`
- Modify: `tests/feature_internal_transitional_surfaces.test.js`

- [ ] Add failing assertions for thin feature public facades and feature-owned dep accessor maps.
- [ ] Run targeted tests and confirm they fail for the intended structural reasons.

## Chunk 2: Thin public surfaces

### Task 2: Move combat/run/ui public surface assembly behind ports modules

**Files:**
- Create: `game/features/combat/ports/public_compat_capabilities.js`
- Create: `game/features/combat/ports/public_surface.js`
- Create: `game/features/run/ports/public_surface.js`
- Create: `game/features/ui/ports/public_surface.js`
- Modify: `game/features/combat/public.js`
- Modify: `game/features/run/public.js`
- Modify: `game/features/ui/public.js`

- [ ] Implement thin root facades that re-export from `ports/public_surface.js`.
- [ ] Preserve current named exports and compat discoverability.

## Chunk 3: Dependency access

### Task 3: Push more legacy dep getter usage into feature-owned providers

**Files:**
- Modify: `game/features/combat/ports/create_combat_ports.js`
- Create: `game/features/event/ports/create_event_dep_accessors.js`
- Modify: `game/features/event/ports/event_ports.js`
- Modify: `game/features/event/ports/reward_ports.js`
- Modify: `game/features/event/ports/create_event_reward_ports.js`
- Modify: `game/platform/legacy/game_api_run_bindings.js`

- [ ] Introduce local contract maps using `createDepsAccessors`.
- [ ] Remove direct `Deps.getXDeps()` calls from feature dep-provider modules where practical.

## Chunk 4: Compat boundaries and transitional structure

### Task 4: Tighten frozen surfaces and carve explicit subdomains

**Files:**
- Create: `game/features/combat/presentation/browser/hud/public_combat_hud_modules.js`
- Create: `game/features/combat/presentation/browser/feedback/public_feedback_modules.js`
- Create: `game/features/run/application/map/public_run_map_actions.js`
- Create: `game/features/run/application/transition/public_run_transition_actions.js`
- Modify: selected compat/re-export files and guardrail tests

- [ ] Add thin public aggregators for combat hud/feedback and run map/transition subdomains.
- [ ] Update guardrails so transitional roots stay explicit and thin.

## Chunk 5: Validation

### Task 5: Run repository validation

**Files:**
- Modify only if needed for guardrails/docs already listed above.

- [ ] Run targeted tests during each chunk.
- [ ] Run `npm run lint`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Run `npm run deps:map`.
