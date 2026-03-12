import { getDoc } from './reward_screen_runtime_helpers.js';
import { renderRewardOptions } from './reward_ui_options.js';
import { renderRewardHeader } from './reward_ui_render.js';

export function showRewardScreenView(ui, payload, deps = {}) {
  const {
    data,
    gs,
    isElite,
    rewardCards,
    rewardMode,
  } = payload || {};
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

  if (typeof deps.showRewardScreen === 'function') deps.showRewardScreen();
  else deps.switchScreen?.('reward');
}
