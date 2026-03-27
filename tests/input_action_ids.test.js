import { describe, expect, it } from 'vitest';

import {
  INPUT_ACTION_IDS,
  INPUT_ACTION_CANCEL,
  INPUT_ACTION_CODEX,
  INPUT_ACTION_CONFIRM,
  INPUT_ACTION_DECK_VIEW,
  INPUT_ACTION_DRAW_CARD,
  INPUT_ACTION_ECHO_SKILL,
  INPUT_ACTION_END_TURN,
  INPUT_ACTION_HELP,
  INPUT_ACTION_PAUSE,
  INPUT_ACTION_TARGET_CYCLE,
} from '../game/shared/input/input_action_ids.js';

describe('input_action_ids', () => {
  it('exports stable canonical action ids', () => {
    expect(INPUT_ACTION_IDS).toEqual({
      CONFIRM: 'confirm',
      CANCEL: 'cancel',
      PAUSE: 'pause',
      HELP: 'help',
      DECK_VIEW: 'deckView',
      CODEX: 'codex',
      END_TURN: 'endTurn',
      ECHO_SKILL: 'echoSkill',
      DRAW_CARD: 'drawCard',
      TARGET_CYCLE: 'targetCycle',
    });
    expect(INPUT_ACTION_CONFIRM).toBe('confirm');
    expect(INPUT_ACTION_CANCEL).toBe('cancel');
    expect(INPUT_ACTION_PAUSE).toBe('pause');
    expect(INPUT_ACTION_HELP).toBe('help');
    expect(INPUT_ACTION_DECK_VIEW).toBe('deckView');
    expect(INPUT_ACTION_CODEX).toBe('codex');
    expect(INPUT_ACTION_END_TURN).toBe('endTurn');
    expect(INPUT_ACTION_ECHO_SKILL).toBe('echoSkill');
    expect(INPUT_ACTION_DRAW_CARD).toBe('drawCard');
    expect(INPUT_ACTION_TARGET_CYCLE).toBe('targetCycle');
  });
});
