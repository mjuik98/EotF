import { describe, expect, it, vi } from 'vitest';
import { renderClassTraitPanel } from '../game/features/combat/public.js';

function createElement(tag = 'div') {
  const listeners = {};
  return {
    tagName: String(tag).toUpperCase(),
    style: {},
    children: [],
    textContent: '',
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
    append(...nodes) {
      this.children.push(...nodes);
    },
    listeners,
  };
}

describe('class_trait_panel_ui', () => {
  it('passes highlighted descriptions into the shared general tooltip', () => {
    const doc = {
      createElement: vi.fn((tag) => createElement(tag)),
    };
    const tooltipUI = {
      showGeneralTooltip: vi.fn(),
      hideGeneralTooltip: vi.fn(),
    };

    const panel = renderClassTraitPanel({
      title: '특성',
      desc: '피해 14. 잔향 20 충전 [지속]',
      label: '특성',
      value: '테스트',
    }, { doc, tooltipUI, win: {} });

    panel.listeners.mouseenter({ currentTarget: { getBoundingClientRect: () => ({ right: 0, left: 0, top: 0 }) } });

    expect(tooltipUI.showGeneralTooltip).toHaveBeenCalledWith(
      expect.anything(),
      '특성',
      expect.stringContaining('kw-dmg'),
      expect.objectContaining({ doc }),
    );
    expect(tooltipUI.showGeneralTooltip.mock.calls[0][2]).toContain('kw-echo');
    expect(tooltipUI.showGeneralTooltip.mock.calls[0][2]).toContain('kw-buff kw-block');
  });
});
