# Structure Doc Alignment Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the repository contract docs with the codebase's current structure and documentation reality without changing runtime behavior.

**Architecture:** Keep `README.md` as the onboarding surface and `AGENTS.md` as the working contract, but separate current facts from target architecture guidance. Document `docs/superpowers/*` as non-canonical execution artifacts and clarify that canonical ownership is `game/features/*`, `game/shared/*`, and `game/platform/*` while transitional roots still exist.

**Tech Stack:** Markdown documentation, package script guardrails, Vitest repository-contract tests

---

## Chunk 1: Drift Inventory

### Task 1: Confirm the current repo/document mismatch points

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Verify only: `game/*`, `docs/superpowers/*`, `package.json`

- [x] Confirm which top-level directories and markdown files exist in the repository.
- [x] Confirm which architecture rule statements in `AGENTS.md` are current facts versus target-state guidance.
- [x] Confirm which README structure notes need to mention transitional surfaces or working artifacts.

## Chunk 2: Contract Doc Updates

### Task 2: Update README onboarding structure notes

**Files:**
- Modify: `README.md`

- [x] Update the project-structure section so it reflects the presence of `docs/` and the mixed canonical/transitional state of `game/`.
- [x] Update the working-model section so it distinguishes canonical docs from agent working artifacts.

### Task 3: Update AGENTS repository contract language

**Files:**
- Modify: `AGENTS.md`

- [x] Update the document model and documentation workflow sections so they match the repository's current markdown reality.
- [x] Update architecture notes so the compat/transitional surface list matches the current tree and allowed core composition exception paths.

## Chunk 3: Verification

### Task 4: Verify repository-contract tests still pass

**Files:**
- Verify only

- [x] Run `npm exec -- vitest run tests/quality_workflow_scripts.test.js tests/build_first_optimization_guardrails.test.js`.
- [x] Confirm the repository-contract and README guardrail assertions pass after the doc updates.
