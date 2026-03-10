import { returnToGameRuntime } from './run_return_ui_runtime.js';

export const RunReturnUI = {
  returnToGame(fromReward, deps = {}) {
    returnToGameRuntime(fromReward, deps);
  },
};


