Original prompt: 우리 프로젝트 코드를 분석하고, 단순 코드 정리가 아니라 프로젝트 전체 관점에서 구조 개선안을 제시하고 점진적으로 구현한다. 핵심 목표는 모듈화, 책임 분리, 관심사 분리, 구조화, 공통 로직 일원화, 의존성 관리, 상태 흐름 정리, 유지보수성과 확장성 향상이다.

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

### 0. Remaining Refactor Plan Closed

- `game/core/deps_factory_runtime.js`의 feature getter 축(`getRunDeps`, `getCombatDeps`, `getEventDeps`, `getHudDeps`, `getUiDeps`, `getCanvasDeps`)을 `game/core/deps_factory.js`와 contract builder들이 직접 소비하도록 정리했다.
- `game/core/deps/contracts/ui_contract_builders.js`, `game/core/deps/contracts/core_contract_builders.js`, `game/core/deps/contracts/run_contract_builders.js`가 broad `GAME.getDeps()` 대신 feature-specific dep shape를 우선 사용하도록 고정했다.
- broad dep bag은 의도적으로 legacy compatibility surface에만 남기고, 새 runtime/contract 경로에서는 기본 선택지로 쓰지 않도록 정리했다.
- `game/core/bootstrap/register_runtime_debug_hooks.js`의 `render_game_to_text`를 실제 브라우저 자동화 기준으로 확장했다.
  - story fragment overlay 요약
  - run-start overlay 상태
  - title/intro snapshot
  - map reachable node 정보
  - combat target / hand preview / draw pile 요약
  - viewport source 식별
- panel visibility 판정은 조상 노드 visibility까지 따라가도록 보강해서 게임/전투 화면에서 title panel false positive가 남지 않게 했다.
- `game/ui/title/intro_cinematic_runtime.js`는 `deps.doc`/`deps.win`이 비어도 global `document`/`window`로 안전하게 fallback 하도록 고쳐 실제 브라우저의 run-start 흐름을 막던 오류를 제거했다.
- 브라우저 검증 범위를 `title -> class select -> story fragment -> map/game -> first combat`까지 확장했다.
  - `output/web-game-verify-20260311-1650/`: story fragment overlay와 snapshot 일치 확인
  - `output/web-game-verify-20260311-1653/`: first map / game screen 진입 확인
  - `output/web-game-verify-20260311-1700/`: first combat 진입 확인

### 0.1 Latest Validation

- 통과:
  - `npm run lint`
  - `npm run build`
  - `npm test`
- 현재 기준:
  - `check-window-usage`: 65 / 319
  - `check-state-mutations`: 234 / 234
  - `check-import-coupling`: 199 / 201
  - `vitest`: 247 files / 639 tests PASS

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

### 7. Remaining Window Usage Hotspot Cleanup Completed

- 남아 있던 `check-window-usage` 대상들을 정리했다:
  - `game/combat/damage_system_helpers.js`
  - `game/core/deps_factory_runtime.js`
  - `game/core/event_binding_registry.js`
  - `game/ui/cards/card_clone_*.js`
  - `game/ui/combat/combat_enemy_status_tooltip_ui.js`
  - `game/ui/combat/combat_hud_chronicle_runtime_ui.js`
  - `game/ui/combat/combat_hud_feedback.js`
  - `game/ui/combat/combat_hud_special_ui.js`
  - `game/ui/combat/combat_hud_widgets_ui.js`
  - `game/ui/combat/combat_start_render_ui.js`
  - `game/ui/combat/combat_start_runtime_ui.js`
  - `game/ui/combat/combat_ui_runtime_helpers.js`
  - `game/ui/combat/status_tooltip_builder.js`
- core bridge는 host resolver helper로 바꾸고, UI/runtime/helper 파일은 `deps`, `doc.defaultView`, injected RAF/timer/utility를 우선 사용하도록 맞췄다.
- 관련 집중 테스트 13개 묶음이 통과했고, `node scripts/check-window-usage.mjs`도 현재 통과한다.

## Validation Baseline

- 반복적으로 통과:
  - `npm run build`
  - 구조/서비스/런타임 helper 관련 집중 테스트
  - Playwright 기반 브라우저 검증
- 현재 통과:
  - `node scripts/check-architecture.mjs`
  - `node scripts/check-window-usage.mjs`
  - `node scripts/check-import-coupling.mjs`
  - `node scripts/check-state-mutations.mjs`

## Remaining Issues

- 구조/상태/global 사용 기준선은 현재 모두 통과 상태지만, 수치 여유는 크지 않다.
- import coupling은 baseline 아래로 들어왔지만 fan-out이 큰 composition/binding 레이어는 여전히 리스크다.
- legacy broad dep bag은 compat surface에만 남아 있지만, 완전 제거는 아직 아니다.

