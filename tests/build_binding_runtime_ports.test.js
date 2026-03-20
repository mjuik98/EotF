import { describe, expect, it } from 'vitest';

import { buildBindingRuntimePorts } from '../game/core/bootstrap/build_binding_runtime_ports.js';

describe('buildBindingRuntimePorts', () => {
  it('prefers scoped core GAME deps over stale flat compat aliases', () => {
    const scopedGame = {
      getDeps: () => ({ source: 'scoped-game' }),
      getRunDeps: () => ({ source: 'scoped-run' }),
      getCombatDeps: () => ({ source: 'scoped-combat' }),
    };
    const staleGame = {
      getDeps: () => ({ source: 'stale-game' }),
      getRunDeps: () => ({ source: 'stale-run' }),
      getCombatDeps: () => ({ source: 'stale-combat' }),
    };
    const modules = {
      GAME: staleGame,
      legacyModules: { GAME: staleGame },
      featureScopes: {
        core: {
          GAME: scopedGame,
        },
      },
    };

    const ports = buildBindingRuntimePorts({ modules });

    expect(ports.getGameDeps()).toEqual({ source: 'scoped-game' });
    expect(ports.getRunRuntimeDeps()).toEqual({ source: 'scoped-run' });
    expect(ports.getCombatRuntimeDeps()).toEqual({ source: 'scoped-combat' });
  });

  it('falls back to legacy compat GAME before stale top-level aliases', () => {
    const compatGame = {
      getDeps: () => ({ source: 'compat-game' }),
      getRunDeps: () => ({ source: 'compat-run' }),
      getCombatDeps: () => ({ source: 'compat-combat' }),
    };
    const staleGame = {
      getDeps: () => ({ source: 'stale-game' }),
      getRunDeps: () => ({ source: 'stale-run' }),
      getCombatDeps: () => ({ source: 'stale-combat' }),
    };
    const modules = {
      GAME: staleGame,
      legacyModules: { GAME: compatGame },
    };

    const ports = buildBindingRuntimePorts({ modules });

    expect(ports.getGameDeps()).toEqual({ source: 'compat-game' });
    expect(ports.getRunRuntimeDeps()).toEqual({ source: 'compat-run' });
    expect(ports.getCombatRuntimeDeps()).toEqual({ source: 'compat-combat' });
  });
});
