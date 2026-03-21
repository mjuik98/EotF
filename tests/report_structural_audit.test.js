import { describe, expect, it } from 'vitest';

import { buildStructuralAuditReport } from '../scripts/report-structural-audit.mjs';

describe('report_structural_audit', () => {
  it('reports thin reexports, multi-hop chains, and stale script references', () => {
    const report = buildStructuralAuditReport(process.cwd());

    expect(report.thinReexportCount).toBeGreaterThan(0);
    expect(report.compatRootCounts['game/ui']).toBeGreaterThan(0);
    expect(report.multiHopCompatChainCount).toBe(report.multiHopCompatChains.length);
    expect(Array.isArray(report.staleScriptReferences)).toBe(true);
    expect(report.staleScriptReferences).toEqual([]);
  });
});