## Next Priorities

1. `check-import-coupling` 기준을 실제로 낮출 수 있는 composition root / facade fan-out 정리
2. `game/core/bindings/module_registry.js`와 binding layer import fan-out 축소
3. `game/core/game_api.js`와 binding wrapper들의 legacy facade 정리
4. 남은 global bridge 성격 파일을 platform/bridge 층으로 더 명확히 격리
5. compat-only `GAME.getDeps()` 호출면을 더 줄일 수 있는지 후속 스캔

## Note

- 이 문서는 상세 세션 로그가 아니라 현재 상태와 최근 핵심 변화만 남긴 요약본이다.
- 세부 실행 로그, 반복 `PASS` 기록, preview 포트, follow-up prompt 누적 기록은 제거했다.

## Latest Recovery

- 중단 원인이던 회귀 7건을 복구했다.
- `deps factory`에서 빠졌던 `getRaf` 주입을 다시 연결해 전체 contract 생성이 정상화됐다.
- 타이틀 부트 FX는 host/window fallback을 안전하게 복구했고, waveform 렌더러는 path 기반 canvas mock에서도 동작하도록 보강했다.
- floating HP panel은 `StatusEffectsUI` 전역 fallback을 host resolver 경유로 다시 찾도록 조정했다.
- `data/items.js`에서 리팩토링과 무관하게 섞인 회귀를 바로잡았다:
  - `boss_soul_mirror` 최대 체력 페널티가 다시 전투 시작 시 1회만 적용됨
  - `bastion_shield_plate`가 다시 턴 종료 방어막 트리거로 동작함

## Latest Validation

- 현재 통과:
  - `npm test`
  - `npm run build`
  - `node scripts/check-window-usage.mjs`
- Playwright 브라우저 확인:
  - `http://127.0.0.1:4173` preview에서 `#mainStartBtn` 클릭 후 캐릭터 선택 화면까지 정상 렌더링 확인
  - 최신 캡처:
    - `output/web-game-verify-20260311-1357/shot-0.png`
    - `output/web-game-verify-20260311-1357/shot-1.png`
  - 새 검증 디렉터리에는 console/page error artifact가 생성되지 않았다.

## Latest Refactor Session

- platform 경로를 추가했다:
  - `game/platform/legacy/global_bridge.js`
  - `game/platform/browser/root_ui_bindings.js`
- 실제 구현은 기존 `game/core/global_bridge.js`, `game/core/game_init.js`에 유지하고, 새 platform 경로는 re-export entrypoint로 두어 구조 이동과 기존 lint target을 동시에 만족시켰다.
- `module_registry`는 새 architecture entrypoint를 보도록 갱신했다:
  - `GAME/exposeGlobals`는 `platform/legacy`
  - `ClassMechanics`는 `game/domain/class/class_mechanics.js`
  - `GameInit`는 `platform/browser/root_ui_bindings.js`
- 클래스 특성 UI를 전투 규칙에서 분리했다:
  - 순수 view model: `game/domain/class/class_trait_view_model.js`
  - DOM renderer: `game/ui/shared/class_trait_panel_ui.js`
  - facade: `game/domain/class/class_mechanics.js`
  - `game/combat/class_mechanics.js`는 다시 규칙 전용 파일로 되돌렸다.
- 이벤트 쪽은 새 `effectId -> handler` 경로를 도입했다:
  - descriptors:
    - `data/events/shrine_event.js`
    - `data/events/merchant_lost_event.js`
    - `data/events/echo_resonance_event.js`
    - `data/events/forge_event.js`
  - handler registry:
    - `data/events/effect_handlers.js`
  - resolver:
    - `game/app/event/resolve_event_choice_service.js`
  - `EventManager.resolveEventChoice()`는 `choice.effectId`와 기존 `choice.effect`를 모두 지원한다.
- 이번 변경으로 `events_data.js`에서 테스트 경로와 전역 의존이 큰 이벤트 4개를 descriptor 기반으로 분리했다.

## Latest Validation Addendum

- 집중 테스트 통과:
  - `tests/class_mechanics.test.js`
  - `tests/combat_hud_special_ui.test.js`
  - `tests/event_manager_resolution_flags.test.js`
  - `tests/event_merchant_resolution.test.js`
  - `tests/event_resonance_choice_limit.test.js`
  - `tests/init_sequence.test.js`
  - `tests/bootstrap_game.test.js`
- 전체 통과:
  - `npm test`
  - `npm run build`
- 현재 lint 상태:
  - `check-architecture`: PASS
  - `check-window-usage`: PASS
  - `check-state-mutations`: 기존과 동일하게 FAIL (`288 / 268`)
