import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';
import { resolveActiveRegionId } from '../game/features/run/ports/public_rule_capabilities.js';

describe('resolveActiveRegionId', () => {
  it('removes the legacy domain-owned region service wrapper', () => {
    expect(
      fs.existsSync(path.join(process.cwd(), 'game/domain/run/region_service.js')),
    ).toBe(false);
  });

  it('prefers explicit active region id when present', () => {
    expect(resolveActiveRegionId({ _activeRegionId: 5, currentRegion: 1 })).toBe(5);
  });

  it('falls back to region resolver when active region id is absent', () => {
    const gs = { currentRegion: 2 };
    const value = resolveActiveRegionId(gs, {
      getRegionIdForStage: () => 7,
    });

    expect(value).toBe(7);
  });

  it('uses region data fallback before stage resolver when available', () => {
    const gs = { currentRegion: 'branch-2' };
    const value = resolveActiveRegionId(gs, {
      getRegionData: () => ({ id: 5 }),
      getRegionIdForStage: () => 7,
    });

    expect(value).toBe(5);
  });

  it('falls back to current region when resolver does not return a finite number', () => {
    const gs = { currentRegion: 3 };
    const value = resolveActiveRegionId(gs, {
      getRegionIdForStage: () => Number.NaN,
    });

    expect(value).toBe(3);
  });
});
