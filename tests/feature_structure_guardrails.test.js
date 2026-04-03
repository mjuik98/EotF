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

function collectJsFilesRecursive(dirPath) {
  const files = [];

  if (!fs.existsSync(dirPath)) return files;

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJsFilesRecursive(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files.sort();
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
      combat: ['app', 'bindings', 'modules', 'runtime'],
      event: ['app'],
      run: ['app', 'bindings', 'modules', 'runtime', 'ui'],
      title: ['app', 'ui'],
      ui: ['app'],
    });

    for (const [featureName, dirNames] of Object.entries(thinWrapperDirsByFeature)) {
      for (const dirName of dirNames) {
        const dirPath = path.join(FEATURES_ROOT, featureName, dirName);
        const files = collectJsFilesRecursive(dirPath);

        expect(files.length).toBeGreaterThan(0);

        for (const filePath of files) {
          const source = readText(path.relative(ROOT, filePath));
          expect(source).toMatch(thinWrapperPattern);
        }
      }
    }
  });

  it('keeps feature contract capability imports constrained to feature-owned capability creator modules', () => {
    const source = readSource('game/core/deps/contracts/create_feature_contract_capabilities.js');
    const importSpecs = [...source.matchAll(/from ['"]([^'"]+)['"]/g)].map((match) => match[1]);

    expect(importSpecs).toEqual([
      '../../../features/ui/ports/public_feature_contract_capability_catalog.js',
    ]);
  });

  it('keeps core deps contract builders free of direct feature imports', () => {
    const files = [
      'game/core/deps/contracts/core_contract_builders.js',
      'game/core/deps/contracts/build_combat_turn_base_contract.js',
      'game/core/deps/contracts/build_reward_contract.js',
      'game/core/deps/contracts/build_save_system_contract.js',
      'game/core/deps/contracts/run_contract_builders.js',
      'game/core/deps/contracts/ui_contract_builders.js',
    ];

    for (const file of files) {
      const source = readSource(file);
      expect(source).not.toMatch(/features\//);
    }
  });

  it('keeps the core contract registry as a thin coordinator over local builder helpers', () => {
    const source = readSource('game/core/deps/contracts/core_contract_builders.js');

    expect(source).toContain("./build_combat_turn_base_contract.js");
    expect(source).toContain("./build_reward_contract.js");
    expect(source).toContain("./build_save_system_contract.js");
    expect(source).toContain("./build_feature_contract_builder_group.js");
    expect(source).not.toContain('enemyTurn:');
    expect(source).not.toContain('showRewardScreen:');
    expect(source).not.toContain('runRules:');
  });

  it('keeps the dep contract registry delegated through local contract builder group helpers', () => {
    const source = readSource('game/core/deps_contract_registry.js');

    expect(source).toContain("./deps/contracts/build_contract_builder_groups.js");
    expect(source).toContain('buildContractBuilderGroups');
    expect(source).toContain('mergeContractBuilderGroups');
    expect(source).not.toContain("from './deps/contracts/core_contract_builders.js'");
    expect(source).not.toContain("from './deps/contracts/ui_contract_builders.js'");
    expect(source).not.toContain("from './deps/contracts/run_contract_builders.js'");
  });

  it('creates feature contract capabilities once at the group-assembly boundary', () => {
    const groupSource = readSource('game/core/deps/contracts/build_contract_builder_groups.js');
    const coreSource = readSource('game/core/deps/contracts/core_contract_builders.js');
    const uiSource = readSource('game/core/deps/contracts/ui_contract_builders.js');
    const runSource = readSource('game/core/deps/contracts/run_contract_builders.js');

    expect(groupSource).toContain("./create_feature_contract_capabilities.js");
    expect(groupSource).toContain('createFeatureContractCapabilities');
    expect(groupSource).toContain('featureContracts');
    expect(coreSource).not.toContain('createFeatureContractCapabilities');
    expect(uiSource).not.toContain('createFeatureContractCapabilities');
    expect(runSource).not.toContain('createFeatureContractCapabilities');
  });

  it('routes feature contract builder aggregation through a shared local helper', () => {
    const coreSource = readSource('game/core/deps/contracts/core_contract_builders.js');
    const uiSource = readSource('game/core/deps/contracts/ui_contract_builders.js');
    const runSource = readSource('game/core/deps/contracts/run_contract_builders.js');

    expect(coreSource).toContain("./build_feature_contract_builder_group.js");
    expect(uiSource).toContain("./build_feature_contract_builder_group.js");
    expect(runSource).toContain("./build_feature_contract_builder_group.js");
    expect(coreSource).toContain('buildFeatureContractBuilderGroup');
    expect(uiSource).toContain('buildFeatureContractBuilderGroup');
    expect(runSource).toContain('buildFeatureContractBuilderGroup');
  });

  it('keeps extracted core contract helpers free of feature capability wiring', () => {
    const files = [
      'game/core/deps/contracts/build_combat_turn_base_contract.js',
      'game/core/deps/contracts/build_reward_contract.js',
      'game/core/deps/contracts/build_save_system_contract.js',
    ];

    for (const file of files) {
      const source = readSource(file);
      expect(source).not.toMatch(/create_feature_contract_capabilities/);
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
    expect(sectionSource).toContain("./character_select_info_panel_summary_section.js");
    expect(sectionSource).toContain("./character_select_info_panel_details_section.js");
    expect(sectionSource).toContain("./character_select_info_panel_section_helpers.js");
    expect(sectionSource).toContain('buildCharacterInfoSummarySection');
    expect(sectionSource).toContain('buildCharacterInfoDetailsSection');
  });

  it('keeps top-level ui and combat port naming on explicit public/runtime patterns', () => {
    const uiPortFiles = fs.readdirSync(path.join(FEATURES_ROOT, 'ui', 'ports'))
      .filter((entry) => entry.endsWith('.js'))
      .sort();
    const combatPortFiles = fs.readdirSync(path.join(FEATURES_ROOT, 'combat', 'ports'))
      .filter((entry) => entry.endsWith('.js'))
      .sort();

    const allowedUiNonPublic = new Set([
      'create_ui_ports.js',
      'ending_screen_runtime_ports.js',
      'runtime_debug_snapshot.js',
    ]);
    const allowedCombatNonPublic = new Set([
      'combat_logging.js',
      'create_combat_ports.js',
      'help_pause_combat_ports.js',
      'hud_shared_view_ports.js',
      'player_turn_policy_ports.js',
      'presentation_shared_runtime_capabilities.js',
      'runtime_debug_snapshot.js',
      'tooltip_ui_ports.js',
    ]);

    expect(uiPortFiles.filter((file) => !file.startsWith('public_') && !allowedUiNonPublic.has(file))).toEqual([]);
    expect(combatPortFiles.filter((file) => !file.startsWith('public_') && !allowedCombatNonPublic.has(file))).toEqual([]);
    expect(uiPortFiles).toContain('runtime_debug_snapshot.js');
    expect(combatPortFiles).toContain('runtime_debug_snapshot.js');
  });
});
