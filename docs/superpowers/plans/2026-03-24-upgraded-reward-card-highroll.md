# Upgraded Reward Card High-Roll Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a low-probability upgraded-card high-roll to three-card combat rewards while guaranteeing the reward set contains at most one upgraded option.

**Architecture:** Keep reward card generation in the existing reward helper. Draw the current base reward set first, then optionally upgrade one eligible card in-place through `upgradeMap`, scoped to three-card combat rewards only.

**Tech Stack:** JavaScript, Vitest

---

### Task 1: Lock the New Reward Behavior With Tests

**Files:**
- Modify: `tests/reward_ui.test.js`

- [ ] Step 1: Add a failing test showing a normal three-card combat reward can surface exactly one upgraded card.
- [ ] Step 2: Add a failing test showing the reward set never contains more than one upgraded card.
- [ ] Step 3: Run the focused test file and confirm the new expectations fail for the missing behavior.

### Task 2: Implement the High-Roll Upgrade Pass

**Files:**
- Modify: `game/features/reward/presentation/browser/reward_screen_runtime_helpers.js`
- Modify: `game/features/reward/application/workflows/show_reward_screen_workflow.js`

- [ ] Step 1: Add helper logic for upgraded reward-card chance and post-draw conversion.
- [ ] Step 2: Keep the behavior scoped to three-card combat rewards and capped at one upgraded card.
- [ ] Step 3: Re-run the focused reward UI tests and confirm green.

### Task 3: Verify

**Files:**
- No code changes

- [ ] Step 1: Run `npm test -- tests/reward_ui.test.js`.
- [ ] Step 2: Run `npm test`.