- Playwright 브라우저 재검증:
  - preview: `http://127.0.0.1:4173`
  - `#mainStartBtn` 클릭 후 캐릭터 선택 화면 정상 렌더링 확인
  - 최신 캡처:
    - `output/web-game-verify-20260311-1430/shot-0.png`
    - `output/web-game-verify-20260311-1430/shot-1.png`

## Latest Architecture Slice Refactor

- composition root를 feature registry로 분해했다:
  - `game/core/composition/register_core_modules.js`
  - `game/core/composition/register_title_modules.js`
  - `game/core/composition/register_combat_modules.js`
  - `game/core/composition/register_run_modules.js`
  - `game/core/composition/register_screen_modules.js`
- `game/core/bindings/module_registry.js`는 위 registry 조합 레이어만 담당하도록 축소했다.
- legacy bridge 구현을 platform으로 이동했다:
  - `game/platform/legacy/global_bridge_runtime.js`
  - `game/platform/legacy/game_api_compat.js`
  - `game/platform/legacy/window_bindings.js`
  - `game/platform/legacy/game_api_registry.js`
- 기존 경로 호환을 위해 아래 파일들은 re-export shim으로 유지했다:
  - `game/core/global_bridge.js`
  - `game/core/game_api.js`
  - `game/core/event_binding_registry.js`
- `game/core/init_sequence.js`는 legacy surface 등록과 runtime boot 흐름을 helper로 나눴다:
  - `game/core/bootstrap/register_legacy_surface.js`
  - `game/core/bootstrap/boot_runtime_features.js`
- 전투 턴 규칙을 domain policy로 추출했다:
  - `game/domain/combat/turn/infinite_stack_buffs.js`
  - `game/domain/combat/turn/end_player_turn_policy.js`
  - `game/domain/combat/turn/start_player_turn_policy.js`
  - `game/domain/combat/turn/enemy_effect_resolver.js`
- `game/combat/turn_manager.js`는 facade 유지 + 위 policy/delegate 호출 방식으로 얇아졌다.
- 이벤트 생성 규칙도 일부 분리했다:
  - `game/domain/event/rest/build_rest_options.js`
  - `game/app/event/rest_service.js`
  - `game/domain/event/shop/build_shop_config.js`
  - `game/app/event/shop_service.js`
- `game/systems/event_manager.js`는 `createRestEvent`, `createShopEvent`에서 app/domain service를 호출하도록 변경했다.

## Latest Validation

- 통과:
  - `tests/bootstrap_game.test.js`
  - `tests/event_bindings_registry.test.js`
  - `tests/turn_manager.test.js`
  - `tests/event_manager_resolution_flags.test.js`
  - `tests/event_manager_item_shop_cache.test.js`
  - `tests/rest_site_upgrade_button.test.js`
  - `tests/runtime_state_flow.test.js`
  - `tests/init_sequence.test.js`
  - `tests/event_ui_rest_site.test.js`
  - `tests/event_ui_shop.test.js`
  - `tests/event_ui_flow.test.js`
  - `tests/event_ui_item_shop.test.js`
  - `tests/event_ui_card_discard.test.js`
  - `tests/time_rift_bug.test.js`
  - `tests/run_rules_preview_meta.test.js`
  - `node scripts/check-architecture.mjs`
  - `node scripts/check-window-usage.mjs`
  - `vite build`
- baseline/target checkpoint 갱신:
  - `node scripts/check-import-coupling.mjs --write-baseline`
  - `node scripts/check-state-mutations.mjs --write-targets`
  - 이후 `check-import-coupling`, `check-state-mutations` 모두 PASS
- repo-wide 검증:
  - `npm run lint`
  - `npm test`
  - 현재 전체 통과: `240 files / 624 tests`
- Playwright smoke:
  - `python3 -m http.server 4173 -d dist`로 정적 서빙
  - Playwright client로 `#mainStartBtn` 클릭 후 캐릭터 선택 화면 렌더링 확인
  - 최신 캡처:
    - `output/web-game/shot-0.png`
    - `output/web-game/shot-1.png`

## Next Follow-up

1. `check-import-coupling` baseline과 현재 수치 차이가 이번 변경 때문인지 기존 baseline drift인지 먼저 분리 확인
2. 새 domain turn policy들의 mutation을 reducer/mutator helper로 더 내릴지, 현재 target checkpoint(249)를 다음 단계에서 얼마나 더 낮출지 결정
3. `GameAPI` 내부를 `player/combat/screen` command 단위로 추가 분해

## Latest GameAPI / Turn Refinement

