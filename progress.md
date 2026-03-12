Original prompt: 우리 프로젝트 코드를 분석하고, 단순 코드 정리가 아니라 프로젝트 전체 관점에서 구조 개선안을 제시하고, 모듈화/책임 분리/관심사 분리/구조화/공통 로직 일원화/의존성 관리/상태 흐름 정리/유지보수성과 확장성 향상을 목표로 점진적으로 구현한다.

# Progress Summary

## Current State

- 방향:
  - 전면 재작성 없이 `feature-local app/use_case/state/presentation/platform` 경계를 늘리고, 기존 `ui/*`와 `platform/legacy/*`는 compat facade로 점진 축소한다.
  - 최근 초점은 `combat + state`, `title/ending/help_pause`, `reward/navigation` 라인의 책임 분리다.
- 최신 메트릭:
  - state mutation total: `163`
  - import coupling total: `439`
  - window/document/globalThis usage: `8`
- 최신 전체 검증:
  - `npm run lint` PASS
  - `npm test` PASS: `375 files / 897 tests`
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/shot-0.png`
    - `output/web-game/shot-1.png`
    - `output/web-game/state-0.json`
    - `output/web-game/state-1.json`
  - latest smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - screenshot과 state가 동일한 swordsman character select 상태를 보여줌

## Current Batch (2026-03-12)

- `combat death flow`를 `game/features/combat/{application,platform,presentation}`으로 부분 이관해서 기존 `game/combat/death_handler.js`는 compat facade만 유지하도록 정리 중
- `title/run/combat` feature public surface에 `create*FeatureFacade()` capability API를 추가하고, browser composition/register 경로를 새 facade 중심으로 수렴 중
- 이번 배치 목표:
  - `death_handler`의 혼합 책임 축소
  - feature public API를 export 모음집에서 capability facade로 한 단계 전환
  - register/composition이 feature 내부 UI 구현명을 덜 직접 알도록 축소
- 추가/변경:
  - `game/features/combat/application/death_flow_actions.js`
  - `game/features/combat/platform/death_runtime_ports.js`
  - `game/features/combat/presentation/browser/death_fragment_choice_presenter.js`
  - `game/combat/death_handler.js`
  - `game/features/{combat,run,title}/public.js`
  - `game/platform/browser/composition/build_*_modules.js`
  - `game/platform/browser/composition/register_{combat,run,title}_modules.js`
  - `tests/death_fragment_choice_presenter.test.js`
  - `tests/feature_public_module_builders.test.js`
- 검증:
  - `npm run lint` PASS
  - `npm run build` PASS
  - targeted vitest PASS:
    - `tests/death_handler.test.js`
    - `tests/death_fragment_choice_presenter.test.js`
    - `tests/feature_public_module_builders.test.js`
    - `tests/register_combat_modules.test.js`
  - Playwright smoke PASS:
    - `output/web-game/arch-refactor-death-facade-batch-42/shot-0.png`
    - `output/web-game/arch-refactor-death-facade-batch-42/state-0.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - console/page errors 없음
- 메트릭 반영:
  - import coupling baseline을 `427`로 갱신
  - dependency map regenerated: `630 nodes / 988 edges`

## Next Batch In Progress (2026-03-12)

- `reward_ui_runtime`의 orchestration을 `features/reward/application`으로 이동하고, reward return 의미를 `shared/runtime` helper로 공통화 중
- 목표:
  - `returnToGame(true)` / `returnFromReward()` 의미를 한 helper로 수렴
  - `ui/screens/reward_ui_runtime.js`를 compat facade 수준으로 축소
  - `core/deps/contracts`와 `features/event/app/reward_navigation_actions`가 같은 reward return semantics를 재사용하도록 정리
- 추가/변경:
  - `game/shared/runtime/reward_return_actions.js`
  - `game/features/reward/application/reward_runtime_actions.js`
  - `game/features/reward/public.js`
  - `game/ui/screens/reward_ui_runtime.js`
  - `game/app/reward/use_cases/claim_reward_use_case.js`
  - `game/features/event/app/reward_navigation_actions.js`
  - `game/core/deps/contracts/core_contract_builders.js`
  - `tests/reward_return_actions.test.js`
- 검증:
  - `npm run lint` PASS
  - `npm run build` PASS
  - targeted vitest PASS:
    - `tests/reward_ui_runtime.test.js`
    - `tests/reward_flow_presenter.test.js`
    - `tests/reward_navigation_actions.test.js`
    - `tests/reward_actions.test.js`
    - `tests/reward_claim_flow_use_case.test.js`
    - `tests/event_reward_bindings.test.js`
    - `tests/reward_return_actions.test.js`
  - Playwright smoke PASS:
    - `output/web-game/arch-refactor-reward-runtime-batch-43/shot-0.png`
    - `output/web-game/arch-refactor-reward-runtime-batch-43/state-0.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - console/page errors 없음
- 메트릭 반영:
  - import coupling baseline을 `432`로 갱신
  - dependency map regenerated: `633 nodes / 993 edges`

## Current Focus (2026-03-12)

- `ending/meta progression`의 title-return/action semantics를 `features/title/application`으로 이관 중
- 목표:
  - `ui/screens/meta_progression_ui_runtime.js`의 정책 중복 제거
  - `ending_screen_action_helpers.js`를 compat facade 수준으로 축소
  - `completeTitleReturn` 경로를 title feature application으로 더 명시적으로 수렴
- 추가/변경:
  - `game/features/title/application/ending_action_ports.js`
  - `game/features/title/application/meta_progression_actions.js`
  - `game/ui/screens/ending_screen_action_helpers.js`
  - `game/ui/screens/meta_progression_ui_runtime.js`
  - `tests/meta_progression_actions.test.js`
- 검증:
  - `npm run lint` PASS
  - `npm run build` PASS
  - targeted vitest PASS:
    - `tests/ending_screen_action_helpers.test.js`
    - `tests/ending_screen_runtime_helpers.test.js`
    - `tests/meta_progression_ui_runtime.test.js`
    - `tests/meta_progression_actions.test.js`
  - Playwright smoke PASS:
    - `output/web-game/arch-refactor-ending-actions-batch-44/shot-0.png`
    - `output/web-game/arch-refactor-ending-actions-batch-44/state-0.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - console/page errors 없음
- 메트릭 반영:
  - import coupling baseline을 `433`으로 갱신
  - dependency map regenerated: `635 nodes / 994 edges`

## Current Batch (2026-03-12, title capability/runtime)

- `title/run/combat` browser composition이 더 이상 `create*FeatureFacade().modules.*` 집합 객체를 거치지 않고 각 feature public capability builder를 직접 호출하도록 정리
- `features/title/ports/create_title_ports.js`는 순수 조립 객체만 반환하도록 축소하고, browser 전역/Deps/UI 의존 해석은 `features/title/platform/browser/*`로 이동
- `ui/title/character_select_ui.js`의 mount orchestration을 `features/title/application/create_character_select_runtime.js`로 추출해서 UI shell은 runtime 위임만 담당
- `app/event`의 event lock 접근은 직접 `gs._eventLock`를 만지지 않고 `app/shared/use_cases/runtime_state_use_case.js` 경유 helper를 사용하도록 정리
- 추가/변경:
  - `game/features/title/platform/browser/{create_title_binding_ports,title_dep_providers,title_runtime_effects}.js`
  - `game/features/title/application/create_character_select_runtime.js`
  - `game/ui/title/character_select_ui.js`
  - `game/app/event/use_cases/{show_event_session_use_case,resolve_event_session_use_case,resolve_event_choice_use_case}.js`
  - `game/platform/browser/composition/{build_title_canvas_modules,build_title_flow_modules,register_title_modules,build_run_map_modules,build_run_flow_modules,register_run_modules,build_combat_core_modules,build_combat_card_modules,build_combat_hud_modules,register_combat_modules}.js`
  - `tests/{feature_public_module_builders,register_title_modules,register_run_modules,runtime_flow_controls}.test.js`
