import { describe, expect, it } from 'vitest';

import {
  formatStatusTooltipUrgentDuration,
  getStatusTooltipSourceIcon,
  getStatusTooltipTypeLabel,
  STATUS_TOOLTIP_COPY,
} from '../game/ui/combat/status_tooltip_copy.js';

describe('status tooltip copy helpers', () => {
  it('resolves fallback type labels for buff and debuff states', () => {
    expect(getStatusTooltipTypeLabel('', true, true)).toBe(STATUS_TOOLTIP_COPY.infiniteBuff);
    expect(getStatusTooltipTypeLabel('', true, false)).toBe(STATUS_TOOLTIP_COPY.buff);
    expect(getStatusTooltipTypeLabel('', false, false)).toBe(STATUS_TOOLTIP_COPY.debuff);
  });

  it('formats source icons and urgent duration copy centrally', () => {
    expect(getStatusTooltipSourceIcon('enemy')).toBe(STATUS_TOOLTIP_COPY.enemySourceIcon);
    expect(getStatusTooltipSourceIcon('self')).toBe(STATUS_TOOLTIP_COPY.selfSourceIcon);
    expect(formatStatusTooltipUrgentDuration(1)).toContain('1');
  });
});
