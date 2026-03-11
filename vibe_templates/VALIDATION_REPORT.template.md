# Validation Report Template

## AI Intake Block

- `doc_type`: `validation_report`
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

## Validation Scope

- target change:
- required confidence:
- excluded checks:

## Command Results

| command | expected_result | actual_result | status | notes |
| --- | --- | --- | --- | --- |
| `npm run test` | tests pass | fill_required | fill_required | fill_required |
| `npm run build` | production build succeeds | fill_required | fill_required | fill_required |
| `npm run lint` | structural checks pass when required | optional | optional | optional |
| `npm run quality` | full quality gate passes when required | optional | optional | optional |

## Browser Validation

- environment:
- steps:
  1. preview 실행
  2. `#mainStartBtn` 클릭
  3. 캐릭터 선택 화면 렌더링 확인
- observed_result:
- console_or_page_errors:

## Failure Interpretation

- failed_checks:
- likely cause:
- confidence:

## Remaining Gaps

- not_tested_yet:
- why_not_tested:
- required follow_up:

## AI Ready Check

- `goal_is_actionable`: yes/no
- `scope_is_bounded`: yes/no
- `validation_is_defined`: yes/no
- `resume_point_exists`: yes/no