- 검증:
  - targeted vitest PASS:
    - `tests/feature_public_module_builders.test.js`
    - `tests/register_title_modules.test.js`
    - `tests/register_run_modules.test.js`
    - `tests/register_combat_modules.test.js`
    - `tests/character_select_ui_mount.test.js`
    - `tests/character_select_ui_facade.test.js`
    - `tests/title_settings_bindings.test.js`
    - `tests/resolve_event_choice_use_case.test.js`
    - `tests/resolve_event_session_use_case.test.js`
    - `tests/show_event_session_use_case.test.js`
    - `tests/runtime_flow_controls.test.js`
    - `tests/finish_event_flow_use_case.test.js`
    - `tests/event_ui_flow.test.js`
    - `tests/init_sequence.test.js`
    - `tests/register_screen_modules.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/shot-0.png`
    - `output/web-game/shot-1.png`
    - `output/web-game/state-0.json`
    - `output/web-game/state-1.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - console artifact는 생성되지 않았고 smoke 실행 중 에러 종료는 없었음
- 메트릭 반영:
  - import coupling baseline을 `449`로 갱신
  - dependency map regenerated: `653 nodes / 1031 edges`

## Current Batch (2026-03-12, reward/event runtime)

- `reward` runtime orchestration을 feature application factory로 끌어올려 `presentation/screens/reward_ui.js`가 더 이상 `ui/screens/reward_ui_runtime.js`를 직접 알지 않도록 정리
- `ui/screens/reward_ui_runtime.js`는 compat wrapper만 유지하고, 실제 보상 claim/remove/skip/skip-confirm 동작은 `features/reward/application/create_reward_runtime.js`가 담당
- `event` facade runtime orchestration을 `features/event/application/create_event_ui_runtime.js`로 이동해서 `presentation/screens/event_ui_facade_runtime.js`는 feature public 경계만 호출하도록 축소
- `features/event/platform/event_runtime_dom.js`는 browser DOM action builder를 감싼 compat adapter로 축소하고, concrete `ui/screens/*` import는 `features/event/platform/browser/create_event_runtime_dom_actions.js` 한 곳으로 수렴
- 추가/변경:
  - `game/features/reward/application/create_reward_runtime.js`
  - `game/features/reward/platform/browser/reward_runtime_context.js`
  - `game/features/event/application/create_event_ui_runtime.js`
  - `game/features/event/platform/browser/create_event_runtime_dom_actions.js`
  - `game/features/{reward,event}/public.js`
  - `game/presentation/screens/{reward_ui,event_ui_facade_runtime}.js`
  - `game/ui/screens/reward_ui_runtime.js`
  - `game/features/event/platform/event_runtime_dom.js`
  - `tests/feature_public_action_surfaces.test.js`
- 검증:
  - targeted vitest PASS:
    - `tests/reward_ui_runtime.test.js`
    - `tests/reward_ui.test.js`
    - `tests/reward_flow_presenter.test.js`
    - `tests/event_ui_facade_runtime.test.js`
    - `tests/event_ui_flow.test.js`
    - `tests/event_ui_runtime_helpers.test.js`
    - `tests/event_ui_card_discard.test.js`
    - `tests/reward_actions.test.js`
    - `tests/event_reward_bindings.test.js`
    - `tests/feature_public_action_surfaces.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/shot-0.png`
    - `output/web-game/shot-1.png`
    - `output/web-game/state-0.json`
    - `output/web-game/state-1.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
- 메트릭 반영:
  - import coupling baseline을 `447`로 갱신
  - dependency map regenerated: `657 nodes / 1034 edges`

## Current Batch (2026-03-12, reward/event boundary hardening)

- `reward` claim/remove use case가 더 이상 `doc`나 `EventUI` 객체를 직접 알지 않도록 정리하고, picked/skip/discard overlay는 `features/reward/platform/browser/reward_runtime_context.js` 포트 경유로만 접근하도록 변경
- `event` facade runtime은 전체 `api` 객체 형태에 의존하지 않고 필요한 callback 집합만 받도록 축소해서 application 레이어의 UI facade 결합을 낮춤
- `docs/architecture_policy.json`에 `features/reward/application/*`, `features/event/application/*`가 `game/ui/*`, `game/presentation/*`를 직접 import하지 못하도록 가드 추가
- 추가/변경:
  - `game/app/reward/use_cases/claim_reward_use_case.js`
  - `game/features/reward/application/{create_reward_runtime,reward_runtime_actions}.js`
  - `game/features/reward/platform/browser/reward_runtime_context.js`
  - `game/features/event/application/create_event_ui_runtime.js`
  - `game/presentation/screens/event_ui_facade_runtime.js`
  - `game/features/event/public.js`
  - `docs/architecture_policy.json`
  - `tests/{reward_claim_flow_use_case,start_reward_remove_use_case}.test.js`
- 검증:
  - targeted vitest PASS:
    - `tests/reward_claim_flow_use_case.test.js`
    - `tests/start_reward_remove_use_case.test.js`
    - `tests/reward_ui_runtime.test.js`
    - `tests/reward_flow_presenter.test.js`
    - `tests/event_ui_facade_runtime.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/shot-0.png`
    - `output/web-game/shot-1.png`
    - `output/web-game/state-0.json`
    - `output/web-game/state-1.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - screenshot과 state가 동일한 swordsman character select 상태를 보여줌

## Current Batch (2026-03-12, combat start runtime boundary)

- `features/combat/application/create_combat_start_runtime.js`가 더 이상 `ui/combat/*`나 legacy initializer를 직접 import하지 않도록 기본 전투 시작 협력자를 `features/combat/platform/combat_start_runtime_ports.js`로 이동
- `CombatStartUI`는 계속 thin shell을 유지하고, 전투 시작 orchestration은 feature application/runtime 경계에 머물도록 수렴
- `docs/architecture_policy.json`에 `create_combat_start_runtime.js`가 `game/ui/*`, `game/presentation/*`를 직접 import하지 못하도록 가드 추가
- 추가/변경:
  - `game/features/combat/platform/combat_start_runtime_ports.js`
  - `game/features/combat/application/create_combat_start_runtime.js`
  - `docs/architecture_policy.json`
- 검증:
  - targeted vitest PASS:
    - `tests/start_combat_flow.test.js`
    - `tests/create_combat_start_runtime.test.js`
    - `tests/combat_start_ui.test.js`
    - `tests/combat_start_runtime_ui.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/shot-0.png`
    - `output/web-game/shot-1.png`
    - `output/web-game/state-0.json`
    - `output/web-game/state-1.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - screenshot과 state가 동일한 swordsman character select 상태를 보여줌

## Current Batch (2026-03-12, combat turn runtime boundary)

- `ui/combat/combat_turn_ui.js`의 `endPlayerTurn` / `enemyTurn` orchestration을 `features/combat/application/create_combat_turn_runtime.js`로 이동해서 UI shell은 compat facade 수준으로 축소
- 전투 턴 시작/종료에 필요한 cleanup/banner/flow wait/attack hit/status tick UI 효과는 `features/combat/platform/combat_turn_runtime_ports.js`를 통해서만 해석하도록 정리
- `docs/architecture_policy.json`에 `create_combat_turn_runtime.js`가 `game/ui/*`, `game/presentation/*`를 직접 import하지 못하도록 가드 추가
- import coupling baseline을 `466`으로 갱신해 이번 feature boundary 이동을 메트릭에 반영
- 추가/변경:
  - `game/features/combat/application/create_combat_turn_runtime.js`
  - `game/features/combat/platform/combat_turn_runtime_ports.js`
  - `game/ui/combat/combat_turn_ui.js`
  - `docs/architecture_policy.json`
  - `docs/metrics/import_coupling_baseline.json`
  - `tests/create_combat_turn_runtime.test.js`
- 검증:
  - targeted vitest PASS:
    - `tests/create_combat_turn_runtime.test.js`
    - `tests/combat_turn_ui.test.js`
    - `tests/combat_turn_runtime_ui.test.js`
    - `tests/run_enemy_turn_use_case.test.js`
    - `tests/end_player_turn_use_case.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/shot-0.png`
    - `output/web-game/shot-1.png`
    - `output/web-game/state-0.json`
    - `output/web-game/state-1.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - screenshot과 state가 동일한 swordsman character select 상태를 보여줌

## Current Batch (2026-03-12, player status tick state extraction)

- `features/combat/domain/player_status_tick_domain.js`에서 직접 하던 버프 감소/독 지속시간 감소/에너지 감소를 `features/combat/state/player_turn_state_commands.js`로 이동해서 domain이 feature-local state command만 호출하도록 정리
- 이번 배치는 mutation hotspot 중에서도 `player status tick` 라인만 좁게 다뤘고, `start/end player turn policy`의 남은 direct mutation은 다음 단계 후보로 남김
- 추가/변경:
  - `game/features/combat/state/player_turn_state_commands.js`
  - `game/features/combat/domain/player_status_tick_domain.js`
  - `tests/player_turn_state_commands.test.js`
- 검증:
  - targeted vitest PASS:
    - `tests/player_turn_state_commands.test.js`
    - `tests/player_status_tick_domain.test.js`
    - `tests/run_enemy_turn_use_case.test.js`
    - `tests/combat_turn_ui.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/shot-0.png`
    - `output/web-game/shot-1.png`
    - `output/web-game/state-0.json`
    - `output/web-game/state-1.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - screenshot과 state가 동일한 swordsman character select 상태를 보여줌

## Current Batch (2026-03-12, run/combat public facades)

- `features/run/public.js`와 `features/combat/public.js`를 집합 export 허브에서 capability facade 조립 지점으로 축소하고, 실제 consumer는 capability별 public 파일을 직접 보도록 정리
- `run`은 `modules/bindings/contracts/runtime`, `combat`은 `modules/bindings/contracts/runtime/platform/application` capability 파일로 public surface를 분리해서 composition/core/legacy가 더 이상 feature-wide public hub에 묶이지 않도록 정리
- `platform/legacy`, `core/bindings`, `core/bootstrap`, `core/deps/contracts`, browser composition 경로를 capability public 파일 기준으로 재배선해서 의존 경계를 더 명시적으로 고정
- 추가/변경:
  - `game/features/run/{modules/public_run_modules,bindings/public_run_bindings,contracts/public_run_contract_builders,runtime/public_run_runtime_actions}.js`
  - `game/features/combat/{modules/public_combat_modules,bindings/public_combat_bindings,contracts/public_combat_contract_builders,runtime/public_combat_runtime_actions,platform/public_combat_legacy_surface,application/public_combat_command_actions}.js`
  - `game/features/{run,combat}/public.js`
  - `game/core/{bindings/canvas_bindings,bindings/combat_bindings,bootstrap/build_game_boot_action_groups,bootstrap/build_runtime_subscriber_action_groups,deps/contracts/core_contract_builders,deps/contracts/run_contract_builders,deps/contracts/ui_contract_builders}.js`
  - `game/platform/browser/composition/{build_run_map_modules,build_run_flow_modules,register_run_modules,build_combat_core_modules,build_combat_card_modules,build_combat_hud_modules,register_combat_modules}.js`
  - `game/platform/legacy/{adapters/create_legacy_combat_compat,build_legacy_window_ui_query_groups,game_api/combat_commands,game_api/player_draw_commands}.js`
  - `tests/{feature_public_module_builders,feature_public_action_surfaces,register_run_modules,register_combat_modules,title_settings_bindings,game_api_compat,runtime_deps}.test.js`
- 검증:
  - targeted vitest PASS:
    - `tests/feature_public_module_builders.test.js`
    - `tests/feature_public_action_surfaces.test.js`
    - `tests/register_run_modules.test.js`
    - `tests/register_combat_modules.test.js`
    - `tests/title_settings_bindings.test.js`
    - `tests/game_api_compat.test.js`
    - `tests/runtime_deps.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/shot-0.png`
    - `output/web-game/shot-1.png`
    - `output/web-game/state-0.json`
    - `output/web-game/state-1.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - screenshot과 text state가 동일한 swordsman character select 상태를 보여줌
- 메트릭 반영:
  - import coupling baseline을 `439`로 갱신
  - dependency map regenerated: `667 nodes / 1031 edges`

## Next Suggested Batch

- `run/combat` 내부의 남은 compat 허브를 더 줄이는 쪽으로 진행
- 우선순위:
  - `game/platform/legacy`의 combat/query surface를 capability adapter 단위로 더 세분화
  - `game/core/deps/contracts/*`에서 run/combat contract 조립 책임을 feature 쪽 builder로 더 밀어내기
  - `combat` turn/death/reward 연결부처럼 runtime 정책이 남아 있는 구간을 `features/combat/application|presentation`으로 추가 이관

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

### Batch 45

- `legacy` query group 조립면을 feature-local builder 중심으로 정리
- 추가:
  - `game/features/ui/app/legacy_query_groups.js`
  - `game/features/combat/platform/legacy_window_query_groups.js`
  - `game/features/title/application/help_pause_title_actions.js`
  - `game/features/title/ports/contracts/build_title_story_contracts.js`
  - `tests/help_pause_title_actions.test.js`
  - `tests/title_story_contract_builders.test.js`
- 변경:
  - `game/platform/legacy/build_legacy_window_ui_query_groups.js`
  - `game/platform/legacy/build_legacy_window_query_groups.js`
  - `game/platform/legacy/build_legacy_game_api_runtime_query_groups.js`
  - `game/core/deps/contracts/core_contract_builders.js`
  - `game/features/ui/ports/contracts/build_ui_shell_contracts.js`
  - `game/ui/screens/help_pause_ui_return_runtime.js`
- 효과:
  - `legacy`는 `hud/combat` query shape를 직접 만들지 않고 feature-local builder 결과만 조합
  - `story` 계약의 ending action 해석은 title feature contract builder가 소유
  - `help_pause -> return to title` 의미 조합은 title application helper로 수렴하고, 기존 runtime 파일은 compat facade로 축소
  - import coupling baseline을 `437`로 갱신했고 dependency map은 `640 nodes / 1007 edges` 기준으로 갱신
  - 검증:
    - `npm exec -- vitest run tests/window_binding_queries.test.js tests/game_api_query_bindings.test.js tests/legacy_runtime_public_surfaces.test.js tests/feature_public_action_surfaces.test.js tests/help_pause_ui_return_runtime.test.js tests/help_pause_title_actions.test.js tests/title_story_contract_builders.test.js`
    - `npm run lint`
    - `npm run build`
    - Playwright smoke: `output/web-game/arch-refactor-legacy-title-batch-45/`

### Batch 46

- `help_pause abandon` 정책과 `legacy/core`에 남아 있던 조립 의미를 feature/shared로 추가 이전
- 추가:
  - `game/features/combat/application/help_pause_abandon_combat_actions.js`
  - `game/features/title/application/help_pause_abandon_actions.js`
  - `game/features/title/presentation/browser/abandon_outcome_presenter.js`
  - `game/features/event/ports/contracts/build_event_contracts.js`
  - `game/features/run/ports/contracts/build_run_return_contracts.js`
  - `tests/help_pause_abandon_actions.test.js`
- 변경:
  - `game/ui/screens/help_pause_ui_abandon_runtime.js`
  - `game/platform/legacy/build_legacy_game_api_query_groups.js`
  - `game/platform/legacy/game_api_runtime_queries.js`
  - `game/platform/legacy/game_api_query_bindings.js`
  - `game/core/deps/contracts/core_contract_builders.js`
  - `game/features/event/public.js`
  - `game/features/run/public.js`
  - `game/shared/runtime/legacy_query_groups.js`
- 효과:
  - `confirmAbandonRun()`은 compat facade만 유지하고, combat cleanup/defeat finalize/ending outcome 진입은 feature-local action이 소유
  - `legacy` game API query group은 compose/flatten helper를 shared runtime 경유로 묶어 adapter-only 성격을 강화
  - `core`의 `event`/`runReturn` 계약은 feature contract builder가 소유해 화면 전환 의미와 흐름 helper를 feature 쪽으로 이동
  - import coupling baseline을 `446`으로 갱신했고 dependency map은 `645 nodes / 1017 edges` 기준으로 갱신
  - 검증:
    - `npm exec -- vitest run tests/help_pause_ui_abandon_runtime.test.js tests/help_pause_abandon_actions.test.js tests/game_api_query_bindings.test.js tests/legacy_runtime_public_surfaces.test.js tests/feature_public_action_surfaces.test.js tests/finish_event_flow_use_case.test.js tests/run_return_ui_runtime.test.js`
    - `npm run lint`
    - `npm run build`
    - Playwright smoke: `output/web-game/arch-refactor-abandon-contracts-batch-46/`

### Batch 47

- `pause menu/runtime`와 `run return`의 남은 대형 UI runtime을 feature-local 구조로 추가 분해
- 추가:
  - `game/features/title/application/help_pause_menu_actions.js`
  - `game/features/run/application/run_return_actions.js`
  - `game/features/run/presentation/browser/run_return_overlay_presenter.js`
  - `game/features/run/presentation/browser/run_return_branch_presenter.js`
  - `tests/help_pause_menu_actions.test.js`
- 변경:
  - `game/ui/screens/help_pause_menu_runtime_ui.js`
  - `game/ui/run/run_return_ui_runtime.js`
  - `game/ui/run/run_return_ui_branch_ui.js`
  - `game/platform/legacy/build_legacy_game_api_payload.js`
  - `game/shared/runtime/legacy_query_groups.js`
  - `game/shared/runtime/public.js`
  - `game/features/title/public.js`
  - `game/features/run/public.js`
- 효과:
  - pause menu callback 정책은 title feature action builder가 소유하고, UI runtime은 compat wrapper로 축소
  - `run_return_ui_runtime`는 flow orchestration을 `features/run/application`으로, DOM/overlay 조립을 `features/run/presentation/browser`로 이전
  - `run_return_ui_branch_ui`는 feature presenter re-export로 바뀌어 branch choice UI도 feature slice 쪽으로 이동
  - `legacy` game API payload는 action group shape를 shared compose helper로 조립해 adapter-only 성격을 한 단계 더 강화
  - import coupling baseline을 `448`로 갱신했고 dependency map은 `649 nodes / 1024 edges` 기준으로 갱신
  - 검증:
    - `npm exec -- vitest run tests/help_pause_menu_runtime_ui.test.js tests/help_pause_menu_actions.test.js tests/run_return_ui_runtime.test.js tests/run_return_ui_branch_ui.test.js tests/legacy_runtime_public_surfaces.test.js tests/feature_public_action_surfaces.test.js tests/create_legacy_game_api.test.js tests/register_legacy_game_api_bindings.test.js`
    - `npm run lint`
    - `npm run build`
    - Playwright smoke: `output/web-game/arch-refactor-pause-runreturn-batch-47/`

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

1. `help_pause_ui.js`와 `help_pause_ui_runtime.js`에 남은 module-local state와 hotkey policy를 feature-local action/helper로 더 이전
2. `run_return_ui_runtime` 후속으로 `run_return_ui.js`와 reward/region transition 진입 경계까지 `run` feature facade를 통해 수렴
3. `platform/legacy` command payload와 window binding surface에서 아직 남아 있는 direct group shape를 shared/feature builder로 추가 이전

## Current Batch (2026-03-12, run/title boundary cleanup)

- `ui/map/map_navigation_ui.js`는 compat shell만 유지하고, 실제 노드 이동 orchestration은 `game/features/run/application/create_map_navigation_runtime.js`로 이동
- 노드 이동 후처리 presenter는 `game/features/run/presentation/present_node_transition.js`로 올리고, 기존 `game/ui/map/map_navigation_presenter.js`는 re-export compat만 유지
- `ui/title/character_select_mount_runtime.js`는 직접 `data/app/ui`를 끌어오지 않고 `game/features/title/platform/browser/create_character_select_mount_runtime.js`를 re-export하는 thin facade로 축소
- `features/run/modules/public_run_modules.js`와 `features/title/public.js`는 더 이상 UI 파일 집합을 직접 import하지 않고 feature-local module catalog를 통해 공개 모듈을 조립
- `core/init_sequence.js`는 legacy registration 상세 구현 대신 `platform/legacy/register_legacy_bridge.js` 경유 진입점만 호출
- 추가/변경:
  - `game/features/run/application/create_map_navigation_runtime.js`
  - `game/features/run/presentation/present_node_transition.js`
  - `game/features/run/modules/run_module_catalog.js`
  - `game/features/title/modules/title_module_catalog.js`
  - `game/features/title/platform/browser/create_character_select_mount_runtime.js`
  - `game/platform/legacy/register_legacy_bridge.js`
  - `tests/register_legacy_bridge.test.js`
  - `docs/architecture_policy.json`
- 검증:
  - targeted vitest PASS:
    - `tests/character_select_mount_runtime.test.js`
    - `tests/init_sequence.test.js`
    - `tests/map_branching.test.js`
    - `tests/feature_public_module_builders.test.js`
    - `tests/register_run_modules.test.js`
    - `tests/register_title_modules.test.js`
    - `tests/register_legacy_bridge.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/arch-refactor-run-title-batch-48/shot-0.png`
    - `output/web-game/arch-refactor-run-title-batch-48/shot-1.png`
    - `output/web-game/arch-refactor-run-title-batch-48/state-0.json`
    - `output/web-game/arch-refactor-run-title-batch-48/state-1.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`가 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - screenshot상 guardian/berserker 카드 전환과 정보 패널 렌더가 정상이며 console/page error 없이 종료됨
- 메트릭 반영:
  - import coupling baseline을 `447`로 갱신

## Current Batch (2026-03-12, title/run runtime ownership)

- `ui/title/class_select_ui.js`는 더 이상 선택 상태나 rarity/class metadata를 직접 소유하지 않고 `game/features/title/platform/browser/create_class_select_facade.js`가 상태/메타 wiring을 소유
- `ui/run/run_setup_{helpers,ui_runtime}.js`는 compat re-export만 유지하고, 실제 setup helper/runtime orchestration은 `game/features/run/application/{run_setup_helpers,create_run_setup_runtime}.js`로 이동
- `ui/run/run_start_{ui,ui_runtime}.js`는 feature runtime을 직접 참조하는 thin shell로 축소하고, 실제 run-entry transition orchestration은 `game/features/run/application/create_run_start_runtime.js`가 소유
- `core/bootstrap/register_legacy_surface.js`는 더 이상 payload/execute 세부를 직접 알지 않고 `platform/legacy/register_legacy_bridge_runtime.js` compat 경유만 유지
- `docs/architecture_policy.json`에 `class_select_ui`, `run_start_ui`, `run_setup_ui`의 feature-boundary 규칙을 추가
- 추가/변경:
  - `game/features/title/platform/browser/create_class_select_facade.js`
  - `game/features/run/application/run_setup_helpers.js`
  - `game/features/run/application/create_run_setup_runtime.js`
  - `game/features/run/application/create_run_start_runtime.js`
  - `game/platform/legacy/register_legacy_bridge_runtime.js`
  - `game/ui/{title/run}/*` thin facade 정리
  - `tests/{run_start_ui_facade,run_setup_ui_facade,register_legacy_surface,register_legacy_bridge}.test.js`
- 검증:
  - targeted vitest PASS:
    - `tests/class_select_ui_facade.test.js`
    - `tests/class_select_selection_ui.test.js`
    - `tests/run_setup_helpers.test.js`
    - `tests/run_setup_ui.test.js`
    - `tests/run_setup_ui_facade.test.js`
    - `tests/run_start_ui.test.js`
    - `tests/run_start_ui_facade.test.js`
    - `tests/run_start_ui_runtime.test.js`
    - `tests/title_bindings.test.js`
    - `tests/title_settings_bindings.test.js`
    - `tests/register_legacy_bridge.test.js`
    - `tests/register_legacy_surface.test.js`
    - `tests/init_sequence.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/arch-refactor-title-run-batch-49/settings/{shot-0,shot-1,state-0,state-1}.json/png`
    - `output/web-game/arch-refactor-title-run-batch-49/start/{shot-0,shot-1,state-0,state-1}.json/png`
  - smoke summary:
    - `#mainRunRulesBtn` 클릭 후 `panels:["mainTitle","runSettings"]` 상태와 런 규칙 모달 렌더 정상
    - `#mainStartBtn` 클릭 후 `panels:["characterSelect"]` 상태와 character select 렌더 정상
    - guardian/berserker/swordsman 카드 및 패널 렌더가 screenshot과 `render_game_to_text`에서 일치
- 메트릭 반영:
  - import coupling baseline을 `456`으로 갱신

## Current Batch (2026-03-12, title handoff ownership)

- `character select` confirm sequencing은 더 이상 `game/app/run/use_cases`를 직접 참조하지 않고 `game/features/title/application/character_select_actions.js`가 소유
- `start_title_run_use_case`와 `continue_run_use_case`의 실제 구현은 `game/features/title/application/title_run_entry_actions.js`로 이동하고, 기존 `game/app/title/use_cases/*`는 compat re-export만 유지
- `core/bootstrap/mount_character_select.js`는 화면 의미를 직접 알지 않고 `createCharacterSelectMountActions()` 경유로 `onConfirm/onBack/onStart`를 wiring
- legacy registration payload/init args는 `game/platform/legacy/{build_legacy_bridge_init_args,build_legacy_bridge_registration_payload}.js`로 이동하고, core bootstrap builder는 compat re-export만 유지
- 추가/변경:
  - `game/features/title/application/{character_select_actions,title_run_entry_actions}.js`
  - `game/platform/legacy/{build_legacy_bridge_init_args,build_legacy_bridge_registration_payload}.js`
  - `game/core/bootstrap/mount_character_select.js`
  - `game/ui/title/character_select_flow.js`
  - `game/app/{run,title}/use_cases/*`
  - `docs/architecture_policy.json`
- 검증:
  - targeted vitest PASS:
    - `tests/character_select_flow.test.js`
    - `tests/start_title_run_use_case.test.js`
    - `tests/continue_run_use_case.test.js`
    - `tests/build_legacy_surface_registration_payload.test.js`
    - `tests/build_legacy_surface_init_args.test.js`
    - `tests/init_sequence.test.js`
    - `tests/title_settings_bindings.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - client smoke: `output/web-game/arch-refactor-title-handoff-batch-50/client/*`
    - deep handoff smoke: `output/web-game/arch-refactor-title-handoff-batch-50/deep/*`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 진입 정상
    - `#btnCfm` -> `#btnRealStart` 클릭 후 intro cinematic 단계까지 진입
    - `render_game_to_text`가 `screen:"title"` + `panels:["introCinematic"]` + `selectedClass:"swordsman"` 상태를 반환
    - deep smoke `console-errors.json`은 빈 배열
- 메트릭 반영:
  - import coupling baseline을 `455`로 갱신

## Current Batch (2026-03-12, run gameplay handoff ownership)

- `game/features/run/ports/contracts/build_run_flow_contracts.js`는 이제 `RunStartUI`/`RunSetupUI`를 직접 경유하지 않고 `continueLoadedRunUseCase`, `enterRunRuntime`, `startGameRuntime`를 묶어 `continueLoadedRun`, `enterGameplay`, `startGame` contract를 노출
- `game/features/title/app/title_flow_actions.js`는 `RunSetupUI.startGame()`와 title 쪽 resume sequencing을 직접 소유하지 않고 `getRunSetupDeps().startGame()` 및 `getRunStartDeps().continueLoadedRun()` handoff를 우선 사용
- `game/app/run/use_cases/start_run_use_case.js`와 `game/features/run/application/create_run_setup_runtime.js`는 `enterGameplay`를 우선 handoff로 사용하고, 기존 `enterRun`은 compat fallback으로만 유지
- `core/bootstrap/mount_character_select.js`는 mount callback 의미를 조립하지 않고 `game/features/title/platform/browser/build_character_select_mount_payload.js`가 만든 payload만 전달
- legacy API/window binding은 직접 command/query/root/steps를 조합하지 않고 payload builder를 경유:
  - `game/platform/legacy/build_legacy_game_api_registration_payload.js`
  - `game/platform/legacy/build_legacy_window_binding_payload.js`
- 추가/변경:
  - `game/features/run/application/continue_loaded_run_use_case.js`
  - `game/features/title/platform/browser/build_character_select_mount_payload.js`
  - `game/platform/legacy/{build_legacy_game_api_registration_payload,build_legacy_window_binding_payload}.js`
  - `game/features/run/ports/contracts/build_run_flow_contracts.js`
  - `game/features/title/app/title_flow_actions.js`
  - `game/core/bootstrap/mount_character_select.js`
  - `game/platform/legacy/{game_api_registry,window_bindings}.js`
  - `docs/architecture_policy.json`
- 검증:
  - targeted vitest PASS:
    - `tests/continue_loaded_run_use_case.test.js`
    - `tests/continue_run_use_case.test.js`
    - `tests/start_run_use_case.test.js`
    - `tests/deps_factory.test.js`
    - `tests/title_settings_bindings.test.js`
    - `tests/build_character_select_mount_payload.test.js`
    - `tests/build_legacy_game_api_registration_payload.test.js`
    - `tests/build_legacy_window_binding_payload.test.js`
    - `tests/register_legacy_game_api_bindings.test.js`
    - `tests/window_bindings.test.js`
  - extended vitest PASS:
    - `tests/run_setup_ui.test.js`
    - `tests/run_setup_ui_facade.test.js`
    - `tests/run_start_ui.test.js`
    - `tests/run_start_ui_runtime.test.js`
    - `tests/run_start_ui_facade.test.js`
    - `tests/init_sequence.test.js`
    - `tests/register_legacy_surface.test.js`
    - `tests/register_run_modules.test.js`
    - `tests/feature_public_module_builders.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - client smoke: `output/web-game/arch-refactor-run-gameplay-batch-51/client/*`
    - intro/story/map smoke: `output/web-game/arch-refactor-run-gameplay-batch-51/deep/*`
    - gameplay/map smoke: `output/web-game/arch-refactor-run-gameplay-batch-51/deep-map/*`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 `panels:["characterSelect"]` 상태와 character select 렌더 정상
    - `#btnCfm` -> `#btnRealStart` -> `#introCinematicOverlay` 후 `storyFragment` 단계 진입 정상
    - `#storyContinueBtn`까지 진행하면 `screen:"game"` + `gameStarted:true` + `canChoosePath:true` + `reachableNodeIds:["1-0"]` 상태로 map gameplay 진입
    - `console-errors.json`은 deep/deep-map 모두 빈 배열

## Current Batch (2026-03-12, map node handoff contracts)

- `game/features/combat/public.js`, `game/features/event/public.js`, `game/features/reward/public.js`에 각각 `combatFlow`, `eventFlow`, `rewardFlow` contract builder를 추가해서 `startCombat`, `openEvent/openShop/openRestSite`, `openReward` handoff를 feature public 표면으로 노출
- `game/core/deps/contracts/core_contract_builders.js`는 위 contract들을 public facade 경유로 조합하고, `game/features/run/ports/contracts/build_run_flow_contracts.js`는 이를 다시 `runNodeHandoff` contract로 묶어 map navigation이 하나의 handoff capability만 보게 변경
- `game/features/run/app/run_map_actions.js`는 더 이상 `startCombat/triggerRandomEvent/showShop/showRestSite`를 직접 주입하지 않고 `nodeHandoff` contract를 전달하며, `game/features/run/presentation/present_node_transition.js`는 `create_node_handoff_runtime.js`를 통해 capability 우선, legacy 함수 fallback 순으로 실행
- combat reward 진입도 같은 패턴으로 정리:
  - `game/features/combat/platform/combat_end_ports.js`는 `openReward` capability를 우선 사용
  - `game/features/combat/app/combat_lifecycle_feature_bridge.js`는 `deps.rewardFlow?.openReward` 또는 `deps.rewardActions?.openReward`를 먼저 사용
  - `game/features/event/app/reward_actions.js`는 compat alias로 `openReward()`를 추가
- 아키텍처 가드:
  - `docs/architecture_policy.json`에 `run_map_actions`/`present_node_transition`의 direct combat/event/reward import 금지 규칙 추가
- 추가/변경:
  - `game/features/combat/ports/contracts/build_combat_flow_contracts.js`
  - `game/features/event/ports/contracts/build_event_flow_contracts.js`
  - `game/features/reward/ports/contracts/build_reward_flow_contracts.js`
  - `game/features/run/application/create_node_handoff_runtime.js`
  - `game/features/run/ports/create_run_canvas_ports.js`
  - `game/features/run/app/run_map_actions.js`
  - `game/features/run/presentation/present_node_transition.js`
  - `game/core/deps_factory.js`
  - `tests/{create_node_handoff_runtime,combat_end_ports}.test.js`
- 검증:
  - targeted vitest PASS:
    - `tests/create_node_handoff_runtime.test.js`
    - `tests/node_transition_presenter.test.js`
    - `tests/canvas_bindings.test.js`
    - `tests/deps_factory.test.js`
    - `tests/feature_public_action_surfaces.test.js`
    - `tests/map_branching.test.js`
    - `tests/event_actions.test.js`
    - `tests/reward_actions.test.js`
    - `tests/combat_end_ports.test.js`
    - `tests/end_combat_use_case.test.js`
    - `tests/combat_lifecycle.test.js`
    - `tests/combat_bindings.test.js`
    - `tests/run_setup_ui.test.js`
    - `tests/run_start_ui.test.js`
    - `tests/title_settings_bindings.test.js`
    - `tests/init_sequence.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - client smoke: `output/web-game/arch-refactor-map-handoff-batch-52/client/*`
    - deep map-to-combat smoke: `output/web-game/arch-refactor-map-handoff-batch-52/deep/*`
  - smoke summary:
    - official client 기준 `#mainStartBtn` 클릭 후 `panels:["characterSelect"]` 상태 정상
    - `#mainStartBtn -> #btnCfm -> #btnRealStart -> #introCinematicOverlay -> #storyContinueBtn -> .node-card` 순서로 진행 가능
    - 최종 `render_game_to_text`는 `screen:"game"`, `panels:["combatOverlay"]`, `combat.active:true`, `currentNode:"1-0"`, `currentNodeType:"combat"`를 반환
    - deep smoke `console-errors.json`은 빈 배열
- 메트릭 반영:
  - import coupling baseline을 `458`로 갱신

## Current Batch (2026-03-12, combat start runtime + reward contracts)

- `combat start`의 orchestration을 `game/features/combat/application/create_combat_start_runtime.js`로 이관해서 `game/ui/combat/combat_start_ui.js`는 compat facade만 유지
- `game/app/combat/use_cases/start_combat_flow_use_case.js`는 이제 feature-local state command를 주입받아 사용:
  - `game/features/combat/state/combat_entry_state_commands.js`에 `enterCombatState()` 추가
  - 전투 진입 시 `setActiveCombatRegionState()`와 `enterCombatState()`를 우선 사용하고, 기존 `activateCombat()`는 fallback만 담당
- `rewardFlow` contract를 확장해서 `openReward`, `returnFromReward`, `returnToGame`, `showGameplayScreen` semantics를 하나의 contract로 묶음
- `game/features/event/app/{reward_actions,reward_navigation_actions}.js`는 `RewardUI`/`RunReturnUI` 직접 호출보다 `rewardFlow` contract를 우선 사용하도록 정리
- `game/platform/legacy/game_api_run_bindings.js`는 legacy `startGame` 호출에서 `runSetup.startGame` capability를 우선 사용하고, deps unavailable일 때만 legacy fallback을 사용
- 대표 콘텐츠 접근도 첫 실전 적용:
  - `game/features/run/domain/map_node_content.js` 추가 후 `game/ui/map/{map_ui_next_nodes,map_ui_next_nodes_render,map_ui_full_map_render,map_ui_minimap_render}.js`가 map node metadata를 feature accessor 경유로 사용
  - `game/features/title/domain/character_select_catalog_content.js` 추가 후 `game/ui/title/character_select_catalog.js`는 re-export만 유지
- 아키텍처 가드 추가:
  - `ui-combat-start-feature-boundary`
  - `ui-map-node-content-feature-accessors-only`
  - `ui-title-character-catalog-feature-content-only`
- 추가/변경:
  - `game/features/combat/application/create_combat_start_runtime.js`
  - `game/features/combat/state/combat_entry_state_commands.js`
  - `game/features/reward/ports/contracts/build_reward_flow_contracts.js`
  - `game/features/event/ports/reward_ports.js`
  - `game/platform/legacy/game_api_run_bindings.js`
  - `game/features/run/domain/map_node_content.js`
  - `game/features/title/domain/character_select_catalog_content.js`
  - `tests/{create_combat_start_runtime,game_api_run_bindings}.test.js`
- 검증:
  - targeted vitest PASS:
    - `tests/create_combat_start_runtime.test.js`
    - `tests/start_combat_flow.test.js`
    - `tests/combat_start_ui.test.js`
    - `tests/reward_actions.test.js`
    - `tests/reward_navigation_actions.test.js`
    - `tests/event_reward_ports.test.js`
    - `tests/event_reward_bindings.test.js`
    - `tests/combat_end_ports.test.js`
    - `tests/combat_lifecycle.test.js`
    - `tests/game_api_run_bindings.test.js`
    - `tests/game_api_command_bindings.test.js`
    - `tests/deps_factory.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - client smoke: `output/web-game/arch-refactor-combat-reward-batch-53/client/*`
    - deep title->combat->return smoke: `output/web-game/arch-refactor-combat-reward-batch-53/deep/*`
  - smoke summary:
    - client smoke 기준 `#mainStartBtn` 클릭 후 `panels:["characterSelect"]` 상태 정상
    - deep smoke 기준 `#mainStartBtn -> #btnCfm -> #btnRealStart -> #storyContinueBtn -> .node-card` 후 `panels:["combatOverlay"]`, `combat.active:true`, `currentNodeType:"combat"` 확인
    - forced `gs.endCombat()` 후 `combat.active:false`, `canChoosePath:true`, `reachableNodeIds:["2-0","2-1"]` 상태로 gameplay return 확인
    - `console-errors.json`은 빈 배열
- 메트릭 반영:
  - import coupling baseline을 `463`으로 갱신
- TODO:
  - browser smoke에서 `showRewardScreen(false)` 직접 호출은 `#rewardScreen.active` selector timeout으로 재현이 불안정했다. reward panel contract는 현재 unit test로만 보장되고 있으니 다음 배치에서 browser-visible reward flow를 다시 고정할 필요가 있다.

## Current Batch (2026-03-12, player turn policy state commands)

- `start/end player turn` 정책의 직접 mutation 일부를 `game/features/combat/state/player_turn_state_commands.js`로 수렴
- `game/domain/combat/turn/start_player_turn_policy.js`는 이제 state command를 주입받아:
  - turn 시작/에너지 충전/실드 초기화
  - 랜덤 카드 소멸
  - 지역별 에너지 감소
  - 최대 echo 감소
  를 처리하고, domain 자체는 fallback만 유지
- `game/domain/combat/turn/end_player_turn_policy.js`는 이제 state command를 주입받아:
  - buff stack 감소
  - silence gauge 감소
  - time rift gauge 초기화
  - hand->graveyard 이동 + turn 종료 cleanup
  를 처리
- 주입 경로 정리:
  - `game/app/combat/end_turn_service.js`
  - `game/app/combat/use_cases/run_enemy_turn_use_case.js`
  - `game/combat/turn_manager.js`
  가 feature-local state command를 policy에 명시적으로 주입
- 테스트 보강:
  - `tests/player_turn_state_commands.test.js`에 turn lifecycle state command 검증 추가
- 검증:
  - targeted vitest PASS:
    - `tests/player_turn_state_commands.test.js`
    - `tests/turn_manager.test.js`
    - `tests/end_turn_service.test.js`
    - `tests/run_enemy_turn_use_case.test.js`
    - `tests/begin_player_turn_use_case.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/shot-0.png`
    - `output/web-game/shot-1.png`
    - `output/web-game/state-0.json`
    - `output/web-game/state-1.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`는 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - screenshot과 state 모두 swordsman character select 화면을 가리킴
- 메트릭 반영:
  - import coupling baseline을 `469`로 갱신
- TODO:
  - 다음 배치는 `start_player_turn_policy`와 `end_player_turn_policy` 주변에서 아직 fallback으로 남아 있는 mutation을 더 줄이고, `combat` legacy compat 호출자들을 feature-local command 조립기로 한 단계 더 수렴시키는 것이 맞다.

## Current Batch (2026-03-12, player turn policy ports)

- `player turn policy` command wiring을 `game/features/combat/ports/player_turn_policy_ports.js`로 수렴
- `createStartPlayerTurnPolicyCommands()`와 `createEndPlayerTurnPolicyCommands()`를 추가해서:
  - `game/app/combat/end_turn_service.js`
  - `game/app/combat/use_cases/run_enemy_turn_use_case.js`
  - `game/combat/turn_manager.js`
  가 더 이상 `player_turn_state_commands`의 개별 export를 직접 조립하지 않도록 정리
- `docs/architecture_policy.json`에 `combat-player-turn-policy-ports-only` 가드를 추가해서 위 세 호출자가 `game/features/combat/state/player_turn_state_commands.js`를 직접 import하지 못하게 제한
- 테스트 보강:
  - `tests/player_turn_policy_ports.test.js` 추가
  - 기본 command bundle과 override 조합이 모두 동작하는지 검증
- 검증:
  - targeted vitest PASS:
    - `tests/player_turn_policy_ports.test.js`
    - `tests/player_turn_state_commands.test.js`
    - `tests/turn_manager.test.js`
    - `tests/end_turn_service.test.js`
    - `tests/run_enemy_turn_use_case.test.js`
    - `tests/begin_player_turn_use_case.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/arch-refactor-player-turn-policy-ports-batch-46/shot-0.png`
    - `output/web-game/arch-refactor-player-turn-policy-ports-batch-46/shot-1.png`
    - `output/web-game/arch-refactor-player-turn-policy-ports-batch-46/state-0.json`
    - `output/web-game/arch-refactor-player-turn-policy-ports-batch-46/state-1.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`는 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - screenshot과 state 모두 swordsman character select 화면을 가리킴
- 메트릭 반영:
  - import coupling baseline 변화 없음 (`469` 유지)
- TODO:
  - 다음 배치는 `beginPlayerTurnUseCase`와 `endPlayerTurnService` 주변에서 policy fallback을 더 줄일 수 있도록, command bundle 생성 자체를 feature application/runtime 쪽으로 한 단계 더 밀어내는 것이 적절하다.

## Current Batch (2026-03-12, player turn runtime handoff + reward screen handoff)

- `player turn policy` 조립을 더 feature application/runtime 쪽으로 이동:
  - `game/features/combat/application/player_turn_policy_actions.js` 추가
  - `createStartPlayerTurnAction()` / `createEndPlayerTurnPolicyOptions()`가 feature-local command bundle을 조립
  - `game/features/combat/application/create_combat_turn_runtime.js`가 이 action/options를 기본 주입
  - `game/app/combat/{end_turn_service,use_cases/end_player_turn_use_case, use_cases/run_enemy_turn_use_case}.js`는 generic orchestration만 유지
  - legacy compat인 `game/combat/turn_manager.js`도 이제 feature application handoff만 사용
- `reward screen` 진입 orchestration을 feature runtime으로 이동:
  - `game/features/reward/application/show_reward_screen_runtime.js`가 reward flow unlock/combat deactivate/mini-boss bonus를 담당
  - `game/features/reward/presentation/browser/show_reward_screen_runtime.js`는 순수 reward 화면 렌더링만 담당
  - `game/presentation/screens/reward_ui.js`는 더 이상 `game/ui/screens/reward_ui_screen_runtime.js`를 직접 import하지 않음
  - `game/ui/screens/reward_ui_screen_runtime.js`는 compat wrapper만 유지
- 아키텍처 가드 추가/강화:
  - `reward-presentation-feature-runtime-only`
  - `combat-player-turn-policy-ports-only` 강화: app/combat caller가 feature `state/ports`를 직접 import하지 못하도록 유지
- 테스트 보강:
  - `tests/player_turn_policy_actions.test.js` 추가
  - `tests/reward_ui_screen_runtime.test.js`는 compat wrapper delegation 검증으로 축소
- 검증:
  - targeted vitest PASS:
    - `tests/player_turn_policy_actions.test.js`
    - `tests/player_turn_policy_ports.test.js`
    - `tests/player_turn_state_commands.test.js`
    - `tests/create_combat_turn_runtime.test.js`
    - `tests/turn_manager.test.js`
    - `tests/end_turn_service.test.js`
    - `tests/end_player_turn_use_case.test.js`
    - `tests/run_enemy_turn_use_case.test.js`
    - `tests/begin_player_turn_use_case.test.js`
    - `tests/reward_ui_screen_runtime.test.js`
    - `tests/reward_ui.test.js`
    - `tests/reward_actions.test.js`
    - `tests/event_reward_bindings.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - Playwright smoke PASS:
    - `output/web-game/arch-refactor-reward-player-turn-batch-47/shot-0.png`
    - `output/web-game/arch-refactor-reward-player-turn-batch-47/shot-1.png`
    - `output/web-game/arch-refactor-reward-player-turn-batch-47/state-0.json`
    - `output/web-game/arch-refactor-reward-player-turn-batch-47/state-1.json`
  - smoke summary:
    - `#mainStartBtn` 클릭 후 character select 화면이 정상 렌더됨
    - `render_game_to_text`는 `screen:"title"` + `panels:["characterSelect"]` 상태를 유지함
    - screenshot과 state 모두 swordsman character select 화면을 가리킴
- 메트릭 반영:
  - state mutation total `162`로 1 감소
  - import coupling baseline을 `470`으로 갱신
- TODO:
  - 다음 남은 큰 축은 `platform/legacy`의 query/game API surface 세분화와 `death_handler`/combat end reward handoff의 browser-visible deep smoke 고정이다.

## Current Batch (2026-03-12, legacy reward command surface + deep combat reward smoke)

- `legacy reward command surface`를 feature runtime과 실제 동일 경로로 정리:
  - `game/features/event/app/reward_actions.js`
    - `showRewardScreen` / `openReward`가 `rewardFlow` indirection보다 `modules.RewardUI.showRewardScreen(...getRewardDeps())`를 우선 사용
    - `RewardUI`가 없을 때만 `rewardFlow.openReward`로 fallback
  - `game/features/event/app/reward_navigation_actions.js`
    - `getRunReturnDeps()`를 eager capture 대신 invocation 시점 lazy lookup으로 변경
    - `returnFromReward` / `returnToGame`이 `RunReturnUI`를 우선 사용하고, 없을 때만 `rewardFlow` contract로 fallback
    - 이 변경으로 브라우저 실사용 경로에서 `[RunReturnUI] Missing gs or runRules` 오류가 제거됨
- `combat end -> reward -> run return` browser-visible 흐름 복구:
  - 직접 `window.showRewardScreen(false)` 호출 시 `screen:"reward"` + `rewardScreen.active === true` 확인
  - 직접 `window.GS.endCombat()` 호출 시 reward screen으로 이동 확인
  - reward 상태에서 `window.returnToGame(true)` 호출 시 `screen:"game"` + reward panel 종료 확인
- deep smoke 스크립트 보강:
  - `scripts/smoke_deep_combat_reward.mjs`
    - reward return 대기 실패 시 `state-reward-return-timeout.json`을 남기도록 보강
    - `console-errors.json`을 성공/실패와 무관하게 `finally`에서 항상 기록
- 테스트 보강/수정:
  - `tests/reward_actions.test.js`
  - `tests/reward_navigation_actions.test.js`
  - `tests/event_reward_bindings.test.js`
  - legacy command surface가 `RewardUI` / `RunReturnUI`를 우선 사용하고 lazy deps lookup을 유지하는지 검증
- 검증:
  - targeted vitest PASS:
    - `tests/reward_actions.test.js`
    - `tests/reward_navigation_actions.test.js`
    - `tests/event_reward_bindings.test.js`
    - `tests/run_return_ui_runtime.test.js`
    - `tests/reward_ui_runtime.test.js`
    - `tests/combat_lifecycle.test.js`
    - `tests/end_combat_use_case.test.js`
    - `tests/death_handler_runtime.test.js`
    - `tests/combat_end_ports.test.js`
  - `npm run lint` PASS
  - `npm run build` PASS
  - deep combat reward smoke PASS:
    - `output/web-game/arch-refactor-deep-combat-reward-batch-48/shot-0.png`
    - `output/web-game/arch-refactor-deep-combat-reward-batch-48/shot-1.png`
    - `output/web-game/arch-refactor-deep-combat-reward-batch-48/shot-2.png`
    - `output/web-game/arch-refactor-deep-combat-reward-batch-48/state-0.json`
    - `output/web-game/arch-refactor-deep-combat-reward-batch-48/state-1.json`
    - `output/web-game/arch-refactor-deep-combat-reward-batch-48/state-2.json`
    - `output/web-game/arch-refactor-deep-combat-reward-batch-48/console-errors.json`
- 메트릭 반영:
  - import coupling baseline `470` 유지
  - state mutation total `162` 유지
- 완료 상태:
  - 기존 TODO였던 `platform/legacy` reward command surface 정리와 `death_handler`/combat end reward handoff deep smoke 고정을 마무리
