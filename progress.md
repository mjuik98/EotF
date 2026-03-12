Original prompt: 우리 프로젝트 코드를 분석하고, 단순 코드 정리가 아니라 프로젝트 전체 관점에서 구조 개선안을 제시하고, 모듈화/책임 분리/관심사 분리/구조화/공통 로직 일원화/의존성 관리/상태 흐름 정리/유지보수성과 확장성 향상을 목표로 점진적으로 구현한다.

# Progress Summary

## Current State

- 방향:
  - 전면 재작성 없이 `feature-local app/use_case/state/presentation/platform` 경계를 늘리고, 기존 `ui/*`와 `platform/legacy/*`는 compat facade로 점진 축소한다.
  - 최근 초점은 `combat + state`, `title/ending/help_pause`, `reward/navigation` 라인의 책임 분리다.
- 최신 메트릭:
  - state mutation total: `164`
  - import coupling total: `418`
  - window/document/globalThis usage: `8`
- 최신 전체 검증:
  - `npm run lint` PASS
  - `npm test` PASS: `375 files / 897 tests`
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/arch-refactor-public-facade-batch-41/shot-0.png`
    - `output/web-game/arch-refactor-public-facade-batch-41/shot-2.png`
    - `output/web-game/arch-refactor-public-facade-batch-41/state-0.json`
    - `output/web-game/arch-refactor-public-facade-batch-41/state-2.json`
  - latest smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - screenshot과 state가 동일한 swordsman character select 상태를 보여줌

## Architecture Refactor Direction (2026-03-12)

- 구조 분석 기준:
  - 현재 저장소는 `game/app`, `game/features`, `game/presentation`, `game/ui`, `game/platform`, `game/core`, `game/combat`, `game/systems`가 공존하는 전이 상태다.
  - 경계 검사는 PASS지만, 실질 허브는 `game/ui`, `game/core`, `game/platform/legacy`에 집중돼 있다.
- 확인된 구조 신호:
  - source file count:
    - `game/ui: 228`
    - `game/core: 115`
    - `game/platform: 74` (`legacy: 50`, `browser: 23`)
    - `game/features: 67`
  - dependency hotspots:
    - `ui->ui: 219`
    - `core->core: 131`
    - `platform->ui: 38`
    - `ui->data: 37`
    - `ui->app: 21`
  - top incoming:
    - `game/domain/audio/audio_event_helpers.js: 34`
    - `game/core/state_actions.js: 20`
    - `data/game_data.js: 14`
- 해석:
  - 레이어가 없는 상태는 아니지만, `ui`가 orchestration과 data access까지 맡고 있고 `core`가 bootstrap + deps + compat를 함께 소유한다.
  - `feature`는 일부 영역에서 facade 역할을 하지만, 아직 `app`과 책임이 중복된다.
  - `platform/browser/composition`이 feature public API가 아니라 UI 구현체를 직접 아는 경우가 많다.
- 확정 방향:
  - 전면 재작성 없이 `feature 단위 수직 분할 + 공용 커널 최소화 + 조립 루트 축소`를 적용한다.
  - 최상위 구조는 장기적으로 `bootstrap`, `shared`, `platform`, `features` 4축으로 수렴한다.
  - `game/app`의 use case는 점진적으로 각 feature의 `application`으로 흡수한다.
  - `game/ui/*`는 기능별 `features/*/presentation/browser`로 이동시키되, 이동 전에는 각 feature에 `public.js` facade를 먼저 도입한다.
  - `platform/legacy`는 유지하되 feature public API를 호출하는 adapter로만 축소한다.

## Next Architecture Batch

1. `platform/legacy`의 남은 window/game API query group 조립면, 특히 `build_legacy_window_query_groups`와 `build_legacy_game_api_query_groups`에서 아직 직접 조립되는 surface를 `shared/runtime` 또는 feature public builder로 더 끌어올린다.
2. `core/system`과 `core/deps`에 남아 있는 비-feature service 의존을 검토해서 `shared` 또는 feature facade로 수렴할 수 있는 후보를 추린다.
3. `game/shared/state/public.js`와 `game/shared/runtime/public.js`로 올린 공용 경계를 `runtime selectors/commands`와 legacy registry payload 쪽으로 더 확장할 수 있는지 검토한다.
4. 신규 아키텍처 가드의 `sourceFiles + denyTargets` 규칙을 legacy/core의 남은 조립 지점까지 점진 확장한다.
5. 검증은 `npm run lint`, `npm test`, `npm run build`, Playwright smoke 순서로 유지한다.

## Active Refactor Tracks

1. Combat + State
   - 목표: `combat_lifecycle`, `death_handler`, `enemy_turn_domain`에 섞인 상태 변경, UI 정리, 보상 전환, alias fallback을 feature-local use case/ports/state commands로 이동
   - 현재 상태:
     - `endCombat`는 `use_case + presentation + platform port`로 분리됨
     - `enemy_turn_domain` 일부 직접 mutation은 state command로 이동됨
     - `enemy status tick`은 pure planner + state command 적용 흐름으로 분리됨
   - 다음 후보:
     - `death_handler` 종료/보상 진입 경로 분리
     - `processEnemyStun` / `decayEnemyWeaken`의 남은 상태 카운터 mutation 정리

2. Title / Ending / HelpPause
   - 목표: 화면 runtime이 정책을 직접 소유하지 않도록 `action facade`, `runtime helper`, `presenter`로 분리
  - 현재 상태:
    - `title return`, `ending restart/select/openCodex`, `help_pause` confirm dialog가 facade/helper 중심으로 정리됨
  - 다음 후보:
    - `help_pause` pause menu helper/runtime를 같은 방식으로 더 얇게 분리
    - `ending_screen_helpers`의 render payload와 scene session 조립 경계 추가 축소

3. Reward / Navigation Semantics
   - 목표: `switchScreen('...')`, `returnToGame(true)` 같은 의미 불명확한 호출을 `showTitleScreen`, `showGameplayScreen`, `returnFromReward` 식의 의미 helper로 수렴
   - 현재 상태:
     - `reward`, `event`, `meta progression`, `combat endless return` 일부가 의미 helper 우선 구조로 정리됨
     - `reward/navigation`은 feature-local `rewardNavigationActions`를 통해 `returnFromReward` / `returnToGame` alias surface를 공통 경유하도록 정리됨
     - `reward_ui_runtime`의 claim/remove 후처리는 공통 use case/helper를 통해 `app/reward/use_cases`로 수렴됨
   - 다음 후보:
     - `death_handler`의 남은 종료 분기와 reward flow payload 조립을 더 축소
     - reward option 선택 이후 screen-level orchestration을 runtime facade/helper로 더 얇게 정리

## Recent Batches

### Batch 41

- legacy의 registry/payload/query merge 조립을 `shared/runtime` helper로 더 끌어올리고, compat surface assign 경로를 공용 helper로 통일
- 추가:
  - `game/shared/runtime/public.js`
  - `tests/legacy_runtime_public_surfaces.test.js`
- 변경:
  - `game/platform/legacy/build_legacy_game_api_payload.js`
  - `game/platform/legacy/window_binding_queries.js`
  - `game/platform/legacy/game_api_registry.js`
  - `game/platform/legacy/game_api_compat.js`
  - `docs/architecture_policy.json`
  - `docs/metrics/import_coupling_baseline.json`
  - `tests/create_legacy_game_api.test.js`
  - `tests/register_legacy_game_api_bindings.test.js`
- 효과:
  - `buildLegacyGameApiActionGroups()`가 legacy API action group 조립을 공용화해서 `build_legacy_game_api_payload.js`가 더 이상 codex/combat/reward/run/settings/ui action 묶음을 직접 소유하지 않는다.
  - `mergeLegacyWindowQueryGroups()`가 legacy window query merge 규칙을 공용화해서 `window_binding_queries.js`가 더 이상 `ui + utility` 병합 세부 구현을 직접 소유하지 않는다.
  - `assignLegacyCompatSurface()`가 registry와 compat facade 양쪽의 `Object.assign` surface를 공통화해서 `game_api_registry.js`와 `game_api_compat.js`가 같은 compat attach 규칙을 사용하게 됐다.
  - architecture policy에 `legacy-game-api-registry-builder-only`, `legacy-game-api-payload-shared-runtime-only`, `legacy-window-query-merge-shared-runtime-only`를 추가해 남은 legacy assembly 회귀를 막았다.
  - import coupling baseline은 `418`로 갱신됐고, 이번 배치 기준 전체 검증(`lint/test/build/smoke`)이 다시 통과했다.

### Batch 40

- legacy의 read-only module/query 조립을 `shared/runtime` builder로 올리고, compat API 조립을 `createLegacyGameApi()` 경유로 통일
- 추가:
  - `game/shared/runtime/public.js`
  - `game/platform/legacy/build_legacy_game_api_compat_payload.js`
  - `tests/legacy_runtime_public_surfaces.test.js`
- 변경:
  - `game/platform/legacy/game_api_module_queries.js`
  - `game/platform/legacy/window_binding_utility_queries.js`
  - `game/platform/legacy/game_api_facade.js`
  - `game/platform/legacy/create_legacy_game_api.js`
  - `docs/architecture_policy.json`
  - `docs/metrics/import_coupling_baseline.json`
  - `tests/create_legacy_game_api.test.js`
- 효과:
  - `legacy`의 module query surface는 더 이상 파일마다 개별 module key를 직접 조합하지 않고 `buildLegacySharedModuleQueries()`와 `buildLegacyUtilityQueries()`를 통해 `game/shared/runtime/public.js`에서 받는다.
  - `buildLegacyGameAPIFacade()`는 더 이상 player/combat/screen/ui facade를 직접 합치지 않고 `buildLegacyGameApiCompatPayload()`와 `createLegacyGameApi()`를 통해 compat API 조립 로직을 재사용한다.
  - `createLegacyGameApi()`는 `playerActions`, `screenActions`까지 수용하도록 확장되어, compat 조립 경로와 registry 조립 경로가 같은 생성 함수를 사용하게 됐다.
  - architecture policy에 `legacy-module-query-shared-runtime-only`, `legacy-game-api-facade-payload-only`를 추가해 shared/public builder 우회 회귀를 막았다.
  - import coupling baseline은 `414`로 갱신됐고, 이번 배치 기준 전체 검증(`lint/test/build/smoke`)이 다시 통과했다.

### Batch 39

- `platform/legacy`의 ui command/query 조립을 feature public facade 중심으로 추가 전환
- 변경:
  - `game/features/ui/public.js`
  - `game/features/combat/public.js`
  - `game/platform/legacy/game_api/ui_commands.js`
  - `game/platform/legacy/build_legacy_window_ui_query_groups.js`
  - `game/platform/legacy/build_legacy_game_api_runtime_query_groups.js`
  - `game/platform/legacy/adapters/create_legacy_combat_compat.js`
  - `docs/architecture_policy.json`
  - `docs/metrics/import_coupling_baseline.json`
  - `tests/feature_public_action_surfaces.test.js`
- 효과:
  - `legacy`의 ui command surface는 `createLegacyUiCommandFacade()`를 통해 `features/ui/public.js`로 위임되고, 더 이상 command 파일 안에서 module lookup 규칙을 직접 소유하지 않는다.
  - `legacy`의 hud/runtime query surface는 `createLegacyHudRuntimeQueryBindings()`를 통해 `features/ui/public.js`에서 조립되고, window/game API query 그룹은 필요한 키만 선택해서 노출한다.
  - `build_legacy_window_ui_query_groups.js`는 더 이상 legacy adapter를 직접 import하지 않고 `createCombatLegacyUiCompat()`를 통해 combat tooltip compat를 feature public surface에서 받는다.
  - architecture policy에 `legacy-window-ui-query-public-only`, `legacy-runtime-query-ui-public-only`를 추가해 같은 회귀를 막았다.
  - import coupling baseline은 legacy가 feature public facade를 더 직접 경유하게 되면서 `412`로 갱신됐고, 이번 배치 기준 전체 검증(`lint/test/build/smoke`)이 다시 통과했다.

### Batch 38

- non-core 상태 액션 import를 `game/shared/state/public.js`로 수렴시키고, legacy screen command의 compat alias 경로를 제거
- 추가:
  - `game/shared/state/public.js`
- 변경:
  - `game/combat/player_methods.js`
  - `game/combat/combat_lifecycle.js`
  - `game/combat/death_handler.js`
  - `game/combat/damage_system.js`
  - `game/combat/damage_system_helpers.js`
  - `game/domain/combat/turn/turn_state_mutators.js`
  - `game/app/combat/card_draw_service.js`
  - `game/app/combat/play_card_service.js`
  - `game/features/combat/app/game_state_card_actions.js`
  - `game/ui/combat/combat_actions_runtime_ui.js`
  - `game/platform/legacy/game_api/combat_commands.js`
  - `game/platform/legacy/game_api/player_health_commands.js`
  - `game/platform/legacy/game_api/player_resource_commands.js`
  - `game/platform/legacy/game_api/screen_commands.js`
  - `docs/architecture_policy.json`
  - `docs/metrics/import_coupling_baseline.json`
  - `tests/runtime_flow_controls.test.js`
- 효과:
  - `core/state_actions.js`는 이제 `game/shared/state/public.js`를 통해서만 non-core 레이어에 노출되며, legacy/app/ui/feature/domain/combat에서의 direct import가 제거됐다.
  - `runtime_flow_controls`와 `Actions/Reducers`가 같은 shared state public surface에 모여, 상태 흐름 공용 경계가 한 단계 더 분명해졌다.
  - `platform/legacy/game_api/screen_commands.js`는 더 이상 `app/system/screen_service.js` compat alias를 거치지 않고 `core/system/screen_service.js`를 직접 사용한다.
  - architecture policy에 `non-core-state-actions-shared-only`, `legacy-screen-commands-core-service-only` 규칙을 추가해 같은 형태의 회귀를 막았다.

### Batch 37

- `core/bindings`, `core/bootstrap`, `core/deps/contracts`, `platform/legacy` 일부를 feature public surface 중심으로 추가 전환
- 추가:
  - `game/features/ui/public.js`
  - `game/features/event/public.js`
  - `tests/feature_public_action_surfaces.test.js`
- 변경:
  - `game/features/title/public.js`
  - `game/features/run/public.js`
  - `game/features/combat/public.js`
  - `game/core/bindings/ui_bindings.js`
  - `game/core/bindings/title_settings_bindings.js`
  - `game/core/bindings/combat_bindings.js`
  - `game/core/bindings/canvas_bindings.js`
  - `game/core/bindings/event_reward_bindings_runtime.js`
  - `game/core/bootstrap/build_runtime_subscriber_action_groups.js`
  - `game/core/bootstrap/build_game_boot_action_groups.js`
  - `game/core/deps/contracts/ui_contract_builders.js`
  - `game/core/deps/contracts/run_contract_builders.js`
  - `game/platform/legacy/game_api/combat_commands.js`
  - `game/platform/legacy/game_api/player_draw_commands.js`
  - `game/platform/legacy/adapters/create_legacy_combat_compat.js`
  - `docs/architecture_policy.json`
  - `docs/metrics/import_coupling_baseline.json`
- 효과:
  - `core`의 binding/bootstrap/contract builder가 더 이상 `features/*/app` 또는 `features/*/ports/contracts`를 직접 보지 않고 `features/*/public.js`를 통해 위임된다.
  - `platform/legacy`의 combat command/draw/compat 경로도 `combat` feature public surface를 경유하게 되어 legacy adapter의 세부 구현 결합이 줄었다.
  - architecture policy는 core/legacy의 public facade 우회 금지 범위를 `deps/contracts`와 `legacy/adapters`까지 확장했다.
  - import coupling baseline은 `413 -> 408`로 갱신됐고, 이번 배치 기준 전체 검증(`lint/test/build/smoke`)이 다시 통과했다.

### Batch 35

- `title/run/combat` feature public facade와 shared runtime flow surface를 도입하고, browser composition 일부를 direct UI import에서 public entry import로 전환
- 추가:
  - `game/features/title/public.js`
  - `game/features/run/public.js`
  - `game/features/combat/public.js`
  - `game/shared/state/runtime_flow_controls.js`
  - `tests/feature_public_module_builders.test.js`
  - `tests/runtime_flow_controls.test.js`
- 변경:
  - `game/platform/browser/composition/build_title_flow_modules.js`
  - `game/platform/browser/composition/build_run_map_modules.js`
  - `game/platform/browser/composition/build_combat_core_modules.js`
  - `game/app/shared/use_cases/runtime_state_use_case.js`
  - `game/app/combat/use_cases/start_combat_flow_use_case.js`
  - `game/app/event/use_cases/finish_event_flow_use_case.js`
  - `game/app/run/use_cases/move_to_node_use_case.js`
  - `game/features/event/app/event_choice_flow_actions.js`
  - `game/features/run/app/run_map_actions.js`
  - `game/ui/run/run_return_ui_runtime.js`
  - `game/ui/screens/help_pause_ui_abandon_runtime.js`
  - `game/ui/screens/reward_ui_runtime.js`
  - `game/ui/screens/reward_ui_screen_runtime.js`
  - `scripts/check-architecture.mjs`
  - `docs/architecture_policy.json`
- 효과:
  - `build_title_flow_modules`, `build_run_map_modules`, `build_combat_core_modules`가 더 이상 `ui/*` 내부 구현체를 직접 import하지 않고 각 feature `public.js`를 통해 조립된다.
  - `runtime_state_use_case` 구현은 `game/shared/state/runtime_flow_controls.js`로 이동하고, 기존 `game/app/shared/use_cases/runtime_state_use_case.js`는 compat re-export만 유지한다.
  - `check-architecture`는 `sourceFiles`와 `denyTargetPrefixes`를 지원하게 되어, 특정 composition 파일이 feature public facade를 우회하는 direct import를 금지할 수 있다.
  - 이번 배치로 "public facade 추가 -> composition 1차 전환 -> shared state alias 도입"까지 완료됐고, 다음 배치는 나머지 composition group과 legacy adapter 확장으로 이어가면 된다

### Batch 36

- 남아 있던 browser composition direct import를 같은 public facade 패턴으로 추가 전환
- 변경:
  - `game/features/title/public.js`
  - `game/features/run/public.js`
  - `game/features/combat/public.js`
  - `game/platform/browser/composition/build_title_canvas_modules.js`
  - `game/platform/browser/composition/build_run_flow_modules.js`
  - `game/platform/browser/composition/build_combat_card_modules.js`
  - `game/platform/browser/composition/build_combat_hud_modules.js`
  - `docs/architecture_policy.json`
  - `docs/metrics/import_coupling_baseline.json`
  - `tests/feature_public_module_builders.test.js`
- 효과:
  - `build_title_canvas_modules`, `build_run_flow_modules`, `build_combat_card_modules`, `build_combat_hud_modules`도 더 이상 `ui/*` 내부 구현을 직접 import하지 않고 각 feature `public.js` builder를 통해 조립된다.
  - `title/run/combat` public facade가 단순 re-export를 넘어 composition group별 builder surface까지 제공하게 됐다.
  - 아키텍처 정책은 title/run/combat의 canvas/flow/card/hud 조립 파일까지 direct import 금지 범위를 확장했다.
  - import coupling baseline은 public facade 확장에 맞춰 `413`으로 갱신됐다.

### Batch 34

- `help_pause` pause menu toggle orchestration과 `ending` scene session bootstrap을 runtime helper 경계로 추가 분리
- 추가:
  - `game/ui/screens/help_pause_ui_pause_runtime.js`
- 변경:
  - `game/ui/screens/help_pause_ui.js`
  - `game/ui/screens/ending_screen_runtime_helpers.js`
  - `tests/help_pause_ui.test.js`
  - `tests/ending_screen_runtime_helpers.test.js`
- 효과:
  - `HelpPauseUI.togglePause()`는 더 이상 `gs/doc` 조회, 기존 modal 판정, menu DOM mount, volume sync를 직접 소유하지 않고 `togglePauseMenuRuntime()`으로 위임
  - `prepareEndingScreenSession()`은 payload 생성, root mount, session state 생성, meta/fx bootstrap을 helper 단위로 쪼개 orchestration-only entry에 가까워짐
  - 새 standalone 테스트 파일을 만들지 않고 기존 테스트 파일에 helper 검증을 흡수해, 이전에 겪었던 Vite parser 이슈를 피하면서 경계 테스트를 보강
  - 이번 배치 이후 `title/ending/help_pause` 축의 남은 큰 책임은 pause menu callback semantics와 ending restart/session lifecycle alias 쪽으로 더 좁혀짐

### Batch 33

- `death_handler`의 종료/보상 진입 경로와 defeat payload 조립을 helper 단위로 분리
- 추가:
  - `game/combat/death_handler_enemy_death_flow.js`
- 변경:
  - `game/combat/death_handler.js`
  - `game/combat/death_handler_outcome.js`
  - `game/combat/death_handler_runtime.js`
  - `tests/death_handler.test.js`
  - `tests/death_handler_runtime.test.js`
- 효과:
  - `DeathHandler.onEnemyDeath()`는 직접 DOM/queue/reward fallback을 조합하지 않고, 적 사망 orchestration helper와 runtime port를 통해 흐름을 실행
  - `buildCombatEndFlowPayload()`와 `buildDeathOutcomePayload()`가 분리되어 reward return/ending action payload 조립이 테스트 가능한 경계가 됨
  - 처음엔 `app/combat/use_cases`로 분리하려 했지만 import coupling guard를 넘겨서 최종 배치는 `game/combat/*` 내부 helper 분리로 마무리함

### Batch 32

- `processEnemyStun` / `decayEnemyWeaken`의 남은 카운터 mutation을 enemy-turn state command로 이동
- 변경:
  - `game/features/combat/domain/enemy_turn_domain.js`
  - `game/features/combat/state/enemy_turn_state_commands.js`
  - `tests/enemy_turn_state_commands.test.js`
- 효과:
  - `enemy_turn_domain`은 stun/weaken 카운터를 직접 감소시키지 않고, dedicated state command를 호출하는 orchestration만 담당
  - 적 턴 시작 시 stun 소비와 weakened decay 규칙이 state command 단일 경계로 수렴
  - `decrementEnemyStatusCounterState`, `consumeEnemyStunState`, `decayEnemyWeakenState` 테스트가 추가되어 남은 direct mutation hotspot이 더 줄어듦

### Batch 31

- `help_pause` help overlay/mobile warning 생성과 `ending_screen_helpers` payload 조립을 helper/runtime 단위로 추가 분리
- 추가:
  - `game/ui/screens/help_pause_ui_overlay_runtime.js`
- 변경:
  - `game/ui/screens/help_pause_ui.js`
  - `game/ui/screens/ending_screen_helpers.js`
  - `tests/help_pause_ui.test.js`
  - `tests/ending_screen_helpers.test.js`
- 효과:
  - `HelpPauseUI`는 공개 메서드와 상태 플래그만 유지하고, mobile warning/help overlay DOM 생성과 토글 규칙은 별도 runtime helper가 담당
  - `ending_screen_helpers`는 `regions/deck/inscriptions/stats/chips/outcome decoration` 계산을 작은 pure helper로 쪼개서 payload 조립 책임이 분명해짐
  - `help_pause`와 `ending` 모두 UI shell은 얇게 유지하면서 기존 public surface는 그대로 보존

### Batch 30

- `reward claim/remove` 후 discard/return 흐름을 공통 use case/helper로 수렴
- 추가:
  - `tests/reward_flow_presenter.test.js`
  - `tests/reward_claim_flow_use_case.test.js`
  - `tests/start_reward_remove_use_case.test.js`
- 변경:
  - `game/app/reward/use_cases/claim_reward_use_case.js`
  - `game/ui/screens/reward_ui_runtime.js`
  - `tests/reward_ui_runtime.test.js`
  - `tests/reward_ui.test.js`
- 효과:
  - `reward_ui_runtime`는 idempotency wrapper와 runtime 진입점만 유지하고, claim 성공 후 공통 후처리와 remove/discard 분기는 공통 use case/helper가 담당
  - `returnFromReward` / `returnToGame` payload 조립, cancel rollback, deferred return scheduling이 테스트 가능한 단위로 분리됨
  - feature-local 분리를 시도했지만 import coupling guard를 유지하기 위해 최종 배치는 기존 `app/reward/use_cases` 경계에 안착시킴

### Batch 29

- `enemy_turn_domain`의 status-effect tick mutation을 pure planner + state command로 분리
- 추가:
  - `game/features/combat/domain/enemy_status_tick_plan_domain.js`
  - `tests/enemy_status_tick_plan_domain.test.js`
- 변경:
  - `game/features/combat/domain/enemy_turn_domain.js`
  - `game/features/combat/state/enemy_turn_state_commands.js`
  - `tests/enemy_turn_domain.test.js`
  - `tests/enemy_turn_state_commands.test.js`
- 효과:
  - poison/burning/regen/marked/immune/doom tick 순서를 pure plan으로 계산하고, 실제 HP/status 변경은 state command를 통해 적용
  - lethal poison 시 duration을 건드리지 않고 후속 tick을 건너뛰는 기존 규칙을 테스트 가능한 형태로 보존
  - `enemy_turn_domain`의 상태 tick 로직은 계산과 mutation 적용 경계가 분명해짐

### Batch 28

- `reward/navigation` alias surface를 feature-local action으로 수렴
- 추가:
  - `game/features/event/app/reward_navigation_actions.js`
  - `tests/reward_navigation_actions.test.js`
- 변경:
  - `game/features/event/app/reward_actions.js`
  - `game/combat/death_handler_runtime.js`
  - `game/features/combat/app/combat_lifecycle_feature_bridge.js`
  - `game/core/deps/contracts/core_contract_builders.js`
  - `game/ui/screens/reward_ui_runtime.js`
  - `game/platform/legacy/build_legacy_game_api_payload.js`
  - `tests/reward_actions.test.js`
  - `tests/event_reward_bindings.test.js`
  - `tests/event_bindings_registry.test.js`
- 효과:
  - `returnFromReward`와 `returnToGame`이 `rewardNavigationActions`를 통해 한 surface로 수렴
  - `reward_ui_runtime`, `death_handler`, `combat end flow`, legacy API payload가 같은 reward return semantics를 재사용
  - `getRunReturnDeps()`는 action 생성 시 1회만 평가되어 binding/runtime 테스트 중복 호출이 줄어듦

### Batch 27

- `game/combat/combat_lifecycle.js`의 전투 종료 흐름을 feature-local 구조로 분리
- 추가:
  - `game/features/combat/app/combat_lifecycle_feature_bridge.js`
  - `game/features/combat/app/use_cases/end_combat_use_case.js`
  - `game/features/combat/presentation/build_combat_end_outcome.js`
  - `game/features/combat/platform/combat_end_ports.js`
  - `game/features/combat/state/enemy_turn_state_commands.js`
  - `tests/end_combat_use_case.test.js`
  - `tests/build_combat_end_outcome.test.js`
  - `tests/enemy_turn_state_commands.test.js`
- 효과:
  - `CombatLifecycle.endCombat()`는 legacy 진입점만 유지
  - 보스/미니보스 판정, endless direct return, 전투 요약 계산을 독립 테스트 가능하게 분리
  - `enemy_turn_domain`의 현재 공격자 기록/누적 피해/플레이어 버프 교체가 state command를 거치게 됨

### Batch 26

- `game/ui/screens/help_pause_ui.js`의 confirm dialog 생성/토글 책임 분리
- 추가:
  - `game/ui/screens/help_pause_ui_dialog_runtime.js`
  - `tests/help_pause_ui_dialog_runtime.test.js`
- 효과:
  - `HelpPauseUI`는 facade에 가까워지고, abandon/title-return confirm overlay 규칙은 runtime helper가 소유

### Batches 24-25

- `title return` 후처리를 `title` action surface로 끌어올림
- `ending/story` overlay의 restart/select/openCodex 흐름을 공통 action/helper로 정리
- 효과:
  - 화면 runtime이 callback 이름을 직접 알 필요가 줄어듦
  - `restartFromEnding`, `selectFragment`, `openCodex` 계열이 의미 중심 action surface로 수렴

### Batches 20-23

- `ending/story` overlay와 reward return 경로를 의미 helper 중심으로 정리
- `returnFromReward()`를 추가하고 endless 최종 보스 클리어 시 `returnToGame(true)` 대신 우선 사용
- `ending fragment` 선택 UI는 DOM 조립과 선택 후처리를 로컬 presenter/actions로 분리

### Batches 16-19

- 화면 전환 책임을 `screen_service`와 계약 helper 쪽으로 수렴
- `showTitleScreen`, `showRewardScreen`, `showGameplayScreen`, `returnFromReward` 같은 helper를 도입해 문자열/불리언 기반 전환을 줄임

## Historical Summary

- Batches 1-15:
  - 아키텍처 가드, dependency contracts, import coupling/state mutation/window usage 메트릭 체계를 정착
  - `platform/browser/composition`, `core/deps/contracts`, `feature slice` 도입을 바탕으로 대형 UI/runtime 파일을 점진적으로 쪼갬
  - `render_game_to_text` 및 Playwright smoke 루프를 포함한 브라우저 검증 경로를 강화
- 결과:
  - 신규 작업은 대부분 “기존 public surface 유지 + 내부 책임 이동” 패턴으로 진행 가능해졌음
  - 구조 개선 작업이 메트릭 악화 없이 반복될 수 있는 기반이 마련됨

## Working Rules

- 기존 public surface는 가능한 유지한다.
- 새 로직은 `ui/*`보다 feature-local `app/use_case/state/presentation/platform`에 우선 배치한다.
- `window`, `document`, `GAME.*`, `globalThis` 의존성은 `platform/browser` 또는 `platform/legacy`로 몰아넣는다.
- 상태 변경은 reducer/state command/use case 경유를 우선하고, direct mutation 증가를 피한다.
- 검증 기본 세트:
  - `npm run lint`
  - `npm test`
  - `npm run build`
  - Playwright smoke with screenshot + `render_game_to_text`

## Next Batch

1. legacy `turn_manager_helpers`에 남아 있는 중복 턴 상태 규칙을 현재 state command surface로 수렴할지 검토
2. `death_handler`와 `combat end flow` 사이에 남은 legacy scheduling alias를 port/helper로 더 줄일지 검토
3. `help_pause` pause menu callback semantics와 `ending` restart/session lifecycle alias를 action/helper로 더 얇게 만들지 검토
