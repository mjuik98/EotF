# Game Studio Followthrough Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce persistent HUD clutter, make scene ownership clearer in the DOM/runtime snapshot, and turn existing runtime hooks into a usable in-browser debug surface.

**Architecture:** Keep simulation ownership unchanged and confine the changes to browser UI and composition seams. Introduce explicit scene roots for title/runtime shells, narrow the UI composition entrypoints used by screen assembly, compress the recent combat feed into a smaller disclosure-first surface, and mount a lightweight runtime debug panel on top of the existing snapshot/advance-time hooks.

**Tech Stack:** Vite, browser DOM UI, Vitest, Playwright smoke scripts

---

## Chunk 1: Scene Shell + Composition

### Task 1: Add explicit scene roots to the HTML shell

**Files:**
- Modify: `index.html`
- Test: `tests/build_first_optimization_guardrails.test.js`
- Test: `tests/runtime_debug_hooks.test.js`

- [ ] **Step 1: Write the failing guardrail assertions for the new scene roots**
- [ ] **Step 2: Run the focused tests to verify they fail**
- [ ] **Step 3: Add title/runtime scene root containers without changing existing ids**
- [ ] **Step 4: Extend runtime debug snapshot coverage for the scene roots**
- [ ] **Step 5: Re-run the focused tests and keep them green**

### Task 2: Narrow the UI composition seam

**Files:**
- Create: `game/features/ui/ports/public_scene_module_capabilities.js`
- Modify: `game/platform/browser/composition/build_screen_primary_modules.js`
- Modify: `game/platform/browser/composition/build_screen_overlay_modules.js`
- Modify: `tests/composition_module_assembly.test.js`

- [ ] **Step 1: Write the failing composition test for the narrower scene-module port**
- [ ] **Step 2: Run the focused composition test to verify it fails**
- [ ] **Step 3: Add the narrow scene-module port and switch composition to it**
- [ ] **Step 4: Re-run the focused composition test and keep it green**

## Chunk 2: Combat HUD Disclosure

### Task 3: Compress the recent combat feed on wide layouts

**Files:**
- Modify: `game/features/combat/presentation/browser/combat_hud_log_ui.js`
- Modify: `css/styles.css`
- Modify: `tests/combat_hud_log_ui.test.js`

- [ ] **Step 1: Write failing tests for the compact wide-screen feed behavior**
- [ ] **Step 2: Run the focused log-ui test to verify it fails**
- [ ] **Step 3: Implement the compact feed layout and matching CSS treatment**
- [ ] **Step 4: Re-run the focused log-ui test and keep it green**

## Chunk 3: Runtime Debug Surface

### Task 4: Mount a lightweight runtime debug panel

**Files:**
- Create: `game/features/ui/presentation/browser/runtime_debug_panel_ui.js`
- Modify: `game/core/bootstrap/register_runtime_debug_hooks.js`
- Modify: `game/features/ui/ports/runtime_debug_snapshot.js`
- Create: `tests/runtime_debug_panel_ui.test.js`
- Modify: `tests/runtime_debug_hooks.test.js`

- [ ] **Step 1: Write failing tests for panel mounting, refresh, and toggle behavior**
- [ ] **Step 2: Run the focused debug tests to verify they fail**
- [ ] **Step 3: Implement the debug panel on top of existing snapshot/metrics hooks**
- [ ] **Step 4: Re-run the focused debug tests and keep them green**

## Chunk 4: Verification

### Task 5: Run repository verification for the touched surfaces

**Files:**
- Test only

- [ ] **Step 1: Run the focused Vitest files touched by the changes**
- [ ] **Step 2: Run `npm test`**
- [ ] **Step 3: Run `npm run smoke:character-select`**
- [ ] **Step 4: Run `npm run smoke:combat-ui`**
- [ ] **Step 5: Fix regressions and re-run failing verification until green**
