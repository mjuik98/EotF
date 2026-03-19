# Remaining Architecture Cleanup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the remaining core/legacy/transitional structure debt without changing gameplay behavior.

**Architecture:** Keep behavior stable while moving responsibility behind narrower ports. Core should orchestrate registration and events, feature/browser code should own DOM-heavy combat reactions, deps/runtime resolution should prefer explicit runtime ports over raw legacy `GAME`, and transitional feature folders should become thin wrappers around canonical `ports/*`.

**Tech Stack:** JavaScript, Vitest, Vite, Playwright smoke

---

### Task 1: Lock the target seams with failing tests

**Files:**
- Modify: `tests/deps_factory.test.js`
- Modify: `tests/module_registry.test.js`
- Modify: `tests/legacy_module_registry.test.js`
- Modify: `tests/refactor_structure_guardrails.test.js`
- Modify: `tests/feature_internal_transitional_surfaces.test.js`

- [ ] Add failing tests for runtime-port preference in deps factory.
- [ ] Add failing tests for non-enumerable legacy module aliases.
- [ ] Add failing guardrails for core combat subscriber delegation and thinner transitional wrappers.

### Task 2: Move combat event side effects behind feature-owned ports

**Files:**
- Create: `game/features/combat/platform/browser/create_combat_event_subscriber_handlers.js`
- Create: `game/features/combat/ports/public_runtime_capabilities.js`
- Modify: `game/core/event_subscribers_combat_events.js`
- Modify: `game/features/combat/ports/public_surface.js`
- Modify: `game/features/combat/ports/public_binding_capabilities.js`
- Modify: `game/features/combat/runtime/public_combat_runtime_actions.js`

- [ ] Add the feature-owned combat event subscriber handler factory.
- [ ] Route core subscriber registration through the combat runtime port.
- [ ] Keep existing public behavior stable through compat exports.

### Task 3: Prefer explicit runtime ports over raw legacy GAME in deps/runtime resolution

**Files:**
- Modify: `game/core/deps_factory_runtime.js`
- Modify: `game/core/bootstrap/build_binding_deps_payload.js`
- Create: `game/core/bootstrap/build_binding_runtime_ports.js`

- [ ] Add binding-time runtime port assembly.
- [ ] Make deps factory runtime read feature/game deps through injected runtime ports first.

### Task 4: Narrow core/bootstrap dep knowledge and flatten transitional wrappers

**Files:**
- Create: `game/features/ui/ports/create_story_ports.js`
- Modify: `game/core/bootstrap/build_binding_ui_helpers.js`
- Modify: `game/core/bootstrap/build_game_boot_refs.js`
- Modify: `game/core/bootstrap/init_story_system_bridge.js`
- Modify: `game/features/run/ports/public_runtime_capabilities.js`
- Modify: `game/features/run/ports/public_surface.js`
- Modify: `game/features/run/ports/public_binding_capabilities.js`
- Modify: `game/features/run/runtime/public_run_runtime_actions.js`
- Modify: `game/features/run/bindings/public_run_bindings.js`
- Modify: `game/features/run/modules/public_run_modules.js`
- Modify: `game/features/run/ui/run_entry_bindings.js`
- Modify: `game/features/combat/modules/public_combat_modules.js`
- Modify: `game/features/combat/bindings/public_combat_bindings.js`

- [ ] Move core bootstrap consumers onto feature-owned dep providers.
- [ ] Make combat/run transitional runtime, bindings, and modules wrappers point at canonical `ports/*`.

### Task 5: Reduce flat module-registry prominence while keeping compat callers alive

**Files:**
- Create: `game/core/bindings/attach_module_registry_flat_compat.js`
- Modify: `game/core/bindings/module_registry.js`
- Modify: `game/platform/legacy/game_module_registry.js`

- [ ] Replace enumerable flat spread with non-enumerable compat aliases.
- [ ] Keep direct property reads working for legacy callers.

### Task 6: Verify and smoke test

**Files:**
- Modify if needed: `progress.md`

- [ ] Run `npm run lint`
- [ ] Run `npm test`
- [ ] Run `npm run build`
- [ ] Run `npm run deps:map`
- [ ] Run browser smoke: click `#mainStartBtn`, confirm character select, confirm no console/page errors
