import { describe, expect, it, vi } from 'vitest';

import { buildRuntimeDebugHooks } from '../game/core/bootstrap/build_runtime_debug_hooks.js';

describe('buildRuntimeDebugHooks', () => {
  it('builds render and advance hooks from injected snapshot factory', async () => {
    const createSnapshot = vi.fn(() => ({ screen: 'title' }));
    const modules = {
      GS: {
        currentScreen: 'game',
        combat: { active: true },
      },
    };
    const fns = {
      updateUI: vi.fn(),
      renderCombatEnemies: vi.fn(),
      renderCombatCards: vi.fn(),
      updateCombatLog: vi.fn(),
      updateEchoSkillBtn: vi.fn(),
      renderMinimap: vi.fn(),
    };
    const timers = [];
    const win = {
      setTimeout: (cb) => {
        timers.push(cb);
      },
      requestAnimationFrame: (cb) => cb(16),
    };

    const hooks = buildRuntimeDebugHooks({
      modules,
      fns,
      doc: { body: {} },
      win,
      createSnapshot,
    });

    expect(JSON.parse(hooks.render_game_to_text())).toEqual({ screen: 'title' });
    expect(createSnapshot).toHaveBeenCalledTimes(1);

    const pending = hooks.advanceTime(32);
    expect(timers).toHaveLength(1);
    timers[0]();
    await expect(pending).resolves.toBe(32);

    expect(fns.updateUI).toHaveBeenCalledTimes(1);
    expect(fns.renderCombatEnemies).toHaveBeenCalledTimes(1);
    expect(fns.renderCombatCards).toHaveBeenCalledTimes(1);
    expect(fns.updateCombatLog).toHaveBeenCalledTimes(1);
    expect(fns.updateEchoSkillBtn).toHaveBeenCalledTimes(1);
    expect(fns.renderMinimap).toHaveBeenCalledTimes(1);
  });
});
