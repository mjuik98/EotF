# Architecture Boundary Hardening Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce architectural leakage in save notifications, title settings browser imports, and combat lifecycle runtime orchestration without changing game behavior.

**Architecture:** Keep the existing feature-first modular monolith. Move browser-only presentation to platform/browser ownership, narrow overly broad feature public imports, and make application modules consume injected runtime adapters instead of browser globals.

**Tech Stack:** JavaScript, Vitest, existing architecture guardrail tests

---

## Chunk 1: Guardrails First

### Task 1: Add failing boundary tests

**Files:**
- Modify: `tests/refactor_structure_guardrails.test.js`
- Modify: `tests/architecture_refactor_guardrails.test.js`
- Modify: `tests/save_status_presenter.test.js`
- Modify: `tests/save_system_outbox.test.js`

- [ ] **Step 1: Write failing guardrail expectations**
- [ ] **Step 2: Run the targeted tests and confirm they fail for the expected reasons**

## Chunk 2: Save Presenter Ownership

### Task 2: Move save-status presentation to platform/browser

**Files:**
- Create: `game/platform/browser/notifications/save_status_presenter.js`
- Modify: `game/platform/browser/composition/build_core_run_system_modules.js`
- Modify: `game/shared/save/public.js`
- Delete: `game/shared/save/save_status_presenter.js`

- [ ] **Step 1: Move the implementation**
- [ ] **Step 2: Update imports and exports**
- [ ] **Step 3: Run targeted save presenter tests**

## Chunk 3: Narrow Title Settings Import Surface

### Task 3: Replace broad UI public import

**Files:**
- Modify: `game/features/title/platform/browser/create_title_settings_actions.js`
- Modify: `tests/refactor_structure_guardrails.test.js`

- [ ] **Step 1: Switch to the narrow browser-module port**
- [ ] **Step 2: Run the relevant guardrail test**

## Chunk 4: Combat Lifecycle Boundary Cleanup

### Task 4: Remove browser globals from combat lifecycle application

**Files:**
- Modify: `game/features/combat/application/combat_lifecycle_facade.js`
- Modify: `tests/combat_lifecycle.test.js`
- Modify: `tests/architecture_refactor_guardrails.test.js`

- [ ] **Step 1: Make the test fail on browser-global leakage and injected runtime behavior**
- [ ] **Step 2: Refactor the application module to use injected deps only**
- [ ] **Step 3: Run targeted combat lifecycle tests**

## Chunk 5: Batch Verification

### Task 5: Verify the batch

**Files:**
- No code changes expected

- [ ] **Step 1: Run targeted tests for changed modules**
- [ ] **Step 2: Run architecture/guardrail suite**
- [ ] **Step 3: Run fast test suite if the changed surface remains stable**
