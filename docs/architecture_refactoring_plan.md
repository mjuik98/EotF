# Architecture Refactoring Plan

## 1. 현재 구조의 문제점 분석

- `game/features/*` 중심 구조가 정본으로 자리잡는 중이지만, `game/app/*`, `game/ui/*`, `game/presentation/*`, `game/state/*`, `game/combat/*`, `game/systems/*`에 compat surface가 아직 넓게 남아 있다.
- `game/core/bootstrap/register_runtime_debug_hooks.js` 같은 core 모듈이 화면 패널 구조와 overlay 세부 사항을 직접 알고 있어 feature-local ownership이 완결되지 않았다.
- `game/systems/run_rules.js`, `game/systems/save_system.js`는 점진 분해가 진행됐지만 여전히 legacy 진입점과 canonical ownership이 혼재한다.
- `game/features/combat/domain/set_bonus_system.js`, `game/features/title/domain/class_progression_system.js`는 facade 아래 세부 책임이 여전히 큰 편이다.

## 2. 왜 유지보수가 어려운지

- 동일 책임이 canonical 경로와 compat 경로에 동시에 존재해 import 방향을 추적하기 어렵다.
- core에서 feature 상세 UI를 직접 알면 기능 추가 시 core 수정이 연쇄적으로 발생한다.
- 공용 뷰 조각이 `ui/shared`에 머무르면 feature가 compat surface를 통해 간접 의존하게 된다.
- save/debug/runtime query처럼 교차 기능이 명시적 public surface 없이 노출되면 의존성 관리가 느슨해진다.

## 3. 모듈 분할 기준

- 기능 경계: `title`, `run`, `combat`, `event`, `reward`, `codex`, `ui`
- 책임 경계: `application`, `domain`, `state`, `presentation`, `platform`, `ports`
- 공통화 기준: 두 개 이상 feature가 사용하는 순수 로직 또는 UI primitive만 `game/shared/*`로 승격
- 금지 기준: compat surface에는 신규 실구현을 추가하지 않고 thin re-export 또는 shim만 허용

## 4. 추천 아키텍처 구조

- `game/core/*`: bootstrap, composition, deps, runtime shell만 유지
- `game/features/*`: 기능별 소유권의 정본
- `game/shared/*`: progression, codex, state, runtime, save, ui primitive 같은 교차 공용 모듈
- `game/platform/*`: browser, storage, legacy adapter
- `game/app/*`, `game/ui/*`, `game/presentation/*`, `game/state/*`, `game/combat/*`, `game/systems/*`: frozen compat surface

## 5. 디렉토리 구조 예시

```text
game/
  core/
    bootstrap/
    composition/
    deps/
  features/
    title|run|combat|event|reward|codex|ui/
      application/
      domain/
      state/
      presentation/
      platform/
      ports/
      public.js
  shared/
    codex/
    progression/
    runtime/
    save/
    state/
    ui/
  platform/
    browser/
    storage/
    legacy/
```

## 6. 핵심 모듈별 역할 정의

- `game/shared/save/public.js`: 저장 관련 canonical public surface
- `game/shared/ui/player_hp_panel/public.js`: floating HP panel의 canonical public surface
- `game/core/bootstrap/create_runtime_debug_snapshot.js`: runtime debug snapshot 조합기
- `game/features/{title,run,combat,ui}/ports/runtime_debug_snapshot.js`: feature별 snapshot contributor
- `game/platform/browser/composition/build_core_run_system_modules.js`: compat surface 대신 canonical shared/feature surface를 조립하는 composition root

## 7. 리팩토링 우선순위

1. compat surface 동결과 canonical public surface 확장
2. 공용 로직을 `game/shared/save/*`, `game/shared/ui/*` 같은 명시적 public surface로 승격
3. core가 feature 내부 UI 구조를 직접 아는 부분을 contributor 조합 방식으로 축소
4. 대형 domain/system 모듈을 facade 유지 상태로 세분화
5. feature 내부 transitional dir를 canonical dir로 수렴
