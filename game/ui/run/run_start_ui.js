import { enterRunRuntime } from '../../features/run/application/create_run_start_runtime.js';

export const RunStartUI = {
  enterRun(deps = {}) {
    return enterRunRuntime(deps);
  },
};
