import {
  bindSaveNotifications,
  bindSaveStorage,
  SaveSystem,
} from '../../../shared/save/public.js';
import { GS } from '../../../core/store/public.js';
import { SaveAdapter } from '../../storage/save_adapter.js';
import { createRunSystemCapabilities } from '../../../features/run/ports/public_system_capabilities.js';
import { createSaveRuntimeNotifications } from '../notifications/save_runtime_notifications.js';
import { presentSaveStatus } from '../notifications/save_status_presenter.js';

export function buildCoreRunSystemModules() {
  const saveNotifications = createSaveRuntimeNotifications({ presentSaveStatus });
  const runtimeSaveAdapter = {
    load(key, deps = {}) {
      return SaveAdapter.load(key, deps);
    },
    save(key, data, deps = {}) {
      return SaveAdapter.save(key, data, {
        ...deps,
        notifyStorageFailure: deps.notifyStorageFailure || saveNotifications.storageFailure,
      });
    },
    remove(key, deps = {}) {
      return SaveAdapter.remove(key, deps);
    },
    has(key, deps = {}) {
      return SaveAdapter.has(key, deps);
    },
  };

  bindSaveStorage(runtimeSaveAdapter);
  bindSaveNotifications(saveNotifications);
  const { rules, runtime } = createRunSystemCapabilities();

  return {
    SaveSystem,
    RunRules: rules.RunRules,
    getRegionData: rules.getRegionData,
    getBaseRegionIndex: rules.getBaseRegionIndex,
    getRegionCount: rules.getRegionCount,
    finalizeRunOutcome: runtime.createFinalizeOutcomeAction(SaveSystem, () => GS),
  };
}