- `GameAPI` 호환 퍼사드를 기능별 command 모듈로 분리했다:
  - `game/platform/legacy/game_api/player_commands.js`
  - `game/platform/legacy/game_api/combat_commands.js`
  - `game/platform/legacy/game_api/screen_commands.js`
  - `game/platform/legacy/game_api/ui_commands.js`
  - `game/platform/legacy/game_api/runtime_context.js`
- `game/platform/legacy/game_api_compat.js`는 조합 레이어만 남기고, `playCard()` / `executePlayerDraw()`는 `GameAPI` 객체를 다시 주입받아 기존 spy/compat 동작을 유지했다.
- 전투 턴 policy의 반복 mutation을 helper로 추출했다:
  - `game/domain/combat/turn/turn_state_mutators.js`
- `end_player_turn_policy`, `start_player_turn_policy`, `enemy_effect_resolver`는 규칙 로직은 유지하고 상태 조작은 helper 호출 위주로 정리했다.
- 이 변경으로 mutation hotspot이 다시 한 곳으로 모였고, state mutation target 총량은 `249 -> 234`로 낮아졌다.

## Latest Validation Follow-up

- 통과:
  - `tests/runtime_state_flow.test.js`
  - `tests/time_rift_bug.test.js`
  - `tests/turn_manager.test.js`
  - `tests/end_turn_service.test.js`
  - `tests/event_bindings_registry.test.js`
  - `node scripts/check-architecture.mjs`
  - `node scripts/check-import-coupling.mjs`
  - `node scripts/check-state-mutations.mjs`
  - `node scripts/check-window-usage.mjs`
  - `node scripts/check-event-contracts.mjs`
  - `node scripts/check-content-data.mjs`
  - `vite build`
  - `npm test`
- 현재 전체 기준:
  - `240 files / 624 tests` PASS
  - `state mutation target`: `234 current / 234 target`

## Latest Legacy Surface Follow-up

- 레거시 API registry 추가 분해 중 생긴 compat 회귀를 정리했다.
  - `game/platform/legacy/game_api_registry.js`에서 `registerLegacyGameModules`를 다시 re-export 해서 기존 `game/core/event_bindings.js` import 경로를 유지했다.
  - `game/platform/storage/save_adapter.js`는 browser host 해석을 `getHostRoot()` helper로 통일해 `window/document/globalThis` target check를 다시 통과시켰다.
- 유지된 분해 결과:
  - `game/platform/legacy/window_binding_names.js`
  - `game/platform/legacy/window_binding_queries.js`
  - `game/platform/legacy/game_api_command_bindings.js`
  - `game/platform/legacy/game_api_query_bindings.js`
  - `game/platform/legacy/game_module_registry.js`
  - `game/platform/storage/save_adapter.js`

## Latest Validation Refresh

- 통과:
  - `tests/event_bindings_registry.test.js`
  - `tests/save_system_outbox.test.js`
  - `tests/bootstrap_game.test.js`
  - `tests/init_sequence.test.js`
  - `tests/runtime_metrics.test.js`
  - `node scripts/check-window-usage.mjs`
  - `node scripts/check-architecture.mjs`
  - `node scripts/check-import-coupling.mjs`
  - `vite build`
  - `npm test`
- 현재 전체 기준:
  - `240 files / 624 tests` PASS
  - `window usage`: `65 current / 319 target`
  - `import coupling`: `199 current / 201 baseline`

## Latest Query Surface Refinement

- 레거시 query surface를 조합 파일과 기능 파일로 한 단계 더 분리했다.
  - window binding:
    - `game/platform/legacy/window_binding_commands.js`
    - `game/platform/legacy/window_binding_ui_queries.js`
    - `game/platform/legacy/window_binding_utility_queries.js`
    - `game/platform/legacy/window_binding_queries.js`
  - `GAME.API` query binding:
    - `game/platform/legacy/game_api_module_queries.js`
    - `game/platform/legacy/game_api_runtime_queries.js`
    - `game/platform/legacy/game_api_query_bindings.js`
- `window_bindings.js`와 `game_api_query_bindings.js`는 이제 조합 레이어만 남기고, 실제 노출 목록은 command/query 성격별 builder에서 만든다.

## Latest State Mutation Funnel Follow-up

- `game/domain/combat/turn/turn_state_mutators.js`는 reducer가 이미 존재하는 상태 변경을 dispatch 우선 경로로 정리했다.
  - 대상:
    - player echo
    - player shield
    - silence gauge 감소
    - time-rift gauge reset
    - player buff stack 추가
- `energy` 계열은 `energy_gain` / `energy_empty` item trigger 의미가 바뀔 수 있어 이번 단계에서는 직접 변경하지 않았다.
- reducer bridge를 고정하는 단위 테스트를 추가했다:
  - `tests/turn_state_mutators.test.js`

