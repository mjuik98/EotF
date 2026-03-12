import { buildShopConfig } from '../../../domain/event/shop/build_shop_config.js';

export function createShopEventService({ uiActions }) {
  return {
    create(gs, data, runRules) {
      const { savedMerchant, costPotion, costCard, costUpgrade } = buildShopConfig(gs, runRules);

      return {
        id: 'shop',
        persistent: true,
        eyebrow: savedMerchant ? '세계 기억 상점' : '상점',
        title: savedMerchant ? '은혜를 갚는 상인' : '잔향 상인',
        desc: savedMerchant
          ? '당신의 도움을 기억한 상인이 가격을 낮춰 주었다.'
          : '부서진 시간대 사이를 떠도는 상인이 거래를 제안한다.',
        choices: [
          {
            text: `🧪 포션 (HP +30) - ${costPotion} 골드`,
            cssClass: 'shop-choice-potion',
            effect: (state) => uiActions.handleChoice('buy_potion', state, data, { costPotion }),
          },
          {
            text: `🃏 랜덤 무작위 카드 - ${costCard} 골드`,
            cssClass: 'shop-choice-card',
            effect: (state) => uiActions.handleChoice('buy_card', state, data, { costCard }),
          },
          {
            text: `✨ 무작위 카드 강화 - ${costUpgrade} 골드`,
            cssClass: 'shop-choice-upgrade',
            effect: (state) => uiActions.handleChoice('upgrade_card', state, data, { costUpgrade }),
          },
          {
            text: '🛍️ 유물 상점 열기',
            cssClass: 'shop-choice-relic',
            effect: (state) => uiActions.handleChoice('open_item_shop', state, data, {}),
          },
          {
            text: '🚶 떠난다',
            cssClass: 'shop-choice-leave',
            effect: () => null,
          },
        ],
      };
    },
  };
}
