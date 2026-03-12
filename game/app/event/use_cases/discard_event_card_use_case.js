import { discardEventCardAction } from '../../../features/event/app/event_manager_actions.js';

export function createDiscardEventCardUseCase({ discardCard = discardEventCardAction } = {}) {
  return function discardEventCard({ gs, cardId, data, isBurn = false }) {
    if (!gs || !cardId) return { success: false, message: '카드를 찾을 수 없습니다.' };
    return discardCard(gs, cardId, data, isBurn);
  };
}

export const discardEventCard = createDiscardEventCardUseCase();
