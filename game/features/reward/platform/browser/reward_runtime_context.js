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
    setRewardPickedState(deps, picked) {
      setRewardPickedState(getDoc(deps), picked);
    },
    setSkipConfirmVisible(deps, visible) {
      setSkipConfirmVisible(getDoc(deps), visible);
    },
    openRewardRemoveDiscard(deps, { gs, isBurn = true, payload } = {}) {
      const showCardDiscard = deps?.showRewardRemoveDiscard || deps?.EventUI?.showCardDiscard;
      if (typeof showCardDiscard !== 'function') return false;
      showCardDiscard(gs, isBurn, payload);
      return true;
    },
  };
}
