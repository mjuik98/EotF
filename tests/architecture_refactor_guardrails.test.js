import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('architecture refactor guardrails', () => {
  it('keeps feature code free of direct core global bridge imports', () => {
    const featureRoot = path.join(process.cwd(), 'game/features');
    const matches = [];

    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
          continue;
        }
        if (!entry.isFile() || !entry.name.endsWith('.js')) continue;

        const source = fs.readFileSync(fullPath, 'utf8');
        if (source.includes("from '../../../core/global_bridge.js'")
          || source.includes("from '../../core/global_bridge.js'")
          || source.includes("from '../core/global_bridge.js'")
          || source.includes("from './core/global_bridge.js'")) {
          matches.push(path.relative(process.cwd(), fullPath));
        }
      }
    };

    walk(featureRoot);
    expect(matches).toEqual([]);
  });

  it('keeps core run composition routed through the run public facade', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/platform/browser/composition/build_core_run_system_modules.js'),
      'utf8',
    );

    expect(source).toContain("from '../../../features/run/public.js'");
    expect(source).not.toContain("from '../../../features/run/application/");
  });

  it('routes core runtime bindings through feature ports/runtime surfaces', () => {
    const files = [
      'game/core/bootstrap/build_game_boot_action_groups.js',
      'game/core/bootstrap/build_runtime_subscriber_action_groups.js',
    ];

    for (const file of files) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toContain('/ports/runtime/');
    }
  });

  it('keeps game state runtime method ownership in shared/state', () => {
    const gameStateSource = fs.readFileSync(
      path.join(process.cwd(), 'game/core/game_state.js'),
      'utf8',
    );
    const compatSource = fs.readFileSync(
      path.join(process.cwd(), 'game/core/game_state_core_methods.js'),
      'utf8',
    );

    expect(gameStateSource).toContain("from '../shared/state/game_state_runtime_methods.js'");
    expect(gameStateSource).not.toContain("from './game_state_core_methods.js'");
    expect(compatSource).toContain("../shared/state/game_state_runtime_methods.js");
  });

  it('scans systems as a frozen compat surface', () => {
    const config = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'docs/metrics/compat_surface_allowlist.json'),
      'utf8',
    ));

    expect(config.scanDirs).toContain('game/systems');
  });

  it('keeps legacy game api adapters routed through feature public facades', () => {
    const legacyGameApiRoot = path.join(process.cwd(), 'game/platform/legacy/game_api');
    const matches = [];

    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
          continue;
        }
        if (!entry.isFile() || !entry.name.endsWith('.js')) continue;

        const source = fs.readFileSync(fullPath, 'utf8');
        if (source.includes('/features/') && source.includes('/application/')) {
          matches.push(path.relative(process.cwd(), fullPath));
        }
      }
    };

    walk(legacyGameApiRoot);
    expect(matches).toEqual([]);
  });

  it('keeps run region rules free of the core global bridge fallback', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/run_rules_regions.js'),
      'utf8',
    );

    expect(source).not.toContain("from '../core/global_bridge.js'");
    expect(source).not.toContain('GAME.State');
  });

  it('keeps run rules feature ownership free of legacy systems run-rule imports', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/run/application/run_rules.js'),
      'utf8',
    );

    expect(source).not.toContain("from '../../../systems/run_rules_");
    expect(source).toContain("from '../domain/run_rules_curses.js'");
    expect(source).toContain("from '../domain/run_rules_regions.js'");
    expect(source).toContain("from '../domain/run_rules_difficulty.js'");
    expect(source).toContain("from '../domain/run_rules_meta.js'");
  });

  it('keeps feature code free of direct systems imports', () => {
    const featureRoot = path.join(process.cwd(), 'game/features');
    const matches = [];

    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
          continue;
        }
        if (!entry.isFile() || !entry.name.endsWith('.js')) continue;

        const source = fs.readFileSync(fullPath, 'utf8');
        if (source.includes('/systems/')) {
          matches.push(path.relative(process.cwd(), fullPath));
        }
      }
    };

    walk(featureRoot);
    expect(matches).toEqual([]);
  });

  it('removes inline close handlers from the run settings modal shell', () => {
    const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    expect(html).not.toContain('onclick="closeRunSettings()"');
  });
});
