import {
  getCardUpgradeId,
  isCardUpgradeVariant,
  resolveCodexCardId,
} from '../../../systems/codex_records_system.js';

export function createCodexCardReferenceUseCase({
  resolveCardId = resolveCodexCardId,
  getUpgradeId = getCardUpgradeId,
  isUpgradeVariant = isCardUpgradeVariant,
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

const defaultCodexCardReferenceUseCase = createCodexCardReferenceUseCase();

export const getCodexCardUpgradeId = defaultCodexCardReferenceUseCase.getCardUpgradeId;
export const isCodexCardUpgradeVariant = defaultCodexCardReferenceUseCase.isCardUpgradeVariant;
export const resolveCodexCardReferenceId = defaultCodexCardReferenceUseCase.resolveCodexCardId;
