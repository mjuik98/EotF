import { describe, expect, it, vi } from 'vitest';

import { showRewardScreenRuntime } from '../game/features/reward/application/workflows/show_reward_screen_workflow.js';

describe('show_reward_screen_workflow ports', () => {
  it('orchestrates reward rendering through an injected screen ui port', () => {
    const gs = { combat: { active: true }, currentNode: { type: 'elite' } };
    const data = { cards: {} };
    const rewardScreenUi = {
      getGS: vi.fn(() => gs),
      getData: vi.fn(() => data),
      normalizeRewardMode: vi.fn(() => 'mini_boss'),
      resolveCurrentNodeType: vi.fn(() => 'elite'),
      resolveRewardCardConfig: vi.fn(() => ({ count: 2, rarities: ['rare', 'rare'] })),
      hideSkipConfirm: vi.fn(),
      drawRewardCards: vi.fn(() => ['card_a', 'card_b']),
      showView: vi.fn(() => true),
    };

    const shown = showRewardScreenRuntime(
      { hideSkipConfirm: vi.fn() },
      'mini_boss',
      { rewardScreenUi },
    );

    expect(shown).toBe(true);
    expect(rewardScreenUi.getGS).toHaveBeenCalledTimes(1);
    expect(rewardScreenUi.getData).toHaveBeenCalledTimes(1);
    expect(rewardScreenUi.hideSkipConfirm).toHaveBeenCalledTimes(1);
    expect(rewardScreenUi.drawRewardCards).toHaveBeenCalledWith(
      gs,
      2,
      ['rare', 'rare'],
      data,
      expect.objectContaining({
        isElite: true,
        rewardMode: 'mini_boss',
      }),
    );
    expect(rewardScreenUi.showView).toHaveBeenCalledWith(expect.objectContaining({
      data,
      gs,
      isElite: true,
      rewardCards: ['card_a', 'card_b'],
      rewardMode: 'mini_boss',
    }));
  });
});
