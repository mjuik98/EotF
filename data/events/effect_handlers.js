import { DATA } from '../game_data.js';
import { LogUtils } from '../../game/utils/log_utils.js';

function adjustGold(gs, amount) {
  if (typeof gs?.addGold === 'function') {
    gs.addGold(amount);
    return;
  }
  gs.player.gold = Number(gs?.player?.gold || 0) + amount;
}

function addEcho(gs, amount) {
  if (typeof gs?.addEcho === 'function') {
    gs.addEcho(amount);
    return;
  }
  gs.player.echo = Number(gs?.player?.echo || 0) + amount;
}

function healPlayer(gs, amount) {
  if (typeof gs?.heal === 'function') {
    gs.heal(amount);
    return;
  }
  const maxHp = Number(gs?.player?.maxHp || 0);
  gs.player.hp = Math.min(maxHp, Number(gs?.player?.hp || 0) + amount);
}

function appendDeckCard(gs, cardId) {
  if (!cardId) return;
  if (!Array.isArray(gs?.player?.deck)) gs.player.deck = [];
  gs.player.deck.push(cardId);
}

function replaceDeckCard(gs, fromCardId, toCardId) {
  const deck = gs?.player?.deck;
  if (!Array.isArray(deck)) return false;
  const idx = deck.indexOf(fromCardId);
  if (idx < 0) return false;
  deck[idx] = toCardId;
  return true;
}

function setWorldMemory(gs, key, value) {
  if (!gs.worldMemory || typeof gs.worldMemory !== 'object') {
    gs.worldMemory = {};
  }
  gs.worldMemory[key] = value;
}

function incrementWorldMemory(gs, key, amount = 1) {
  const current = Number(gs?.worldMemory?.[key] || 0);
  setWorldMemory(gs, key, current + amount);
}

function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)] || null;
}

export const EVENT_CHOICE_HANDLERS = {
  shrine_blood_echo({ gs }) {
    gs.player.hp = Math.max(1, Number(gs?.player?.hp || 0) - 10);
    addEcho(gs, 50);
    return '피가 제단석에 닿는 순간, 잔향이 타오른다. 몸이 더 가벼워진 건지 가벼워진 척하는 건지.';
  },

  shrine_gold_heal({ gs }) {
    if (gs.player.hp >= gs.player.maxHp) {
      return { resultText: '상처가 없다. 신도 쓸모없는 것은 받지 않는다.', isFail: true };
    }
    if (gs.player.gold >= 15) {
      adjustGold(gs, -15);
      healPlayer(gs, 20);
      return '동전이 빛으로 변했다. 치유가 스며든다. 돈으로 살 수 있는 것들이 있다는 사실이 위안이 되기도, 불편하기도 하다.';
    }
    return '기억이 얕다. 사당은 빈 손을 원하지 않는다.';
  },

  merchant_help({ gs }) {
    incrementWorldMemory(gs, 'savedMerchant', 1);
    healPlayer(gs, 15);
    gs.addLog?.(LogUtils.formatHeal('상인', 15), 'heal');
    return '상인은 치료약을 내밀었다. 말은 없었다. 이 표정을 어디선가 본 것 같다 — 당신이 구해준 것이 이번이 처음이 아닌 것처럼.';
  },

  merchant_rob({ gs }) {
    adjustGold(gs, 30);
    setWorldMemory(gs, 'stoleFromMerchant', true);
    gs.addLog?.(LogUtils.formatStatChange('약탈', '골드', 30), 'damage');
    return '동전 서른 닢. 상인은 저항하지 않았다. 세계는 이 선택을 기억한다. 당신도 기억하게 될 것이다.';
  },

  echo_resonance_gain_echo({ gs }) {
    addEcho(gs, 60);
    return '잔향이 흉곽을 가득 채운다. 다른 루프의 기억들이 잠깐 스쳐 지나갔다. 보이지 않아서 다행이다.';
  },

  echo_resonance_gain_rare_card({ gs, data = DATA, services = {} }) {
    const cardId = gs.getRandomCard?.('rare');
    appendDeckCard(gs, cardId);
    services.playItemGet?.();
    return {
      resultText: `에너지가 응결한다. 기억이 기술이 된다 — ${data.cards?.[cardId]?.name}. 배운 기억이 흐릿한데 손이 먼저 안다.`,
      acquiredCard: cardId,
    };
  },

  forge_upgrade_random_card({ gs, data = DATA }) {
    const upgradeMap = data.upgradeMap || {};
    const upgradable = (gs.player.deck || []).filter((id) => upgradeMap[id]);
    if (!upgradable.length) {
      return { resultText: '화로가 식는다. 더 나아질 것이 없다는 뜻인지, 아직 때가 아니라는 뜻인지.', isFail: true };
    }

    const target = pickRandom(upgradable);
    const upgraded = upgradeMap[target];
    replaceDeckCard(gs, target, upgraded);

    const originName = data.cards?.[target]?.name || '알 수 없음';
    const newName = data.cards?.[upgraded]?.name || '알 수 없음';
    return `${originName}이 불 속에서 다시 태어났다. ${newName}. 같은 카드가 아니다.`;
  },

  forge_gain_echo({ gs }) {
    addEcho(gs, 40);
    return '화로 앞에 서자 잔향이 스며든다. 뜨겁지 않다. 익숙한 온도다.';
  },
};
