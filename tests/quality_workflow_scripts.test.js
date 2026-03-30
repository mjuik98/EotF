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
    expect(packageJson.scripts['test:slow-report']).toBe('node scripts/report-slow-tests.mjs --suite fast');
    expect(packageJson.scripts['test:manifest']).toBe('node scripts/test_suite_manifest.mjs --check');
    expect(packageJson.scripts['test:manifest:write']).toBe('node scripts/test_suite_manifest.mjs --write');
    expect(packageJson.scripts.test).toBe('node scripts/run-vitest-suite.mjs fast');
    expect(packageJson.scripts['test:guardrails']).toBe('node scripts/run-vitest-suite.mjs guardrails');
    expect(packageJson.scripts['test:full']).toBe('node scripts/run-vitest-suite.mjs full');
    expect(packageJson.scripts['test:order-guard']).toBe('node scripts/check-vitest-order-dependence.mjs fast');
    expect(packageJson.scripts['deps:map:check']).toBe('node scripts/generate-dependency-map.mjs --check');
    expect(packageJson.scripts['quality:sync']).toBe('npm run test:manifest:write && npm run deps:map');
    expect(packageJson.scripts['quality:full']).toContain('npm run test:coverage');
    expect(packageJson.scripts['quality:full']).toContain('npm run audit:structure');
    expect(packageJson.scripts['quality:full']).toContain('npm run deps:map:check');
    expect(packageJson.scripts['quality:full']).toContain('npm run test:order-guard -- --runs 1 --sample 20');
    expect(packageJson.scripts['quality:full']).toContain('npm run build');
    expect(packageJson.scripts['quality:full']).toContain('npm run smoke:browser -- --reuse-dist');
    expect(packageJson.scripts.quality).toBe('npm run quality:full');
  });

  it('registers an order-dependence guard that shuffles the fast suite from the manifest', () => {
    const script = readText('scripts/check-vitest-order-dependence.mjs');

    expect(script).toContain('test_suite_manifest.json');
    expect(script).toContain('Math.random');
    expect(script).toContain('spawnSync');
    expect(script).toContain('CODEX_VITEST_SUITE');
    expect(script).toContain("suite = process.argv[2] || 'fast'");
  });

  it('keeps the automated quality gate aligned with the local full workflow', () => {
    const workflow = readText('.github/workflows/quality-gate.yml');
    const slowReportScript = readText('scripts/report-slow-tests.mjs');
    const smokeSuiteScript = readText('scripts/run_browser_smoke_suite.mjs');

    expect(workflow).toContain('- run: npm run test:manifest');
    expect(workflow).toContain('- run: npm run deps:map:check');
    expect(workflow).toContain('- run: npm run lint');
    expect(workflow).toContain('- run: npm run test:coverage');
    expect(workflow).toContain('- run: npm run test:slow-report -- --threshold-ms 1500 --top 10');
    expect(workflow).toContain('- run: npm run audit:structure');
    expect(workflow).toContain('- run: npm run test:order-guard -- --runs 1 --sample 20');
    expect(workflow).toContain('- run: npm run build');
    expect(workflow).toContain('SMOKE_URL=http://127.0.0.1:4173 npm run smoke:browser');
    expect(slowReportScript).toContain('GITHUB_STEP_SUMMARY');
    expect(smokeSuiteScript).toContain('GITHUB_STEP_SUMMARY');
    expect(smokeSuiteScript).toContain('SMOKE_DIST_DIR');
  });

  it('loads coverage thresholds from quality config', () => {
    const coverageThresholds = JSON.parse(readText('config/quality/coverage_thresholds.json'));
    const vitestConfig = readText('vitest.config.js');

    expect(coverageThresholds.lines).toBeGreaterThanOrEqual(80);
    expect(coverageThresholds.functions).toBeGreaterThanOrEqual(60);
    expect(coverageThresholds.statements).toBeGreaterThanOrEqual(80);
    expect(coverageThresholds.branches).toBeGreaterThanOrEqual(65);
    expect(vitestConfig).toContain("coverage_thresholds.json");
  });

  it('loads bundle budget and structural audit policy from quality config', () => {
    const bundleBudgets = JSON.parse(readText('config/quality/bundle_budgets.json'));
    const structuralAuditThresholds = JSON.parse(readText('config/quality/structural_audit_thresholds.json'));
    const packageJson = JSON.parse(readText('package.json'));
    const auditScript = readText('scripts/report-structural-audit.mjs');
    const budgetScript = readText('scripts/assert-bundle-budgets.mjs');

    expect(bundleBudgets.entryJs.maxBytes).toBe(400 * 1024);
    expect(bundleBudgets.entryCss.maxBytes).toBe(190 * 1024);
    expect(bundleBudgets.uiEventJs.maxBytes).toBe(44 * 1024);
    expect(bundleBudgets.uiCombatJs.maxBytes).toBe(384 * 1024);
    expect(bundleBudgets.codexUiJs.maxBytes).toBe(41280);
    expect(bundleBudgets.runModeUiJs.maxBytes).toBe(28 * 1024);
    expect(structuralAuditThresholds.maxThinReexports).toBe(0);
    expect(structuralAuditThresholds.maxCompatRootCounts['game/ui']).toBe(0);
    expect(structuralAuditThresholds.maxCompatRootCounts['game/app']).toBe(0);
    expect(structuralAuditThresholds.maxCompatRootCounts['game/combat']).toBe(0);
    expect(packageJson.scripts['audit:structure']).toContain('--strict');
    expect(auditScript).toContain('structural_audit_thresholds.json');
    expect(budgetScript).toContain('bundle_budgets.json');
  });

  it('registers a transition-surface audit script and documents its current output contract', async () => {
    const packageJson = JSON.parse(readText('package.json'));

    expect(packageJson.scripts['audit:transition-surfaces']).toBe('node scripts/report-transition-surface-audit.mjs');

    const { buildTransitionSurfaceAuditReport } = await import('../scripts/report-transition-surface-audit.mjs');
    const report = buildTransitionSurfaceAuditReport(process.cwd());

    expect(report.canonicalRoots).toEqual(['game/features', 'game/shared', 'game/platform']);
    expect(report.transitionalRoots).toEqual([
      'game/app',
      'game/combat',
      'game/domain',
      'game/presentation',
      'game/state',
      'game/systems',
      'game/ui',
    ]);
    expect(report.rootCounts).toHaveProperty('game/app');
    expect(report.rootCounts).toHaveProperty('game/ui');
    expect(report.rootCounts['game/features']).toBeGreaterThan(0);
    expect(report.rootCounts['game/domain']).toBeGreaterThanOrEqual(0);
    expect(report.rootCounts['game/systems']).toBeGreaterThanOrEqual(0);
    expect(report.totals.canonical).toBeGreaterThan(0);
    expect(report.totals.transitional).toBeGreaterThanOrEqual(0);
    expect(report.largestTransitionalRoots[0].root).toBeTypeOf('string');
    expect(report.transitionalRoots).toContain(report.largestTransitionalRoots[0].root);
    expect(report.largestTransitionalRoots[0].count).toBe(
      Math.max(...report.transitionalRoots.map((root) => report.rootCounts[root])),
    );
  });

  it('loads explicit suite ownership and coupling targets from quality config', () => {
    const suiteManifest = JSON.parse(readText('config/quality/test_suite_manifest.json'));
    const couplingTargets = JSON.parse(readText('config/quality/import_coupling_targets.json'));
    const lintScript = JSON.parse(readText('package.json')).scripts.lint;
    const suiteScript = readText('scripts/test_suite_manifest.mjs');
    const couplingScript = readText('scripts/check-import-coupling.mjs');
    const deprecatedCompatScript = readText('scripts/check-deprecated-compat-imports.mjs');

    expect(suiteManifest.fast.length).toBeGreaterThan(0);
    expect(suiteManifest.guardrails.length).toBeGreaterThan(0);
    expect(couplingTargets.maxTotal).toBe(217);
    expect(couplingTargets.maxByPair['feature->shared']).toBe(45);
    expect(couplingTargets.maxByPair['feature->platform']).toBe(15);
    expect(couplingTargets.maxByPair['feature->data']).toBe(13);
    expect(couplingTargets.maxByPair['feature->core']).toBe(18);
    expect(couplingTargets.maxByPair['feature->legacy']).toBe(1);
    expect(lintScript).toContain('node scripts/check-deprecated-compat-imports.mjs');
    expect(lintScript).toContain('node scripts/test_suite_manifest.mjs --check');
    expect(suiteScript).toContain('--write');
    expect(suiteScript).toContain('--check');
    expect(suiteScript).toContain('Fast suite changes:');
    expect(suiteScript).toContain('Guardrail suite changes:');
    expect(suiteScript).toContain('test_suite_manifest.json');
    expect(couplingScript).toContain('--json');
    expect(couplingScript).toContain('import_coupling_targets.json');
    expect(deprecatedCompatScript).toContain('public_feature_support_capabilities.js');
    expect(deprecatedCompatScript).toContain('public_shared_support_capabilities.js');
    expect(deprecatedCompatScript).toContain('shared_support_capabilities.js');
    expect(deprecatedCompatScript).toContain('public_core_support_capabilities.js');
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
    expect(readme).toContain('npm run audit:transition-surfaces');
    expect(readme).toContain('npm run quality:fast');
    expect(readme).toContain('npm run quality:full');
    expect(readme).toContain('npm run audit:structure');
    expect(readme).toContain('npm run smoke:browser');
    expect(readme).toContain('npm run test:slow-report');
  });

  it('documents the split test workflow in the repository contract', () => {
    const agents = readText('AGENTS.md');

    expect(agents).toContain('Run `npm test` for fast logic and behavior changes.');
    expect(agents).toContain('Run `npm run test:guardrails` for architecture, boundary, compat, or composition changes.');
    expect(agents).toContain('Run `npm run test:full` when a change spans both runtime behavior and guardrail coverage.');
    expect(agents).toContain('Run `npm run quality:sync` when test ownership and dependency-map outputs both changed.');
    expect(agents).toContain('Run `npm run deps:map:check` to verify generated dependency map outputs are current before handoff on dependency-flow changes.');
    expect(agents).toContain('Broad compat support barrels are deprecated and must not be used for new runtime imports.');
    expect(agents).toContain('Feature port files should prefer explicit `public_*` names; reserve `runtime_*` names for runtime debug or orchestration surfaces.');
  });

  it('keeps window-usage and state-mutation targets aligned with live files and current totals', () => {
    const windowTargets = JSON.parse(readText('config/quality/window_usage_targets.json'));
    const stateTargets = JSON.parse(readText('config/quality/state_mutation_targets.json'));

    expect(windowTargets.totalMax).toBe(4);
    expect(windowTargets.byKindMax.window).toBe(0);
    expect(windowTargets.byKindMax.document).toBe(2);
    expect(windowTargets.byKindMax.globalThis).toBe(2);
    expect(Object.keys(windowTargets.byFileMax)).toEqual([
      'game/utils/security.js',
      'engine/audio.js',
    ]);

    expect(stateTargets.totalMax).toBe(68);
    expect(Object.keys(stateTargets.byFileMax)).not.toContain('game/domain/combat/turn/end_player_turn_policy.js');
    expect(Object.keys(stateTargets.byFileMax)).not.toContain('game/domain/combat/turn/enemy_effect_resolver.js');
    expect(Object.keys(stateTargets.byFileMax)).not.toContain('game/domain/combat/turn/turn_state_mutators.js');

    for (const relPath of [
      ...Object.keys(windowTargets.byFileMax),
      ...Object.keys(stateTargets.byFileMax),
    ]) {
      expect(fs.existsSync(path.join(process.cwd(), relPath))).toBe(true);
    }
  });
});
