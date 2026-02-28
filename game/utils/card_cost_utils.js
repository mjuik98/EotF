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
    if (CardCostUtils.isCascadeFree(cardId, player, handIndex)) return false;
    return Number(player._freeCardUses || 0) > 0;
  },

  /**
   * 클래스 특성 등으로 부여된 카드별 1회성 할인 토큰 보유 여부
   */
  hasTraitDiscount(cardId, player) {
    if (!player || typeof player._traitCardDiscounts !== 'object' || !player._traitCardDiscounts) {
      return false;
    }
    return Number(player._traitCardDiscounts[cardId] || 0) > 0;
  },

  /**
   * 카드의 실제 사용 비용 계산
   * @returns {number} 실제 에너지 비용 (0 이상)
   */
  calcEffectiveCost(cardId, card, player, handIndex = -1) {
    if (!card || !player) return 0;
    if (player.zeroCost) return 0;
    if (CardCostUtils.isCascadeFree(cardId, player, handIndex)) return 0;
    if (CardCostUtils.isChargeFree(cardId, player, handIndex)) return 0;
    // _nextCardDiscount 는 다음 카드 1 장에만 적용 (우선적으로 차감)
    const nextDisc = player._nextCardDiscount || 0;
    const disc = player.costDiscount || 0;
    const traitDisc = CardCostUtils.hasTraitDiscount(cardId, player) ? 1 : 0;
    const totalDisc = nextDisc + disc + traitDisc;
    return Math.max(0, card.cost - totalDisc);
  },

  /**
   * 현재 에너지로 카드를 사용할 수 있는지 확인
   */
  canPlay(cardId, card, player, handIndex = -1) {
    const cost = CardCostUtils.calcEffectiveCost(cardId, card, player, handIndex);
    return player.energy >= cost;
  },

  /**
   * 카드 사용 후 무료 충전 소비 처리
   * playCard() 내에서 에너지 차감 전에 호출
   */
  consumeFreeCharge(cardId, player, handIndex = -1) {
    if (CardCostUtils.isCascadeFree(cardId, player, handIndex)) {
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
    if (CardCostUtils.isChargeFree(cardId, player, handIndex)) {
      player._freeCardUses = Math.max(0, Number(player._freeCardUses || 0) - 1);
    }
  },

  /**
   * 카드별 할인 토큰 1회 소모
   * @returns {boolean} 실제 소모 여부
   */
  consumeTraitDiscount(cardId, player) {
    if (!CardCostUtils.hasTraitDiscount(cardId, player)) return false;
    const current = Number(player._traitCardDiscounts[cardId] || 0);
    if (current <= 1) delete player._traitCardDiscounts[cardId];
    else player._traitCardDiscounts[cardId] = current - 1;
    return true;
  },

  /**
   * 카드 UI 렌더링용 — 비용 표시 문자열 + 할인 여부 반환
   * @returns {{ displayCost: number, isFree: boolean, isDiscounted: boolean }}
   */
  getCostDisplay(cardId, card, player, handIndex = -1) {
    const isFree = player.zeroCost
      || CardCostUtils.isCascadeFree(cardId, player, handIndex)
      || CardCostUtils.isChargeFree(cardId, player, handIndex);
    const effectiveCost = CardCostUtils.calcEffectiveCost(cardId, card, player, handIndex);
    const totalDiscount = (player.costDiscount || 0)
      + (player._nextCardDiscount || 0)
      + (CardCostUtils.hasTraitDiscount(cardId, player) ? 1 : 0);
    const isDiscounted = !isFree && totalDiscount > 0 && effectiveCost < card.cost;
    return { displayCost: effectiveCost, isFree, isDiscounted };
  },
};
