Original prompt: 우선순위대로 모두 진행해줘

- 2026-03-22: Start pass for relic detail follow-up work.
- Scope for this chunk: keyboard/accessibility on layout-only relic surfaces, formal detail panel variants, subtle panel transitions, and one more relic surface using layout details instead of tooltips.
- 2026-03-22: Added failing tests first for keyboard navigation, inline panel variant, and class-select relic detail layout. Implemented shared navigation + variant support, combat/stage keyboard navigation, and class-select shared relic detail panel.
- 2026-03-22: Verification pass: targeted suites and broader relic/layout suites passed, combat browser smoke passed, build passed. Import coupling lint remains red on this branch family (HEAD already fails at 51 feature->shared vs 44 baseline; current worktree is 55 because of intentional shared renderer reuse).
