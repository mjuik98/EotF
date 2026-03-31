import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetKeyboardNav, setupKeyboardNav } from '../game/features/title/ports/public_game_boot_presentation_capabilities.js';

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

function getDocumentHandler(doc, eventName) {
  const entry = doc.addEventListener.mock.calls.find(([name]) => name === eventName);
  return entry?.[1];
}

describe('game_boot_ui_nav_fx', () => {
  beforeEach(() => {
    resetKeyboardNav();
  });

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

  it('uses enter to activate the first visible title action when no keyboard focus exists yet', () => {
    const continueItem = makeItem('mainContinueBtn');
    continueItem.getBoundingClientRect = vi.fn(() => ({ width: 0, height: 0, top: 20 }));
    continueItem.closest = vi.fn(() => ({ style: { display: 'none' } }));
    const startItem = makeItem('mainStartBtn');
    const quitItem = makeItem('mainQuitBtn');
    const items = [continueItem, startItem, quitItem];
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
        mainContinueBtn: continueItem,
      }[id] || null)),
      addEventListener: vi.fn(),
    };

    setupKeyboardNav(doc);

    const onKeyDown = getDocumentHandler(doc, 'keydown');
    onKeyDown?.({ key: 'Enter', preventDefault: vi.fn() });

    expect(startItem.click).toHaveBeenCalledTimes(1);
    expect(continueItem.click).not.toHaveBeenCalled();
    expect(quitItem.click).not.toHaveBeenCalled();
  });

  it('uses enter to activate new run even when continue is visible and no keyboard focus exists yet', () => {
    const continueItem = makeItem('mainContinueBtn');
    const startItem = makeItem('mainStartBtn');
    const quitItem = makeItem('mainQuitBtn');
    const items = [continueItem, startItem, quitItem];
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
        mainContinueBtn: continueItem,
        mainStartBtn: startItem,
      }[id] || null)),
      addEventListener: vi.fn(),
    };

    setupKeyboardNav(doc);

    const onKeyDown = getDocumentHandler(doc, 'keydown');
    onKeyDown?.({ key: 'Enter', preventDefault: vi.fn() });

    expect(startItem.click).toHaveBeenCalledTimes(1);
    expect(continueItem.click).not.toHaveBeenCalled();
    expect(quitItem.click).not.toHaveBeenCalled();
  });
});