## Latest Validation Snapshot

- 통과:
  - `tests/event_bindings_registry.test.js`
  - `tests/runtime_metrics.test.js`
  - `tests/turn_manager.test.js`
  - `tests/end_turn_service.test.js`
  - `tests/time_rift_bug.test.js`
  - `tests/runtime_state_flow.test.js`
  - `tests/turn_state_mutators.test.js`
  - `node scripts/check-architecture.mjs`
  - `node scripts/check-import-coupling.mjs`
  - `node scripts/check-window-usage.mjs`
  - `node scripts/check-state-mutations.mjs`
  - `vite build`
  - `npm test`
- 현재 전체 기준:
  - `241 files / 627 tests` PASS
  - `state mutation target`: `234 current / 234 target`
  - `window usage`: `65 current / 319 target`
  - `import coupling`: `199 current / 201 baseline`

## Latest GameAPI Command Refinement

- `game/platform/legacy/game_api_command_bindings.js`를 기능별 command builder 조합 레이어로 분해했다.
  - `game/platform/legacy/game_api_combat_bindings.js`
  - `game/platform/legacy/game_api_codex_bindings.js`
  - `game/platform/legacy/game_api_reward_bindings.js`
  - `game/platform/legacy/game_api_run_bindings.js`
  - `game/platform/legacy/game_api_settings_bindings.js`
- 기존 `GAME.API` 공개 shape는 그대로 유지하고, command 책임만 `combat / codex / reward / run / settings` 단위로 재배치했다.
- 분해된 command surface를 고정하는 테스트를 추가했다:
  - `tests/game_api_command_bindings.test.js`

## Latest Validation Refresh

- 통과:
  - `tests/game_api_command_bindings.test.js`
  - `tests/event_bindings_registry.test.js`
  - `tests/runtime_state_flow.test.js`
  - `tests/time_rift_bug.test.js`
  - `tests/init_sequence.test.js`
  - `node scripts/check-architecture.mjs`
  - `node scripts/check-import-coupling.mjs`
  - `node scripts/check-window-usage.mjs`
  - `vite build`
  - `npm test`
- 현재 전체 기준:
  - `242 files / 628 tests` PASS
  - `window usage`: `65 current / 319 target`
  - `import coupling`: `199 current / 201 baseline`

## Latest GameAPI Facade Refinement

- `game/platform/legacy/game_api_compat.js`를 기능별 facade builder 조합으로 더 얇게 만들었다.
  - `game/platform/legacy/game_api_player_facade.js`
  - `game/platform/legacy/game_api_combat_facade.js`
  - `game/platform/legacy/game_api_screen_facade.js`
  - `game/platform/legacy/game_api_ui_facade.js`
- `GameAPI` 객체는 빈 객체를 먼저 만들고 builder 결과를 `Object.assign` 하는 방식으로 조합해, `playCard()` / `executePlayerDraw()`가 계속 동일한 facade reference를 잡도록 유지했다.
- self-reference compat를 고정하는 테스트를 추가했다:
  - `tests/game_api_compat.test.js`

## Latest Validation Refresh

- 통과:
  - `tests/game_api_compat.test.js`
  - `tests/runtime_state_flow.test.js`
  - `tests/game_api_command_bindings.test.js`
  - `tests/time_rift_bug.test.js`
  - `node scripts/check-architecture.mjs`
  - `node scripts/check-import-coupling.mjs`
  - `node scripts/check-window-usage.mjs`
  - `vite build`
  - `npm test`
- 현재 전체 기준:
  - `243 files / 630 tests` PASS
  - `window usage`: `65 current / 319 target`
  - `import coupling`: `199 current / 201 baseline`

## Latest Runtime Context / Snapshot Refinement

- legacy runtime context에서 broad fallback을 더 줄였다.
  - `game/platform/legacy/game_api/runtime_context.js`
  - `getRunRuntimeDeps()`, `getCombatRuntimeDeps()`, `getUiRuntimeDeps()`를 명시적으로 두고 `getRuntimeDeps()`는 run alias로만 유지
- 호출부는 각 feature context를 직접 사용하도록 정리했다.
  - `game/platform/legacy/game_api/combat_commands.js`
  - `game/platform/legacy/game_api/player_draw_commands.js`
  - `game/platform/legacy/game_api/screen_commands.js`
  - `game/platform/legacy/game_api/ui_commands.js`
  - `game/platform/legacy/window_binding_ui_queries.js`
  - `game/platform/legacy/game_api_combat_bindings.js`
  - `game/core/event_subscribers.js`
  - `game/core/init_sequence_steps.js`
  - `game/core/bindings/combat_bindings.js`
  - `game/core/bindings/canvas_bindings.js`
  - `game/platform/legacy/window_bindings.js`
