import { startGameRuntime } from '../../features/run/application/create_run_setup_runtime.js';

export const RunSetupUI = {
  startGame(deps = {}) {
    return startGameRuntime(deps);
  },
};
