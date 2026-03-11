import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/ui/screens/reward_ui_claims.js', () => ({
  ensureMiniBossBonus: vi.fn(),
}));

vi.mock('../game/ui/screens/reward_ui_helpers.js', () => ({
  drawRewardCards: vi.fn(() => ['card_a', 'card_b']),
  getData: vi.fn((deps) => deps.data),
  getDoc: vi.fn((deps) => deps.doc),
  getGS: vi.fn((deps) => deps.gs),
  normalizeRewardMode: vi.fn((mode) => mode || 'normal'),
  resolveRewardCardConfig: vi.fn(() => ({ count: 2, rarities: ['common', 'rare'] })),
}));

vi.mock('../game/ui/screens/reward_ui_options.js', () => ({
  renderRewardOptions: vi.fn(),
}));

vi.mock('../game/ui/screens/reward_ui_render.js', () => ({
  renderRewardHeader: vi.fn(),
}));

describe('reward_ui_screen_runtime', () => {
  it('prepares the reward screen and delegates option rendering', async () => {
    const { showRewardScreenRuntime } = await import('../game/ui/screens/reward_ui_screen_runtime.js');
    const claims = await import('../game/ui/screens/reward_ui_claims.js');
    const render = await import('../game/ui/screens/reward_ui_render.js');
    const options = await import('../game/ui/screens/reward_ui_options.js');
    const container = {
      textContent: 'old',
      classList: {
        remove: vi.fn(),
      },
    };
    const deps = {
      gs: {
        combat: { active: true },
        currentNode: { type: 'elite' },
      },
      data: {},
      doc: {
        getElementById: vi.fn((id) => (id === 'rewardCards' ? container : null)),
      },
      switchScreen: vi.fn(),
    };
    const ui = {
      hideSkipConfirm: vi.fn(),
      takeRewardCard: vi.fn(),
      takeRewardBlessing: vi.fn(),
      takeRewardItem: vi.fn(),
    };

    showRewardScreenRuntime(ui, 'mini_boss', deps);

    expect(deps.gs.combat.active).toBe(false);
    expect(ui.hideSkipConfirm).toHaveBeenCalledWith(deps);
    expect(claims.ensureMiniBossBonus).toHaveBeenCalledWith(deps.gs, deps.data, deps);
    expect(render.renderRewardHeader).toHaveBeenCalledWith(deps.doc, 'mini_boss', true);
    expect(container.textContent).toBe('');
    expect(container.classList.remove).toHaveBeenCalledWith('picked');
    expect(options.renderRewardOptions).toHaveBeenCalledWith(expect.objectContaining({
      container,
      rewardMode: 'mini_boss',
      isElite: true,
      rewardCards: ['card_a', 'card_b'],
    }));
    expect(deps.switchScreen).toHaveBeenCalledWith('reward');
  });
});
