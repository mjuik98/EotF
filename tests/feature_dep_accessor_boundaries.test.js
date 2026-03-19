import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('feature dep accessor boundaries', () => {
  it('keeps feature-owned contract maps near feature dep providers', () => {
    const expectations = {
      'game/features/combat/ports/create_combat_ports.js': [
        'const COMBAT_DEP_CONTRACTS',
        'createDepsAccessors',
        "getBaseCardDeps: 'baseCard'",
        "getFeedbackDeps: 'feedback'",
      ],
      'game/features/event/ports/create_event_reward_ports.js': [
        'const EVENT_REWARD_DEP_CONTRACTS',
        'createDepsAccessors',
        "getEventDeps: 'event'",
        "getRewardFlowDeps: 'rewardFlow'",
      ],
      'game/features/ui/ports/create_ui_ports.js': [
        'const UI_DEP_CONTRACTS',
        'createDepsAccessors',
        "getCodexDeps: 'codex'",
        "getCombatHudDeps: 'combatHud'",
      ],
      'game/features/run/ports/create_run_canvas_ports.js': [
        'const RUN_CANVAS_DEP_CONTRACTS',
        'createDepsAccessors',
        "getRunNodeHandoffDeps: 'runNodeHandoff'",
        "getWorldCanvasDeps: 'worldCanvas'",
      ],
      'game/features/title/platform/browser/title_dep_providers.js': [
        'const TITLE_DEP_CONTRACTS',
        'createDepsAccessors',
        "getRunModeDeps: 'runMode'",
        "getSettingsDeps: 'settings'",
      ],
    };

    for (const [file, patterns] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
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
      const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
      for (const pattern of forbiddenPatterns) {
        expect(source).not.toContain(pattern);
      }
    }
  });
});
