import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  ensureDeckModalShell: vi.fn(),
}));

vi.mock('../game/features/combat/platform/browser/ensure_deck_modal_shell.js', () => ({
  ensureDeckModalShell: hoisted.ensureDeckModalShell,
}));

import {
  closeDeckModal,
  getDeckModalFilter,
  openDeckModal,
  resetDeckModalFilter,
  setDeckModalFilter,
} from '../game/features/combat/public.js';

function createModal() {
  const classes = new Set();
  return {
    classList: {
      add: (token) => classes.add(token),
      remove: (token) => classes.delete(token),
      contains: (token) => classes.has(token),
    },
  };
}

function createDoc(modal) {
  return {
    getElementById(id) {
      return id === 'deckViewModal' ? modal : null;
    },
  };
}

describe('deck_modal_runtime_ui', () => {
  it('tracks filter state and opens/closes the modal', () => {
    const modal = createModal();
    const doc = createDoc(modal);

    resetDeckModalFilter();
    expect(getDeckModalFilter()).toBe('all');

    setDeckModalFilter('POWER');
    expect(getDeckModalFilter()).toBe('POWER');

    openDeckModal({ doc });
    expect(hoisted.ensureDeckModalShell).toHaveBeenCalledWith(doc);
    expect(modal.classList.contains('active')).toBe(true);

    closeDeckModal({ doc });
    expect(modal.classList.contains('active')).toBe(false);
  });
});
