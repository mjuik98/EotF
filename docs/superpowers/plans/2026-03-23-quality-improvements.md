# Quality Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make repository quality checks more explicit and gradually stricter without destabilizing the current CI baseline.

**Architecture:** Move quality policy values out of ad hoc code paths into `config/quality/*`, strengthen structural audit and import-coupling checks with explicit thresholds/targets, and replace heuristic test-suite partitioning with a manifest-driven source of truth. Keep enforcement gradual by baselining current values where needed and only failing on regressions beyond the agreed limits.

**Tech Stack:** Node.js scripts, Vitest, Vite, GitHub Actions, JSON config

---

## Chunk 1: Quality Policy Externalization

### Task 1: Externalize bundle budget and coverage policy

**Files:**
- Create: `config/quality/bundle_budgets.json`
- Create: `config/quality/coverage_thresholds.json`
- Modify: `scripts/assert-bundle-budgets.mjs`
- Modify: `vitest.config.js`
- Test: `tests/assert_bundle_budgets.test.js`
- Test: `tests/quality_workflow_scripts.test.js`

- [ ] Step 1: Write failing tests for loading bundle budgets and coverage thresholds from config files.
- [ ] Step 2: Run the focused tests and confirm they fail for the expected reason.
- [ ] Step 3: Implement config loading with existing defaults preserved.
- [ ] Step 4: Re-run the focused tests and confirm they pass.

## Chunk 2: Structural Audit Tightening

### Task 2: Add explicit structural audit thresholds with gradual enforcement

**Files:**
- Create: `config/quality/structural_audit_thresholds.json`
- Modify: `scripts/report-structural-audit.mjs`
- Modify: `.github/workflows/quality-gate.yml`
- Test: `tests/report_structural_audit.test.js`
- Test: `tests/quality_workflow_scripts.test.js`

- [ ] Step 1: Write failing tests for threshold loading/reporting and strict regression detection.
- [ ] Step 2: Run the focused tests and confirm they fail for the expected reason.
- [ ] Step 3: Implement threshold-aware audit reporting and wire strict mode into CI.
- [ ] Step 4: Re-run the focused tests and confirm they pass.

## Chunk 3: Explicit Test Suite Classification

### Task 3: Replace filename-token partitioning with manifest-driven suite ownership

**Files:**
- Create: `config/quality/test_suite_manifest.json`
- Modify: `scripts/test_suite_manifest.mjs`
- Test: `tests/test_suite_manifest.test.js`
- Test: `tests/quality_workflow_scripts.test.js`

- [ ] Step 1: Write failing tests for manifest-based suite classification and repository coverage checks.
- [ ] Step 2: Run the focused tests and confirm they fail for the expected reason.
- [ ] Step 3: Implement manifest loading and validation while preserving `fast`, `guardrails`, and `full` workflows.
- [ ] Step 4: Re-run the focused tests and confirm they pass.

## Chunk 4: Import Coupling Convergence Targets

### Task 4: Add pair-level max targets in addition to growth baseline checks

**Files:**
- Create: `config/quality/import_coupling_targets.json`
- Modify: `scripts/check-import-coupling.mjs`
- Test: `tests/quality_workflow_scripts.test.js`
- Test: `tests/architecture_refactor_guardrails.test.js`
- Test: `tests/check_import_coupling.test.js`

- [ ] Step 1: Write failing tests for pair-level target enforcement with a gradual current-state baseline.
- [ ] Step 2: Run the focused tests and confirm they fail for the expected reason.
- [ ] Step 3: Implement target-aware comparison/reporting.
- [ ] Step 4: Re-run the focused tests and confirm they pass.

## Chunk 5: Verification

### Task 5: Prove the new quality model works end-to-end

**Files:**
- Verify only

- [ ] Step 1: Run focused script tests for the changed files.
- [ ] Step 2: Run `npm test`.
- [ ] Step 3: Run `npm run lint`.
- [ ] Step 4: Report actual results and any residual risk.
