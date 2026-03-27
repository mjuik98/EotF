# Architecture Stabilization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize runtime architecture by separating save infrastructure from UI concerns, introducing workflow UI ports in key features, and adding regression guardrails.

**Architecture:** Preserve the current modular monolith, but move high-risk seams toward explicit ports. Keep compat wrappers intact while migrating canonical runtime ownership toward `application`, `state`, and `platform/browser` boundaries.

**Tech Stack:** JavaScript, Vitest, Vite

---

### Task 1: Save Infrastructure Boundary

**Files:**
- Modify: `game/shared/save/save_system.js`
- Modify: `game/shared/save/public.js`
- Modify: `game/platform/storage/save_adapter.js`
- Create or modify: `game/platform/browser/notifications/*`
- Test: `tests/save_system_outbox.test.js`
- Test: `tests/save_status_presenter.test.js`

- [ ] Write failing tests for save infrastructure decoupling and notification routing.
- [ ] Verify the tests fail for the intended boundary change.
- [ ] Refactor save system and save adapter to remove embedded DOM notification responsibility.
- [ ] Re-run targeted save tests until green.

### Task 2: Workflow UI Ports

**Files:**
- Modify: `game/features/event/application/workflows/event_choice_flow.js`
- Modify: `game/features/reward/application/workflows/show_reward_screen_workflow.js`
- Modify: `game/features/run/application/create_maze_runtime.js`
- Modify related browser/runtime entrypoints that compose these workflows
- Test: targeted event/reward/runtime regression tests

- [ ] Add failing regression tests that assert workflow orchestration can run through injected UI/runtime ports.
- [ ] Verify failures before implementation.
- [ ] Refactor the workflows to depend on explicit UI/runtime port objects instead of importing browser presenters directly.
- [ ] Re-run targeted regression tests until green.

### Task 3: Guardrails and Operational Cleanup

**Files:**
- Modify: architecture/runtime guardrail tests as needed
- Modify: touched runtime files that still use direct `console.*` when repository logging should be used

- [ ] Add or update guardrail coverage for new save/workflow boundaries.
- [ ] Verify failures where applicable.
- [ ] Implement the minimal cleanup needed to keep the boundaries stable.
- [ ] Run targeted tests, then broader repository verification commands.
