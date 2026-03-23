import { describe, expect, it, vi } from 'vitest';
import {
  hideGeneralTooltipUi,
  showGeneralTooltipUi,
} from '../game/features/combat/public.js';

function createElement(tag = 'div') {
  return {
    tagName: String(tag).toUpperCase(),
    id: '',
    style: {},
    children: [],
    textContent: '',
    innerHTML: '',
    parentNode: null,
    append(...nodes) {
      this.children.push(...nodes);
      nodes.forEach((node) => {
        if (node && typeof node === 'object') node.parentNode = this;
      });
    },
    appendChild(node) {
      this.children.push(node);
      if (node && typeof node === 'object') node.parentNode = this;
      return node;
    },
    remove: vi.fn(function remove() {
      if (!this.parentNode?.children) return;
      this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
      this.parentNode = null;
    }),
    getBoundingClientRect: vi.fn(() => ({ width: 220, height: 120 })),
  };
}

function createDoc() {
  const body = createElement('body');
  body.appendChild = vi.fn(function appendChild(node) {
    this.children.push(node);
    if (node && typeof node === 'object') node.parentNode = this;
    return node;
  });

  return {
    body,
    createElement: vi.fn((tag) => createElement(tag)),
  };
}

describe('tooltip_general_ui', () => {
  it('replaces an existing tooltip and stores the latest element on window', () => {
    const doc = createDoc();
    const previous = createElement();
    previous.remove = vi.fn();
    const win = { innerWidth: 900, innerHeight: 700, _generalTipEl: previous };
    const event = {
      currentTarget: {
        getBoundingClientRect: () => ({ right: 120, left: 60, top: 40 }),
      },
    };

    showGeneralTooltipUi(event, 'Title', 'Body', { doc, win });

    expect(previous.remove).toHaveBeenCalledTimes(1);
    expect(doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(win._generalTipEl).toBe(doc.body.children[0]);
    expect(win._generalTipEl.children[0].textContent).toBe('Title');
    expect(win._generalTipEl.children[1].innerHTML).toBe('Body');
    expect(win._generalTipEl.style.left).toBe('130px');
    expect(win._generalTipEl.style.top).toBe('40px');
  });

  it('removes and clears the stored tooltip on hide', () => {
    const tip = createElement();
    tip.remove = vi.fn();
    const win = { _generalTipEl: tip };

    hideGeneralTooltipUi({ win });

    expect(tip.remove).toHaveBeenCalledTimes(1);
    expect(win._generalTipEl).toBeNull();
  });
});
