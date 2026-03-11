Original prompt: 우리 프로젝트 코드를 분석하고, 단순 코드 정리가 아니라 프로젝트 전체 관점에서 구조 개선안을 제시하고, 모듈화/책임 분리/관심사 분리/구조화/공통 로직 일원화/의존성 관리/상태 흐름 정리/유지보수성과 확장성 향상을 목표로 점진적으로 구현한다.

# Progress Summary

## Current Status

- 프로젝트는 신규 기능보다 구조 개선과 안정화에 우선순위를 두고 있다.
- 최근 리팩토링의 기준은 `facade -> app service -> domain/service/helper` 분리와 composition root 축소다.
- `game/core/game_api.js`와 binding layer는 더 얇은 진입점으로 정리되고, 실제 흐름은 app/service 및 feature-specific contract 쪽으로 이동했다.
- 대형 UI/runtime 파일은 helper/runtime 모듈로 분해되었고, 전역 접근은 주입 가능한 `deps` 경로로 계속 축소됐다.
- `render_game_to_text`와 브라우저 자동화 검증 경로가 강화되어 title -> class select -> story fragment -> map -> first combat 흐름까지 확인 가능하다.

## Current Baseline

- 현재 통과:
  - `npm run lint`
  - `npm run build`
  - `npm test`
- 핵심 메트릭:
  - `window usage`: `10 / 319`
  - `state mutation`: `234 / 234`
  - `import coupling`: `141 / 201`
  - `vitest`: `292 files / 697 tests` PASS
- 구조/품질 검사 기준선은 현재 모두 통과 상태다.

## Recently Completed

- 오디오 시스템 통합:
  - `engine/audio.js`를 preset-driven Web Audio 엔진으로 교체하고, `engine/audioHelpers.js`, `engine/audioPresets.js`를 추가했다.
  - 기존 `AudioEngine` surface는 유지하면서 `play`, `playEvent`, `playClick`, `stopAmbient`, `destroy`, `setReverbRouting`, `getConfig`, `presets`를 지원하도록 확장했다.
  - title/run/settings/hud/combat hot-path 일부 호출부를 `playEvent(...)` 우선 + legacy method fallback 형태로 이관했다.
  - `tests/audio_engine.test.js`를 추가해 init/no-audio-context, `playClick`/`playEvent`, ambient index mapping, stop/destroy, volume compatibility를 고정했다.
  - 후속 튜닝으로 `ui.click`, `attack.slash`, `status.heal` 프리셋의 어택/잔향 밸런스를 조정하고, ambient attack/crossfade를 줄여 지역 전환 공백을 완화했다.
  - 호출부 공통화를 위해 `game/domain/audio/audio_event_helpers.js`를 추가하고, `playEvent()`가 값을 반환하지 않아 legacy 메서드까지 함께 호출되던 중복 재생 버그를 제거했다.
  - title/codex/ending/settings/run/combat/event 일부 클릭/힐/타격 호출은 공통 helper를 통해 “event 우선, legacy는 미지원일 때만 fallback” 경로로 통일했다.
- 아키텍처/구조:
  - 상태 리듀서와 주요 오케스트레이션을 도메인별로 분리하고, `game/core/game_api.js` 및 binding wrapper의 legacy facade를 점진적으로 축소했다.
  - `deps factory`와 contract builder는 broad dep bag보다 feature-specific dep shape를 우선 사용하도록 정리했다.
  - `register_game_bindings`와 `boot_runtime_features`는 다시 feature helper 조합 레이어로 쪼개서, orchestration 파일이 직접 세부 binding/subscriber/boot step을 다 알지 않도록 정리했다.
- Legacy surface 축소:
  - `GAME.getDeps()`는 compat surface 중심으로만 남기고, 새 runtime/contract 경로에서는 feature별 getter를 기본 선택지로 사용하도록 맞췄다.
  - global bridge 성격 코드는 platform 경계로 더 분리했다.
  - 실제 게임 코드 기준 broad `GAME.getDeps()` 호출은 더 이상 남아 있지 않고, 현재 호출면은 compat surface 정의와 테스트에만 남아 있다.
  - `GameAPI`는 `game_api_facade.js` 조합을 통해 compat shell 역할만 수행하도록 한 단계 더 얇아졌다.
