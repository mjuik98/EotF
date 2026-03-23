import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  showRewardScreenRuntime: vi.fn(),
}));

vi.mock('../game/features/reward/application/workflows/show_reward_screen_workflow.js', () => ({
  showRewardScreenRuntime: hoisted.showRewardScreenRuntime,
}));

describe('reward_ui_screen_runtime', () => {
  it('delegates reward screen runtime to the feature-owned reward runtime', async () => {
    const { showRewardScreenRuntime } = await import('../game/features/reward/public.js');
    const ui = { id: 'ui' };
    const deps = { id: 'deps' };

    showRewardScreenRuntime(ui, 'mini_boss', deps);

    expect(hoisted.showRewardScreenRuntime).toHaveBeenCalledWith(ui, 'mini_boss', deps);
  });
});
