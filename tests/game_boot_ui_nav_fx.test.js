import { describe, expect, it, vi } from 'vitest';
import { resetKeyboardNav, setupKeyboardNav } from '../game/ui/title/game_boot_ui_nav_fx.js';

function makeItem(id) {
  return {
    id,
    classList: { toggle: vi.fn(), contains: vi.fn(() => true) },
    addEventListener: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({ width: 100, height: 40, top: 20 })),
    click: vi.fn(),
    closest: vi.fn(() => ({ style: { display: 'block' } })),
  };
}

describe('game_boot_ui_nav_fx', () => {
  it('binds title keyboard navigation only once until reset', () => {
    const items = [makeItem('mainContinueBtn'), makeItem('mainStartBtn')];
    const titleScreen = { classList: { contains: vi.fn(() => true) } };
    const mainScreen = { style: { display: 'block' } };
    const cursor = { style: {} };
    const panel = { getBoundingClientRect: vi.fn(() => ({ top: 0 })) };
    const doc = {
      querySelectorAll: vi.fn(() => items),
      getElementById: vi.fn((id) => ({
        titleNavCursor: cursor,
        titleMenuPanel: panel,
        titleScreen,
        mainTitleSubScreen: mainScreen,
        mainContinueBtn: items[0],
      }[id] || null)),
      addEventListener: vi.fn(),
    };

    setupKeyboardNav(doc);
    setupKeyboardNav(doc);

    expect(doc.addEventListener).toHaveBeenCalledTimes(1);

    resetKeyboardNav();
    setupKeyboardNav(doc);

    expect(doc.addEventListener).toHaveBeenCalledTimes(2);
  });
});
