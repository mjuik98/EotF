import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function readText(relPath) {
  return fs.readFileSync(path.join(process.cwd(), relPath), 'utf8').replace(/^\uFEFF/, '');
}

describe('quality workflow scripts', () => {
  it('separates fast local regressions, guardrail sweeps, and the full quality gate', () => {
    const packageJson = JSON.parse(readText('package.json'));

    expect(packageJson.scripts['quality:fast']).toBe('npm run lint && npm test');
    expect(packageJson.scripts['test:manifest']).toBe('node scripts/test_suite_manifest.mjs --check');
    expect(packageJson.scripts['test:manifest:write']).toBe('node scripts/test_suite_manifest.mjs --write');
    expect(packageJson.scripts.test).toBe('node scripts/run-vitest-suite.mjs fast');
    expect(packageJson.scripts['test:guardrails']).toBe('node scripts/run-vitest-suite.mjs guardrails');
    expect(packageJson.scripts['test:full']).toBe('node scripts/run-vitest-suite.mjs full');
    expect(packageJson.scripts['deps:map:check']).toBe('node scripts/generate-dependency-map.mjs --check');
    expect(packageJson.scripts['quality:sync']).toBe('npm run test:manifest:write && npm run deps:map');
    expect(packageJson.scripts['quality:full']).toContain('npm run test:coverage');
    expect(packageJson.scripts['quality:full']).toContain('npm run audit:structure');
    expect(packageJson.scripts['quality:full']).toContain('npm run deps:map:check');
    expect(packageJson.scripts['quality:full']).toContain('npm run build');
    expect(packageJson.scripts['quality:full']).toContain('npm run smoke:character-select');
    expect(packageJson.scripts.quality).toBe('npm run quality:full');
  });

  it('keeps the automated quality gate aligned with the local full workflow', () => {
    const workflow = readText('.github/workflows/quality-gate.yml');

    expect(workflow).toContain('- run: npm run test:manifest');
    expect(workflow).toContain('- run: npm run deps:map:check');
    expect(workflow).toContain('- run: npm run lint');
    expect(workflow).toContain('- run: npm run test:coverage');
    expect(workflow).toContain('- run: npm run audit:structure');
    expect(workflow).toContain('- run: npm run build');
  });

  it('loads coverage thresholds from quality config', () => {
    const coverageThresholds = JSON.parse(readText('config/quality/coverage_thresholds.json'));
    const vitestConfig = readText('vitest.config.js');

    expect(coverageThresholds.lines).toBeGreaterThanOrEqual(70);
    expect(coverageThresholds.functions).toBeGreaterThanOrEqual(55);
    expect(coverageThresholds.statements).toBeGreaterThanOrEqual(70);
    expect(coverageThresholds.branches).toBeGreaterThanOrEqual(60);
    expect(vitestConfig).toContain("coverage_thresholds.json");
  });

  it('loads bundle budget and structural audit policy from quality config', () => {
    const bundleBudgets = JSON.parse(readText('config/quality/bundle_budgets.json'));
    const structuralAuditThresholds = JSON.parse(readText('config/quality/structural_audit_thresholds.json'));
    const packageJson = JSON.parse(readText('package.json'));
    const auditScript = readText('scripts/report-structural-audit.mjs');
    const budgetScript = readText('scripts/assert-bundle-budgets.mjs');

    expect(bundleBudgets.entryJs.maxBytes).toBe(410 * 1024);
    expect(structuralAuditThresholds.maxThinReexports).toBe(0);
    expect(structuralAuditThresholds.maxCompatRootCounts['game/ui']).toBe(0);
    expect(structuralAuditThresholds.maxCompatRootCounts['game/app']).toBe(0);
    expect(structuralAuditThresholds.maxCompatRootCounts['game/combat']).toBe(0);
    expect(packageJson.scripts['audit:structure']).toContain('--strict');
    expect(auditScript).toContain('structural_audit_thresholds.json');
    expect(budgetScript).toContain('bundle_budgets.json');
  });

  it('loads explicit suite ownership and coupling targets from quality config', () => {
    const suiteManifest = JSON.parse(readText('config/quality/test_suite_manifest.json'));
    const couplingTargets = JSON.parse(readText('config/quality/import_coupling_targets.json'));
    const lintScript = JSON.parse(readText('package.json')).scripts.lint;
    const suiteScript = readText('scripts/test_suite_manifest.mjs');
    const couplingScript = readText('scripts/check-import-coupling.mjs');

    expect(suiteManifest.fast.length).toBeGreaterThan(0);
    expect(suiteManifest.guardrails.length).toBeGreaterThan(0);
    expect(couplingTargets.maxTotal).toBe(245);
    expect(couplingTargets.maxByPair['feature->shared']).toBe(34);
    expect(couplingTargets.maxByPair['feature->domain']).toBe(17);
    expect(couplingTargets.maxByPair['feature->data']).toBe(10);
    expect(couplingTargets.maxByPair['feature->utils']).toBe(15);
    expect(couplingTargets.maxByPair['feature->legacy']).toBe(1);
    expect(lintScript).toContain('node scripts/test_suite_manifest.mjs --check');
    expect(suiteScript).toContain('--write');
    expect(suiteScript).toContain('--check');
    expect(suiteScript).toContain('Fast suite changes:');
    expect(suiteScript).toContain('Guardrail suite changes:');
    expect(suiteScript).toContain('test_suite_manifest.json');
    expect(couplingScript).toContain('--json');
    expect(couplingScript).toContain('import_coupling_targets.json');
  });

  it('keeps dependency delta thresholds biased toward convergence instead of growth', () => {
    const thresholds = JSON.parse(readText('config/quality/dependency_delta_thresholds.json'));

    expect(thresholds.maxNodeDelta).toBeLessThanOrEqual(25);
    expect(thresholds.maxEdgeDelta).toBeLessThanOrEqual(80);
    expect(thresholds.maxAddedImports).toBeLessThanOrEqual(90);
    expect(thresholds.defaultMaxLayerDelta).toBeLessThanOrEqual(15);
    expect(thresholds.maxLayerDeltaByEdge['feature->feature']).toBeLessThanOrEqual(20);
    expect(thresholds.maxLayerDeltaByEdge['feature->legacy']).toBe(0);
    expect(thresholds.maxLayerDeltaByEdge['feature->core']).toBeLessThanOrEqual(12);
  });

  it('documents the fast and full verification commands in the README', () => {
    const readme = readText('README.md');

    expect(readme).toContain('npm run test:guardrails');
    expect(readme).toContain('npm run test:manifest:write');
    expect(readme).toContain('npm run quality:sync');
    expect(readme).toContain('npm run test:full');
    expect(readme).toContain('npm run deps:map:check');
    expect(readme).toContain('npm run quality:fast');
    expect(readme).toContain('npm run quality:full');
    expect(readme).toContain('npm run audit:structure');
  });

  it('documents the split test workflow in the repository contract', () => {
    const agents = readText('AGENTS.md');

    expect(agents).toContain('Run `npm test` for fast logic and behavior changes.');
    expect(agents).toContain('Run `npm run test:guardrails` for architecture, boundary, compat, or composition changes.');
    expect(agents).toContain('Run `npm run test:full` when a change spans both runtime behavior and guardrail coverage.');
    expect(agents).toContain('Run `npm run quality:sync` when test ownership and dependency-map outputs both changed.');
    expect(agents).toContain('Run `npm run deps:map:check` to verify generated dependency map outputs are current before handoff on dependency-flow changes.');
  });
});
