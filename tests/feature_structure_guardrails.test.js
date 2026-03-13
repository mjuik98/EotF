import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const FEATURES_ROOT = path.join(ROOT, 'game', 'features');
const CONFIG = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'docs', 'metrics', 'feature_structure_targets.json'), 'utf8'),
);

function readSource(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

describe('feature structure guardrails', () => {
  it('keeps feature roots constrained to canonical and allowlisted transitional dirs', () => {
    const features = fs.readdirSync(FEATURES_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const featureName of features) {
      const featureDir = path.join(FEATURES_ROOT, featureName);
      const entries = fs.readdirSync(featureDir, { withFileTypes: true });
      const actualDirs = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
      const actualFiles = entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .sort();
      const allowedDirs = new Set([
        ...CONFIG.canonicalTopLevelDirs,
        ...(CONFIG.allowedExtraDirsByFeature[featureName] || []),
      ]);
      const allowedFiles = new Set([
        ...CONFIG.requiredRootFiles,
        ...(CONFIG.allowedExtraRootFilesByFeature[featureName] || []),
      ]);

      expect(actualFiles).toContain('public.js');
      expect(actualDirs.filter((dirName) => !allowedDirs.has(dirName))).toEqual([]);
      expect(actualFiles.filter((fileName) => !allowedFiles.has(fileName))).toEqual([]);
    }
  });

  it('keeps feature contract capability imports on public facades only', () => {
    const source = readSource('game/core/deps/contracts/create_feature_contract_capabilities.js');
    const importSpecs = [...source.matchAll(/from ['"]([^'"]+)['"]/g)].map((match) => match[1]);

    expect(importSpecs).toEqual([
      '../../../features/combat/public.js',
      '../../../features/event/public.js',
      '../../../features/reward/public.js',
      '../../../features/run/public.js',
      '../../../features/title/public.js',
      '../../../features/ui/public.js',
    ]);
  });

  it('keeps core deps contract builders free of direct feature imports', () => {
    const files = [
      'game/core/deps/contracts/core_contract_builders.js',
      'game/core/deps/contracts/run_contract_builders.js',
      'game/core/deps/contracts/ui_contract_builders.js',
    ];

    for (const file of files) {
      const source = readSource(file);
      expect(source).not.toMatch(/features\//);
      expect(source).toMatch(/create_feature_contract_capabilities/);
    }
  });

  it('exposes ui shell contract capabilities through the ui feature facade', () => {
    const source = readSource('game/features/ui/public.js');

    expect(source).toMatch(/export function createUiContractCapabilities/);
    expect(source).toMatch(/buildShell: buildUiShellContractPublicBuilders/);
    expect(source).toMatch(/contracts: createUiContractCapabilities\(\)/);
  });
});
