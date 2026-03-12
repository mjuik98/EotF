Original prompt: 우리 프로젝트 코드를 분석하고, 단순 코드 정리가 아니라 프로젝트 전체 관점에서 구조 개선안을 제시하고, 모듈화/책임 분리/관심사 분리/구조화/공통 로직 일원화/의존성 관리/상태 흐름 정리/유지보수성과 확장성 향상을 목표로 점진적으로 구현한다.

# Progress Summary

## Current State

- 방향:
  - 전면 재작성 없이 `feature-local app/use_case/state/presentation/platform` 경계를 늘리고, 기존 `ui/*`와 `platform/legacy/*`는 compat facade로 점진 축소한다.
  - 최근 초점은 `combat + state`, `title/ending/help_pause`, `reward/navigation` 라인의 책임 분리다.
- 최신 메트릭:
  - state mutation total: `164`
  - import coupling total: `396`
  - window/document/globalThis usage: `8`
- 최신 전체 검증:
  - `npm run lint` PASS
  - `npm test` PASS: `371 files / 858 tests`
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/arch-refactor-smoke-30/shot-0.png`
    - `output/web-game/arch-refactor-smoke-30/shot-2.png`
    - `output/web-game/arch-refactor-smoke-30/state-0.json`
    - `output/web-game/arch-refactor-smoke-30/state-2.json`
  - latest smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - screenshot과 state가 동일한 선택 상태를 보여줌

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
     - `help_pause`의 help overlay/mobile warning 생성 분리
     - `ending_screen_helpers`의 payload/meta decoration 추가 분리

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

1. `help_pause`의 help overlay/mobile warning 생성과 `ending_screen_helpers`의 payload decoration을 helper/presenter로 추가 분리
2. `processEnemyStun` / `decayEnemyWeaken`의 남은 카운터 mutation을 state command/helper로 정리
3. `death_handler`의 종료/보상 진입 경로와 reward flow payload 조립을 더 분리
