import { DATA } from '../ports/public_data_runtime_capabilities.js';
import {
  ensureCodexRecords,
  ensureCodexState,
} from '../ports/public_codex_state_capabilities.js';
import { createRunRuleProgressionPorts } from '../ports/create_run_rule_progression_ports.js';
import { ensureRunMeta } from '../domain/run_rules_meta.js';

export function resolveRunRuleClassIds(data = DATA) {
  return Object.keys(data?.classes || {});
}

export function ensureRunRuleMeta(meta, options = {}) {
  const curses = options.curses || {};
  const data = options.data || DATA;
  const ensureCodexStateRef = options.ensureCodexState || ensureCodexState;
  const ensureCodexRecordsRef = options.ensureCodexRecords || ensureCodexRecords;
  const runRuleProgressionPorts = options.runRuleProgressionPorts || createRunRuleProgressionPorts({
    classProgressionSystem: options.classProgressionSystem,
    reconcileMetaProgression: options.reconcileMetaProgression,
  });

  ensureRunMeta(meta, {
    curses,
    data,
    ensureCodexState: ensureCodexStateRef,
    ensureCodexRecords: ensureCodexRecordsRef,
    ensureClassProgressionMeta: (metaRef, classIds) => (
      runRuleProgressionPorts.ensureClassProgressionMeta(metaRef, classIds)
    ),
  });
  runRuleProgressionPorts.reconcileMetaProgression(meta);
}
