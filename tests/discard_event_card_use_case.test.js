import { describe, expect, it, vi } from 'vitest';

import { createDiscardEventCardUseCase } from '../game/features/event/public.js';

describe('discard_event_card_use_case', () => {
  it('delegates discard handling to the event service boundary', () => {
    const discardCard = vi.fn(() => ({ success: true, message: 'ok' }));
    const useCase = createDiscardEventCardUseCase({ discardCard });
    const gs = { player: {} };
    const data = { cards: { strike: { id: 'strike' } } };

    const result = useCase({ gs, cardId: 'strike', data, isBurn: true });

    expect(result).toEqual({ success: true, message: 'ok' });
    expect(discardCard).toHaveBeenCalledWith(gs, 'strike', data, true);
  });

  it('rejects empty requests before hitting the event service', () => {
    const discardCard = vi.fn();
    const useCase = createDiscardEventCardUseCase({ discardCard });

    expect(useCase({ gs: null, cardId: '', data: null })).toEqual({
      success: false,
      message: '카드를 찾을 수 없습니다.',
    });
    expect(discardCard).not.toHaveBeenCalled();
  });
});
