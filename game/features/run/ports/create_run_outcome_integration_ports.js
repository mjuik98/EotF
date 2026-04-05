import { evaluateAchievementTrigger } from '../../meta_progression/ports/public_achievement_application_capabilities.js';
import { ClassProgressionSystem } from '../../title/ports/public_class_progression_capabilities.js';

function persistRunOutcomeMeta(deps = {}) {
  const saveSystem = deps.saveSystem;
  const status = saveSystem?.saveMeta?.(deps);
  saveSystem?.showSaveStatus?.(status, deps);
  saveSystem?.clearSave?.();
}

export function createRunOutcomeIntegrationPorts() {
  return {
    awardRunXp: (gs, kind, options) => ClassProgressionSystem.awardRunXP(gs, kind, options),
    evaluateAchievements: (meta, eventName, payload) => evaluateAchievementTrigger(meta, eventName, payload),
    persistMeta: (persistDeps) => persistRunOutcomeMeta(persistDeps),
  };
}
