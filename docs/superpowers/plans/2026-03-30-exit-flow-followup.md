# Exit Flow Follow-Up Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify pause/title exit language, add a shared quit confirmation modal, and extend browser smoke coverage for the revised exit flow.

**Architecture:** Keep the existing title and help/pause ownership intact, but move app-exit confirmation into the shared overlay system so title and pause reuse one confirm flow. Limit runtime changes to UI presentation/runtime modules, title system actions, and smoke scripts.

**Tech Stack:** JavaScript, Vitest, repository CSS in `css/styles.css` and markup in `index.html`

---

## Chunk 1: Quit Confirm Contract

### Task 1: Lock in failing tests for shared quit confirmation

**Files:**
- Modify: `tests/help_pause_ui_dialog_overlays.test.js`
- Modify: `tests/help_pause_ui_dialog_runtime.test.js`
- Modify: `tests/help_pause_ui.test.js`
- Modify: `tests/title_bindings.test.js`
- Modify: `tests/game_boot_ui.test.js`
- Modify: `tests/help_pause_hotkey_smoke_script.test.js`
- Modify: `tests/save_load_roundtrip_smoke_script.test.js`

- [ ] **Step 1: Add failing assertions for quit confirm overlay, title quit copy, and smoke captures**
- [ ] **Step 2: Run the focused tests to verify they fail**
  Run: `npx vitest run tests/help_pause_ui_dialog_overlays.test.js tests/help_pause_ui_dialog_runtime.test.js tests/help_pause_ui.test.js tests/title_bindings.test.js tests/game_boot_ui.test.js tests/help_pause_hotkey_smoke_script.test.js tests/save_load_roundtrip_smoke_script.test.js`
- [ ] **Step 3: Implement the minimal runtime and copy changes**
- [ ] **Step 4: Re-run the focused tests to verify they pass**
  Run: `npx vitest run tests/help_pause_ui_dialog_overlays.test.js tests/help_pause_ui_dialog_runtime.test.js tests/help_pause_ui.test.js tests/title_bindings.test.js tests/game_boot_ui.test.js tests/help_pause_hotkey_smoke_script.test.js tests/save_load_roundtrip_smoke_script.test.js`

## Chunk 2: Runtime And Styling

### Task 2: Implement the quit confirm flow and polish title/pause language

**Files:**
- Modify: `game/features/ui/presentation/browser/help_pause_ui_dialog_overlays.js`
- Modify: `game/features/ui/presentation/browser/help_pause_ui_dialog_runtime.js`
- Modify: `game/features/ui/presentation/browser/help_pause_ui.js`
- Modify: `game/features/ui/presentation/browser/help_pause_ui_pause_menu_overlay.js`
- Modify: `game/features/ui/presentation/browser/help_pause_ui_overlays.js`
- Modify: `game/features/ui/platform/browser/create_lazy_help_pause_module.js`
- Modify: `game/features/title/platform/browser/create_title_system_actions.js`
- Modify: `game/features/title/presentation/browser/game_boot_ui_helpers.js`
- Modify: `game/shared/runtime/overlay_escape_support.js`
- Modify: `game/features/run_session/platform/browser/run_session_hotkey_runtime.js`
- Modify: `css/styles.css`
- Modify: `index.html`
- Modify: `scripts/help_pause_hotkey_smoke_check.mjs`
- Modify: `scripts/save_load_roundtrip_smoke_check.mjs`

- [ ] **Step 1: Add shared quit confirm overlay markup and runtime toggling**
- [ ] **Step 2: Route title and pause quit actions through the shared confirm flow**
- [ ] **Step 3: Tighten title continue/archive copy and title quit button text**
- [ ] **Step 4: Extend smoke scripts with new screenshots and quit-confirm escape assertions**
- [ ] **Step 5: Re-run the focused tests**
  Run: `npx vitest run tests/help_pause_ui_dialog_overlays.test.js tests/help_pause_ui_dialog_runtime.test.js tests/help_pause_ui.test.js tests/title_bindings.test.js tests/game_boot_ui.test.js tests/help_pause_hotkey_smoke_script.test.js tests/save_load_roundtrip_smoke_script.test.js`

## Chunk 3: Verification

### Task 3: Verify the revised exit flow end to end

**Files:**
- Modify: none

- [ ] **Step 1: Run the focused test bundle**
  Run: `npx vitest run tests/help_pause_ui_dialog_overlays.test.js tests/help_pause_ui_dialog_runtime.test.js tests/help_pause_ui.test.js tests/title_bindings.test.js tests/game_boot_ui.test.js tests/help_pause_hotkey_smoke_script.test.js tests/save_load_roundtrip_smoke_script.test.js`
- [ ] **Step 2: Run the fast suite**
  Run: `npm test`
- [ ] **Step 3: Run the production build**
  Run: `npm run build`
- [ ] **Step 4: Run the browser smoke suite**
  Run: `npm run smoke:browser`
