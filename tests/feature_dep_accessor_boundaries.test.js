import { describe, expect, it } from 'vitest';
import { readText } from './helpers/guardrail_fs.js';

describe('feature dep accessor boundaries', () => {
  it('keeps feature-owned contract maps near feature dep providers', () => {
    const expectations = {
      'game/features/combat/ports/create_combat_ports.js': [
        'const COMBAT_DEP_CONTRACTS',
        'Deps.buildFeatureContractAccessors',
        "getBaseCardDeps: 'baseCard'",
        "getFeedbackDeps: 'feedback'",
      ],
      'game/features/event/ports/create_event_reward_ports.js': [
        'const EVENT_REWARD_DEP_CONTRACTS',
        'Deps.buildFeatureContractAccessors',
        "getEventDeps: 'event'",
        "getRewardFlowDeps: 'rewardFlow'",
      ],
      'game/features/ui/ports/create_ui_ports.js': [
        'const UI_DEP_CONTRACTS',
        'Deps.buildFeatureContractAccessors',
        "getCodexDeps: 'codex'",
        "getCombatHudDeps: 'combatHud'",
      ],
      'game/features/run/ports/create_run_canvas_ports.js': [
        'const RUN_CANVAS_DEP_CONTRACTS',
        'Deps.buildFeatureContractAccessors',
        "getRunNodeHandoffDeps: 'runNodeHandoff'",
        "getWorldCanvasDeps: 'worldCanvas'",
      ],
      'game/features/title/platform/browser/title_dep_providers.js': [
        'const TITLE_DEP_CONTRACTS',
        'Deps.buildFeatureContractAccessors',
        "getRunModeDeps: 'runMode'",
        "getSettingsDeps: 'settings'",
      ],
    };

    for (const [file, patterns] of Object.entries(expectations)) {
      const source = readText(file);
      for (const pattern of patterns) {
        expect(source).toContain(pattern);
      }
    }
  });

  it('avoids direct core getter calls inside feature dep provider modules', () => {
    const expectations = {
      'game/features/combat/ports/create_combat_ports.js': [
        'Deps.baseCardDeps(',
        'Deps.getCardTargetDeps(',
        'Deps.getCombatTurnBaseDeps(',
        'Deps.getFeedbackDeps(',
      ],
      'game/features/event/ports/create_event_reward_ports.js': [
        'Deps.getEventDeps(',
        'Deps.getRewardDeps(',
        'Deps.getRewardFlowDeps(',
        'Deps.getRunReturnDeps(',
      ],
      'game/features/event/ports/event_ports.js': [
        'depsFactory.getEventDeps(',
      ],
      'game/features/event/ports/reward_ports.js': [
        'depsFactory.getRewardDeps(',
        'depsFactory.getRewardFlowDeps(',
        'depsFactory.getRunReturnDeps(',
      ],
      'game/features/ui/ports/create_ui_ports.js': [
        'Deps.getCodexDeps(',
        'Deps.getCombatHudDeps(',
        'Deps.getCombatInfoDeps(',
        'Deps.getDeckModalDeps(',
        'Deps.getHudUpdateDeps(',
        'Deps.getScreenDeps(',
        'Deps.getTooltipDeps(',
      ],
      'game/features/run/ports/create_run_canvas_ports.js': [
        'Deps.getRunNodeHandoffDeps(',
        'Deps.getWorldCanvasDeps(',
      ],
      'game/features/title/platform/browser/title_dep_providers.js': [
        'depsFactory.getClassSelectDeps(',
        'depsFactory.getRunModeDeps(',
        'depsFactory.getMetaProgressionDeps(',
        'depsFactory.getRegionTransitionDeps(',
        'depsFactory.getHelpPauseDeps(',
        'depsFactory.getSaveSystemDeps(',
        'depsFactory.getRunStartDeps(',
        'depsFactory.getRunSetupDeps(',
        'depsFactory.getSettingsDeps(',
      ],
    };

    for (const [file, forbiddenPatterns] of Object.entries(expectations)) {
      const source = readText(file);
      for (const pattern of forbiddenPatterns) {
        expect(source).not.toContain(pattern);
      }
    }
  });

  it('centralizes feature dep-accessor fallback policy in one core helper', () => {
    const files = [
      'game/features/combat/ports/create_combat_ports.js',
      'game/features/event/ports/create_event_reward_ports.js',
      'game/features/ui/ports/create_ui_ports.js',
      'game/features/run/ports/create_run_canvas_ports.js',
      'game/features/title/platform/browser/title_dep_providers.js',
      'game/core/bootstrap/create_bootstrap_dep_providers.js',
      'game/platform/legacy/game_api_run_bindings.js',
    ];

    for (const file of files) {
      const source = readText(file);
      expect(source).toContain('buildFeatureContractAccessors');
      expect(source).not.toContain('function buildDepAccessors(');
      expect(source).not.toContain('Object.prototype.hasOwnProperty.call(Deps, \'buildContractDepAccessors\')');
    }
  });
});
