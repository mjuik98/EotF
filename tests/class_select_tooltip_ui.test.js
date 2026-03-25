import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  hideClassSelectTooltip,
  showClassSelectTooltip,
} from '../game/features/title/ports/public_character_select_presentation_capabilities.js';

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
  it('creates a highlighted tooltip and positions it from the current target', () => {
    const doc = createDoc();
    const childTarget = {
      getBoundingClientRect: () => ({ left: 120, bottom: 60 }),
    };

    showClassSelectTooltip({
      target: childTarget,
      currentTarget: {
        getBoundingClientRect: () => ({ left: 420, bottom: 180 }),
      },
    }, 'Trait', '피해 14. 잔향 20 충전 [소진]', { doc, win: { innerWidth: 900 } });

    const tip = doc.getElementById('classSelectTooltip');
    expect(doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(tip.innerHTML).toContain('Trait');
    expect(tip.innerHTML).toContain('kw-dmg');
    expect(tip.innerHTML).toContain('kw-echo');
    expect(tip.innerHTML).toContain('kw-exhaust kw-block');
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

  it('styles class select tooltip descriptions with the shared keyword palette', () => {
    const css = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');

    expect(css).toContain('.class-select-tooltip {');
    expect(css).toContain('.class-select-tooltip-title {');
    expect(css).toContain('.class-select-tooltip-desc {');
    expect(css).toContain('.class-select-tooltip-desc .kw-dmg');
    expect(css).toContain('.class-select-tooltip-desc .kw-echo');
    expect(css).toContain('.class-select-tooltip-desc .kw-burst.kw-block');
  });
});
