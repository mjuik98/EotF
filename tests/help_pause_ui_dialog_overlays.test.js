import { describe, expect, it, vi } from 'vitest';
import {
  createAbandonConfirm,
  createHelpMenu,
  createMobileWarning,
  createQuitGameConfirm,
  createReturnTitleConfirm,
} from '../game/features/ui/public.js';

function createElementFactory(elements) {
  return function createElement(tagName) {
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      id: '',
      style: {},
      className: '',
      textContent: '',
      innerHTML: '',
      children: [],
      append(...nodes) {
        this.children.push(...nodes);
      },
      appendChild(node) {
        this.children.push(node);
        if (node?.id) elements[node.id] = node;
        return node;
      },
    };
    return el;
  };
}

function createDoc() {
  const elements = {};
  return {
    createElement: createElementFactory(elements),
    elements,
  };
}

describe('help_pause_ui_dialog_overlays', () => {
  it('builds the help overlay with the shared modal frame and dismiss action', () => {
    const doc = createDoc();
    const menu = createHelpMenu(doc, {}, vi.fn());

    expect(menu.id).toBe('helpMenu');
    expect(menu.className).toContain('hp-overlay');
    expect(menu.className).toContain('hp-overlay-help');
    expect(menu.children[0].className).toContain('hp-panel');
    expect(menu.children[0].className).toContain('gm-modal-panel');
    expect(menu.children[0].children.at(-1).children[0].className).toContain('action-btn-secondary');
    expect(menu.children[0].children.at(-1).children[0].className).toContain('gm-close-btn');
    expect(menu.children[0].children.at(-1).children[0].className).toContain('gm-close-btn-footer');
  });

  it('builds confirm dialogs and the mobile warning through the same overlay frame system', () => {
    const doc = createDoc();
    const abandon = createAbandonConfirm(doc, vi.fn(), vi.fn());
    const returnTitle = createReturnTitleConfirm(doc, vi.fn(), vi.fn());
    const quitGame = createQuitGameConfirm(doc, vi.fn(), vi.fn());
    const warning = createMobileWarning(doc, vi.fn());

    [abandon, returnTitle, quitGame, warning].forEach((overlay) => {
      expect(overlay.className).toContain('hp-overlay');
      expect(overlay.children[0].className).toContain('hp-panel');
      expect(overlay.children[0].className).toContain('gm-modal-panel');
    });

    expect(abandon.children[0].children.at(-1).children[0].className).toContain('hp-actions');
    expect(returnTitle.children[0].children.at(-1).children[0].className).toContain('hp-actions');
    expect(warning.children[0].children.at(-1).children[0].className).toContain('action-btn-primary');

    const returnTitleHeader = returnTitle.children[0].children[0];
    const headerMain = returnTitleHeader.children[0];
    expect(headerMain.children[1].textContent).toBe('타이틀로 돌아가시겠습니까?');
    expect(returnTitle.children[0].children.at(-1).children[0].children[1].textContent).toBe('타이틀로 이동');

    const quitHeader = quitGame.children[0].children[0].children[0];
    expect(quitHeader.children[1].textContent).toBe('게임을 종료하시겠습니까?');
    expect(quitGame.children[0].children[1].children[0].innerHTML).toContain('브라우저에서는 자동 종료가 제한될 수 있습니다.');
    expect(quitGame.children[0].children[1].children[1].id).toBe('quitGameStatus');
    expect(quitGame.children[0].children.at(-1).children[0].children[1].textContent).toBe('종료하기');
  });
});
