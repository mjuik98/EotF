# Exit Flow Follow-Up Design

> Scope: refine title/pause exit decisions and save-return language without changing save semantics or boot architecture.

## Goal

Make leaving, returning, and resuming feel like one coherent language system across:

- ESC pause exit actions
- title continue entry
- title quit action
- confirm overlays

## Visual Thesis

A restrained decision hierarchy: continuation stays calm and direct, reversible exits feel intentional, and terminal exits require an unmistakable confirm surface.

## Content Plan

- pause menu keeps a clear `continue` cluster and a polished `leave run` cluster
- title screen keeps a strong `continue` card but uses the same vocabulary as pause
- destructive app-exit actions open a shared confirm modal instead of browser-native dialog chrome

## Interaction Thesis

- ESC should always dismiss the topmost overlay before falling back to pause/title surfaces
- title quit and pause quit should converge on the same shared modal system
- return-to-title and continue copy should describe destination and resumability explicitly

## Chosen Approach

1. add a shared `quit game` confirm overlay inside the existing help/pause modal system
2. route both title quit and pause quit through that overlay
3. tighten title save-preview language around `이어하기`, `저장된 런`, and `런 중단`
4. extend browser smoke coverage with screenshots and escape-priority assertions for the new confirm surface

## Copy Decisions

- title quit menu item: `게임 종료`
- title quit meta: `브라우저 창 닫기`
- quit confirm title: `게임을 종료하시겠습니까?`
- quit confirm body: warn that browser close may be blocked and the window may need to be closed manually
- quit confirm submit: `종료하기`
- archive outcome for abandoned runs: `런 중단`
- continue preview meta stays floor/class/ascension based, but default copy should stay rooted in `저장된 런`

## Testing

Add focused coverage for:

- shared quit confirm overlay markup and runtime wiring
- title system quit action delegating to the shared overlay
- script-level smoke expectations for quit confirm screenshots and escape priority

Then run:

- focused Vitest tests
- `npm test`
- `npm run build`
- `npm run smoke:browser`
