import {
  getData,
  getDoc,
  getGS,
} from '../../presentation/browser/reward_ui_helpers.js';
import {
  setRewardPickedState,
  setSkipConfirmVisible,
} from './reward_ui_state.js';

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
