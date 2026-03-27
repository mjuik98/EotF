# Progression Roadmap, History, And Save Recovery Design

**Context**

The repository already contains three partially surfaced systems:

- Meta unlock definitions and achievement requirements exist, but only specific runtime surfaces expose them.
- Class progression summaries are queued for replay, but they disappear after consumption and are not browseable.
- Save outbox telemetry exists, but the player-facing UI only shows a short toast.

This batch should make those systems visible without adding a new standalone screen. The safest approach is to attach each improvement to an existing high-frequency surface:

- Run settings: show the next unlock roadmap
- Character info panel: show roadmap plus recent progression history
- Save status presenter: show queue and retry context

**Approaches Considered**

1. Add one new meta progression screen for everything.
   This centralizes information, but it is larger in scope and adds a brand-new navigation surface.

2. Extend existing title/run/save surfaces with small focused panels.
   This reuses already-familiar entry points, keeps scope low, and matches the current architecture.

3. Add only richer notifications and leave the existing surfaces unchanged.
   This is cheapest, but it keeps important progression state transient and easy to miss.

**Recommendation**

Use approach 2. It keeps changes behavior-preserving, fits existing feature ownership, and produces the most visible gain per line of code.

**Design**

## 1. Unlock Roadmap

Create a meta progression query layer that converts achievements plus unlockable definitions into small roadmap view models. Each roadmap item should answer:

- what unlock is next
- whether it is account-scoped or class-scoped
- which requirement is blocking it
- current progress toward that requirement

Run settings should show the account-level roadmap, especially curse unlocks. Character info should show class-specific roadmap items for the currently selected class plus the next account-level unlock.

## 2. Progression History

Persist recent class progression summaries in meta instead of treating them as replay-only. Keep the existing pending FIFO for replay, but also append each awarded summary into a capped history list. Character info should show the most recent summaries for the selected class and indicate when unseen summaries remain queued.

## 3. Save Recovery Visibility

Keep the existing toast presenter, but enrich it with queue depth and retry timing. SaveSystem should enrich outgoing status payloads with outbox metrics when available. The presenter should render concise recovery context for queued/error states and keep the success state lightweight.

**Boundaries**

- Meta roadmap logic belongs in `game/features/meta_progression/*`
- Character panel rendering stays in `game/features/title/platform/browser/*`
- Save recovery presentation stays in `game/shared/save/*`
- Run settings unlock roadmap stays in `game/features/run/presentation/browser/*`

**Testing**

- Add query tests for roadmap generation
- Add render tests for run settings roadmap and character info history
- Add progression system tests for persisted recent summaries
- Add presenter/system tests for enriched save recovery messages
