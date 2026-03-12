import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  showRewardScreenRuntime: vi.fn(),
}));

vi.mock('../game/features/reward/public.js', () => ({
  showRewardScreenRuntime: hoisted.showRewardScreenRuntime,
}));

describe('reward_ui_screen_runtime', () => {
  it('delegates reward screen runtime to the reward feature public surface', async () => {
    const { showRewardScreenRuntime } = await import('../game/ui/screens/reward_ui_screen_runtime.js');
    const ui = { id: 'ui' };
    const deps = { id: 'deps' };

    showRewardScreenRuntime(ui, 'mini_boss', deps);

    expect(hoisted.showRewardScreenRuntime).toHaveBeenCalledWith(ui, 'mini_boss', deps);
  });
});