- Composition / binding fan-out 축소:
  - `game/core/composition/register_*_modules.js`는 이제 `game/platform/browser/composition/*`로 위임하는 shim만 남는다.
  - 실제 UI/engine/data import는 `platform/browser/composition`으로 이동시켜 `core->ui` cross-layer import를 크게 줄였다.
  - 이번 단계에서 `check-import-coupling` 총량이 `199 -> 145`로 감소했다.
  - `game/platform/browser/composition/register_combat_modules.js`는 이제 `build_combat_core_modules.js`, `build_combat_card_modules.js`, `build_combat_hud_modules.js`를 조합하는 thin wrapper만 남는다.
  - 이 단계로 combat composition도 `combat screen/core`, `card interaction`, `hud update` 세 group으로 분리되어 browser composition의 가장 큰 단일 import fan-out 하나를 정리했다.
  - `game/platform/browser/composition/build_core_system_modules.js`는 이제 `build_core_progression_modules.js`, `build_core_run_system_modules.js`, `build_core_utility_modules.js`를 조합하는 thin wrapper만 남는다.
  - 이 단계로 core system composition도 `progression`, `run/save`, `utility` 세 group으로 분리되어 composition root에서 system import fan-out이 더 줄었다.
  - `game/core/event_subscribers.js`는 이제 `build_event_subscriber_registrars.js`와 `execute_event_subscriber_registration.js`를 조합하는 thin wrapper만 남는다.
  - 이 단계로 subscriber orchestration도 `context resolve`, `registrar list`, `registration execute` 세 경계로 분리되어 event subscriber 등록 순서가 명시적으로 고정됐다.
- 번들 분할:
  - `vite.config.js`의 `manualChunks`를 확장해 `ui-title`, `ui-map`, `ui-combat`, `ui-event`, `ui-story`, `ui-settings` 청크를 추가했다.
  - 그 결과 메인 번들은 `661.27 kB -> 173.23 kB`로 줄었고, title/map/combat/event/settings/story UI가 기능 단위 청크로 분리됐다.
  - 기존 `ui-codex`, `ui-ending`, `ui-run-mode`, `data-cards`, `data-enemies`, `vendor` 분리와 합쳐서 현재 build에서 600 kB chunk warning은 재현되지 않는다.
- Runtime debug hook / 브라우저 검증:
  - `render_game_to_text`가 title, story fragment, map, combat 상태를 더 잘 요약하도록 확장됐다.
  - Playwright 기반 검증 범위가 first combat까지 늘어났고, 최근 실행에서는 신규 콘솔 에러 재현이 없었다.
- Orchestration hotspot 추가 정리:
  - `event_subscribers.js`는 player/card/combat/runtime subscriber helper 조합 레이어로 축소했다.
  - `init_sequence_steps.js`는 story system bridge, init binding, character mount, boot payload helper re-export 레이어로 축소했다.
  - `register_game_bindings`와 `boot_runtime_features` 구조를 고정하는 테스트를 추가했다.
- Feature-oriented binder/action 도입:
  - `game/core/bindings/title_settings_bindings.js`는 이제 `game/features/title/ports/create_title_ports.js` + `game/features/title/app/title_actions.js`를 조합하는 thin shim이 됐다.
  - 타이틀/런타임 DOM 이벤트는 `game/platform/browser/bindings/root_bindings.js`에서 `game/features/title/ui/title_bindings.js`, `game/features/run/ui/run_entry_bindings.js`로 위임되며, `game/core/game_init.js`는 browser binding 계층 re-export만 남긴다.
  - root event wiring에서 직접 `GAME.API`/`window.*`를 호출하던 경로를 injected `actions` 포트 중심으로 치환해 title -> character select / run-entry / reward / codex 관련 DOM 바인딩의 변경면을 줄였다.
