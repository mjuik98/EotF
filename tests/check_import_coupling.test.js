import { describe, expect, it } from 'vitest';

import {
  IMPORT_COUPLING_TARGETS_PATH,
  compareAgainstTargets,
  computeCoupling,
  readCouplingTargets,
} from '../scripts/check-import-coupling.mjs';

describe('check_import_coupling', () => {
  it('loads pair-level coupling targets from quality config', () => {
    const targets = readCouplingTargets();

    expect(IMPORT_COUPLING_TARGETS_PATH.endsWith('config/quality/import_coupling_targets.json')).toBe(true);
    expect(targets.maxTotal).toBe(245);
    expect(targets.maxByPair['feature->shared']).toBe(34);
    expect(targets.maxByPair['feature->domain']).toBe(17);
    expect(targets.maxByPair['feature->data']).toBe(10);
    expect(targets.maxByPair['feature->utils']).toBe(15);
    expect(targets.maxByPair['feature->legacy']).toBe(1);
  });

  it('reports pairs that exceed configured coupling targets', () => {
    const failures = compareAgainstTargets(
      {
        total: 8,
        byPair: {
          'feature->legacy': 3,
          'feature->shared': 6,
        },
      },
      {
        maxByPair: {
          'feature->legacy': 2,
          'feature->shared': 6,
        },
      },
    );

    expect(failures).toEqual(['feature->legacy: 3 (target 2)']);
  });

  it('can compute the current coupling report for target tuning', async () => {
    const current = await computeCoupling();

    expect(current.total).toBeGreaterThan(0);
    expect(current.byPair['feature->shared']).toBeGreaterThan(0);
    expect(Object.keys(current.byPair).length).toBeGreaterThan(10);
  });
});
