export {
  getCardUpgradeId as getCodexCardUpgradeId,
  isCardUpgradeVariant as isCodexCardUpgradeVariant,
  resolveCodexCardId as resolveCodexCardReferenceId,
} from '../../../systems/codex_records_system.js';

import {
  getCardUpgradeId as getCodexCardUpgradeId,
  isCardUpgradeVariant as isCodexCardUpgradeVariant,
  resolveCodexCardId as resolveCodexCardReferenceId,
} from '../../../systems/codex_records_system.js';

export function createCodexCardReferenceUseCase({
  resolveCardId = resolveCodexCardReferenceId,
  getUpgradeId = getCodexCardUpgradeId,
  isUpgradeVariant = isCodexCardUpgradeVariant,
} = {}) {
  return {
    getCardUpgradeId(cardId) {
      return getUpgradeId(cardId);
    },
    isCardUpgradeVariant(cardId) {
      return isUpgradeVariant(cardId);
    },
    resolveCodexCardId(cardId) {
      return resolveCardId(cardId);
    },
  };
}
