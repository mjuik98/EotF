import { describe, expect, it, vi } from 'vitest';
import {
  hideClassSelectTooltip,
  showClassSelectTooltip,
} from '../game/ui/title/class_select_tooltip_ui.js';

function createDoc() {
  const elements = new Map();
  const body = {
    appendChild: vi.fn((node) => {
      elements.set(node.id, node);
    }),
  };
  return {
    body,
    createElement: vi.fn(() => ({ id: '', style: {}, innerHTML: '' })),
    getElementById: vi.fn((id) => elements.get(id) || null),
  };
}

describe('class select tooltip helper', () => {
  it('creates and positions the tooltip', () => {
    const doc = createDoc();

    showClassSelectTooltip({
      target: {
        getBoundingClientRect: () => ({ left: 420, bottom: 180 }),
      },
    }, 'Trait', 'Description', { doc, win: { innerWidth: 900 } });

    const tip = doc.getElementById('classSelectTooltip');
    expect(doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(tip.innerHTML).toContain('Trait');
    expect(tip.style.left).toBe('420px');
    expect(tip.style.top).toBe('186px');
    expect(tip.style.opacity).toBe('1');
  });

  it('hides an existing tooltip', () => {
    const tip = { style: { opacity: '1' } };
    const doc = {
      getElementById: vi.fn(() => tip),
    };

    hideClassSelectTooltip({ doc });
    expect(tip.style.opacity).toBe('0');
  });
});
