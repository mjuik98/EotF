import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';
import { ROOT, readText } from './helpers/guardrail_fs.js';

const FEATURES_ROOT = path.join(ROOT, 'game', 'features');
const CONFIG = JSON.parse(
  readText('config/quality/feature_structure_targets.json'),
);

function readSource(relPath) {
  return readText(relPath);
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

  it('keeps configured transitional wrapper dirs as thin re-export surfaces', () => {
    const thinWrapperDirsByFeature = CONFIG.thinWrapperDirsByFeature || {};
    const thinWrapperPattern = /^\s*(?:export\s+(?:\*|\{[\s\S]*?\})\s+from\s+['"][^'"]+['"];?\s*)+$/;

    expect(thinWrapperDirsByFeature).toEqual({
      combat: ['bindings', 'modules', 'runtime'],
      run: ['bindings', 'modules', 'runtime', 'ui'],
      title: ['ui'],
    });

    for (const [featureName, dirNames] of Object.entries(thinWrapperDirsByFeature)) {
      for (const dirName of dirNames) {
        const dirPath = path.join(FEATURES_ROOT, featureName, dirName);
        const files = fs.existsSync(dirPath)
          ? fs.readdirSync(dirPath)
            .filter((entry) => entry.endsWith('.js'))
            .sort()
          : [];

        expect(files.length).toBeGreaterThan(0);

        for (const fileName of files) {
          const source = readText(path.relative(ROOT, path.join(dirPath, fileName)));
          expect(source).toMatch(thinWrapperPattern);
        }
      }
    }
  });

  it('keeps feature contract capability imports constrained to feature-owned capability creator modules', () => {
    const source = readSource('game/core/deps/contracts/create_feature_contract_capabilities.js');
    const importSpecs = [...source.matchAll(/from ['"]([^'"]+)['"]/g)].map((match) => match[1]);

    expect(importSpecs).toEqual([
      '../../../features/combat/ports/public_contract_capabilities.js',
      '../../../features/event/ports/public_contract_capabilities.js',
      '../../../features/reward/ports/public_contract_capabilities.js',
      '../../../features/run/ports/public_contract_capabilities.js',
      '../../../features/title/ports/public_contract_capabilities.js',
      '../../../features/ui/ports/public_contract_capabilities.js',
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

    expect(source).toContain("./ports/public_surface.js");
  });

  it('keeps large feature browser entrypoints routed through subdomain aggregators', () => {
    const combatSource = readSource('game/features/combat/platform/browser/combat_browser_modules.js');
    const runSource = readSource('game/features/run/platform/browser/run_browser_modules.js');

    expect(combatSource).toContain('./public_combat_core_browser_modules.js');
    expect(combatSource).toContain('./public_combat_card_browser_modules.js');
    expect(combatSource).toContain('./public_combat_hud_browser_modules.js');
    expect(runSource).toContain('/presentation/browser/map/');
    expect(runSource).toContain('/presentation/browser/transition/');
  });

  it('keeps the character info panel shell delegated to section builders', () => {
    const panelSource = readSource('game/features/title/platform/browser/character_select_info_panel.js');
    const sectionSource = readSource('game/features/title/platform/browser/character_select_info_panel_sections.js');

    expect(panelSource).toContain("./character_select_info_panel_sections.js");
    expect(sectionSource).toContain('buildCharacterInfoSummarySection');
    expect(sectionSource).toContain('buildCharacterInfoDetailsSection');
  });
});
