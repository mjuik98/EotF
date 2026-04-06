import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  applyPlayerHealState,
} from '../game/shared/state/player_state_commands.js';
import { applyPlayerGoldCompatState } from '../game/shared/state/player_state_command_compat.js';
import { enableLegacyPlayerStateCommandFallback } from '../game/platform/legacy/state/legacy_player_state_command_fallback.js';
import {
  getPlayerStateLegacyFallbackMetrics,
  resetPlayerStateLegacyFallbackMetrics,
} from '../game/platform/legacy/state/player_state_command_legacy_adapter.js';

describe('player state legacy fallback metrics', () => {
  beforeEach(() => {
    resetPlayerStateLegacyFallbackMetrics();
  });

  it('records direct fallback usage when shared state commands drop to legacy mutations', () => {
    const gs = enableLegacyPlayerStateCommandFallback({
      markDirty: vi.fn(),
      player: { hp: 10, maxHp: 20 },
    });

    expect(applyPlayerHealState(gs, 3)).toEqual({ healed: 3, hpAfter: 13 });
    expect(getPlayerStateLegacyFallbackMetrics()).toEqual({
      compat: {},
      direct: {
        applyPlayerHealState: 1,
      },
    });
  });

  it('records compat fallback usage when reducer-backed compat commands still force legacy mutation paths', () => {
    const gs = {
      dispatch: vi.fn(() => null),
      markDirty: vi.fn(),
      player: { gold: 10 },
    };

    expect(applyPlayerGoldCompatState(gs, 2)).toEqual({ delta: 2, goldAfter: 12 });
    expect(getPlayerStateLegacyFallbackMetrics()).toEqual({
      compat: {
        applyPlayerGoldState: 1,
      },
      direct: {
        applyPlayerGoldState: 1,
      },
    });
  });
});
