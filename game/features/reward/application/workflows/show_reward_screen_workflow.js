import { clearIdempotencyPrefix } from '../reward_idempotency.js';
import {
  deactivateCombat,
  unlockRewardFlow,
} from '../../state/reward_runtime_flow_ports.js';
import { ensureMiniBossBonus } from '../claim_reward_use_case.js';
import {
  drawRewardCards,
  getData,
  getGS,
  normalizeRewardMode,
  resolveCurrentNodeType,
  resolveRewardCardConfig,
} from '../../presentation/browser/reward_screen_runtime_helpers.js';
import { showRewardScreenView } from '../../presentation/browser/show_reward_screen_runtime.js';

export function showRewardScreenRuntime(ui, mode = false, deps = {}) {
  const gs = getGS(deps);
  const data = getData(deps);
  if (!gs || !data) return;

  const rewardMode = normalizeRewardMode(mode);
  const isElite = resolveCurrentNodeType(gs) === 'elite';
  const { count, rarities } = resolveRewardCardConfig(rewardMode, isElite);

  if (gs.combat?.active) deactivateCombat(gs);

  unlockRewardFlow(gs);
  clearIdempotencyPrefix('reward:');
  ui.hideSkipConfirm(deps);

  if (rewardMode === 'mini_boss') {
    ensureMiniBossBonus(gs, data, deps);
  }

  const rewardCards = drawRewardCards(gs, count, rarities, data, {
    isElite,
    rewardMode,
  });
  return showRewardScreenView(ui, {
    data,
    gs,
    isElite,
    rewardCards,
    rewardMode,
  }, deps);
}
