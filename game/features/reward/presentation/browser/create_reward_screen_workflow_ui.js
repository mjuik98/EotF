import { showRewardScreenView } from './show_reward_screen_runtime.js';
import {
  drawRewardCards,
  getData,
  getGS,
  normalizeRewardMode,
  resolveCurrentNodeType,
  resolveRewardCardConfig,
} from './reward_screen_runtime_helpers.js';

export function createRewardScreenWorkflowUi(ui, deps = {}) {
  return {
    getData: () => getData(deps),
    getGS: () => getGS(deps),
    normalizeRewardMode,
    resolveCurrentNodeType,
    resolveRewardCardConfig,
    hideSkipConfirm: () => ui.hideSkipConfirm(deps),
    drawRewardCards,
    showView: (payload) => showRewardScreenView(ui, payload, deps),
  };
}