- Binding layer 추가 분해:
  - `game/core/bindings/combat_bindings.js`는 이제 `game/features/combat/ports/create_combat_ports.js` + `game/features/combat/app/combat_actions.js` 조합 shim이다.
  - `game/core/bindings/event_reward_bindings.js`는 이제 `game/features/event/ports/create_event_reward_ports.js` + `game/features/event/app/event_reward_actions.js` 조합 shim이다.
  - `game/core/bindings/ui_bindings.js`는 이제 `game/features/ui/ports/create_ui_ports.js` + `game/features/ui/app/ui_actions.js` 조합 shim이다.
  - 이 단계로 core binding 파일에서 broad `Deps` 직접 호출을 feature ports 쪽으로 더 밀어 넣고, title/combat/event/ui 바인딩을 같은 구조 패턴으로 맞췄다.
  - `game/core/bindings/canvas_bindings.js`는 이제 `game/features/run/ports/create_run_canvas_ports.js` + `game/features/run/app/run_canvas_actions.js` 조합 shim이다.
  - world render loop, map generation, minimap, node navigation에 필요한 canvas 의존성 조립을 `run` feature port에서 담당하도록 옮겨 core binding의 역할을 `fns` 확장에만 제한했다.
  - `game/core/deps/contracts/ui_contract_builders.js`는 이제 contract registry shim만 남고, 실제 builder 정의는 `game/features/combat/ports/contracts/*`, `game/features/ui/ports/contracts/*`, `game/features/run/ports/contracts/*`로 분해됐다.
  - 이 단계로 `hud/combatInfo/baseCard/helpPause/worldCanvas/settings` 성격의 dep contract가 feature별 파일 경계 안으로 이동해 broad UI dep hotspot을 줄였다.
  - `game/core/deps/contracts/run_contract_builders.js`는 이제 contract composition만 담당하고, 실제 builder 정의는 `game/features/title/ports/contracts/build_title_run_contracts.js`, `game/features/run/ports/contracts/build_run_flow_contracts.js`로 분해됐다.
  - 이 단계로 `runMode/metaProgression`과 `runStart/runSetup/regionTransition/gameBoot`가 서로 다른 feature 경계로 분리되어 `run` dep contract hotspot도 줄였다.
  - `game/core/bootstrap/build_game_boot_payload.js`의 action fan-out은 `game/core/bootstrap/build_game_boot_actions.js`로 추출되고, 실제 action map은 `game/features/title/app/build_title_boot_actions.js`, `game/features/run/app/build_run_boot_actions.js`에서 조립한다.
  - `game/core/bootstrap/register_runtime_subscribers.js`는 이제 `game/core/bootstrap/build_runtime_subscriber_payload.js`를 호출하는 wrapper만 남고, 실제 subscriber action 조합은 `game/core/bootstrap/build_runtime_subscriber_actions.js`와 `game/features/combat/app/build_runtime_subscriber_actions.js`, `game/features/ui/app/build_runtime_subscriber_actions.js`로 분해됐다.
  - `game/core/bootstrap/register_runtime_boot_steps.js`는 이제 `game/core/bootstrap/build_runtime_boot_bindings.js` + `game/core/bootstrap/execute_runtime_boot_sequence.js` 조합 wrapper만 남아, boot step 순서와 각 step 구현을 분리했다.
  - `game/core/bootstrap/register_runtime_debug_hooks.js`는 이제 `game/core/bootstrap/build_runtime_debug_hooks.js`를 통해 hook 조립을 위임하고, runtime debug snapshot 노출과 advance-time 동작의 조립 책임을 helper로 분리했다.