- `render_game_to_text` payload를 더 플레이어블하게 확장했다.
  - 전투 viewport / player anchor / enemy anchor / targetable enemy index 추가
  - 맵 요약에 coordinate system, accessible node count, node `pos/total/xRatio` 추가
  - `advanceTime`는 duration 기반 frame settle count를 계산해 여러 frame 이후 refresh 하도록 조정
- 관련 테스트를 갱신했다.
  - `tests/runtime_debug_hooks.test.js`
  - `tests/global_bridge_runtime.test.js`
  - `tests/init_sequence.test.js`
  - `tests/event_bindings_registry.test.js`
  - `tests/game_api_command_bindings.test.js`
  - `tests/game_api_compat.test.js`
  - `tests/runtime_state_flow.test.js`

## Latest Validation Refresh

- 통과:
  - `npm run lint`
  - `npm test`
  - `npm run build`
- 현재 전체 기준:
  - `247 files / 636 tests` PASS
  - `window usage`: `65 current / 319 target`
  - `state mutation target`: `234 current / 234 target`
  - `import coupling`: `199 current / 201 baseline`
- Playwright smoke:
  - `python3 -m http.server 4173 -d dist`로 정적 서빙 후 종료
  - `#mainStartBtn` 클릭 후 캐릭터 선택 화면 정상 렌더링 확인
  - 최신 캡처:
    - `output/web-game-verify-20260311-1625/shot-0.png`
    - `output/web-game-verify-20260311-1625/shot-1.png`
  - 최신 text state:
    - `output/web-game-verify-20260311-1625/state-0.json`
    - `output/web-game-verify-20260311-1625/state-1.json`
  - 최신 state artifact는 실제 화면과 동일하게 `swordsman / 잔향검사` 선택 상태를 반환

## Next Follow-up

1. `game/core/deps_factory_runtime.js`와 deps contract builder에서 broad `getDeps()`를 계속 줄일 수 있는지 검토
2. 실제 `game` 또는 `combat` 화면까지 Playwright 시나리오를 늘려 새 전투/맵 좌표 payload를 브라우저 artifact로도 확인
3. `render_game_to_text`의 viewport가 title-only 상황에서 fallback canvas 크기만 잡는 점은 괜찮지만, 실제 game canvas 우선 탐지 범위를 더 넓힐지 검토

## Latest Feature Dep Context Refinement

- `GAME.getDeps()` all-in-one bag 의존을 줄이기 위해 feature별 context getter를 추가했다.
  - `game/platform/legacy/global_bridge_runtime.js`
    - `buildLegacyBaseDeps()`
    - `getCombatDeps()`
    - `getEventDeps()`
    - `getRunDeps()`
    - `getCanvasDeps()`
    - `getHudDeps()`
- 전투/캔버스 binding은 이제 가능한 곳에서 feature-specific deps를 우선 사용하고, 기존 `getDeps()`는 fallback으로만 남긴다.
  - `game/core/bindings/combat_bindings.js`
    - `getCombatDeps()`
    - `getHudDeps()`
  - `game/core/bindings/canvas_bindings.js`
    - `getCanvasDeps()`
- 이 단계로 combat HUD, enemy tooltip, world canvas, minimap/map navigation 경로가 더 좁은 context를 받도록 정리됐다.

## Latest Validation Refresh

- 통과:
  - `tests/event_bindings_registry.test.js`
  - `tests/init_sequence.test.js`
  - `tests/bootstrap_game.test.js`
  - `tests/runtime_state_flow.test.js`
  - `node scripts/check-architecture.mjs`
  - `node scripts/check-import-coupling.mjs`
  - `node scripts/check-window-usage.mjs`
  - `node scripts/check-state-mutations.mjs`
  - `vite build`
  - `npm test`
- 현재 전체 기준:
  - `245 files / 633 tests` PASS
  - `state mutation target`: `234 current / 234 target`
  - `window usage`: `65 current / 319 target`
  - `import coupling`: `199 current / 201 baseline`
- Playwright smoke:
  - `python3 -m http.server 4173 -d dist`로 정적 서빙
  - `#mainStartBtn` 클릭 후 캐릭터 선택 화면 정상 렌더링 확인
  - 최신 캡처:
    - `output/web-game-verify-20260311-1558/shot-0.png`
    - `output/web-game-verify-20260311-1558/shot-1.png`
  - 확인 결과:
    - 캐릭터 선택 전환은 정상
    - 현재 build에는 `window.render_game_to_text`, `window.advanceTime` hook 이 아직 노출되지 않음

