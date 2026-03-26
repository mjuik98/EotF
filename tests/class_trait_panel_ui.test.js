import { describe, expect, it, vi } from 'vitest';
import { renderClassTraitPanel } from '../game/features/combat/public.js';

function createElement(tag = 'div') {
  const listeners = {};
  const attributes = {};
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
    setAttribute: vi.fn((name, value) => {
      attributes[name] = String(value);
    }),
    getAttribute: vi.fn((name) => attributes[name]),
    listeners,
  };
}

describe('class_trait_panel_ui', () => {
  it('passes raw descriptions into the shared general tooltip', () => {
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
      '피해 14. 잔향 20 충전 [지속]',
      expect.objectContaining({ doc }),
    );
  });

  it('exposes the trait panel as keyboard-focusable and mirrors tooltip hide on blur', () => {
    const doc = {
      createElement: vi.fn((tag) => createElement(tag)),
    };
    const tooltipUI = {
      showGeneralTooltip: vi.fn(),
      hideGeneralTooltip: vi.fn(),
    };

    const panel = renderClassTraitPanel({
      title: '특성',
      desc: '피해 14',
      label: '특성',
      value: '테스트',
    }, { doc, tooltipUI, win: {} });

    expect(panel.getAttribute('tabindex')).toBe('0');
    expect(panel.getAttribute('role')).toBe('button');
    expect(panel.getAttribute('aria-label')).toContain('특성');

    panel.listeners.focus?.({ currentTarget: { getBoundingClientRect: () => ({ right: 0, left: 0, top: 0 }) } });
    panel.listeners.blur?.();

    expect(tooltipUI.showGeneralTooltip).toHaveBeenCalledTimes(1);
    expect(tooltipUI.hideGeneralTooltip).toHaveBeenCalledTimes(1);
  });
});
