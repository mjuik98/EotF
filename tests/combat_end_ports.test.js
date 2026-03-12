import { describe, expect, it, vi } from 'vitest';

import { createCombatEndRewardFlowPort } from '../game/features/combat/platform/combat_end_ports.js';

describe('combat_end_ports', () => {
  it('prefers reward flow openReward actions over the legacy reward screen fallback', () => {
    const openReward = vi.fn();
    const showRewardScreen = vi.fn();
    const port = createCombatEndRewardFlowPort({
      openReward,
      showRewardScreen,
    });

    port.openReward('boss');

    expect(openReward).toHaveBeenCalledWith('boss');
    expect(showRewardScreen).not.toHaveBeenCalled();
  });
});
