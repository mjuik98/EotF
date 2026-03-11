# Vibe Templates

AI가 문서를 읽고 바로 작업에 들어갈 수 있게 만든 프로젝트 기록 템플릿 세트다. 공통 뼈대는 범용으로 유지하고, 기본값과 예시는 이 저장소 운영 방식에 맞춰 두었다.

## Recommended Flow

1. 새 프로젝트 기준을 잡을 때는 `PROJECT_BRIEF.template.md`를 복제한다.
2. 개별 작업을 시작할 때는 `WORK_BRIEF.template.md`를 복제한다.
3. 작업 중간 기록은 `SESSION_LOG.template.md`에 누적한다.
4. 테스트와 브라우저 확인은 `VALIDATION_REPORT.template.md`에 남긴다.
5. 세션 종료 시 `HANDOFF.template.md`를 갱신한다.
6. 장기적 구조 판단은 `DECISION_LOG.template.md`에 남긴다.
7. 저장소 전체의 현재 상태 요약은 기존 `progress.md`에 유지한다.

## Template Map

| File | Purpose | Writer | Update When | Main Output |
| --- | --- | --- | --- | --- |
| `ARCHITECTURE.md` | 이 저장소용 AI 시작 가이드 | 혼합 | 구조/검증 규칙이 바뀔 때 | 작업 전 공통 기준 |
| `PROJECT_BRIEF.template.md` | 프로젝트 레벨 영속 기준 문서 | 혼합 | 프로젝트 방향이 바뀔 때 | 목표, 제약, 품질 기준 |
| `WORK_BRIEF.template.md` | 개별 작업 착수 문서 | 혼합 | 새 작업 시작 시 | 목표, 범위, 첫 액션 |
| `SESSION_LOG.template.md` | 상태 변화 중심 세션 로그 | AI 중심 | 작업 중 수시 | 현재 상태, 아티팩트, 재개 지점 |
| `VALIDATION_REPORT.template.md` | 테스트/빌드/브라우저 검증 기록 | AI 중심 | 검증 실행 시 | 명령, 결과, 미검증 범위 |
| `HANDOFF.template.md` | 다음 담당자 인계 문서 | AI 중심 | 세션 종료 시 | 현재 진실, 미완료, 시작 위치 |
| `DECISION_LOG.template.md` | ADR-lite 결정 기록 | 혼합 | 구조/규칙 변경 시 | 결정 이유와 영향 |

## Repository Defaults

- 기본 작업 대상 예시: `game/`, `data/`, `docs/`, `tests/`
- 기본 검증 명령: `npm run test`, `npm run build`, 필요 시 `npm run lint`, `npm run quality`
- 브라우저 확인 기본 예시: preview 실행 후 `#mainStartBtn` 클릭, 캐릭터 선택 화면 렌더링 확인
- 현재 운영 원칙: `progress.md`는 요약본, 세션 상세와 인수인계는 별도 템플릿으로 남긴다

## Usage Rules

- 모든 `.template.md`는 상단의 `AI Intake Block`부터 채운다.
- 필수값이 비어 있으면 `fill_required`를 사용한다.
- 본문은 한국어로 쓰고, AI가 파싱해야 하는 키는 영문으로 유지한다.
- 세션 로그는 시도 나열보다 상태 변화와 재개 포인트를 우선 기록한다.
- 핸드오프에는 다음 작업자가 첫 5분 안에 어디서 시작할지 명시한다.

## Relationship To `progress.md`

- `progress.md`: 저장소 전체 상태를 압축한 지속 요약본
- `PROJECT_BRIEF`: 프로젝트 목표와 제약의 기준 문서
- `WORK_BRIEF`: 지금 작업의 실행 계약
- `SESSION_LOG` / `VALIDATION_REPORT`: 세션 상세 기록
- `HANDOFF`: 다음 담당자를 위한 종료 문서
- `DECISION_LOG`: 장기 판단의 근거

## AI Ready Check

- `goal_is_actionable`: yes
- `scope_is_bounded`: yes
- `validation_is_defined`: yes
- `resume_point_exists`: yes
