import { DATA } from '../ports/public_data_runtime_capabilities.js';
import { getRunCurseDefinition } from '../domain/run_rules_curses.js';
import { ClassProgressionSystem } from '../../title/ports/public_progression_capabilities.js';
import {
  applyPlayerMaxHpPenalty,
  applySilenceCurseTurnStart,
} from '../state/run_outcome_state_commands.js';
import { resolveRunRuleClassIds } from './run_rule_meta.js';

export function applyRunStartEffects(gs, options = {}) {
  if (!gs?.meta || !gs?.player) return;

  const ensureMeta = options.ensureMeta || (() => {});
  const getAscension = options.getAscension || (() => 0);
  const curses = options.curses || {};
  const data = options.data || DATA;
  const classProgressionSystem = options.classProgressionSystem || ClassProgressionSystem;

  ensureMeta(gs.meta);
  const asc = getAscension(gs);
  const cfg = gs.runConfig || {};
  const ascHpLoss = Math.min(20, asc * 2);
  const classIds = resolveRunRuleClassIds(data);

  applyPlayerMaxHpPenalty(gs, ascHpLoss);

  const curseDef = getRunCurseDefinition(cfg.curse, curses);
  if (curseDef.runStartMaxHpPenalty) applyPlayerMaxHpPenalty(gs, curseDef.runStartMaxHpPenalty);

  classProgressionSystem.applyRunStartBonuses(gs, {
    classIds,
    data,
  });
}

export function applyCombatStartEffects(gs, options = {}) {
  if (!gs?.player) return;
  const classProgressionSystem = options.classProgressionSystem || ClassProgressionSystem;

  classProgressionSystem.applyCombatStartBonuses(gs, {
    classIds: resolveRunRuleClassIds(options.data || DATA),
  });
}

export function applyCombatDeckReadyEffects(gs, options = {}) {
  if (!gs?.player) return;
  const data = options.data || DATA;
  const classProgressionSystem = options.classProgressionSystem || ClassProgressionSystem;

  classProgressionSystem.applyDeckReadyBonuses(gs, {
    classIds: resolveRunRuleClassIds(data),
    data,
  });
}

export function applyTurnStartEffects(gs) {
  if (!gs?.player || !gs?.combat) return;

  if (getRunCurseDefinition(gs.runConfig?.curse).limitsEarlyTurnEnergy) {
    applySilenceCurseTurnStart(gs);
  }
}

export function applyCombatEndEffects(gs) {
  if (!gs?.player) return;

  const curseDef = getRunCurseDefinition(gs.runConfig?.curse);
  if (curseDef.combatEndMaxHpPenalty) applyPlayerMaxHpPenalty(gs, curseDef.combatEndMaxHpPenalty);
}
