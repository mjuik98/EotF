import { describe, expect, it } from 'vitest';

import {
  buildStatusTooltipHeaderHTML,
  composeStatusTooltipBodyHTML,
} from '../game/ui/combat/status_tooltip_layout.js';

describe('status tooltip layout helpers', () => {
  it('renders header chrome from extracted layout helper', () => {
    const html = buildStatusTooltipHeaderHTML(
      { icon: '!', name: 'Focus' },
      { accent: '#111', nameColor: '#222', typeBg: '#333', typeColor: '#444' },
      { nameEn: 'Focus' },
      'Buff',
      'focus',
    );

    expect(html).toContain('stt-header');
    expect(html).toContain('Focus');
    expect(html).toContain('Buff');
  });

  it('composes body sections without falsy fragments', () => {
    const html = composeStatusTooltipBodyHTML(['<div>a</div>', '', null, '<div>b</div>']);

    expect(html).toBe('<div>a</div><div>b</div>');
  });
});
