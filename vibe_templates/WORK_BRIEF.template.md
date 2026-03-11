# Work Brief Template

## AI Intake Block

- `doc_type`: `work_brief`
- `goal`: `fill_required`
- `current_state`: `fill_required`
- `constraints`: `fill_required`
- `inputs`: `fill_required`
- `outputs`: `fill_required`
- `priority`: `fill_required`
- `owner`: `fill_required`
- `status`: `fill_required`
- `next_action`: `fill_required`
- `validation_required`: `fill_required`
- `links`: `fill_required`

## Request Summary

- request:
- why_now:
- expected user-visible outcome:

## Success Contract

- done_when:
- acceptance_checks:
- explicit non-goals:

## Change Surface

- expected edit zones:
  - `game/`
  - `data/`
  - `docs/`
  - `tests/`
- do_not_touch:
- risky dependencies:

## Execution Plan

- first_action:
- implementation notes:
- rollback signal:

## Validation Plan

- required commands:
  - `npm run test`
  - `npm run build`
- optional commands:
  - `npm run lint`
  - `npm run quality`
- browser check:
  - preview 실행 후 `#mainStartBtn` 클릭
  - 캐릭터 선택 화면 렌더링 확인

## Risks

- likely regressions:
- assumptions:
- blockers:

## AI Ready Check

- `goal_is_actionable`: yes/no
- `scope_is_bounded`: yes/no
- `validation_is_defined`: yes/no
- `resume_point_exists`: yes/no
