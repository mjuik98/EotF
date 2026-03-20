import { describe, expect, it, vi } from 'vitest';

import { createCombatPorts } from '../game/features/combat/ports/create_combat_ports.js';
import { createRunCanvasPorts } from '../game/features/run/ports/create_run_canvas_ports.js';

describe('combat and run ports scope preference', () => {
  it('prefers scoped core GAME for combat legacy dep bridges', () => {
    const scopedCombatDeps = vi.fn(() => ({ token: 'scoped-combat' }));
    const scopedHudDeps = vi.fn(() => ({ token: 'scoped-hud' }));
    const modules = {
      GAME: {
        getCombatDeps: vi.fn(() => ({ token: 'flat-combat' })),
        getHudDeps: vi.fn(() => ({ token: 'flat-hud' })),
      },
      featureScopes: {
        core: {
          GAME: {
            getCombatDeps: scopedCombatDeps,
            getHudDeps: scopedHudDeps,
          },
        },
      },
    };

    const ports = createCombatPorts(modules, {
      getBaseCardDeps: vi.fn(() => ({ token: 'base-card' })),
      getCardTargetDeps: vi.fn(() => ({ token: 'card-target' })),
      getCombatTurnBaseDeps: vi.fn(() => ({ token: 'combat-turn-base' })),
      getFeedbackDeps: vi.fn(() => ({ token: 'feedback' })),
    });

    expect(ports.getCombatDeps()).toEqual({ token: 'scoped-combat' });
    expect(ports.getHudDeps()).toEqual({ token: 'scoped-hud' });
    expect(scopedCombatDeps).toHaveBeenCalledTimes(1);
    expect(scopedHudDeps).toHaveBeenCalledTimes(1);
  });

  it('prefers scoped core GAME for run canvas deps', () => {
    const scopedCanvasDeps = vi.fn(() => ({ token: 'scoped-canvas', doc: { id: 'scoped-doc' } }));
    const modules = {
      GAME: {
        getCanvasDeps: vi.fn(() => ({ token: 'flat-canvas', doc: { id: 'flat-doc' } })),
      },
      featureScopes: {
        core: {
          GAME: {
            getCanvasDeps: scopedCanvasDeps,
          },
        },
      },
    };

    const ports = createRunCanvasPorts(modules, {
      doc: { id: 'explicit-doc' },
      win: { id: 'explicit-win', requestAnimationFrame: vi.fn() },
    });

    expect(ports.getCanvasDeps()).toEqual({
      token: 'scoped-canvas',
      doc: { id: 'explicit-doc' },
      win: { id: 'explicit-win', requestAnimationFrame: expect.any(Function) },
    });
    expect(scopedCanvasDeps).toHaveBeenCalledTimes(1);
  });
});
