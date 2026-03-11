import { clearIdempotencyPrefix } from '../../utils/idempotency_utils.js';
import { ensureMiniBossBonus } from './reward_ui_claims.js';
import {
  drawRewardCards,
  getData,
  getDoc,
  getGS,
  normalizeRewardMode,
  resolveRewardCardConfig,
} from './reward_ui_helpers.js';
import { renderRewardOptions } from './reward_ui_options.js';
import { renderRewardHeader } from './reward_ui_render.js';

export function showRewardScreenRuntime(ui, mode = false, deps = {}) {
  const gs = getGS(deps);
  const data = getData(deps);
  if (!gs || !data) return;

  const rewardMode = normalizeRewardMode(mode);
  const isElite = gs.currentNode?.type === 'elite';
  const { count, rarities } = resolveRewardCardConfig(rewardMode, isElite);

  if (gs.combat?.active) gs.combat.active = false;

  gs._rewardLock = false;
  clearIdempotencyPrefix('reward:');
  ui.hideSkipConfirm(deps);

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
    onTakeCard: (cardId) => ui.takeRewardCard(cardId, deps),
    onTakeBlessing: (blessing) => ui.takeRewardBlessing(blessing, deps),
    onTakeItem: (itemId) => ui.takeRewardItem(itemId, deps),
  });

  deps.switchScreen?.('reward');
}
