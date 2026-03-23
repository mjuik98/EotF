import { DATA } from '../ports/public_data_runtime_capabilities.js';
import {
  ensureCodexRecords,
  ensureCodexState,
} from '../ports/public_codex_state_capabilities.js';
import { ClassProgressionSystem } from '../../title/ports/public_progression_capabilities.js';
import { ensureRunMeta } from '../domain/run_rules_meta.js';

export function resolveRunRuleClassIds(data = DATA) {
  return Object.keys(data?.classes || {});
}

export function ensureRunRuleMeta(meta, options = {}) {
  const curses = options.curses || {};
  const data = options.data || DATA;
  const ensureCodexStateRef = options.ensureCodexState || ensureCodexState;
  const ensureCodexRecordsRef = options.ensureCodexRecords || ensureCodexRecords;
  const classProgressionSystem = options.classProgressionSystem || ClassProgressionSystem;

  ensureRunMeta(meta, {
    curses,
    data,
    ensureCodexState: ensureCodexStateRef,
    ensureCodexRecords: ensureCodexRecordsRef,
    ensureClassProgressionMeta: (metaRef, classIds) => classProgressionSystem.ensureMeta(metaRef, classIds),
  });
}