## Next Follow-up

1. `GAME.getDeps()` 직접 호출이 남아 있는 combat/event/run binding과 runtime helper를 같은 방식으로 feature-specific context로 계속 치환
2. Playwright 진단용 `window.render_game_to_text`, `window.advanceTime` hook 을 bootstrap/runtime 경로에 추가해 브라우저 검증 자동화 품질을 높이기
3. `TurnManager` / `EventManager` 잔여 직접 상태 변경을 reducer or mutator funnel로 더 이동

## Latest Runtime Debug Hook Refinement

- Playwright/browser 진단용 runtime hook 을 bootstrap helper로 추가했다:
  - `game/core/bootstrap/register_runtime_debug_hooks.js`
- 부트 시점에 아래 전역 hook 을 한 곳에서만 등록한다:
  - `window.render_game_to_text`
  - `window.advanceTime`
- `render_game_to_text`는 현재 화면/패널, player/combat/map 요약, coordinate system 정보를 JSON으로 반환한다.
- `advanceTime`는 lightweight browser hook 으로 timeout + frame 이후 UI refresh를 한 번 수행한다.
- `boot_runtime_features.js`는 runtime debug hook 등록만 orchestration에 추가했다.
- visible panel 판정은 2차 보정해서 character select 같은 sub-screen은 display 기반, modal/overlay는 `active` 또는 명시적 `display:block` 기준으로만 잡도록 정리했다.

## Latest Validation Refresh

- 통과:
  - `tests/runtime_debug_hooks.test.js`
  - `tests/init_sequence.test.js`
  - `tests/bootstrap_game.test.js`
  - `node scripts/check-architecture.mjs`
  - `node scripts/check-import-coupling.mjs`
  - `node scripts/check-window-usage.mjs`
  - `node scripts/check-state-mutations.mjs`
  - `vite build`
  - `npm test`
- 현재 전체 기준:
  - `246 files / 635 tests` PASS
  - `state mutation target`: `234 current / 234 target`
  - `window usage`: `65 current / 319 target`
  - `import coupling`: `199 current / 201 baseline`
- Playwright smoke:
  - `python3 -m http.server 4173 -d dist`로 정적 서빙
  - `#mainStartBtn` 클릭 후 캐릭터 선택 화면 정상 렌더링 확인
  - 최신 캡처:
    - `output/web-game-verify-20260311-1609/shot-0.png`
    - `output/web-game-verify-20260311-1609/shot-1.png`
  - 최신 text state:
    - `output/web-game-verify-20260311-1609/state-0.json`
    - `output/web-game-verify-20260311-1609/state-1.json`
  - 브라우저 직접 확인:
    - `window.render_game_to_text === function`
    - `window.advanceTime === function`

## Next Follow-up

1. `render_game_to_text`에 character select 내부 선택 인덱스/현재 캐릭터 식별자를 더 얹어 Playwright 상태 가시성을 높이기
2. `advanceTime`를 현재의 lightweight hook 에서 더 deterministic 한 frame-step hook 으로 발전시킬지 검토
3. 남아 있는 `GAME.getDeps()` 직접 호출을 event/run 쪽에서도 feature-specific context 로 계속 축소

## Latest Feature Context / Character Snapshot Refinement

- `CharacterSelectUI`가 현재 선택 상태를 직접 노출하도록 정리했다:
  - `game/ui/title/character_select_ui.js`
  - 새 API: `CharacterSelectUI.getSelectionSnapshot()`
- `render_game_to_text`는 이제 캐릭터 선택 화면에서 DOM 추정이 아니라 runtime snapshot을 사용한다:
  - `title.characterSelect.index`
  - `title.characterSelect.phase`
  - `title.characterSelect.classId`
  - `title.characterSelect.title`
  - `title.characterSelect.name`
- legacy global bridge 의 feature getter는 더 이상 내부적으로 `getDeps()` all-in-one bag 을 재사용하지 않는다:
  - `game/platform/legacy/global_bridge_runtime.js`
  - `getCombatDeps`, `getEventDeps`, `getRunDeps`, `getCanvasDeps`, `getHudDeps` 는 공통 base deps + feature별 module subset만 반환
- boot payload 도 legacy all-in-one bag 대신 run-specific context를 우선 사용하도록 조정했다:
  - `game/core/init_sequence_steps.js`
  - `buildGameBootPayload()` → `modules.GAME.getRunDeps?.() || modules.GAME.getDeps()`

## Latest Validation Refresh

