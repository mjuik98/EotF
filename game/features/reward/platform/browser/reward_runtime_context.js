import {
  getData,
  getDoc,
  getGS,
} from '../../../../ui/screens/reward_ui_helpers.js';
import {
  setRewardPickedState,
  setSkipConfirmVisible,
} from '../../../../ui/screens/reward_ui_render.js';

export function createRewardRuntimeContext() {
  return {
    getData,
    getDoc,
    getGS,
    setRewardPickedStateFn: setRewardPickedState,
    setSkipConfirmVisibleFn: setSkipConfirmVisible,
  };
}
