import { startGameRuntime } from './run_setup_ui_runtime.js';

export const RunSetupUI = {
  startGame(deps = {}) {
    return startGameRuntime(deps);
  },
};