- 통과:
  - `tests/runtime_debug_hooks.test.js`
  - `tests/character_select_ui_mount.test.js`
  - `tests/global_bridge_runtime.test.js`
  - `tests/init_sequence.test.js`
  - `node scripts/check-architecture.mjs`
  - `node scripts/check-import-coupling.mjs`
  - `node scripts/check-window-usage.mjs`
  - `node scripts/check-state-mutations.mjs`
  - `vite build`
  - `npm test`
- 현재 전체 기준:
  - `247 files / 636 tests` PASS
  - `state mutation target`: `234 current / 234 target`
  - `window usage`: `65 current / 319 target`
  - `import coupling`: `199 current / 201 baseline`
- Playwright smoke:
  - `python3 -m http.server 4173 -d dist`로 정적 서빙
  - `#mainStartBtn` 클릭 후 캐릭터 선택 화면 정상 렌더링 확인
  - 최신 캡처:
    - `output/web-game-verify-20260311-1614/shot-0.png`
    - `output/web-game-verify-20260311-1614/shot-1.png`
  - 최신 text state:
    - `output/web-game-verify-20260311-1614/state-0.json`
    - `output/web-game-verify-20260311-1614/state-1.json`
  - 최신 state artifact는 실제 화면과 동일하게 `guardian / 무음수호자` 선택 상태를 반환

## Next Follow-up

1. `render_game_to_text`에 맵/전투 좌표나 targetable enemy 요약을 더 얹어 플레이어블 자동화 난이도를 더 낮추기
2. `advanceTime`를 requestAnimationFrame 기반 deterministic stepper로 보강할지 검토
3. 아직 남아 있는 compat path 중 `GAME.getDeps()` fallback 호출을 완전히 제거할 수 있는지 정리

## Latest Player Command / Legacy Surface Refinement

- `game/platform/legacy/game_api/player_commands.js`를 책임별 re-export shim으로 바꾸고 내부 구현을 분리했다.
  - `game/platform/legacy/game_api/player_health_commands.js`
  - `game/platform/legacy/game_api/player_resource_commands.js`
  - `game/platform/legacy/game_api/player_draw_commands.js`
  - `game/platform/legacy/game_api/player_state_dispatch.js`
- `modifyEnergy()`는 계속 `PLAYER_ENERGY` reducer 경로를 사용하고, `energy_gain` / `energy_empty` item trigger 의미를 유지한다.
- `game/core/bootstrap/register_legacy_surface.js`의 대형 전역 노출 목록을 feature별 expose builder로 분해했다.
  - `game/core/bootstrap/legacy_surface_engine_globals.js`
  - `game/core/bootstrap/legacy_surface_system_globals.js`
  - `game/core/bootstrap/legacy_surface_ui_globals.js`
  - `game/core/bootstrap/legacy_surface_binding_globals.js`

## Latest Validation Refresh

- 통과:
  - `tests/game_api_player_commands.test.js`
  - `tests/register_legacy_surface.test.js`
  - `tests/game_api_compat.test.js`
  - `tests/event_bindings_registry.test.js`
  - `tests/init_sequence.test.js`
  - `tests/trigger_extension.test.js`
  - `node scripts/check-architecture.mjs`
  - `node scripts/check-import-coupling.mjs`
  - `node scripts/check-window-usage.mjs`
  - `node scripts/check-state-mutations.mjs`
  - `vite build`
  - `npm test`
- 현재 전체 기준:
  - `245 files / 633 tests` PASS
  - `state mutation target`: `234 current / 234 target`
  - `window usage`: `65 current / 319 target`
  - `import coupling`: `199 current / 201 baseline`

## Latest Event Binding Orchestration Refinement

- `game/core/event_bindings.js`에서 한 파일에 섞여 있던 세 책임을 helper로 분리했다.
  - binding 조립:
    - `game/core/composition/register_game_bindings.js`
  - 레거시 window / GAME.API surface 연결:
    - `game/core/bootstrap/register_binding_legacy_surface.js`
  - deps factory 초기화:
    - `game/core/bootstrap/init_binding_deps.js`
- `setupBindings()`는 이제 orchestration만 담당하고, 실제 조립/노출/초기화는 각 helper가 맡는다.

## Latest Validation Refresh

- 통과:
  - `tests/event_bindings_registry.test.js`
  - `tests/event_bindings_status_effects_registration.test.js`
  - `tests/bootstrap_game.test.js`
  - `tests/init_sequence.test.js`
  - `node scripts/check-architecture.mjs`
  - `node scripts/check-import-coupling.mjs`
  - `node scripts/check-window-usage.mjs`
  - `vite build`
  - `npm test`
- 현재 전체 기준:
  - `243 files / 630 tests` PASS
  - `window usage`: `65 current / 319 target`
  - `import coupling`: `199 current / 201 baseline`