- Legacy compat 정리:
  - `game/platform/legacy/create_legacy_game_api.js`를 추가해 grouped action/query binding을 compat surface로 합성하도록 만들었고, `game_api_registry.js`는 이 조합 helper를 사용하도록 정리했다.
  - `game/core/bootstrap/register_legacy_surface.js`는 이제 `game/core/bootstrap/build_legacy_surface_globals.js`를 호출하는 wrapper만 남고, engine/system/ui/binding global 조립을 별도 helper로 분리했다.
  - `game/platform/legacy/global_bridge_runtime.js`의 feature dep builder와 global exposure 로직은 `game/platform/legacy/global_bridge_helpers.js`로 이동해 runtime bridge 파일의 책임을 `GAME` compat object 유지로 축소했다.
  - `game/ui/combat/combat_turn_ui.js`와 `game/ui/combat/combat_turn_runtime_ui.js`에서는 `GAME.Modules.HudUpdateUI` 직접 fallback을 제거하고 injected `updateCombatEnergy`/`hudUpdateUI` 경로를 우선 사용하도록 정리했다.
  - `game/systems/run_rules.js`의 `finalizeRunOutcome`는 이제 저장 포트를 세 번째 인자로 받고, 실제 런타임 바인딩은 `game/features/run/app/bind_run_outcome_action.js`를 통해 `SaveSystem`이 주입된 wrapper로 등록된다.
  - `game/combat/death_handler.js`는 이제 `EndingScreenUI`와 `selectFragment`를 injected deps / window 경로로만 해석하고, `GAME.API`/`GAME.Modules` 직접 fallback을 제거했다.
  - `game/ui/shared/player_hp_panel_runtime_ui.js`는 이제 `StatusEffectsUI`를 injected deps에서만 해석하며, global `GAME.Modules.StatusEffectsUI` fallback을 제거했다.
  - `game/combat/combat_initializer.js`의 지역 디버프 적용은 `runRules` 주입 기반으로 바뀌었고, `game/ui/combat/combat_start_ui.js`가 이 포트를 넘기도록 맞췄다.
  - `game/features/combat/app/game_state_card_actions.js`를 추가해 draw/play/discard 공통 로직을 feature app helper로 끌어올렸고, `game/platform/legacy/game_api/combat_commands.js`와 `game/platform/legacy/game_api/player_draw_commands.js`가 이 helper를 공유하도록 맞췄다.
  - `game/combat/card_methods.js`는 더 이상 `GAME.Modules['GameAPI']`를 직접 보지 않고, `game/platform/legacy/adapters/create_legacy_game_state_card_ports.js`를 통한 좁은 runtime port + shared card action helper 경로를 사용한다.
  - `game/combat/combat_lifecycle.js`는 `deps.runRules`만 사용하도록 정리되어 `globalThis.GAME?.Modules?.RunRules` fallback이 제거됐다.
  - `game/ui/combat/combat_start_ui.js`는 이제 `getRegionData/getBaseRegionIndex/getRegionCount/difficultyScaler/classMechanics`를 injected deps에서만 받도록 정리됐고, 이 값들은 `game/features/combat/app/combat_actions.js`에서 명시 주입된다.
  - `game/systems/class_progression_system.js`의 deck-ready 카드 비용 조회는 이제 `options.cards || options.data.cards`만 사용해 `globalThis.DATA` fallback을 제거했다.
  - `game/ui/combat/status_effects_ui.js`는 tooltip 위치 계산용 window 참조를 `deps.win || doc.defaultView`로만 해석하도록 정리되어 `globalThis.window` fallback이 제거됐다.
  - `game/features/ui/app/ui_actions.js`는 `StatusEffectsUI.updateStatusDisplay()` 호출 시 `doc.defaultView`를 함께 넘기도록 맞춰 browser 런타임 계약을 명시화했다.
  - `game/ui/cards/deck_modal_ui.js`는 이제 tooltip/description 로직을 `deps.showTooltip`, `deps.hideTooltip`, `deps.descriptionUtils`에서만 해석하고 `window.showTooltip`, `window.hideTooltip`, `window.DescriptionUtils` fallback을 제거했다.
  - `game/features/ui/app/ui_actions.js`는 deck modal 호출 시 tooltip deps와 `DescriptionUtils`를 합성한 좁은 port를 주입해 card-modal tooltip 경계를 명시화했다.
  - `game/ui/cards/card_ui.js`는 이제 drag/render/card-cost 경로를 injected `deps`에서만 해석하고 `globalThis.handleCardDragStart`, `globalThis.handleCardDragEnd`, `globalThis.renderCombatCards`, `globalThis.CardCostUtils` fallback을 제거했다.
  - `game/ui/cards/card_target_ui.js`는 enemy rerender를 injected `renderCombatEnemies` 포트에서만 호출하도록 정리되어 `window.CombatUI.renderCombatEnemies`와 `window.DATA` fallback이 제거됐다.
  - `game/ui/map/world_render_loop_ui.js`는 이제 `getRegionData`, `HitStop`, `ScreenShake`, `requestAnimationFrame`을 injected deps에서만 사용해 `window` fallback을 제거했다.
  - `game/ui/map/region_transition_ui.js`는 이제 `getRegionData`, `getBaseRegionIndex`, `descriptionUtils`, viewport, timeout을 injected browser/runtime deps에서만 해석해 `globalThis` fallback을 제거했다.
  - `game/ui/map/map_generation_ui.js`는 `getRegionData`, `getBaseRegionIndex`를 injected deps에서만 사용하도록 정리됐다.
  - `game/ui/map/maze_system_ui.js`는 이제 `win`, `fovEngine`, `requestAnimationFrame`, `setTimeoutFn`을 injected deps 또는 doc.defaultView에서만 해석한다.
  - `game/features/run/app/run_canvas_actions.js`와 `game/features/run/ports/create_run_canvas_ports.js`는 map runtime이 필요한 browser/engine 핸들을 명시 주입하도록 확장됐다.
  - `game/features/run/ports/contracts/build_run_flow_contracts.js`의 `regionTransition` contract는 `DescriptionUtils`를 포함하도록 확장됐다.
  - `game/utils/runtime_deps.js`는 이제 audio/raf를 injected deps 또는 injected window에서만 해석해 `globalThis` fallback을 제거했다.
  - `game/ui/title/run_end_screen_ui.js`, `game/ui/title/level_up_popup_ui.js`는 constructor에서 browser handles를 직접 global에서 읽지 않고 injected `doc/win/raf`를 사용한다.
  - `game/ui/title/character_select_ui.js`는 `LevelUpPopupUI`와 `RunEndScreenUI`를 생성할 때 `doc/win/requestAnimationFrame/cancelAnimationFrame/setTimeout`을 명시 전달하도록 정리됐다.
  - `game/ui/hud/hud_effects_ui.js`는 `resetCombatInfoPanel` 해석 시 `globalThis._resetCombatInfoPanel` fallback을 제거했다.
  - `game/ui/screens/help_pause_ui.js`는 모바일 판단과 title reload를 injected `win/doc` 브라우저 포트로만 해석하도록 정리됐다.
  - `game/core/app_config.js`는 host object helper를 통해 `__GAME_CONFIG__`를 읽도록 바뀌어 직접 `globalThis` 접근을 제거했다.
  - `game/platform/browser/composition/register_core_runtime_modules.js`는 이제 core runtime registry를 직접 나열하지 않고 `build_core_engine_modules.js`, `build_core_runtime_bridge_modules.js`, `build_core_system_modules.js`를 조합하는 얇은 composition wrapper만 남는다.
  - 이 단계로 core/browser composition root에서 가장 큰 fan-out registry 하나를 engine/data, legacy bridge, system/rules 축으로 분리해 조립 책임을 더 명확하게 나눴다.
  - `game/platform/browser/composition/register_run_modules.js`, `register_screen_modules.js`, `register_title_modules.js`도 각각 map/run-flow, primary-screen/overlay, title-canvas/title-flow helper 조합으로 분해되어 9줄 수준의 thin wrapper만 남는다.
  - 이 단계로 browser composition registry 전반이 “직접 import 나열”보다 “명시적 module group merge” 패턴으로 정리됐다.
  - `game/core/bindings/module_registry.js`는 이제 `build_module_registry_groups.js`가 반환한 `core/title/combat/run/screen` group을 merge하는 thin wrapper만 남는다.
  - `game/core/bootstrap_game.js`는 이제 `create_bootstrap_context.js`와 `init_bootstrap_cursor.js`를 조합하는 wrapper만 남아, browser handle/deps/module registry 해석과 cursor init side effect를 helper 경계로 분리했다.
  - 이 단계로 composition root에서 남아 있던 registry merge 순서와 bootstrap init fan-out이 별도 helper로 이동해 `bootstrapGameApp()` 책임이 `context resolve -> bindings -> boot` 3단계로 축소됐다.
  - `game/core/event_bindings.js`는 이제 `create_binding_setup_context.js`와 `execute_binding_setup_sequence.js`를 조합하는 wrapper만 남아, binding setup의 context 생성과 실행 순서를 helper 경계로 분리했다.
  - `game/core/composition/register_game_bindings.js`는 이제 `build_game_binding_registrars.js`가 제공하는 registrar 목록을 순회하는 wrapper만 남는다.
  - 이 단계로 binding orchestration도 `context resolve -> group bindings -> legacy surface -> deps init` 순서가 명시적 sequence로 고정되어 후속 분해 지점이 더 분명해졌다.
  - `game/core/bootstrap/init_binding_deps.js`는 이제 `build_binding_deps_payload.js`가 만든 payload를 `deps.initDepsFactory()`에 넘기는 thin wrapper만 남는다.
  - `game/core/bootstrap/register_binding_legacy_surface.js`는 이제 `build_binding_legacy_metrics.js`, `build_binding_legacy_surface_steps.js`, `execute_binding_legacy_surface_steps.js`를 조합하는 wrapper만 남는다.
  - 이 단계로 binding bootstrap의 남은 fan-out도 `deps payload 구성`과 `legacy surface step 실행`으로 나뉘어, 공개 surface 조립과 deps factory 초기화 경계가 더 명확해졌다.
  - `game/core/bootstrap/build_legacy_surface_globals.js`는 이제 `build_legacy_surface_global_groups.js`가 반환한 `engine/system/ui/binding` group을 merge하는 wrapper만 남는다.
  - `game/core/bootstrap/register_legacy_surface.js`는 이제 `build_legacy_surface_registration_payload.js`와 `execute_legacy_surface_registration.js`를 조합하는 wrapper만 남아, legacy surface init/expose 단계를 helper 경계로 분리했다.
  - `game/platform/legacy/game_api_registry.js`는 이제 `build_legacy_game_api_payload.js`가 만든 grouped payload를 `createLegacyGameApi()`에 넘기는 wrapper만 남는다.
  - 이 단계로 compat/public surface fan-out도 `global group 조합`, `registration payload`, `api payload` 세 축으로 분리되어 legacy registry 변경 지점이 더 명확해졌다.
  - `game/platform/legacy/window_bindings.js`는 이제 `resolve_legacy_window_binding_root.js`, `build_legacy_window_binding_steps.js`, `execute_legacy_window_binding_steps.js`를 조합하는 wrapper만 남는다.
  - `game/platform/legacy/game_api_command_bindings.js`는 이제 `build_legacy_game_api_command_groups.js`가 만든 `combat/codex/reward/run/settings` group을 merge하는 wrapper만 남는다.
  - `game/platform/legacy/game_api_query_bindings.js`는 이제 `build_legacy_game_api_query_groups.js`가 만든 `module/runtime` group을 merge하는 wrapper만 남는다.
  - 이 단계로 compat surface 내부 fan-out도 `window root resolve`, `window step execution`, `command/query group merge`로 분리되어 legacy 하위 변경면이 더 좁아졌다.
  - `game/platform/legacy/window_binding_queries.js`는 이제 `build_legacy_window_query_groups.js`가 반환한 `ui/utility` group을 merge하는 wrapper만 남는다.
  - `game/platform/legacy/window_binding_ui_queries.js`는 이제 `build_legacy_window_ui_query_groups.js`가 반환한 `hud/combat` group을 merge하는 wrapper만 남는다.
  - `game/platform/legacy/game_api_combat_bindings.js`는 이제 `build_legacy_game_api_combat_groups.js`가 만든 `hud/player/flow` group을 merge하는 wrapper만 남는다.
  - `game/platform/legacy/game_api_runtime_queries.js`는 이제 `build_legacy_game_api_runtime_query_groups.js`가 만든 `save/metrics/hud` group을 merge하는 wrapper만 남는다.
  - 이 단계로 compat surface 하위 helper에서도 실제 변경면이 `window query group`, `combat action group`, `runtime query group` 수준으로 더 좁혀졌다.
  - `game/platform/legacy/adapters/create_legacy_combat_compat.js`를 추가해 compat combat helper가 `modules.GAME.get*Deps()`와 `modules.GameAPI`를 직접 참조하지 않고 feature combat port와 player command helper를 통해 동작하도록 정리했다.
  - `game/platform/legacy/build_legacy_window_ui_query_groups.js`와 `game/platform/legacy/build_legacy_game_api_combat_groups.js`는 이제 공통 compat adapter를 통해 status tooltip, echo skill HUD 갱신, draw/take-damage 경로를 조립한다.
  - `game/core/event_subscribers_player_events.js`의 `PLAYER_SILENCE` 처리에서 `GAME.getHudDeps()` 직접 조회를 제거하고 injected action(`updateUI`) 경로로 정리했다.
  - `game/platform/legacy/adapters/create_legacy_runtime_ports.js`를 추가해 legacy runtime에서 필요한 `run/combat/ui deps`, `Modules`, `Data`, `Audio`, `State` 접근을 공통 adapter 하나로 모았다.
  - `game/platform/legacy/game_api/runtime_context.js`와 `game/platform/legacy/adapters/create_legacy_game_state_card_ports.js`는 이제 이 runtime adapter를 통해 동작해 legacy command/card 경계의 직접 global bridge 해석을 한 곳으로 축소했다.
  - `game/core/bootstrap/create_game_boot_ports.js`를 추가하고 `game/core/bootstrap/build_game_boot_payload.js`는 boot payload 조립 시 직접 `modules.GAME.getRunDeps()`를 보지 않고 좁은 boot port를 사용하도록 정리했다.
  - 이 단계 이후 `game/platform/legacy`와 `game/core` 기준으로 직접 `modules.GAME.get*Deps()` 및 `modules.GameAPI` 문자열 참조는 남아 있지 않다.
