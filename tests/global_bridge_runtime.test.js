import { afterEach, describe, expect, it } from 'vitest';

import { GAME } from '../game/platform/legacy/global_bridge_runtime.js';

const ORIGINAL_STATE = {
  State: GAME.State,
  Data: GAME.Data,
  Audio: GAME.Audio,
  Particle: GAME.Particle,
  Modules: GAME.Modules,
  API: GAME.API,
  _depsBase: GAME._depsBase,
};

function resetGame() {
  GAME.State = ORIGINAL_STATE.State;
  GAME.Data = ORIGINAL_STATE.Data;
  GAME.Audio = ORIGINAL_STATE.Audio;
  GAME.Particle = ORIGINAL_STATE.Particle;
  GAME.Modules = {};
  GAME.API = {};
  GAME._depsBase = null;
}

describe('global bridge feature dep contexts', () => {
  afterEach(() => {
    resetGame();
  });

  it('keeps feature-specific deps narrower than the legacy all-in-one bag', () => {
    GAME.init({ currentScreen: 'title' }, { cards: {} }, { playClick() {} }, { burst() {} });
    GAME.register('CombatUI', { id: 'combat-ui' });
    GAME.register('EventUI', { id: 'event-ui' });
    GAME.register('RunRules', { id: 'run-rules' });
    GAME.register('RunModeUI', { id: 'run-mode-ui' });
    GAME.register('HudUpdateUI', { id: 'hud-update-ui' });
    GAME.register('TooltipUI', { id: 'tooltip-ui' });
    GAME.register('DeckModalUI', { id: 'deck-modal-ui' });
    GAME.register('CodexUI', { id: 'codex-ui' });

    const legacy = GAME.getDeps();
    const combat = GAME.getCombatDeps();
    const event = GAME.getEventDeps();
    const run = GAME.getRunDeps();
    const ui = GAME.getUiDeps();

    expect(legacy).toMatchObject({
      CombatUI: { id: 'combat-ui' },
      EventUI: { id: 'event-ui' },
      RunRules: { id: 'run-rules' },
      RunModeUI: { id: 'run-mode-ui' },
    });

    expect(combat).toMatchObject({
      CombatUI: { id: 'combat-ui' },
      HudUpdateUI: { id: 'hud-update-ui' },
      TooltipUI: { id: 'tooltip-ui' },
      runRules: { id: 'run-rules' },
    });
    expect(combat.EventUI).toBeUndefined();
    expect(combat.RunModeUI).toBeUndefined();

    expect(event).toMatchObject({
      EventUI: { id: 'event-ui' },
      runRules: { id: 'run-rules' },
      TooltipUI: { id: 'tooltip-ui' },
    });
    expect(event.CombatUI).toBeUndefined();

    expect(run).toMatchObject({
      RunRules: { id: 'run-rules' },
      RunModeUI: { id: 'run-mode-ui' },
      runRules: { id: 'run-rules' },
    });
    expect(run.EventUI).toBeUndefined();
    expect(run.CombatUI).toBeUndefined();

    expect(ui).toMatchObject({
      HudUpdateUI: { id: 'hud-update-ui' },
      TooltipUI: { id: 'tooltip-ui' },
      DeckModalUI: { id: 'deck-modal-ui' },
      CodexUI: { id: 'codex-ui' },
    });
    expect(ui.CombatUI).toBeUndefined();
    expect(ui.RunModeUI).toBeUndefined();
  });

  it('exposes classMechanics alias through combat deps for legacy runtime callers', () => {
    const classMechanics = { swordsman: { onPlayCard() {} } };

    GAME.init({ currentScreen: 'title' }, { cards: {} }, { playClick() {} }, { burst() {} });
    GAME.register('ClassMechanics', classMechanics);

    const combat = GAME.getCombatDeps();

    expect(combat.ClassMechanics).toBe(classMechanics);
    expect(combat.classMechanics).toBe(classMechanics);
  });
});
