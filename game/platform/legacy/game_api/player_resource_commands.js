import { Logger } from '../../../utils/logger.js';
import { Actions } from '../core_support/public_state_action_support_capabilities.js';
import { getDefaultState } from './runtime_context.js';
import { dispatchPlayerAction } from './player_state_dispatch.js';

export function addGold(amount, gs = getDefaultState()) {
  if (amount === 0) return;
  const result = dispatchPlayerAction(gs, Actions.PLAYER_GOLD, { amount });
  Logger.info(`[API] Gold ${amount > 0 ? '+' : ''}${amount}. Current: ${result?.goldAfter}`);
  return result;
}

export function modifyEnergy(amount, gs = getDefaultState()) {
  const result = dispatchPlayerAction(gs, Actions.PLAYER_ENERGY, { amount });
  Logger.debug(`[API] Energy modified by ${amount}. Current: ${result?.energyAfter}`);
  return result;
}
