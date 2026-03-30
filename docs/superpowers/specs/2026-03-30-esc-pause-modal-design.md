# ESC Pause Modal Design

> Scope: refine the existing run pause overlay only. Preserve runtime behavior while making action hierarchy, wording, and risk signaling clearer.

## Goal

Make the ESC pause modal read as one coherent decision surface:

- keep "continue playing" actions grouped together
- separate run/session exit actions from utility actions
- replace ambiguous wording around title return
- make visual emphasis match action risk and reversibility

## Visual Thesis

A restrained run-command panel: calm echo-purple framing for pause state, bright utility accents for non-destructive actions, and a distinct low-saturation danger zone for leaving the current session.

## Content Plan

- primary action: resume the run immediately
- support actions: deck, codex, settings, and controls
- detail block: run metadata in the footer remains unchanged
- final action cluster: title return, run abandon, game quit

## Interaction Thesis

- keep the current modal shell and button treatment so the pause menu still feels native to the existing UI system
- introduce one structural divider and grouped layout rather than adding more chrome
- use color and spacing, not extra copy, to communicate which actions are routine versus terminal

## Current Problems

### 1. Ambiguous wording

`처음으로` does not tell the player where they are going. In the current order it sits between `런 포기하기` and `게임 종료`, which makes it feel like another destructive exit option instead of a reversible "return to title" path.

### 2. Mixed hierarchy

Utility actions and exit actions all live in one vertical list. The user has to parse semantics from individual labels rather than reading grouped intent from the layout.

### 3. Weak risk signaling

`런 포기하기` uses the strongest danger styling, but `게임 종료` is only partially danger-coded and `처음으로` is visually close to both. The modal currently communicates button variety more than action hierarchy.

## Chosen Approach

Keep the existing pause overlay runtime and modal frame intact, but reorganize the body into two sections:

1. a `run control` section for resume and utility actions
2. a `leave run` section for title return, abandon, and quit

The leave section should use a compact label and a muted divider so the modal reads in two passes: "what helps me continue" first, "how to leave" second.

## Copy Decisions

- keep `계속하기`
- keep `덱 보기`, `도감`, `환경 설정`
- shorten `컨트롤 안내 (?)` to `조작 안내`
- rename `처음으로` to `타이틀로 돌아가기`
- rename `런 포기하기` to `이번 런 포기`
- keep `게임 종료`
- update the return-to-title confirm button copy to `타이틀로 이동`

These choices aim for explicit destination-based wording rather than metaphor or shorthand.

## Layout And Styling

### Sectioning

- keep the existing tall pause panel
- keep the current two-column row for deck and codex
- add a dedicated leave-actions container below the utility cluster
- add a small section eyebrow such as `RUN EXIT`

### Color policy

- pause shell stays on the echo accent so the modal still feels like a pause surface
- utility buttons remain neutral/cyan-leaning
- title return becomes a neutral elevated action, not a danger action
- abandon and quit both live in the leave section, with abandon carrying the strongest danger treatment and quit carrying a weaker but still danger-aware treatment

### Motion

No new custom motion is needed. Existing overlay entrance is enough for this incremental change.

## Testing

Add assertions around:

- grouped pause menu structure
- revised button labels
- leave-section presence and ordering

Then run:

- focused Vitest coverage for the pause menu overlay
- `npm test`
- `npm run build`
- `npm run smoke:browser`
