import { describe, expect, it } from 'vitest';

import { createLegacyRuntimePorts } from '../game/platform/legacy/adapters/create_legacy_runtime_ports.js';
import { LEGACY_PLAYER_STATE_FALLBACK_FLAG } from '../game/shared/state/player_state_command_fallback_flag.js';

describe('createLegacyRuntimePorts', () => {
  it('reads legacy runtime values from a provided root object', () => {
    const state = { token: 'state' };
    const audio = { id: 'audio' };
    const card = { id: 'strike' };
    const module = { id: 'hud' };
    const root = {
      getRunDeps: () => ({ token: 'run' }),
      getCombatDeps: () => ({ token: 'combat' }),
      getUiDeps: () => ({ token: 'ui' }),
      Modules: { HudUpdateUI: module },
      Data: { cards: { strike: card } },
      Audio: audio,
      State: state,
    };

    const ports = createLegacyRuntimePorts(root);

    expect(ports.getRuntimeDeps()).toEqual({ token: 'run' });
    expect(ports.getRunRuntimeDeps()).toEqual({ token: 'run' });
    expect(ports.getCombatRuntimeDeps()).toEqual({ token: 'combat' });
    expect(ports.getUiRuntimeDeps()).toEqual({ token: 'ui' });
    expect(ports.getModule('HudUpdateUI')).toBe(module);
    expect(ports.getCurrentCard('strike')).toBe(card);
    expect(ports.getAudioEngine()).toBe(audio);
    expect(ports.getDefaultState()).toBe(state);
    expect(state[LEGACY_PLAYER_STATE_FALLBACK_FLAG]).toBeUndefined();
  });

  it('falls back to empty feature dep bags when a legacy getter is missing', () => {
    const ports = createLegacyRuntimePorts({
      Modules: {},
      Data: {},
    });

    expect(ports.getRuntimeDeps()).toEqual({});
    expect(ports.getCombatRuntimeDeps()).toEqual({});
    expect(ports.getUiRuntimeDeps()).toEqual({});
  });
});
