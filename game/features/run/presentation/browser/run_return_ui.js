import { returnToGameRuntime } from './run_return_ui_runtime.js';

export const RunReturnUI = {
  returnFromReward(deps = {}) {
    return returnToGameRuntime(true, deps);
  },

  returnToGame(fromReward, deps = {}) {
    returnToGameRuntime(fromReward, deps);
  },
};
