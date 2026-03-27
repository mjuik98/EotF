# Meta Visibility And Recovery Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose the remaining progression, recovery, and Codex context on existing title/run/Codex surfaces without adding a new standalone screen.

**Architecture:** Reuse the existing feature-first surfaces and add only thin query/render seams. Keep new behavior inside `title`, `codex`, and `shared/save` ownership, route any new data through existing application/view-model layers, and lock the changes down with focused tests before updating UI output.

**Tech Stack:** JavaScript, Vitest, existing browser presentation helpers, existing smoke scripts

---

## Chunk 1: Progression Summary Visibility

### Task 1: Surface unseen progression summary counts in character select presentation

**Files:**
- Modify: `game/features/title/domain/class_progression/class_progression_queries.js`
- Modify: `game/features/title/domain/class_progression_system.js`
- Modify: `game/features/title/application/load_character_select_use_case.js`
- Test: `tests/load_character_select_use_case.test.js`

- [ ] **Step 1: Write the failing test**

Add an assertion in `tests/load_character_select_use_case.test.js` that a presentation built from meta with queued `pendingSummaries` exposes an unread summary count for the selected class and a total unread count for the account.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm exec -- vitest run tests/load_character_select_use_case.test.js`
Expected: FAIL because the presentation object does not yet expose unread summary counts.

- [ ] **Step 3: Implement the query and presentation wiring**

Add a small query/helper that counts pending summaries by class and total, expose it through `ClassProgressionSystem`, and include the counts in `getCharacterSelectPresentation(...)`.

- [ ] **Step 4: Re-run the focused test**

Run: `npm exec -- vitest run tests/load_character_select_use_case.test.js`
Expected: PASS

### Task 2: Render unread progression badges in the character info panel

**Files:**
- Modify: `game/features/title/platform/browser/character_select_info_panel_sections.js`
- Test: `tests/character_select_info_panel.test.js`

- [ ] **Step 1: Write the failing render test**

Add an assertion in `tests/character_select_info_panel.test.js` that the recent progression/history section includes a visible unread badge or helper line when unread summaries are present.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm exec -- vitest run tests/character_select_info_panel.test.js`
Expected: FAIL because the markup does not yet include unread summary context.

- [ ] **Step 3: Implement the minimal render update**

Use the new presentation counts to add a compact unread badge/helper text in the existing recent progression block without changing panel ownership.

- [ ] **Step 4: Re-run the focused test**

Run: `npm exec -- vitest run tests/character_select_info_panel.test.js`
Expected: PASS

## Chunk 2: Save Recovery Diagnostics

### Task 3: Enrich title recovery panel diagnostics

**Files:**
- Modify: `game/features/title/presentation/browser/game_boot_ui_helpers.js`
- Test: `tests/game_boot_ui.test.js`

- [ ] **Step 1: Write the failing test**

Add assertions in `tests/game_boot_ui.test.js` that the recovery panel shows retry failure count and last failure timing/context when the outbox metrics provide them.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm exec -- vitest run tests/game_boot_ui.test.js`
Expected: FAIL because the recovery panel only renders queue depth and next retry timing.

- [ ] **Step 3: Implement the minimal helper/render change**

Extend the existing title recovery panel markup to show concise diagnostics from `saveSystem.getOutboxMetrics()` while preserving the current “recover now” flow and button behavior.

- [ ] **Step 4: Re-run the focused test**

Run: `npm exec -- vitest run tests/game_boot_ui.test.js`
Expected: PASS

### Task 4: Make queued/error save toasts show richer retry context

**Files:**
- Modify: `game/platform/browser/notifications/save_status_presenter.js`
- Test: `tests/save_status_presenter.test.js`

- [ ] **Step 1: Write the failing test**

Add assertions in `tests/save_status_presenter.test.js` that queued/error messages include retry failure context when `retryFailures` or `lastFailureAt` are present.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm exec -- vitest run tests/save_status_presenter.test.js`
Expected: FAIL because the presenter only appends queue depth and next retry timing.

- [ ] **Step 3: Implement the minimal presenter change**

Extend the presenter text builder to append compact recovery diagnostics for queued/error states while leaving the saved state short.

- [ ] **Step 4: Re-run the focused test**

Run: `npm exec -- vitest run tests/save_status_presenter.test.js`
Expected: PASS

## Chunk 3: Codex Progression Polish

### Task 5: Include “remaining to next reward” and stronger recent discovery copy in Codex progress view

**Files:**
- Modify: `game/features/codex/presentation/browser/codex_ui_progress_render.js`
- Test: `tests/codex_ui_progress_render.test.js`

- [ ] **Step 1: Write the failing render test**

Add assertions in `tests/codex_ui_progress_render.test.js` for explicit remaining-count copy in roadmap entries and richer category/date formatting in recent discoveries.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm exec -- vitest run tests/codex_ui_progress_render.test.js`
Expected: FAIL because the current markup does not render the additional copy.

- [ ] **Step 3: Implement the minimal render update**

Use the existing `remaining`, `focusLabel`, and category data to make the progress block more actionable without changing state flow.

- [ ] **Step 4: Re-run the focused test**

Run: `npm exec -- vitest run tests/codex_ui_progress_render.test.js`
Expected: PASS

### Task 6: Ensure runtime progress payloads carry the richer Codex roadmap/discovery data

**Files:**
- Modify: `game/features/codex/presentation/browser/codex_ui_runtime_helpers.js`
- Test: `tests/codex_ui_runtime_helpers.test.js`

- [ ] **Step 1: Write the failing test**

Add a focused assertion that the runtime helper passes the richer roadmap/discovery payload through to `renderCodexProgress(...)`.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm exec -- vitest run tests/codex_ui_runtime_helpers.test.js`
Expected: FAIL if the render payload shape is missing the new fields.

- [ ] **Step 3: Implement the minimal helper update**

Only if needed, normalize the progress payload in the runtime helper so the render layer always receives the expected data shape.

- [ ] **Step 4: Re-run the focused test**

Run: `npm exec -- vitest run tests/codex_ui_runtime_helpers.test.js`
Expected: PASS

## Chunk 4: Verification

### Task 7: Run targeted verification for the batch

**Files:**
- Test: `tests/load_character_select_use_case.test.js`
- Test: `tests/character_select_info_panel.test.js`
- Test: `tests/game_boot_ui.test.js`
- Test: `tests/save_status_presenter.test.js`
- Test: `tests/codex_ui_progress_render.test.js`
- Test: `tests/codex_ui_runtime_helpers.test.js`

- [ ] **Step 1: Run the targeted suite**

Run: `npm exec -- vitest run tests/load_character_select_use_case.test.js tests/character_select_info_panel.test.js tests/game_boot_ui.test.js tests/save_status_presenter.test.js tests/codex_ui_progress_render.test.js tests/codex_ui_runtime_helpers.test.js`
Expected: PASS

### Task 8: Run full verification and sync outputs

**Files:**
- Modify: `config/quality/test_suite_manifest.json` if new tests are added
- Modify: `artifacts/dependency_map.json`
- Modify: `artifacts/dependency_map.md`

- [ ] **Step 1: Run repository verification**

Run:
- `npm test`
- `npm run test:guardrails`
- `npm run lint`
- `npm run deps:map`
- `npm run deps:map:check`
- `npm run build`
- `npm run smoke:browser`

Expected: PASS for each command
