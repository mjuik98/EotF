import { EventManager } from '../../../systems/event_manager.js';

export function createDiscardEventCardUseCase({ discardCard = EventManager.discardCard } = {}) {
  return function discardEventCard({ gs, cardId, data, isBurn = false }) {
    if (!gs || !cardId) return { success: false, message: '카드를 찾을 수 없습니다.' };
    return discardCard(gs, cardId, data, isBurn);
  };
}

export const discardEventCard = createDiscardEventCardUseCase();
