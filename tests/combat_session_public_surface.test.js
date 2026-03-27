import { describe, expect, it } from 'vitest';

import {
  CombatSessionPublicSurface,
  createCombatSessionApplicationCapabilities,
} from '../game/features/combat_session/ports/public_surface.js';

describe('combat_session_public_surface', () => {
  it('exposes grouped combat-session capabilities', () => {
    expect(Object.keys(CombatSessionPublicSurface).sort()).toEqual([
      'application',
      'runtime',
    ]);
  });

  it('keeps combat-session application ownership stable', () => {
    expect(typeof createCombatSessionApplicationCapabilities).toBe('function');
    expect(typeof CombatSessionPublicSurface.application.handleInputAction).toBe('function');
    expect(typeof CombatSessionPublicSurface.runtime.rewardTransition).toBe('function');
  });
});
