# Progress Summary

## Current Status

- 프로젝트는 기능 추가보다 구조 개선과 안정화 중심으로 진행 중이다.
- 최근 리팩토링은 `facade -> app service -> domain/service/helper` 분리를 기준으로 점진적으로 적용했다.
- HUD, 전투 UI, 이벤트 UI, 보상 UI, 스토리 UI, 맵/미로 UI, 타이틀/캐릭터 선택 UI의 큰 덩어리 파일들을 여러 helper/runtime 모듈로 나눴다.
- `game/core/game_api.js`는 점차 얇은 진입점으로 바뀌고 있고, 실제 흐름은 app/service 계층으로 이동 중이다.
- `node scripts/check-architecture.mjs`는 통과하는 상태다.
- `npm run build`와 최근 집중 테스트들은 반복적으로 통과했다.
- 브라우저 확인도 Playwright 기반으로 반복 검증했고, 최근 실행들에서는 신규 콘솔 에러 재현이 없었다.

## Recently Completed

### 1. Architecture Refactor

- 상태 리듀서를 도메인별로 분리하고 `game/core/state_actions.js`는 조합 레이어로 축소했다.
- `RunRules`, `HudUpdateUI`, `CombatUI`를 facade 중심으로 재구성하고 세부 렌더링/런타임 로직을 helper 모듈로 분리했다.
- `GameAPI`의 draw, screen, event, play-card 흐름을 app service로 이동했다.
- `region_service`, `end_turn_service`, `card_draw_service`, `event_service`, `screen_service`, `play_card_service`를 추가해 UI가 직접 전역/도메인 로직을 건드리는 경로를 줄였다.

### 2. Global Access Reduction

- 전투 턴, 이벤트 화면, 휴식/상점/카드 폐기, 타이틀 부트, 인트로, 타이틀 캔버스, 캐릭터 선택 흐름에서 `window`, `document`, `globalThis` 직접 접근을 줄였다.
- 주입 가능한 `win`, `doc`, timer, RAF, `now` 의존성으로 바꾸어 테스트 가능성과 런타임 안정성을 높였다.
- 타이틀/캐릭터 선택 스택은 최근 리팩토링 후 `check-window-usage`의 주요 hotspot 목록에서 대부분 빠졌다.

### 3. Bug Fixes

- 버프 카드 사용 후 HUD 상태 배지가 즉시 갱신되지 않던 문제 수정.
- 전투 포기 후 타이틀로 돌아가도 전투 HUD가 남아 있던 문제 수정.
- 보스/미니보스 시작 연출 뒤 플레이어 턴 배너 타이밍 조정.
- 이벤트 `길 잃은 상인 -> 손을 내민다` 선택 시 이벤트가 닫히지 않던 문제 수정.
- 스토리 조각이 이미 본 내용으로 반복 노출되던 흐름 수정.
- 타이틀 부트 시 timer binding 문제로 발생하던 `Illegal invocation` 런타임 오류 수정.

### 4. UI / Runtime Extraction

- 이벤트, 보상, 스토리 hidden ending, HUD panel/update, 맵 full-map/next-nodes, 미로 시스템 등에서 화면 조립과 상태 흐름을 분리했다.
- 최근에는 medium-sized UI runtime 파일을 우선적으로 얇게 만드는 방향으로 진행했다.

### 5. HUD / Reward / Map / Pause Global Cleanup

- `help_pause_ui_pause_menu_overlay`, `reward_ui_helpers`, `reward_ui_option_renderers`, `feedback_ui_effects`, `map_ui_next_nodes_render`에서 `window`, `document`, `globalThis` 직접 fallback을 제거했다.
- `map_ui_next_nodes`는 `runOnNextFrame`과 `buildRelicPanel`에 `deps`를 전달하도록 맞춰 RAF/window 의존을 주입형으로 통일했다.
- dependency contract도 함께 보강해서 `helpPause`는 `audioEngine`, `reward`는 tooltip/description utils, `feedback`는 RAF를 명시적으로 받게 했다.
- 집중 테스트:
  - `tests/help_pause_ui_pause_menu_overlay.test.js`
  - `tests/reward_ui_option_renderers.test.js`
  - `tests/reward_ui_screen_runtime.test.js`
  - `tests/feedback_ui_effects.test.js`
  - `tests/map_ui_next_nodes_render.test.js`
  - `tests/map_ui_next_nodes_overlay.test.js`
  모두 통과했다.

### 6. Run Mode / Ending Screen Global Cleanup

- `run_mode_ui_helpers`, `run_mode_ui_render`, `run_mode_ui_runtime`에서 `document`, `window`, `globalThis.DATA` fallback을 제거했다.
- `ending_screen_render_helpers`, `ending_screen_runtime_helpers`, `ending_screen_scene_runtime`, `event_ui_flow`도 `deps` 기반 선택/재시작/audio/data 경로만 사용하도록 정리했다.
- 집중 테스트:
  - `tests/run_mode_ui.test.js`
  - `tests/run_mode_ui_facade.test.js`
  - `tests/run_mode_ui_render_sections.test.js`
  - `tests/run_mode_ui_runtime.test.js`
  - `tests/ending_screen_render_helpers.test.js`
  - `tests/ending_screen_runtime_helpers.test.js`
  - `tests/ending_screen_scene_runtime.test.js`
  - `tests/ending_screen_ui.test.js`
  - `tests/ending_screen_ui_runtime.test.js`
  모두 통과했다.

## Validation Baseline

- 반복적으로 통과:
  - `npm run build`
  - 구조/서비스/런타임 helper 관련 집중 테스트
  - Playwright 기반 브라우저 검증
- 현재 통과:
  - `node scripts/check-architecture.mjs`
- 아직 남아 있는 기준 초과:
  - `node scripts/check-import-coupling.mjs`
  - `node scripts/check-window-usage.mjs`

## Remaining Issues

- import coupling은 아직 repo 전체 기준으로 초과 상태다.
- window/global 접근도 전체 기준으로는 아직 목표치 이하로 내리지 못했다.
- 남은 hotspot은 title 바깥의 HUD, help/pause, map 계열 runtime helper 쪽이 우선순위가 높다.

## Next Priorities

1. `game/ui/screens/codex_ui_runtime.js`와 `game/ui/screens/codex_ui_progress_render.js` 정리
2. `game/ui/run/run_return_ui_branch_ui.js`와 `game/ui/shared/player_hp_panel_runtime_ui.js` 정리
3. combat/cards/shared runtime helper에서 남은 `window/globalThis` fallback 제거
4. `check-import-coupling`과 `check-window-usage` 기준치를 실제로 낮출 수 있는 파일부터 순차 정리

## Note

- 이 문서는 상세 세션 로그가 아니라 현재 상태와 최근 핵심 변화만 남긴 요약본이다.
- 세부 실행 로그, 반복 `PASS` 기록, preview 포트, follow-up prompt 누적 기록은 제거했다.