- 신규 회귀 테스트:
  - `tests/title_bindings.test.js`
  - `tests/run_entry_bindings.test.js`
  - `tests/create_legacy_game_api.test.js`
  - `tests/combat_bindings.test.js`
  - `tests/event_reward_bindings.test.js`
  - `tests/ui_bindings.test.js`
  - `tests/canvas_bindings.test.js`
  - `tests/build_game_boot_payload.test.js`
  - `tests/build_runtime_subscriber_payload.test.js`
  - `tests/execute_runtime_boot_sequence.test.js`
  - `tests/build_runtime_debug_hooks.test.js`
  - `tests/combat_turn_ui.test.js`
  - `tests/card_methods.test.js`
  - `tests/combat_lifecycle.test.js`
  - `tests/class_progression_bonuses.test.js`에 explicit `cards` 입력 경로 회귀 추가
  - `tests/ui_bindings_status_display.test.js`에 `win` 전달 계약 회귀 추가
  - `tests/ui_actions_deck_modal.test.js`
  - `tests/card_ui.test.js`
  - `tests/card_target_ui.test.js`
  - `tests/world_render_loop_ui.test.js`
  - `tests/runtime_deps.test.js`
  - `tests/hud_effects_ui.test.js`
  - `tests/app_config.test.js`
  - `tests/register_core_runtime_modules.test.js`
  - `tests/register_run_modules.test.js`
  - `tests/register_screen_modules.test.js`
  - `tests/register_title_modules.test.js`
  - `tests/module_registry.test.js`
  - `tests/execute_binding_setup_sequence.test.js`
  - `tests/build_binding_deps_payload.test.js`
  - `tests/register_binding_legacy_surface.test.js`
  - `tests/build_legacy_surface_registration_payload.test.js`
  - `tests/register_legacy_game_api_bindings.test.js`
  - `tests/window_bindings.test.js`
  - `tests/game_api_query_bindings.test.js`
  - `tests/window_binding_queries.test.js`
  - `tests/game_api_combat_bindings.test.js`
  - `tests/event_subscribers_player_silence.test.js`
  - `tests/create_legacy_runtime_ports.test.js`
  - `tests/create_game_boot_ports.test.js`
  - `tests/register_combat_modules.test.js`
  - `tests/build_core_system_modules.test.js`
  - `tests/event_subscribers_registry.test.js`
  - `tests/deck_modal_ui.test.js`는 injected tooltip/description 계약을 검증하도록 갱신
  - `tests/game_api_command_bindings.test.js`는 compat adapter 기준으로 player command 포트를 검증하도록 갱신
  - 직접 global fallback 제거에 맞춘 `tests/death_handler.test.js`, `tests/player_hp_panel_ui.test.js`, `tests/combat_start_ui.test.js`, `tests/region_transition_ui.test.js`, `tests/canvas_bindings.test.js`, `tests/run_end_screen_ui_facade.test.js`, `tests/level_up_popup_ui_facade.test.js`, `tests/character_select_ui_mount.test.js`, `tests/help_pause_ui.test.js` 갱신
