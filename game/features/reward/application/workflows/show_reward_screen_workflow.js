import { clearIdempotencyPrefix } from '../reward_idempotency.js';
import {
  deactivateCombat,
  unlockRewardFlow,
} from '../../state/reward_runtime_flow_ports.js';
import { ensureMiniBossBonus } from '../claim_reward_use_case.js';

export function showRewardScreenRuntime(ui, mode = false, deps = {}) {
  const rewardScreenUi = deps.rewardScreenUi;
  const gs = rewardScreenUi?.getGS?.();
  const data = rewardScreenUi?.getData?.();
  if (!gs || !data || !rewardScreenUi) return;

  const rewardMode = rewardScreenUi.normalizeRewardMode(mode);
  const isElite = rewardScreenUi.resolveCurrentNodeType(gs) === 'elite';
  const { count, rarities } = rewardScreenUi.resolveRewardCardConfig(rewardMode, isElite);

  if (gs.combat?.active) deactivateCombat(gs);

  unlockRewardFlow(gs);
  clearIdempotencyPrefix('reward:');
  rewardScreenUi.hideSkipConfirm();

  if (rewardMode === 'mini_boss') {
    ensureMiniBossBonus(gs, data, deps);
  }

  const rewardCards = rewardScreenUi.drawRewardCards(gs, count, rarities, data, {
    isElite,
    rewardMode,
  });
  return rewardScreenUi.showView({
    data,
    gs,
    isElite,
    rewardCards,
    rewardMode,
  });
}
