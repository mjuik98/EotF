import { describe, expect, it, vi } from 'vitest';

import { createCodexCardReferenceUseCase } from '../game/shared/codex/codex_card_reference_use_case.js';

describe('codex_card_reference_use_case', () => {
  it('exposes codex card id helpers behind a use case boundary', () => {
    const useCase = createCodexCardReferenceUseCase({
      resolveCardId: vi.fn((cardId) => `${cardId}_base`),
      getUpgradeId: vi.fn((cardId) => `${cardId}_plus`),
      isUpgradeVariant: vi.fn((cardId) => cardId.endsWith('_plus')),
    });

    expect(useCase.resolveCodexCardId('strike_plus')).toBe('strike_plus_base');
    expect(useCase.getCardUpgradeId('strike')).toBe('strike_plus');
    expect(useCase.isCardUpgradeVariant('strike_plus')).toBe(true);
  });
});
