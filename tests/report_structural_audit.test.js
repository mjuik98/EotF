import { describe, expect, it } from 'vitest';

import {
  STRUCTURAL_AUDIT_THRESHOLDS_PATH,
  buildStructuralAuditReport,
  readStructuralAuditThresholds,
} from '../scripts/report-structural-audit.mjs';

describe('report_structural_audit', () => {
  it('loads structural audit thresholds from quality config', () => {
    const thresholds = readStructuralAuditThresholds();

    expect(STRUCTURAL_AUDIT_THRESHOLDS_PATH.endsWith('config/quality/structural_audit_thresholds.json')).toBe(true);
    expect(thresholds.maxThinReexports).toBe(0);
    expect(thresholds.maxCompatRootCounts['game/ui']).toBe(0);
    expect(thresholds.maxMultiHopCompatChains).toBe(0);
    expect(thresholds.maxStaleScriptReferences).toBe(0);
  });

  it('reports thin reexports, multi-hop chains, and stale script references', () => {
    const report = buildStructuralAuditReport(process.cwd());

    expect(report.thinReexportCount).toBe(0);
    expect(report.compatRootCounts['game/ui']).toBe(0);
    expect(report.compatRootCounts['game/app']).toBe(0);
    expect(report.compatRootCounts['game/combat']).toBe(0);
    expect(report.multiHopCompatChainCount).toBe(report.multiHopCompatChains.length);
    expect(Array.isArray(report.staleScriptReferences)).toBe(true);
    expect(report.staleScriptReferences).toEqual([]);
    expect(report.thresholdFailures).toEqual([]);
  });
});
