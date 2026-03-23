import path from 'node:path';

import { describe, expect, it } from 'vitest';
import { ROOT, readText, toPosix, walkJsFiles } from './helpers/guardrail_fs.js';

function readFullPath(fullPath) {
  return readText(toPosix(path.relative(ROOT, fullPath)));
}

describe('architecture refactor guardrails', () => {
  it('keeps feature code free of direct core global bridge imports', () => {
    const matches = [];

    for (const fullPath of walkJsFiles(path.join(ROOT, 'game/features'))) {
      const source = readFullPath(fullPath);
      if (source.includes("from '../../../core/global_bridge.js'")
        || source.includes("from '../../core/global_bridge.js'")
        || source.includes("from '../core/global_bridge.js'")
        || source.includes("from './core/global_bridge.js'")) {
        matches.push(path.relative(ROOT, fullPath));
      }
    }

    expect(matches).toEqual([]);
  });

  it('keeps core run composition routed through public run capability ports', () => {
    const source = readText('game/platform/browser/composition/build_core_run_system_modules.js');

    expect(source).toContain("from '../../../features/run/ports/public_system_capabilities.js'");
    expect(source).not.toContain("from '../../../features/run/application/");
  });

  it('keeps core progression composition routed through canonical feature/shared owners', () => {
    const source = readText('game/platform/browser/composition/build_core_progression_modules.js');

    expect(source).not.toContain("from '../../../combat/difficulty_scaler.js'");
    expect(source).not.toContain("from '../../../systems/set_bonus_system.js'");
    expect(source).not.toContain("from '../../../features/combat/domain/difficulty_scaler.js'");
    expect(source).toContain("from '../../../features/combat/ports/public_system_capabilities.js'");
    expect(source).toContain("from '../../../shared/progression/set_bonus_system.js'");
  });

  it('routes core runtime bindings through feature ports/runtime surfaces', () => {
    const files = [
      'game/core/bootstrap/build_game_boot_action_groups.js',
      'game/core/bootstrap/build_runtime_subscriber_action_groups.js',
    ];

    for (const file of files) {
      const source = readText(file);
      expect(source).toContain('/ports/runtime/');
    }
  });

  it('keeps game state runtime method ownership in shared/state', () => {
    const gameStateSource = readText('game/core/game_state.js');
    const storeStateSource = readText('game/core/store/game_state.js');
    const compatSource = readText('game/core/game_state_core_methods.js');

    expect(gameStateSource).toContain("from './store/game_state.js'");
    expect(gameStateSource).not.toContain('export const GS = {');
    expect(storeStateSource).toContain("from '../../shared/state/game_state_runtime_methods.js'");
    expect(storeStateSource).not.toContain("from '../game_state_core_methods.js'");
    expect(storeStateSource).not.toContain('attachCombatGameStateRuntimeMethods(GS)');
    expect(compatSource).toContain("../shared/state/game_state_runtime_methods.js");
  });

  it('keeps browser runtime GS exports canonical and pushes legacy GS facade wrapping into compat helpers', () => {
    const engineSource = readText('game/platform/browser/composition/build_core_engine_modules.js');
    const compatSource = readText('game/core/bindings/create_module_registry_flat_compat.js');

    expect(engineSource).not.toContain("from '../../../platform/legacy/state/legacy_game_state_runtime_facade.js'");
    expect(engineSource).not.toContain('createLegacyGameStateRuntimeFacade(GS)');
    expect(compatSource).toContain("../game_state_core_methods.js");
    expect(compatSource).toContain('createLegacyGameStateRuntimeFacade');
  });

  it('scans systems as a frozen compat surface', () => {
    const config = JSON.parse(readText('config/quality/compat_surface_allowlist.json'));

    expect(config.scanDirs).toContain('game/systems');
  });

  it('keeps legacy game api adapters routed through feature ports and runtime surfaces', () => {
    const matches = [];

    for (const fullPath of walkJsFiles(path.join(ROOT, 'game/platform/legacy/game_api'))) {
      const source = readFullPath(fullPath);
      if (source.includes('/features/') && source.includes('/application/')) {
        matches.push(path.relative(ROOT, fullPath));
      }
      expect(source.includes('/features/') && source.includes('/public.js')).toBe(false);
    }

    expect(matches).toEqual([]);
  });

  it('keeps core and platform code off feature public-surface aggregators', () => {
    const roots = ['game/core', 'game/platform'];
    const matches = [];

    roots
      .flatMap((dir) => walkJsFiles(dir))
      .forEach((fullPath) => {
        const relPath = toPosix(path.relative(ROOT, fullPath));
        const source = readFullPath(fullPath);
        if (/\/features\/.+(\/public\.js|\/ports\/public_surface\.js)/.test(source)) {
          matches.push(relPath);
        }
      });

    expect(matches).toEqual([]);
  });

  it('keeps legacy player-state fallback enablement inside platform/legacy only', () => {
    const matches = [];

    for (const fullPath of walkJsFiles(path.join(ROOT, 'game'))) {
      const relPath = toPosix(path.relative(ROOT, fullPath));
      if (relPath.startsWith('game/platform/legacy/')) continue;
      if (relPath === 'game/shared/state/player_state_commands.js') continue;
      if (relPath === 'game/shared/state/player_state_command_compat.js') continue;

      const source = readFullPath(fullPath);
      if (source.includes('enableLegacyPlayerStateCommandFallback')) {
        matches.push(relPath);
      }
    }

    expect(matches).toEqual([]);
  });

  it('keeps shared player-state commands free of legacy fallback flag literals', () => {
    const source = readText('game/shared/state/player_state_commands.js');

    expect(source).not.toContain('__legacyPlayerStateCommandFallback');
    expect(source).not.toContain("./player_state_command_fallback_flag.js");
    expect(source).toContain("../../platform/legacy/state/player_state_command_legacy_adapter.js");
  });

  it('keeps shared runtime methods routed through explicit legacy compat adapters for combat/card helpers', () => {
    const source = readText('game/shared/state/game_state_runtime_methods.js');

    expect(source).not.toContain("../../features/combat/application/card_methods_compat.js");
    expect(source).not.toContain("../../features/combat/application/combat_methods_compat.js");
    expect(source).toContain("./compat/game_state_card_runtime_compat_methods.js");
    expect(source).toContain("./compat/game_state_combat_runtime_compat_methods.js");
  });

  it('keeps run region rules free of the core global bridge fallback', () => {
    const source = readText('game/systems/run_rules_regions.js');

    expect(source).not.toContain("from '../core/global_bridge.js'");
    expect(source).not.toContain('GAME.State');
  });

  it('keeps run rules feature ownership free of legacy systems run-rule imports', () => {
    const source = readText('game/features/run/application/run_rules.js');

    expect(source).not.toContain("from '../../../systems/run_rules_");
    expect(source).toContain("from '../domain/run_rules_curses.js'");
    expect(source).toContain("from '../domain/run_rules_regions.js'");
    expect(source).toContain("from '../domain/run_rules_difficulty.js'");
    expect(source).toContain("from '../domain/run_rules_meta.js'");
  });

  it('keeps feature code free of direct systems imports', () => {
    const matches = [];

    for (const fullPath of walkJsFiles('game/features')) {
      const source = readFullPath(fullPath);
      if (source.includes('/systems/')) {
        matches.push(toPosix(path.relative(ROOT, fullPath)));
      }
    }

    expect(matches).toEqual([]);
  });

  it('keeps domain ownership free of combat compat helper imports', () => {
    const files = [
      'game/domain/class/class_mechanics.js',
      'game/domain/combat/turn/start_player_turn_policy.js',
      'game/domain/combat/turn/end_player_turn_policy.js',
    ];

    for (const file of files) {
      const source = readText(file);
      expect(source).not.toContain('/combat/class_mechanics.js');
      expect(source).not.toContain('/combat/turn_manager_helpers.js');
    }
  });

  it('keeps combat feature death flow routed through feature-owned helpers', () => {
    const files = [
      'game/features/combat/application/death_flow_actions.js',
      'game/features/combat/platform/death_runtime_ports.js',
    ];

    for (const file of files) {
      const source = readText(file);
      expect(source).not.toContain('/combat/death_handler_');
    }
  });

  it('keeps combat ui contracts free of GS playCard fallbacks', () => {
    const source = readText('game/features/combat/ports/contracts/build_combat_ui_contracts.js');

    expect(source).not.toContain('refs.GS?.playCard');
  });

  it('removes inline close handlers from the run settings modal shell', () => {
    const html = readText('index.html');
    expect(html).not.toContain('onclick="closeRunSettings()"');
  });

  it('keeps direct legacy global access inside platform/legacy only', () => {
    const matches = [];
    const blockedPatterns = [
      /\bwindow\.(?:GS|GAME|GameState)\b/,
      /\bglobalThis\.(?:GS|GAME|GameState)\b/,
    ];

    for (const fullPath of walkJsFiles('game')) {
      const relPath = toPosix(path.relative(ROOT, fullPath));
      if (relPath.startsWith('game/platform/legacy/')) continue;

      const source = readFullPath(fullPath);
      if (blockedPatterns.some((pattern) => pattern.test(source))) {
        matches.push(relPath);
      }
    }

    expect(matches).toEqual([]);
  });

  it('keeps combat hud shared view ports routed through platform browser effects', () => {
    const source = readText('game/features/combat/ports/hud_shared_view_ports.js');

    expect(source).toContain("from '../../../platform/browser/effects/button_feedback.js'");
    expect(source).not.toContain("from '../../../ui/feedback/button_feedback.js'");
  });

  it('keeps game state runtime methods routed through explicit shared compat adapters for combat/card helpers', () => {
    const source = readText('game/shared/state/game_state_runtime_methods.js');

    expect(source).toContain("from './compat/game_state_card_runtime_compat_methods.js'");
    expect(source).toContain("from './compat/game_state_combat_runtime_compat_methods.js'");
    expect(source).not.toContain("from '../../combat/card_methods.js'");
    expect(source).not.toContain("from '../../combat/combat_methods.js'");
  });

  it('routes event, run, and reward flow callers through canonical workflow owners', () => {
    const expectations = [
      [
        'game/features/event/application/create_event_ui_runtime.js',
        "from './workflows/event_choice_flow.js'",
        '../app/event_choice_flow_actions.js',
      ],
      [
        'game/features/run/presentation/browser/run_return_ui_runtime.js',
        "from '../../application/workflows/run_return_flow.js'",
        '../../application/run_return_actions.js',
      ],
      [
        'game/features/reward/presentation/browser/reward_ui.js',
        "from '../../application/workflows/show_reward_screen_workflow.js'",
        '../../application/show_reward_screen_runtime.js',
      ],
    ];

    for (const [file, allowedImport, blockedImport] of expectations) {
      const source = readText(file);
      expect(source).toContain(allowedImport);
      expect(source).not.toContain(blockedImport);
    }
  });

  it('keeps core card event subscribers as a thin combat feature compat surface', () => {
    const source = readText('game/core/event_subscribers_card_events.js').trim();

    expect(source).toBe(
      "export { registerCardEventSubscribers } from '../features/combat/ports/runtime/public_combat_runtime_surface.js';",
    );
  });

  it('keeps character-select mounting routed through the title runtime public surface', () => {
    const source = readText('game/core/bootstrap/mount_character_select.js');

    expect(source).toContain(
      "from '../../features/title/ports/runtime/public_title_runtime_surface.js'",
    );
    expect(source).not.toContain(
      "from '../../features/title/platform/browser/build_character_select_mount_payload.js'",
    );
  });
});
