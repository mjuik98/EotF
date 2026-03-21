import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  ensureCombatChronicleBrowserModules: vi.fn(async () => ({
    closeBattleChronicleOverlay: vi.fn(),
    isChronicleOverlayOpen: vi.fn(() => false),
    openBattleChronicleOverlay: vi.fn(),
  })),
}));

vi.mock('../game/features/combat/platform/browser/ensure_combat_chronicle_browser_modules.js', () => ({
  ensureCombatChronicleBrowserModules: hoisted.ensureCombatChronicleBrowserModules,
}));

import { CombatHudUI } from '../game/features/combat/presentation/browser/combat_hud_ui.js';

describe('CombatHudUI lazy chronicle loading', () => {
  it('loads chronicle helpers on demand before opening the overlay', async () => {
    const doc = {
      getElementById: vi.fn(() => ({ classList: { contains: vi.fn(() => false) } })),
      defaultView: { requestAnimationFrame: vi.fn() },
    };
    const deps = { doc, gs: { combat: { log: [{ msg: 'entry' }] } } };

    await CombatHudUI.openBattleChronicle(deps);

    expect(hoisted.ensureCombatChronicleBrowserModules).toHaveBeenCalledWith(doc);
    const modules = await hoisted.ensureCombatChronicleBrowserModules.mock.results[0].value;
    expect(modules.openBattleChronicleOverlay).toHaveBeenCalledWith(doc, deps.gs.combat.log, {
      requestAnimationFrame: doc.defaultView.requestAnimationFrame,
    });
  });
});
