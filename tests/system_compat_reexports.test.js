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
    const eventManagerSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/event_manager.js'),
      'utf8',
    ).trim();
    const codexRecordsSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/codex_records_system.js'),
      'utf8',
    ).trim();
    const itemSystemSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/item_system.js'),
      'utf8',
    ).trim();
    const inscriptionSystemSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/inscription_system.js'),
      'utf8',
    ).trim();
    const saveOutboxMetricsSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/save/save_outbox_metrics.js'),
      'utf8',
    ).trim();
    const saveOutboxQueueSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/save/save_outbox_queue.js'),
      'utf8',
    ).trim();
    const saveRepositorySource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/save/save_repository.js'),
      'utf8',
    ).trim();
    const saveMigrationsSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/save_migrations.js'),
      'utf8',
    ).trim();

    expect(classProgressionSource).toBe(
      "export { ClassProgressionSystem } from '../features/title/domain/class_progression_system.js';",
    );
    expect(runRulesSource).toBe(
      "export { finalizeRunOutcome, getBaseRegionIndex, getRegionCount, getRegionData, getRegionIdForStage, RunRules } from '../platform/legacy/run_rules_compat.js';",
    );
    expect(saveSystemSource).toBe(
      "export { SaveSystem } from '../shared/save/save_system.js';",
    );
    expect(setBonusSource).toBe(
      "export { SetBonusSystem } from '../shared/progression/set_bonus_system.js';",
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
    expect(eventManagerSource).toBe(
      "export { EventManager } from '../features/event/application/event_manager_compat.js';",
    );
    expect(codexRecordsSource).toBe(
      "export { ensureCodexRecords, ensureCodexState, getCardUpgradeId, isCardUpgradeVariant, registerCardDiscovered, registerCardUsed, registerEnemyEncounter, registerEnemyKill, registerItemFound, resolveCodexCardId } from '../shared/codex/codex_records.js';",
    );
    expect(itemSystemSource).toBe(
      "export { ItemSystem } from '../shared/progression/item_system.js';",
    );
    expect(inscriptionSystemSource).toBe(
      "export { InscriptionSystem } from '../shared/progression/inscription_system.js';",
    );
    expect(saveOutboxMetricsSource).toBe([
      'export {',
      '  createOutboxMetrics,',
      '  summarizeOutboxMetrics,',
      "} from '../../shared/save/save_outbox_metrics.js';",
    ].join('\n'));
    expect(saveOutboxQueueSource).toBe([
      'export {',
      '  OUTBOX_RETRY_BASE_MS,',
      '  OUTBOX_RETRY_MAX_MS,',
      '  clearOutboxTimer,',
      '  cloneSnapshot,',
      '  dropOutboxKey,',
      '  flushOutboxQueue,',
      '  persistWithOutbox,',
      '  scheduleOutboxFlush,',
      '  upsertOutboxEntry,',
      "} from '../../shared/save/save_outbox_queue.js';",
    ].join('\n'));
    expect(saveRepositorySource).toBe([
      'export {',
      '  buildMetaSave,',
      '  buildRunSave,',
      '  ensureMetaRunConfig,',
      '  getDoc,',
      '  getGS,',
      '  hydrateMetaState,',
      '  hydrateRunState,',
      '  validateRunSaveData,',
      "} from '../../shared/save/save_repository.js';",
    ].join('\n'));
    expect(saveMigrationsSource).toBe([
      'export {',
      '  META_SAVE_VERSION,',
      '  RUN_SAVE_VERSION,',
      '  migrateMetaSave,',
      '  migrateRunSave,',
      "} from '../shared/save/save_migrations.js';",
    ].join('\n'));
  });
});
