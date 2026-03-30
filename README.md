# ECHO OF THE FALLEN

> Purpose: onboarding entrypoint for humans and agents working in this repository.
> Update when: setup commands, repo layout, or canonical file links change.
> Do not put here: architecture policy details, current sprint status, or batch history.

기억의 잔향이 뒤엉킨 미궁을 탐색하며 덱을 성장시키는 로그라이크 덱빌딩 RPG입니다. 클래스, 카드, 유물, 이벤트를 조합해 매 런마다 다른 전투 흐름을 만들고, 조각난 세계의 기록을 하나씩 복원하는 경험을 목표로 합니다.

## What Is This?

`ECHO OF THE FALLEN`은 브라우저에서 실행되는 JavaScript 기반 싱글플레이 덱빌딩 게임입니다. 현재는 플레이 가능한 프로토타입이며, 구조 개선과 회귀 방지를 병행하는 개발 중 프로젝트입니다.

## Quick Start

```bash
npm install
npm run dev
```

개발 서버 실행 후 브라우저에서 Vite가 안내한 로컬 주소를 열면 됩니다.

프로덕션 빌드와 프리뷰:

```bash
npm run build
npm run preview
```

## Core Commands

```bash
# development
npm run dev
npm run clean
npm run clean:smoke

# verification
npm test
npm run test:manifest
npm run test:manifest:write
npm run test:guardrails
npm run test:full
npm run test:slow-report
npm run lint
npm run audit:structure
npm run audit:transition-surfaces
npm run build
npm run deps:map
npm run deps:map:check
npm run quality:sync
npm run quality:fast
npm run quality:full
npm run smoke:browser
```

`npm test`는 빠른 로직/런타임 회귀 루프이고, `npm run test:guardrails`는 구조/compat/조립 가드레일 묶음입니다. `npm run test:manifest`는 명시 test suite manifest가 저장소 상태와 동기화돼 있는지 확인하고, drift를 반영할 때는 `npm run test:manifest:write`를 사용합니다. `npm run test:slow-report`는 fast suite 기준으로 느린 테스트 파일 상위를 리포트합니다. dependency flow를 건드린 변경은 `npm run deps:map`으로 산출물을 갱신하고 `npm run deps:map:check`로 현재 저장소 상태와 맞는지 확인합니다. `npm run audit:transition-surfaces`는 transitional runtime surface의 파일 분포를 읽기 전용으로 집계합니다(현재 canonical runtime 파일 기준 transitional root 집계는 0). 둘을 함께 갱신할 때는 `npm run quality:sync`를 사용합니다. 테스트 소유권과 dependency map이 같이 바뀌는 작업은 handoff 전에 `npm run quality:sync`를 먼저 돌리는 편이 안전합니다. 둘 다 필요한 변경은 `npm run test:full`로 함께 확인합니다.

`npm run quality:full`은 로컬에서 `npm run build` 직후 기존 `dist/`를 재사용해 브라우저 스모크를 돌리므로, 같은 검증 루프 안에서 번들을 한 번 더 생성하지 않습니다. `npm run clean:smoke`는 누적된 브라우저 스모크 산출물까지 같이 정리할 때 사용합니다.

## Environment Variables

주로 스모크/프리뷰 검증에서 사용하는 환경 변수입니다.

```text
SMOKE_URL       이미 떠 있는 앱 URL을 재사용합니다. 지정하면 로컬 정적 서버를 새로 띄우지 않습니다.
SMOKE_DIST_DIR  스모크 검증이 서빙할 빌드 출력 경로입니다. 미지정 시 각 스크립트가 기본 dist 또는 임시 dist를 사용합니다.
SMOKE_OUT_DIR   스모크 스크립트 결과물(JSON/PNG) 출력 경로를 덮어씁니다.
```

UI에 영향이 있는 작업은 개발 서버에서 `#mainStartBtn` 클릭 후 캐릭터 선택 화면이 렌더링되는지와 콘솔/페이지 오류가 없는지도 확인합니다.

## Project Structure

```text
.
├── game/         # runtime code: canonical feature/shared/platform ownership, core orchestration, and transitional compat surfaces
├── data/         # static game data
├── tests/        # regression and guardrail coverage
├── scripts/      # quality, reporting, smoke, build helper scripts
├── config/       # machine-owned policy, baselines, thresholds, allowlists
├── artifacts/    # generated dependency and reporting outputs
├── docs/         # agent-generated plans/specs and other working artifacts
├── README.md     # onboarding
└── AGENTS.md     # rules and architecture contract
```

현재 `game/`는 `game/features/*`, `game/shared/*`, `game/platform/*` 중심 구조가 기준이며, transitional roots(`game/app`, `game/combat`, `game/domain`, `game/presentation`, `game/state`, `game/systems`, `game/ui`)는 디렉터리 표면만 유지 중이고 runtime 파일 집계는 0입니다. 신규 구현은 `game/features/<feature>/...`, `game/shared/*`, `game/platform/*` 아래에 두고 compat surface는 얇게 유지합니다. `game/core/*`는 조립, 부트스트랩, 상태 오케스트레이션 위주로 유지하는 전제를 둡니다.

## Read First

- [README.md](README.md): 시작점, 실행 방법, 핵심 명령
- [AGENTS.md](AGENTS.md): 작업 규칙, 아키텍처 경계, 검증 기준

## Working Model

- 사람이 직접 유지하는 canonical docs는 `README.md`와 `AGENTS.md`입니다.
- `docs/superpowers/*`에는 에이전트 실행 과정에서 생성된 plan/spec 문서가 있을 수 있지만, 현재 구조나 정책의 source of truth는 아닙니다.
- 저장소 안의 현재 상태/배치 이력은 별도 markdown 문서로 유지하지 않습니다.
- 현재 우선순위와 세부 이력은 Git commit, PR, issue 흐름에서 확인합니다.
- 품질 기준 JSON은 `config/quality/*`, 생성 출력은 `artifacts/*` 아래에서 관리합니다.

## License

ISC
