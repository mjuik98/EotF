import { describe, expect, it } from 'vitest';

import {
  getStatusTooltipMeta,
  resolveStatusTooltipPalette,
} from '../data/status_tooltip_meta_data.js';

describe('status tooltip meta data', () => {
  it('resolves merged tooltip metadata for explicit and normalized keys', () => {
    expect(getStatusTooltipMeta('focus')?.nameEn).toBe('Focus');
    expect(getStatusTooltipMeta('unbreakable_wall_plus')?.gauge?.infinite).toBe(true);
    expect(getStatusTooltipMeta('time_warp_plus')?.typeLabel).toBeTruthy();
  });

  it('returns fallback palettes when no tooltip-specific metadata exists', () => {
    expect(resolveStatusTooltipPalette('mystery', false)?.accent).toBe('#ff3366');
    expect(resolveStatusTooltipPalette('mystery', true, { isInfinite: true })?.accent).toBe('#8b5cf6');
  });
});
