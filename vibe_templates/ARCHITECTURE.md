# Architecture Quick Guide

이 문서는 이 저장소에서 작업을 시작하는 AI를 위한 압축 가이드다. 세부 정책은 `docs/architecture_boundaries.md`, 진행 상태는 `progress.md`, 확장 방향은 `docs/scaling_playbook.md`를 기준으로 한다.

## Layer Direction

- `engine/`, `data/`: 정적 데이터와 엔진 기초
- `game/core/`, `game/app/`, `game/domain/`, `game/systems/`, `game/combat/`, `game/utils/`: 상태, 서비스, 규칙, 시스템
- `game/ui/`: 화면 조립과 런타임

기본 방향은 `ui -> app/domain/core/data` 쪽이다. `game/ui/*` 바깥에서 `game/ui/*`를 직접 참조하는 코드는 피하고, `game/core/*`에서 UI를 참조해야 한다면 composition root 성격 파일로 제한한다.

## Safe Change Zones

- 기능 로직 수정: `game/domain/`, `game/app/`, `game/combat/`
- UI 런타임 분리와 주입 정리: `game/ui/`
- 이벤트/카드/유물/몬스터 정의: `data/`
- 회귀 방지 테스트 추가: `tests/`

## Avoid These Couplings

- `window`, `document`, `globalThis` 직접 fallback 추가
- UI에서 전역 상태를 우회 수정하는 코드
- composition root 외부에서 `game/ui/*`를 역참조하는 코드
- 리듀서 규칙을 벗어난 직접 state mutation 확대
- `game/core/game_api.js`에 새 거대 오케스트레이션 로직 누적

## Quality Gates

- 기본 검증:
  - `npm run test`
  - `npm run build`
- 구조 검증:
  - `npm run lint`
- 풀 게이트:
  - `npm run quality`

`npm run lint`는 architecture, window usage, state mutation, event contracts, import coupling, content data, asset manifest를 함께 확인한다.

## Current Project State

- 현재 우선순위는 신규 기능보다 구조 개선과 안정화다.
- `progress.md`는 최근 핵심 변화만 남기는 요약본이다.
- 최근 리팩토링 방향은 `facade -> app service -> domain/service/helper` 분리다.
- Playwright 기반 브라우저 확인이 반복적으로 사용되고 있다.

## Known Risks

- `check-import-coupling`은 아직 압박이 남아 있다.
- state mutation 기준도 저장소 전체 기준으로는 완전히 정리되지 않았다.
- binding layer와 legacy facade 경로는 여전히 팬아웃이 크다.
- global bridge 성격 코드가 남아 있어 platform 경계 유지가 중요하다.

## Default Browser Validation

1. 필요 시 `npm run preview` 또는 기존 preview 환경을 사용한다.
2. 시작 화면에서 `#mainStartBtn`을 클릭한다.
3. 캐릭터 선택 화면이 정상 렌더링되는지 확인한다.
4. 새 console/page error 아티팩트가 생기는지 확인한다.

## Working Notes

- 저장소 전체 상태를 갱신할 때는 `progress.md`를 사용한다.
- 작업 단위 기록은 이 폴더의 템플릿을 복제해서 별도로 남긴다.
- 구조 변경 시에는 `DECISION_LOG`와 `HANDOFF`까지 함께 갱신하는 편이 안전하다.

## AI Ready Check

- `goal_is_actionable`: yes
- `scope_is_bounded`: yes
- `validation_is_defined`: yes
- `resume_point_exists`: yes
