import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('system compat re-exports', () => {
  it('keeps legacy systems files as thin feature re-exports once ownership moves', () => {
    const classProgressionSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/class_progression_system.js'),
      'utf8',
    ).trim();
    const runRulesSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/run_rules.js'),
      'utf8',
    ).trim();
    const saveSystemSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/save_system.js'),
      'utf8',
    ).trim();
    const setBonusSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/set_bonus_system.js'),
      'utf8',
    ).trim();
    const runRulesCursesSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/run_rules_curses.js'),
      'utf8',
    ).trim();
    const runRulesRegionsSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/run_rules_regions.js'),
      'utf8',
    ).trim();
    const runRulesDifficultySource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/run_rules_difficulty.js'),
      'utf8',
    ).trim();
    const runRulesMetaSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/run_rules_meta.js'),
      'utf8',
    ).trim();

    expect(classProgressionSource).toBe(
      "export { ClassProgressionSystem } from '../features/title/domain/class_progression_system.js';",
    );
    expect(runRulesSource).toContain("from '../features/run/application/run_rules.js';");
    expect(runRulesSource).toContain('export function finalizeRunOutcome(');
    expect(runRulesSource).toContain('getCompatGameState');
    expect(saveSystemSource).toBe(
      "export { SaveSystem } from '../shared/save/save_system.js';",
    );
    expect(setBonusSource).toBe(
      "export { SetBonusSystem } from '../features/combat/domain/set_bonus_system.js';",
    );
    expect(runRulesCursesSource).toBe(
      "export { CURSES } from '../features/run/domain/run_rules_curses.js';",
    );
    expect(runRulesRegionsSource).toBe([
      'export {',
      '  getBaseRegionIndex,',
      '  getRegionCount,',
      '  getRegionData,',
      '  getRegionIdForStage,',
      "} from '../features/run/domain/run_rules_regions.js';",
    ].join('\n'));
    expect(runRulesDifficultySource).toBe([
      'export {',
      '  getAscension,',
      '  getDifficultyScore,',
      '  getEnemyScaleMultiplier,',
      '  getHealAmount,',
      '  getInscriptionScoreAdjustment,',
      '  getRewardMultiplier,',
      '  getShopCost,',
      '  isEndless,',
      "} from '../features/run/domain/run_rules_difficulty.js';",
    ].join('\n'));
    expect(runRulesMetaSource).toBe(
      "export { ensureRunMeta } from '../features/run/domain/run_rules_meta.js';",
    );
  });
});
