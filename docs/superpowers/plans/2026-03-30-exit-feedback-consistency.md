# Exit Feedback Consistency Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 타이틀과 pause의 이탈 액션 구조를 통일하고, 브라우저 종료 fallback을 shared confirm overlay 안에서 설명 가능하게 만든다.

**Architecture:** 기존 help-pause shared modal frame을 유지하면서 quit confirm runtime만 환경별 분기를 추가한다. 타이틀 화면은 정적 마크업과 title screen CSS만 조정해 정보 구조를 재정렬하고, smoke scripts에 구조 snapshot을 남겨 회귀를 빠르게 감지한다.

**Tech Stack:** Vanilla JS, Vite, Vitest, Playwright smoke scripts

---

### Task 1: Lock the new behavior with tests

**Files:**
- Modify: `tests/help_pause_ui_dialog_runtime.test.js`
- Modify: `tests/help_pause_ui_dialog_overlays.test.js`
- Modify: `tests/help_pause_ui_pause_menu_overlay.test.js`
- Modify: `tests/player_facing_localization_regression.test.js`
- Modify: `tests/save_load_roundtrip_smoke_script.test.js`

- [x] Add failing expectations for `세션 이탈`, browser quit fallback status UI, native quit hook branch, and smoke snapshot fields.
- [x] Run focused Vitest commands and confirm the new expectations fail before implementation.

### Task 2: Implement shared quit feedback and unified section copy

**Files:**
- Modify: `game/features/ui/presentation/browser/help_pause_ui_dialog_overlays.js`
- Modify: `game/features/ui/presentation/browser/help_pause_ui_dialog_runtime.js`
- Modify: `game/features/ui/presentation/browser/help_pause_ui_pause_menu_overlay.js`
- Modify: `game/features/title/platform/browser/create_title_system_actions.js`
- Modify: `index.html`
- Modify: `css/title_screen.css`

- [x] Replace quit confirm alert fallback with inline status updates and optional `quitGameRequest` support.
- [x] Rename pause exit eyebrow to `세션 이탈`.
- [x] Split title menu into `저장된 런` and `세션 이탈` sections without changing button ids or nav wiring.

### Task 3: Extend smoke structure capture

**Files:**
- Modify: `scripts/help_pause_hotkey_smoke_check.mjs`
- Modify: `scripts/save_load_roundtrip_smoke_check.mjs`
- Modify: `scripts/title_meta_smoke_check.mjs`

- [x] Capture return-title shared-frame metadata.
- [x] Capture pause exit label snapshots and quit confirm body/title snapshots.
- [x] Capture title section labels and quit meta snapshot.

### Task 4: Verify end to end

**Files:**
- No code changes required unless regressions appear

- [ ] Run focused Vitest bundles for touched UI/runtime/smoke tests.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Run `npm run smoke:browser`.
