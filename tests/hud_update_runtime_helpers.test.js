import { describe, expect, it, vi } from 'vitest';

import {
  performHudRefresh,
  processHudDirtyFlags,
  resolvePartialHudDeps,
  scheduleHudUpdate,
  updateEndButtonWarn,
} from '../game/features/combat/public.js';

describe('hud_update_runtime_helpers', () => {
  it('toggles the end-turn warning only when energy can still be spent', () => {
    const toggle = vi.fn();
    updateEndButtonWarn(
      {
        player: { energy: 2 },
        combat: { active: true, playerTurn: true },
      },
      {
        getElementById: () => ({
          querySelector: () => ({
            classList: { toggle },
          }),
        }),
      },
    );

    expect(toggle).toHaveBeenCalledWith('energy-warn', true);
  });

  it('schedules hud refresh through raf once while the ui is pending', () => {
    const refresh = vi.fn();
    const raf = vi.fn();

    scheduleHudUpdate({ gameStarted: true, requestAnimationFrame: raf }, refresh);
    scheduleHudUpdate({ gameStarted: true, requestAnimationFrame: raf }, refresh);

    expect(raf).toHaveBeenCalledTimes(1);
    expect(refresh).not.toHaveBeenCalled();

    const scheduled = raf.mock.calls[0][0];
    scheduled();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('processes dirty flags and dispatches dependent renderers', () => {
    const updateUI = vi.fn();
    const renderCombatEnemies = vi.fn();
    const renderCombatCards = vi.fn();
    const gs = {
      isDirty: () => true,
      hasDirtyFlag: (flag) => ['hud', 'enemies', 'hand'].includes(flag),
      clearDirty: vi.fn(),
    };

    processHudDirtyFlags(gs, { renderCombatEnemies, renderCombatCards }, updateUI);

    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(renderCombatEnemies).toHaveBeenCalledTimes(1);
    expect(renderCombatCards).toHaveBeenCalledTimes(1);
    expect(gs.clearDirty).toHaveBeenCalledTimes(1);
  });

  it('refreshes hud panels and clears the hud dirty flag', () => {
    const renderFloatingPlayerHpPanel = vi.fn();
    const updatePlayerStatsUI = vi.fn();
    const updateCombatEnergyUI = vi.fn();
    const updateHudPanels = vi.fn();
    const updateStatusDisplay = vi.fn();
    const updateEndBtnWarn = vi.fn();
    const clearDirtyFlag = vi.fn();
    const setText = vi.fn();
    const gs = {
      clearDirtyFlag,
      player: { hp: 10 },
    };
    const deps = {
      data: { classes: {} },
      updateNoiseWidget: vi.fn(),
      updateStatusDisplay,
    };

    performHudRefresh({
      gs,
      deps,
      doc: { marker: true },
      setText,
      renderFloatingPlayerHpPanel,
      updatePlayerStatsUI,
      updateCombatEnergyUI,
      updateHudPanels,
      updateEndBtnWarn,
    });

    expect(renderFloatingPlayerHpPanel).toHaveBeenCalled();
    expect(updatePlayerStatsUI).toHaveBeenCalled();
    expect(updateCombatEnergyUI).toHaveBeenCalled();
    expect(deps.updateNoiseWidget).toHaveBeenCalledTimes(1);
    expect(updateHudPanels).toHaveBeenCalledWith(expect.objectContaining({
      gs,
      deps,
      doc: { marker: true },
      data: deps.data,
      setText: expect.any(Function),
    }));
    expect(updateStatusDisplay).toHaveBeenCalledTimes(1);
    expect(updateEndBtnWarn).toHaveBeenCalledTimes(1);
    expect(clearDirtyFlag).toHaveBeenCalledWith('hud');
  });

  it('resolves partial hud deps through the deps factory', () => {
    const result = resolvePartialHudDeps(
      { player: {} },
      { doc: { marker: 'doc' }, win: { marker: 'win' } },
      (deps) => deps.doc,
    );

    expect(result.gs).toEqual({ player: {} });
    expect(result.doc).toEqual({ marker: 'doc' });
    expect(result.win).toEqual({ marker: 'win' });
  });
});