- 최근 회귀 수정:
  - 인트로 cinematic의 `document`/`window` fallback 오류를 복구해 run-start 흐름을 막던 런타임 오류를 제거했다.
  - 타이틀 부트, 이벤트 닫힘, 반복 스토리 조각, HUD 잔존 같은 최근 회귀 이슈들을 정리했다.

## Current Risks

- 브라우저 스모크 기준 title -> settings -> class select -> intro/story -> map -> first combat까지 정상이며, 오디오 관련 신규 콘솔 에러는 재현되지 않았다.
- 추가 settings 스모크에서도 title 설정 패널이 정상적으로 열렸고, 이번 오디오 튜닝 이후 새 UI 오류는 재현되지 않았다.
- 추가 click-fix settings 스모크에서도 title 설정 패널이 정상적으로 열렸고, 중복 재생 수정 이후 새 UI 오류는 재현되지 않았다.
- first combat 진입을 막던 `"[CombatStart] Missing dependencies"` 회귀는 `game/features/combat/app/combat_actions.js`에서 region helper를 named export 기준으로 주입하도록 수정해 해소했다.
- `import coupling`은 충분히 내려왔지만 binding/orchestration 쪽 fan-out hotspot은 여전히 후속 관리 대상이다.
- `state mutation`과 `window usage`는 현재 통과 중이지만 여유 폭이 크지 않아 회귀 시 다시 경계선에 걸릴 수 있다.
- compat-only `GAME.getDeps()`는 정의 자체는 남아 있지만, 실제 게임 코드에서의 직접 호출면은 정리된 상태다.
- platform/legacy bridge 파일은 구조적으로 격리됐지만, 후속 변경에서 다시 경계가 흐려질 위험이 있다.
- 현재 게이트 기준선은 `window/document/globalThis usage: 10`, `import coupling: 141`, `vitest: 292 files / 697 tests`다.

