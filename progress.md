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
  - `window usage`: `64 / 319`
  - `state mutation`: `234 / 234`
  - `import coupling`: `143 / 201`
  - `vitest`: `255 files / 647 tests` PASS
- 구조/품질 검사 기준선은 현재 모두 통과 상태다.

## Recently Completed

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
- Legacy compat 정리:
  - `game/platform/legacy/create_legacy_game_api.js`를 추가해 grouped action/query binding을 compat surface로 합성하도록 만들었고, `game_api_registry.js`는 이 조합 helper를 사용하도록 정리했다.
- 신규 회귀 테스트:
  - `tests/title_bindings.test.js`
  - `tests/run_entry_bindings.test.js`
  - `tests/create_legacy_game_api.test.js`
  - `tests/combat_bindings.test.js`
  - `tests/event_reward_bindings.test.js`
  - `tests/ui_bindings.test.js`
- 최근 회귀 수정:
  - 인트로 cinematic의 `document`/`window` fallback 오류를 복구해 run-start 흐름을 막던 런타임 오류를 제거했다.
  - 타이틀 부트, 이벤트 닫힘, 반복 스토리 조각, HUD 잔존 같은 최근 회귀 이슈들을 정리했다.

## Current Risks

- `import coupling`은 충분히 내려왔지만 binding/orchestration 쪽 fan-out hotspot은 여전히 후속 관리 대상이다.
- `state mutation`과 `window usage`는 현재 통과 중이지만 여유 폭이 크지 않아 회귀 시 다시 경계선에 걸릴 수 있다.
- compat-only `GAME.getDeps()`는 정의 자체는 남아 있지만, 실제 게임 코드에서의 직접 호출면은 정리된 상태다.
- platform/legacy bridge 파일은 구조적으로 격리됐지만, 후속 변경에서 다시 경계가 흐려질 위험이 있다.

## Next Priorities

1. binding/orchestration helper 중 아직 큰 fan-out을 가진 파일을 추가 분해한다.
2. `GAME.API` compat shell 바깥에서 legacy facade를 직접 넓히는 경로가 없는지 계속 점검한다.
3. platform/legacy bridge 경계가 다시 core 쪽으로 새지 않도록 rule과 테스트를 유지한다.
4. import coupling 수치가 다시 증가하지 않도록 새 composition 추가 시 platform/browser 쪽 조합 패턴을 유지한다.

## Notes

- 이 문서는 저장소 전체의 현재 상태만 남기는 요약본이다.
- 세션 상세 로그, 검증 실행 기록, 인수인계 메모는 별도 문서로 남기고 `progress.md`에는 누적하지 않는다.
- 최신 브라우저 검증 산출물:
  - `output/web-game-verify-20260311-1812/shot-0.png`
  - `output/web-game-verify-20260311-1812/state-0.json`
  - `output/web-game-verify-20260311-1732/shot-1.png`
  - `output/web-game-verify-20260311-1732/state-1.json`
