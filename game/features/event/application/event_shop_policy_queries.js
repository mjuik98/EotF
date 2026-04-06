import { CONSTANTS } from '../ports/event_data_policy_ports.js';
import {
  hasRestorableStagnationCards,
  pickRandomBaseCardId,
  pickRandomUpgradeableCardId,
  resolveEventShopMaxEnergyCap,
} from '../domain/event_shop_rule_queries.js';

export function getEventShopMaxEnergyCap(state) {
  return resolveEventShopMaxEnergyCap({
    overrideCap: state?.player?.maxEnergyCap,
    configCap: CONSTANTS?.PLAYER?.MAX_ENERGY_CAP,
  });
}

export {
  hasRestorableStagnationCards,
  pickRandomBaseCardId,
  pickRandomUpgradeableCardId,
  resolveEventShopMaxEnergyCap,
};
