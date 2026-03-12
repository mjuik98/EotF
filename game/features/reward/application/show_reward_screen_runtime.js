import { clearIdempotencyPrefix } from '../../../utils/idempotency_utils.js';
import {
  deactivateCombat,
  unlockRewardFlow,
} from '../../../shared/state/runtime_flow_controls.js';
import { ensureMiniBossBonus } from '../../../app/reward/use_cases/claim_reward_use_case.js';
import {
  drawRewardCards,
  getData,
  getGS,
  normalizeRewardMode,
  resolveCurrentNodeType,
  resolveRewardCardConfig,
} from '../presentation/browser/reward_screen_runtime_helpers.js';
import { showRewardScreenView } from '../presentation/browser/show_reward_screen_runtime.js';

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

  const rewardCards = drawRewardCards(gs, count, rarities);
  return showRewardScreenView(ui, {
    data,
    gs,
    isElite,
    rewardCards,
    rewardMode,
  }, deps);
}
