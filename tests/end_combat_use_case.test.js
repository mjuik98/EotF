import { describe, expect, it, vi } from 'vitest';

import { endCombatUseCase } from '../game/features/combat/app/use_cases/end_combat_use_case.js';

describe('end_combat_use_case', () => {
  it('returns directly to the run on endless final-region boss clears', async () => {
    const gs = {
      combat: { active: true },
      dispatch: vi.fn(),
    };
    const beginResolution = vi.fn().mockReturnValue(true);
    const completeResolution = vi.fn();
    const setBossRewardState = vi.fn();
    const returnFromReward = vi.fn();
    const clock = { delay: vi.fn(() => Promise.resolve()) };

    const outcome = await endCombatUseCase({
      audioPort: { playItemGet: vi.fn() },
      buildOutcome: vi.fn(() => ({
        isBoss: true,
        bossRewardState: { pending: true, lastRegion: true },
        returnDirectlyToRun: true,
        delays: { directReturnMs: 300 },
        summary: { dealt: 12, taken: 3, kills: 1 },
        uiReset: { hideTooltips: true },
      })),
      clock,
      combatStateCommands: {
        beginResolution,
        completeResolution,
        setBossRewardState,
        setCombatActive: vi.fn(),
      },
      combatUiPort: {
        resetAfterCombat: vi.fn(),
        showSummary: vi.fn(),
      },
      gs,
      rewardFlowPort: {
        returnFromReward,
        openReward: vi.fn(),
      },
      runRules: {
        onCombatEnd: vi.fn(),
      },
    });

    expect(beginResolution).toHaveBeenCalledWith(gs);
    expect(setBossRewardState).toHaveBeenCalledWith(gs, { pending: true, lastRegion: true });
    expect(clock.delay).toHaveBeenCalledWith(300);
    expect(returnFromReward).toHaveBeenCalledTimes(1);
    expect(completeResolution).toHaveBeenCalledWith(gs);
    expect(outcome.returnDirectlyToRun).toBe(true);
  });

  it('shows the reward screen for normal combat ends', async () => {
    const gs = {
      combat: { active: true },
      dispatch: vi.fn(),
    };
    const openReward = vi.fn();
    const setCombatActive = vi.fn();

    const outcome = await endCombatUseCase({
      audioPort: { playItemGet: vi.fn() },
      buildOutcome: () => ({
        rewardMode: false,
        returnDirectlyToRun: false,
        delays: { rewardScreenMs: 1000 },
        summary: { dealt: 4, taken: 2, kills: 0 },
        uiReset: { clearHand: true },
      }),
      clock: { delay: vi.fn(() => Promise.resolve()) },
      combatStateCommands: {
        beginResolution: vi.fn().mockReturnValue(true),
        completeResolution: vi.fn(),
        setCombatActive,
      },
      combatUiPort: {
        resetAfterCombat: vi.fn(),
        hideNodeOverlay: vi.fn(),
        showSummary: vi.fn(),
      },
      gs,
      rewardFlowPort: {
        openReward,
      },
    });

    expect(setCombatActive).toHaveBeenCalledWith(gs, false);
    expect(openReward).toHaveBeenCalledWith(false);
    expect(outcome.rewardMode).toBe(false);
  });
});
