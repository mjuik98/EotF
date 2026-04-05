import { ClassProgressionSystem } from '../../title/ports/public_class_progression_capabilities.js';
import { reconcileMetaProgression } from '../../meta_progression/ports/public_achievement_application_capabilities.js';

export function createRunRuleProgressionPorts(options = {}) {
  const classProgressionSystem = options.classProgressionSystem || ClassProgressionSystem;
  const reconcileMetaProgressionFn = options.reconcileMetaProgression || reconcileMetaProgression;

  return {
    ensureClassProgressionMeta(meta, classIds) {
      return classProgressionSystem.ensureMeta(meta, classIds);
    },

    reconcileMetaProgression(meta) {
      return reconcileMetaProgressionFn(meta);
    },

    applyRunStartBonuses(gs, runtimeOptions) {
      return classProgressionSystem.applyRunStartBonuses(gs, runtimeOptions);
    },

    applyCombatStartBonuses(gs, runtimeOptions) {
      return classProgressionSystem.applyCombatStartBonuses(gs, runtimeOptions);
    },

    applyDeckReadyBonuses(gs, runtimeOptions) {
      return classProgressionSystem.applyDeckReadyBonuses(gs, runtimeOptions);
    },
  };
}