## Next Priorities

1. binding/orchestration helper 중 아직 큰 fan-out을 가진 파일을 추가 분해한다.
2. production `game/` 코드 기준 직접 `window/globalThis` 문자열 접근은 제거됐고, `game/platform/legacy`와 `game/core` 기준 직접 `modules.GAME.get*Deps()` 및 `modules.GameAPI` 참조도 정리됐다. 다음 단계는 compat facade 밖의 넓은 orchestration/helper fan-out 자체를 더 줄이는 작업이다.
3. event subscriber와 compat helper가 injected action/port를 우회하지 않도록 테스트 경계를 더 추가한다.
4. `GAME.API` compat shell 바깥에서 legacy facade를 직접 넓히는 경로가 없는지 계속 점검한다.
5. platform/legacy bridge 경계가 다시 core 쪽으로 새지 않도록 rule과 테스트를 유지한다.
6. import coupling 수치가 다시 증가하지 않도록 새 composition 추가 시 platform/browser 쪽 조합 패턴과 현재 chunk 분리 기준을 유지한다.

## Notes

- 이 문서는 저장소 전체의 현재 상태만 남기는 요약본이다.
- 세션 상세 로그, 검증 실행 기록, 인수인계 메모는 별도 문서로 남기고 `progress.md`에는 누적하지 않는다.
- 최신 브라우저 검증 산출물:
  - `output/web-game-audio-click-fix-settings/shot-0.png`
  - `output/web-game-audio-click-fix-settings/state-0.json`
  - `output/web-game-audio-tuning-settings/shot-0.png`
  - `output/web-game-audio-tuning-settings/state-0.json`
  - `output/web-game-audio-smoke-settings/shot-0.png`
  - `output/web-game-audio-smoke-settings/state-0.json`
  - `output/web-game-audio-smoke-class-select/shot-0.png`
  - `output/web-game-audio-smoke-class-select/state-0.json`
  - `output/web-game-audio-smoke-run-start/shot.png`
  - `output/web-game-audio-smoke-run-start/state.json`
  - `output/web-game-audio-smoke-map-final/shot.png`
  - `output/web-game-audio-smoke-map-final/state.json`
  - `output/web-game-audio-smoke-combat/shot.png`
  - `output/web-game-audio-smoke-combat/state.json`
  - `output/web-game-verify-20260311-2135/shot-0.png`
  - `output/web-game-verify-20260311-2135/state-0.json`
  - `output/web-game-verify-20260311-2140/shot-0.png`
  - `output/web-game-verify-20260311-2140/state-0.json`
  - `output/web-game-verify-20260311-2142/shot-0.png`
  - `output/web-game-verify-20260311-2142/state-0.json`
  - `output/web-game-verify-20260311-2148/shot-0.png`
  - `output/web-game-verify-20260311-2148/state-0.json`
  - `output/web-game-verify-20260311-2124/shot-0.png`
  - `output/web-game-verify-20260311-2124/state-0.json`
  - `output/web-game-verify-20260311-2118/shot-0.png`
  - `output/web-game-verify-20260311-2118/state-0.json`
  - `output/web-game-verify-20260311-2054/shot-0.png`
  - `output/web-game-verify-20260311-2054/state-0.json`
  - `output/web-game-verify-20260311-2049/shot-0.png`
  - `output/web-game-verify-20260311-2049/state-0.json`
  - `output/web-game-verify-20260311-2038/shot-0.png`
  - `output/web-game-verify-20260311-2038/state-0.json`
  - `output/web-game-verify-20260311-2034/shot-0.png`
  - `output/web-game-verify-20260311-2034/state-0.json`
  - `output/web-game-verify-20260311-2022/shot-0.png`
  - `output/web-game-verify-20260311-2022/state-0.json`
  - `output/web-game-verify-20260311-2010/shot-0.png`
  - `output/web-game-verify-20260311-2010/state-0.json`
  - `output/web-game-verify-20260311-1812/shot-0.png`
  - `output/web-game-verify-20260311-1812/state-0.json`
  - `output/web-game-verify-20260311-1732/shot-1.png`
  - `output/web-game-verify-20260311-1732/state-1.json`
