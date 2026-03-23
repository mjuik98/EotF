import { afterEach, describe, expect, it, vi } from 'vitest';

import { Actions } from '../game/core/state_action_types.js';
import { PlayerReducers } from '../game/core/state_reducers/player_reducers.js';
import { PlayerUiEffectMethods } from '../game/shared/player/player_ui_effects.js';
import { PlayerRuntimeEffectMethods } from '../game/shared/player/player_runtime_effects.js';

function createRuntimeState(overrides = {}) {
  const { player: playerOverrides = {}, ...gsOverrides } = overrides;
  const logs = [];
  const commits = [];
  const spawned = [];
  const player = {
    class: 'sentinel',
    silenceGauge: 0,
    timeRiftGauge: 0,
    energy: 3,
    maxEnergy: 5,
    ...playerOverrides,
  };

  const gs = {
    player,
    combat: { active: true },
    addLog(message, type) {
      logs.push({ message, type });
    },
    spawnEnemy(deps) {
      spawned.push(deps);
    },
    commit(action, payload) {
      commits.push({ action, payload });
      const reducer = PlayerReducers[action];
      return reducer ? reducer(this, payload) : null;
    },
    dispatch(action, payload) {
      const reducer = PlayerReducers[action];
      return reducer ? reducer(this, payload) : null;
    },
    markDirty() {},
    ...gsOverrides,
  };

  return { commits, gs, logs, player, spawned };
}

describe('player runtime effects', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('spawns an enemy and resets silence when the gauge reaches the cap', () => {
    const { commits, gs, logs, player, spawned } = createRuntimeState({
      player: { silenceGauge: 8 },
    });
    const screenShake = { shake: vi.fn() };
    const updateNoiseWidget = vi.fn();
    const updateClassSpecialUI = vi.fn();

    PlayerRuntimeEffectMethods.addSilence.call(gs, 2, '소음', {
      screenShake,
      updateClassSpecialUI,
      updateNoiseWidget,
      win: {},
    });

    expect(player.silenceGauge).toBe(0);
    expect(spawned).toHaveLength(1);
    expect(screenShake.shake).toHaveBeenCalledWith(10, 0.5);
    expect(updateNoiseWidget).toHaveBeenCalledTimes(1);
    expect(updateClassSpecialUI).toHaveBeenCalledTimes(1);
    expect(commits).toEqual([
      { action: Actions.PLAYER_SILENCE, payload: { amount: 2 } },
      { action: Actions.PLAYER_SILENCE, payload: { amount: -10 } },
    ]);
    expect(logs.some(({ message }) => message.includes('소음 10/10'))).toBe(true);
    expect(logs.some(({ message }) => message.includes('파수꾼 등장'))).toBe(true);
  });

  it('forces a turn end when time rift reaches the cap', () => {
    vi.useFakeTimers();
    const { commits, gs, logs, player } = createRuntimeState({
      player: { energy: 4, timeRiftGauge: 9 },
    });
    const screenShake = { shake: vi.fn() };
    const updateNoiseWidget = vi.fn();
    const endPlayerTurn = vi.fn();

    PlayerRuntimeEffectMethods.addTimeRift.call(gs, 1, '시간의 균열', {
      endPlayerTurn,
      screenShake,
      updateNoiseWidget,
      win: {},
    });

    expect(player.timeRiftGauge).toBe(0);
    expect(player.energy).toBe(0);
    expect(updateNoiseWidget).toHaveBeenCalledTimes(1);
    expect(screenShake.shake).toHaveBeenCalledWith(15, 0.6);
    expect(commits).toEqual([
      { action: Actions.PLAYER_TIME_RIFT, payload: { amount: 1 } },
      { action: Actions.PLAYER_TIME_RIFT, payload: { amount: -10 } },
    ]);
    expect(logs.some(({ message }) => message.includes('시간 강제 재조정'))).toBe(true);

    vi.advanceTimersByTime(300);

    expect(endPlayerTurn).toHaveBeenCalledTimes(1);
  });
});

describe('player ui effects', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('creates a low-hp overlay and removes it after the timeout', () => {
    vi.useFakeTimers();
    let overlay = null;
    const doc = {
      querySelector: vi.fn(() => overlay),
      createElement: vi.fn(() => {
        overlay = {
          className: '',
          remove: vi.fn(() => {
            overlay = null;
          }),
        };
        return overlay;
      }),
      body: {
        appendChild: vi.fn(),
      },
    };
    const host = {};

    PlayerUiEffectMethods.showLowHpWarning.call(host, { doc });

    expect(doc.createElement).toHaveBeenCalledWith('div');
    expect(doc.body.appendChild).toHaveBeenCalledWith(expect.objectContaining({
      className: 'pulse-overlay',
    }));

    vi.advanceTimersByTime(5000);

    expect(doc.body.appendChild.mock.calls[0][0].remove).toHaveBeenCalledTimes(1);
  });

  it('reuses the existing overlay and resets the removal timer', () => {
    vi.useFakeTimers();
    let overlay = null;
    const doc = {
      querySelector: vi.fn(() => overlay),
      createElement: vi.fn(() => {
        overlay = {
          className: '',
          remove: vi.fn(() => {
            overlay = null;
          }),
        };
        return overlay;
      }),
      body: {
        appendChild: vi.fn(),
      },
    };
    const host = {};

    PlayerUiEffectMethods.showLowHpWarning.call(host, { doc });
    vi.advanceTimersByTime(4000);
    PlayerUiEffectMethods.showLowHpWarning.call(host, { doc });

    expect(doc.createElement).toHaveBeenCalledTimes(1);
    expect(doc.body.appendChild).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(doc.body.appendChild.mock.calls[0][0].remove).not.toHaveBeenCalled();

    vi.advanceTimersByTime(4000);
    expect(doc.body.appendChild.mock.calls[0][0].remove).toHaveBeenCalledTimes(1);
  });
});
