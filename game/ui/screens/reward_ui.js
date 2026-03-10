import { clearIdempotencyPrefix } from '../../utils/idempotency_utils.js';
import {
  ensureMiniBossBonus,
} from './reward_ui_claims.js';
import {
  drawRewardCards,
  getData,
  getDoc,
  getGS,
  normalizeRewardMode,
  resolveRewardCardConfig,
} from './reward_ui_helpers.js';
import {
  renderRewardHeader,
  setSkipConfirmVisible,
} from './reward_ui_render.js';
import {
  renderRewardOptions,
} from './reward_ui_options.js';
import {
  skipRewardRuntime,
  takeRewardBlessingRuntime,
  takeRewardCardRuntime,
  takeRewardItemRuntime,
  takeRewardRemoveRuntime,
  takeRewardUpgradeRuntime,
} from './reward_ui_runtime.js';

export const RewardUI = {
  showRewardScreen(mode = false, deps = {}) {
    const gs = getGS(deps);
    const data = getData(deps);
    if (!gs || !data) return;

    const rewardMode = normalizeRewardMode(mode);
    const isElite = gs.currentNode?.type === 'elite';
    const { count, rarities } = resolveRewardCardConfig(rewardMode, isElite);

    if (gs.combat?.active) gs.combat.active = false;

    gs._rewardLock = false;
    clearIdempotencyPrefix('reward:');
    this.hideSkipConfirm(deps);

    if (rewardMode === 'mini_boss') {
      ensureMiniBossBonus(gs, data, deps);
    }

    const rewardCards = drawRewardCards(gs, count, rarities);
    const doc = getDoc(deps);
    const container = doc.getElementById('rewardCards');
    if (!container) return;

    renderRewardHeader(doc, rewardMode, isElite);
    container.textContent = '';
    container.classList.remove('picked');

    renderRewardOptions({
      container,
      rewardMode,
      isElite,
      rewardCards,
      data,
      gs,
      deps,
      onTakeCard: (cardId) => this.takeRewardCard(cardId, deps),
      onTakeBlessing: (blessing) => this.takeRewardBlessing(blessing, deps),
      onTakeItem: (itemId) => this.takeRewardItem(itemId, deps),
    });

    deps.switchScreen?.('reward');
  },

  takeRewardBlessing(blessing, deps = {}) {
    return takeRewardBlessingRuntime(blessing, deps);
  },

  takeRewardCard(cardId, deps = {}) {
    return takeRewardCardRuntime(cardId, deps);
  },

  takeRewardItem(itemKey, deps = {}) {
    return takeRewardItemRuntime(itemKey, deps);
  },

  takeRewardUpgrade(deps = {}) {
    return takeRewardUpgradeRuntime(deps);
  },

  takeRewardRemove(deps = {}) {
    return takeRewardRemoveRuntime(deps);
  },

  showSkipConfirm(deps = {}) {
    setSkipConfirmVisible(getDoc(deps), true);
  },

  hideSkipConfirm(deps = {}) {
    setSkipConfirmVisible(getDoc(deps), false);
  },

  skipReward(deps = {}) {
    return skipRewardRuntime(deps);
  },
};
