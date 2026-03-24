# Documentation Guardrails And Transition Audit Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add guardrails that keep root markdown policy aligned with the repo contract and add an audit command that reports remaining transitional surface ownership.

**Architecture:** Keep canonical docs under `README.md` and `AGENTS.md`, allow `docs/superpowers/*` as non-canonical working artifacts, and expose the current transitional runtime footprint through a read-only script. Reuse existing Vitest guardrail patterns and package-script conventions so the new checks fit the current quality workflow.

**Tech Stack:** Markdown docs, JavaScript ESM scripts, Vitest

---

## Chunk 1: Documentation Guardrail

### Task 1: Add a failing repository-contract test for root markdown policy

**Files:**
- Create: `tests/repository_documentation_guardrails.test.js`

- [x] Add a test that expects only `README.md` and `AGENTS.md` at the repo root and expects `docs/superpowers/plans` and `docs/superpowers/specs` to exist as the allowed non-canonical markdown area.
- [x] Run `npm exec -- vitest run tests/repository_documentation_guardrails.test.js` and confirm it fails before implementation because the supporting assertions do not exist yet.
- [x] Implement the minimal test helper logic inside the new test file.
- [x] Re-run `npm exec -- vitest run tests/repository_documentation_guardrails.test.js` and confirm it passes.

## Chunk 2: Transitional Surface Audit

### Task 2: Add a failing test for a transition-surface audit command

**Files:**
- Modify: `tests/quality_workflow_scripts.test.js`

- [x] Add a failing test that expects a new `audit:transition-surfaces` package script and expects the backing script to report counts for transitional and canonical roots.
- [x] Run `npm exec -- vitest run tests/quality_workflow_scripts.test.js` and confirm it fails for the missing script.

### Task 3: Implement the audit script and wire it into package scripts

**Files:**
- Create: `scripts/report-transition-surface-audit.mjs`
- Modify: `package.json`

- [x] Implement a read-only audit script with `--json` output for root counts and totals.
- [x] Add `npm run audit:transition-surfaces` to `package.json`.
- [x] Re-run `npm exec -- vitest run tests/quality_workflow_scripts.test.js` and confirm it passes.

## Chunk 3: Verification And Audit Readout

### Task 4: Verify the new guardrails and collect the current inventory

**Files:**
- Verify only

- [x] Run `npm exec -- vitest run tests/repository_documentation_guardrails.test.js tests/quality_workflow_scripts.test.js tests/build_first_optimization_guardrails.test.js`.
- [x] Run `npm run audit:transition-surfaces -- --json`.
- [x] Record the current transitional-surface counts for the final handoff summary.
