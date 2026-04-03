import { evaluateAchievementTrigger } from '../../meta_progression/public.js';
import { ClassProgressionSystem } from '../../title/ports/public_progression_capabilities.js';

function persistRunOutcomeMeta(deps = {}) {
  const saveSystem = deps.saveSystem;
  const status = saveSystem?.saveMeta?.(deps);
  saveSystem?.showSaveStatus?.(status, deps);
  saveSystem?.clearSave?.();
}

export function resolveRunOutcomeExternalPorts(deps = {}) {
  const ports = deps.externalPorts || {};

  return {
    awardRunXp: ports.awardRunXp || ((gs, kind, options) => ClassProgressionSystem.awardRunXP(gs, kind, options)),
    evaluateAchievements: ports.evaluateAchievements || ((meta, eventName, payload) => evaluateAchievementTrigger(meta, eventName, payload)),
    persistMeta: ports.persistMeta || ((persistDeps) => persistRunOutcomeMeta(persistDeps)),
  };
}
