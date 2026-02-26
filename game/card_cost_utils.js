// ────────────────────────────────────────
//  CARD COST UTILS
//  카드 비용 계산 공통 유틸리티
//
//  이전에 game_state_core_methods.js::playCard() 와
//  card_ui.js::renderCombatCards() 에 동일한 로직이 복붙되어 있었음.
//  규칙 변경 시 한 곳만 수정하면 되도록 통합.
// ────────────────────────────────────────
export const CardCostUtils = {

  /**
   * 해당 카드가 캐스케이드 무료인지 확인
   */
  isCascadeFree(cardId, player, handIndex = -1) {
    const cascade = player._cascadeCards;
    if (!cascade) return false;
    if (cascade instanceof Map) {
      if (handIndex !== -1) return cascade.has(handIndex);
      // Fallback: check if any entry matches cardId (less precise but compatible)
      for (let [idx, id] of cascade) {
        if (id === cardId) return true;
      }
      return false;
    }
    return !!(cascade.has && cascade.has(cardId));
  },

  /**
   * 해당 카드가 충전 무료(freeCardUses)인지 확인
   * zeroCost, cascadeFree가 아닐 때만 적용
   */
  isChargeFree(cardId, player, handIndex = -1) {
    if (player.zeroCost) return false;
    if (this.isCascadeFree(cardId, player, handIndex)) return false;
    return Number(player._freeCardUses || 0) > 0;
  },

  /**
   * 카드의 실제 사용 비용 계산
   * @returns {number} 실제 에너지 비용 (0 이상)
   */
  calcEffectiveCost(cardId, card, player, handIndex = -1) {
    if (!card || !player) return 0;
    if (player.zeroCost) return 0;
    if (this.isCascadeFree(cardId, player, handIndex)) return 0;
    if (this.isChargeFree(cardId, player, handIndex)) return 0;
    const disc = player.costDiscount || 0;
    return Math.max(0, card.cost - disc);
  },

  /**
   * 현재 에너지로 카드를 사용할 수 있는지 확인
   */
  canPlay(cardId, card, player, handIndex = -1) {
    const cost = this.calcEffectiveCost(cardId, card, player, handIndex);
    return player.energy >= cost;
  },

  /**
   * 카드 사용 후 무료 충전 소비 처리
   * playCard() 내에서 에너지 차감 전에 호출
   */
  consumeFreeCharge(cardId, player, handIndex = -1) {
    if (this.isCascadeFree(cardId, player, handIndex)) {
      const cascade = player._cascadeCards;
      if (cascade instanceof Map) {
        if (handIndex !== -1) {
          cascade.delete(handIndex);
        } else {
          // Fallback: find first matching cardId and delete it
          for (let [idx, id] of cascade) {
            if (id === cardId) {
              cascade.delete(idx);
              break;
            }
          }
        }
      } else if (cascade.delete) {
        cascade.delete(cardId);
      }
      return;
    }
    if (this.isChargeFree(cardId, player, handIndex)) {
      player._freeCardUses = Math.max(0, Number(player._freeCardUses || 0) - 1);
    }
  },

  /**
   * 카드 UI 렌더링용 — 비용 표시 문자열 + 할인 여부 반환
   * @returns {{ displayCost: number, isFree: boolean, isDiscounted: boolean }}
   */
  getCostDisplay(cardId, card, player, handIndex = -1) {
    const isFree = player.zeroCost
      || this.isCascadeFree(cardId, player, handIndex)
      || this.isChargeFree(cardId, player, handIndex);
    const effectiveCost = this.calcEffectiveCost(cardId, card, player, handIndex);
    const isDiscounted = !isFree && (player.costDiscount || 0) > 0 && effectiveCost < card.cost;
    return { displayCost: effectiveCost, isFree, isDiscounted };
  },
};
