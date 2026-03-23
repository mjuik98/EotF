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

# verification
npm test
npm run test:guardrails
npm run test:full
npm run lint
npm run audit:structure
npm run build
npm run deps:map
npm run quality:fast
npm run quality:full
```

`npm test`는 빠른 로직/런타임 회귀 루프이고, `npm run test:guardrails`는 구조/compat/조립 가드레일 묶음입니다. 둘 다 필요한 변경은 `npm run test:full`로 함께 확인합니다.

UI에 영향이 있는 작업은 개발 서버에서 `#mainStartBtn` 클릭 후 캐릭터 선택 화면이 렌더링되는지와 콘솔/페이지 오류가 없는지도 확인합니다.

## Project Structure

```text
.
├── game/         # runtime, features, platform, legacy compat
├── data/         # static game data
├── tests/        # regression and guardrail coverage
├── scripts/      # quality, reporting, smoke, build helper scripts
├── config/       # machine-owned policy, baselines, thresholds, allowlists
├── artifacts/    # generated dependency and reporting outputs
├── README.md     # onboarding
└── AGENTS.md     # rules and architecture contract
```

신규 구현은 가능하면 `game/features/<feature>/...` 아래에 두고, compat surface는 얇게 유지합니다.

## Read First

- [README.md](README.md): 시작점, 실행 방법, 핵심 명령
- [AGENTS.md](AGENTS.md): 작업 규칙, 아키텍처 경계, 검증 기준

## Working Model

- 저장소 안의 현재 상태/배치 이력은 별도 markdown 문서로 유지하지 않습니다.
- 현재 우선순위와 세부 이력은 Git commit, PR, issue 흐름에서 확인합니다.
- 품질 기준 JSON은 `config/quality/*`, 생성 출력은 `artifacts/*` 아래에서 관리합니다.

## License

ISC
