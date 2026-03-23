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
    expect(packageJson.scripts.test).toBe('node scripts/run-vitest-suite.mjs fast');
    expect(packageJson.scripts['test:guardrails']).toBe('node scripts/run-vitest-suite.mjs guardrails');
    expect(packageJson.scripts['test:full']).toBe('node scripts/run-vitest-suite.mjs full');
    expect(packageJson.scripts['quality:full']).toContain('npm run test:coverage');
    expect(packageJson.scripts['quality:full']).toContain('npm run audit:structure');
    expect(packageJson.scripts['quality:full']).toContain('npm run build');
    expect(packageJson.scripts['quality:full']).toContain('npm run smoke:character-select');
    expect(packageJson.scripts.quality).toBe('npm run quality:full');
  });

  it('keeps the automated quality gate aligned with the local full workflow', () => {
    const workflow = readText('.github/workflows/quality-gate.yml');

    expect(workflow).toContain('- run: npm run lint');
    expect(workflow).toContain('- run: npm run test:coverage');
    expect(workflow).toContain('- run: npm run audit:structure');
    expect(workflow).toContain('- run: npm run build');
  });

  it('keeps coverage thresholds meaningfully above the bootstrap floor', () => {
    const vitestConfig = readText('vitest.config.js');

    expect(vitestConfig).toContain('lines: 70');
    expect(vitestConfig).toContain('functions: 55');
    expect(vitestConfig).toContain('statements: 70');
    expect(vitestConfig).toContain('branches: 60');
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
    expect(readme).toContain('npm run test:full');
    expect(readme).toContain('npm run quality:fast');
    expect(readme).toContain('npm run quality:full');
    expect(readme).toContain('npm run audit:structure');
  });

  it('documents the split test workflow in the repository contract', () => {
    const agents = readText('AGENTS.md');

    expect(agents).toContain('Run `npm test` for fast logic and behavior changes.');
    expect(agents).toContain('Run `npm run test:guardrails` for architecture, boundary, compat, or composition changes.');
    expect(agents).toContain('Run `npm run test:full` when a change spans both runtime behavior and guardrail coverage.');
  });
});
