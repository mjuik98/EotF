import { clearIdempotencyKey, runIdempotent } from '../../utils/idempotency_utils.js';
import { playAttackSlash, playUiItemGetFeedback } from '../../domain/audio/audio_event_helpers.js';
import {
  applyRewardBlessing,
  applyRewardCard,
  applyRewardItem,
  applyRewardUpgrade,
} from './reward_ui_claims.js';
import {
  getData,
  getDoc,
  getGS,
  getMaxEnergyCap,
} from './reward_ui_helpers.js';
import {
  setRewardPickedState,
} from './reward_ui_render.js';

export const REWARD_CLAIM_KEY = 'reward:claim';
export const REWARD_SKIP_KEY = 'reward:skip';

export function finishReward(deps = {}) {
  setTimeout(() => deps.returnToGame?.(true), 350);
}

function playRewardItemGet(deps = {}) {
  return playUiItemGetFeedback(deps.playItemGet, deps.audioEngine);
}

export function takeRewardBlessingRuntime(blessing, deps = {}) {
  const gs = getGS(deps);
  if (!gs) return;

  return runIdempotent(REWARD_CLAIM_KEY, () => {
    if (gs._rewardLock) return;
    if (blessing.type === 'energy' && (gs.player.maxEnergy || 0) >= getMaxEnergyCap(gs)) {
      playAttackSlash(deps.audioEngine);
      return;
    }

    gs._rewardLock = true;
    setRewardPickedState(getDoc(deps), true);
    applyRewardBlessing(gs, blessing);

    playRewardItemGet(deps);
    deps.showItemToast?.({ name: blessing.name, icon: blessing.icon, desc: blessing.desc });
    finishReward(deps);
  }, { ttlMs: 3000 });
}

export function takeRewardCardRuntime(cardId, deps = {}) {
  const gs = getGS(deps);
  const data = getData(deps);
  if (!gs || !data) return;

  return runIdempotent(REWARD_CLAIM_KEY, () => {
    if (gs._rewardLock) return;
    gs._rewardLock = true;
    setRewardPickedState(getDoc(deps), true);

    const card = applyRewardCard(gs, data, cardId);
    playRewardItemGet(deps);
    deps.showItemToast?.({ name: card?.name || cardId, icon: card?.icon || '*', desc: card?.desc || '' });
    finishReward(deps);
  }, { ttlMs: 3000 });
}

export function takeRewardItemRuntime(itemKey, deps = {}) {
  const gs = getGS(deps);
  const data = getData(deps);
  if (!gs || !data) return;

  return runIdempotent(REWARD_CLAIM_KEY, () => {
    if (gs._rewardLock) return;
    gs._rewardLock = true;
    setRewardPickedState(getDoc(deps), true);

    const item = applyRewardItem(gs, data, itemKey);
    playRewardItemGet(deps);
    deps.showItemToast?.(item, { forceQueue: true });
    finishReward(deps);
  }, { ttlMs: 3000 });
}

export function takeRewardUpgradeRuntime(deps = {}) {
  const gs = getGS(deps);
  const data = getData(deps);
  if (!gs || !data) return;

  return runIdempotent(REWARD_CLAIM_KEY, () => {
    if (gs._rewardLock) return;
    const upgradedId = applyRewardUpgrade(gs, data);
    if (!upgradedId) {
      playAttackSlash(deps.audioEngine);
      return;
    }

    gs._rewardLock = true;
    playRewardItemGet(deps);
    deps.showItemToast?.({
      name: `Upgrade complete: ${data.cards?.[upgradedId]?.name || upgradedId}`,
      icon: 'UP',
      desc: 'A random card has been upgraded.',
    });
    finishReward(deps);
  }, { ttlMs: 3000 });
}

export function takeRewardRemoveRuntime(deps = {}) {
  const gs = getGS(deps);
  if (!gs) return;

  return runIdempotent(REWARD_CLAIM_KEY, () => {
    if (gs._rewardLock) return;
    gs._rewardLock = true;

    const doc = getDoc(deps);
    setRewardPickedState(doc, true);
    const eventUI = deps.EventUI;

    if (eventUI && typeof eventUI.showCardDiscard === 'function') {
      eventUI.showCardDiscard(gs, true, {
        ...deps,
        onCancel: () => {
          gs._rewardLock = false;
          clearIdempotencyKey(REWARD_CLAIM_KEY);
          setRewardPickedState(doc, false);
        },
        returnToGame: (force) => deps.returnToGame?.(force),
      });
      return;
    }

    deps.returnToGame?.(true);
  }, { ttlMs: 3000 });
}

export function skipRewardRuntime(deps = {}) {
  const gs = getGS(deps);
  if (!gs) return;

  return runIdempotent(REWARD_SKIP_KEY, () => {
    if (gs._rewardLock) return;
    gs._rewardLock = true;
    deps.returnToGame?.(true);
  }, { ttlMs: 3000 });
}
