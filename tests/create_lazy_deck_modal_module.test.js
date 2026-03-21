import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  importDeckModalModule: vi.fn(async () => ({
    DeckModalUI: {
      showDeckView: vi.fn(),
      renderDeckModal: vi.fn(),
      setDeckFilter: vi.fn(),
      closeDeckView: vi.fn(),
    },
  })),
}));

vi.mock('../game/features/combat/platform/browser/import_deck_modal_module.js', () => ({
  importDeckModalModule: hoisted.importDeckModalModule,
}));

import { createLazyDeckModalModule } from '../game/features/combat/platform/browser/create_lazy_deck_modal_module.js';

describe('createLazyDeckModalModule', () => {
  it('loads the deck modal module on first method call and forwards subsequent calls', async () => {
    const lazyDeckModal = createLazyDeckModalModule();

    await lazyDeckModal.showDeckView({ marker: 'show' });
    await lazyDeckModal.setDeckFilter('ATTACK', { marker: 'filter' });

    expect(hoisted.importDeckModalModule).toHaveBeenCalledTimes(1);
    const { DeckModalUI } = await hoisted.importDeckModalModule.mock.results[0].value;
    expect(DeckModalUI.showDeckView).toHaveBeenCalledWith({ marker: 'show' });
    expect(DeckModalUI.setDeckFilter).toHaveBeenCalledWith('ATTACK', { marker: 'filter' });
  });
});
