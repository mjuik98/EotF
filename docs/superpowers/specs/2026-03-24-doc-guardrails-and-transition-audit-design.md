# Documentation Guardrails And Transition Audit Design

Date: 2026-03-24
Status: Approved for implementation

## Goal

Keep the repository contract honest by preventing new root-level scratch markdown files and by making the remaining transitional runtime surface visible through a repeatable audit command.

## Recommended Approach

Use two lightweight controls instead of heavier repo policy machinery:

1. add repository guardrail tests that assert the allowed root markdown policy and the documented `docs/superpowers/*` exception
2. add a dedicated audit script that reports how much JavaScript still lives under transitional roots such as `game/app`, `game/ui`, and `game/presentation`

This keeps the policy cheap to maintain, readable in tests, and easy to run locally without changing runtime code.

## Alternatives Considered

### Option 1: Test-only enforcement

Pros:
- smallest implementation
- easy to read

Cons:
- no structured inventory of remaining transitional ownership

### Option 2: Audit-only reporting

Pros:
- useful for tracking progress

Cons:
- does not stop policy drift such as reintroducing root scratch markdown

### Option 3: Combined guardrail plus audit

Pros:
- blocks the specific documentation regression that already happened
- makes remaining structure debt explicit
- fits existing `scripts/*` plus Vitest guardrail patterns

Cons:
- one extra script and one extra test surface to maintain

Recommendation: option 3.

## Design

### Documentation Guardrail

Add a focused repository-contract test that asserts:

- root markdown files are limited to `README.md` and `AGENTS.md`
- `docs/superpowers/plans/*` and `docs/superpowers/specs/*` may exist as non-canonical working artifacts
- `README.md` and `AGENTS.md` both describe that split consistently

### Transitional Surface Audit

Add `scripts/report-transition-surface-audit.mjs` to scan the current repository and report:

- JavaScript file counts per transitional root
- totals for canonical roots and transitional roots
- the largest transitional roots by file count

The script should support `--json` so tests and local follow-up can consume stable output.

### Scope Boundaries

This batch does not move production code between roots. It only adds visibility and regression protection for the current state.

## Testing

- add a failing repository guardrail test first
- run the targeted test and confirm the expected RED failure
- implement the minimal documentation guardrail
- add a failing audit test for the new script and expected output shape
- run the targeted test and confirm RED
- implement the script and package command
- run focused guardrail tests and the audit command
