import { DescriptionUtils } from '../../utils/description_utils.js';
import { DomSafe } from '../../utils/dom_safe.js';
import { UNBREAKABLE_WALL_STACK_UNIT } from '../../../data/status_key_data.js';
import {
  hideGeneralTooltipUi,
  showGeneralTooltipUi,
} from './tooltip_general_ui.js';
import {
  hideItemTooltipUi,
  showItemTooltipUi,
} from './tooltip_item_ui.js';


let _tooltipTimer = null;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

function _isUnbreakableWallCard(cardId) {
  return cardId === 'unbreakable_wall' || cardId === 'unbreakable_wall_plus';
}

function _getUnbreakableWallBuffId(cardId) {
  return cardId === 'unbreakable_wall_plus' ? 'unbreakable_wall_plus' : 'unbreakable_wall';
}

function _getUnbreakableWallHitCount(buff) {
  const stacks = Number(buff?.stacks || 0);
  if (!Number.isFinite(stacks) || stacks <= 0) return 0;
  return Math.max(1, Math.floor(stacks / UNBREAKABLE_WALL_STACK_UNIT));
}

function _buildUnbreakableWallCardTooltip(cardId, gs) {
  if (!_isUnbreakableWallCard(cardId)) return '';

  const buffId = _getUnbreakableWallBuffId(cardId);
  const currentBuff = gs?.getBuff?.(buffId);
  const currentHits = _getUnbreakableWallHitCount(currentBuff);
  const nextHits = Math.max(1, currentHits + 1);
  const ratio = cardId === 'unbreakable_wall_plus' ? 0.7 : 0.5;
  const shield = Number(gs?.player?.shield || 0);
  const safeShield = Number.isFinite(shield) && shield > 0 ? Math.floor(shield) : 0;
  const perHit = Math.floor(safeShield * ratio);
  const total = perHit * nextHits;

  return `<br><br>\uD604\uC7AC \uC911\uCCA9: ${currentHits}\uD68C \uBC1C\uB3D9<br>\uC0AC\uC6A9 \uD6C4 \uC608\uC0C1: ${nextHits}\uD68C \uBC1C\uB3D9<br>\uD604\uC7AC \uBC29\uC5B4\uB9C9(${safeShield}) \uAE30\uC900: 1\uD68C ${perHit}, \uCD1D ${total} \uD53C\uD574`;
}

const KEYWORD_MAP = {
  '[소진]': { title: '소진 (Exhaust)', text: '사용 후 이번 전투에서 영구 제거됩니다. 소모 더미로 가지 않습니다.' },
  '[지속]': { title: '지속 (Persistent)', text: '전투가 끝날 때까지 계속 효과가 발동되는 능력 카드입니다.' },
  '[즉시]': { title: '즉시 (Instant)', text: '사용 즉시 발동되는 강력한 일회성 효과입니다.' },
  '잔향': { title: '잔향 (Echo)', text: '특수 능력을 발동하는 에너지 자원. 0~100 사이를 유지하며, 게이지에 따라 효과가 달라집니다.' },
  '연쇄': { title: '연쇄 (Chain)', text: '연속 공격 횟수를 나타냅니다. 5회 이상 쌓이면 다음 공격에 추가 피해가 적용됩니다.' },
  '침묵': { title: '침묵 (Silence)', text: '침묵사냥꾼 전용 게이지. 최대치(10) 도달 시 다음 공격이 대폭 강화됩니다.' },
  '약화': { title: '약화 (Weakened)', text: '대상의 공격력이 50% 감소합니다. 지속 시간이 만료되면 해제됩니다.' },
  '기절 면역': { title: '기절 면역 (Stun Immunity)', text: '적의 기절 효과를 지정된 횟수만큼 완전히 무효화합니다.' },
  '기절': { title: '기절 (Stunned)', text: '다음 턴에 행동하지 못합니다. 기절 턴에는 공격과 방어 모두 불가합니다.' },
  '독': { title: '독 (Poison)', text: '중독된 대상의 턴 시작 시 독 스택 × 5 피해를 입힙니다. 매 턴 독 스택이 1씩 감소합니다.' },
  '화염': { title: '화염 (Burning)', text: '매 턴 시작 시 피해 5를 입습니다. 지속 시간이 끝나면 소멸합니다.' },
  '처형 표식': { title: '처형 표식 (Death Mark)', text: '3턴 후 표식이 폭발하여 피해 30을 입힙니다. 시간이 얼마 남지 않았을 때 더욱 위험합니다.' },
  '면역': { title: '면역 (Immune)', text: '모든 피해와 상태이상을 완전히 무효화합니다. 지속 시간 동안 무적 상태입니다.' },
  '회피': { title: '회피 (Dodge)', text: '다음 적의 공격 1회를 완전히 무효화합니다. 회피 후 즉시 소모됩니다.' },
  '은신': { title: '은신 (Stealth)', text: '다음에 사용하는 공격 카드가 치명타로 적중합니다. 공격 즉시 은신이 해제됩니다.' },
  '반사': { title: '반사 (Reflect)', text: '피해를 받을 때 해당 피해를 공격자에게 되돌립니다.' },
  '시간 왜곡': { title: '시간 왜곡 (Time Warp)', text: '매 턴 시작 시 에너지를 1 추가로 획득합니다. 전투가 끝날 때까지 지속됩니다.' },
  '드로우': { title: '드로우 (Draw)', text: '덱에서 카드를 손패로 가져옵니다. 덱이 비면 소모 더미를 섞어 새 덱을 만듭니다.' },
};

export const TooltipUI = {
  showTooltip(event, cardId, deps = {}) {
    const data = deps.data;
    const gs = deps.gs;
    if (!data?.cards || !gs) return;

    // 특수 툴팁: 스킬 소각
    if (cardId === 'remove_card') {
      this.showGeneralTooltip(event, '🔥 스킬 소각', '덱에서 원하는 카드 1장을 영구히 제거합니다.<br><br>조건: 덱에 카드가 있어야 합니다.', deps);
      return;
    }

    const card = data.cards[cardId];
    if (!card) return;
    clearTimeout(_tooltipTimer);
    const doc = _getDoc(deps);
    const win = _getWin(deps);
    const tt = doc.getElementById('cardTooltip');
    if (!tt) return;

    doc.getElementById('ttIcon').textContent = card.icon;
    doc.getElementById('ttCost').textContent = card.cost;
    doc.getElementById('ttName').textContent = card.name;
    doc.getElementById('ttType').textContent = card.type;
    DomSafe.setHighlightedText(doc.getElementById('ttDesc'), card.desc || '');
    const rarityEl = doc.getElementById('ttRarity');
    rarityEl.textContent = DescriptionUtils.getRarityLabel(card.rarity || 'common');
    rarityEl.className = `card-tooltip-rarity rarity-${card.rarity || 'common'}`;

    const predEl = doc.getElementById('ttPredicted');
    const baseDmg = card.dmg;
    const res = gs.getBuff?.('resonance');
    const acc = gs.getBuff?.('acceleration');
    const resBonus = res ? (res.dmgBonus || 0) : 0;
    const accBonus = acc ? (acc.dmgBonus || 0) : 0;
    const chainBonus = baseDmg && gs.player.echoChain >= 3 ? Math.floor(baseDmg * 0.2) : 0;

    // 공격 카드만 예상 피해 표시 (스킬/파워 카드는 숨김)
    if (baseDmg !== undefined && baseDmg > 0) {
      const total = baseDmg + resBonus + accBonus + chainBonus;
      predEl.style.display = 'block';
      predEl.textContent = '';
      predEl.append(doc.createTextNode('⚔ 예상 피해: '));
      const totalB = doc.createElement('b'); totalB.textContent = total; predEl.appendChild(totalB);

      if (resBonus > 0) {
        const span = doc.createElement('span');
        span.style.cssText = 'color:rgba(255,120,120,0.8);font-size:9px;';
        span.textContent = ` (+${resBonus} 공명)`;
        predEl.appendChild(span);
      }
      if (accBonus > 0) {
        const span = doc.createElement('span');
        span.style.cssText = 'color:rgba(255,180,0,0.8);font-size:9px;';
        span.textContent = ` (+${accBonus} 가속)`;
        predEl.appendChild(span);
      }
      if (chainBonus > 0) {
        const chainSpan = doc.createElement('span');
        chainSpan.style.cssText = 'color:rgba(0,255,204,0.8);font-size:9px;';
        chainSpan.textContent = ` (+${chainBonus} 체인)`;
        predEl.appendChild(chainSpan);
      }
    } else {
      predEl.style.display = 'none';
    }
    const rect = event.currentTarget.getBoundingClientRect();
    let x = rect.right + 12;
    let y = rect.top;
    if (x + 170 > win.innerWidth) x = rect.left - 172;
    if (y + 260 > win.innerHeight) y = win.innerHeight - 265;
    tt.style.left = `${x}px`;
    tt.style.top = `${y}px`;
    tt.classList.add('visible');

    // Sub-tooltip for keywords
    const st = doc.getElementById('subTooltip');
    if (st) {
      // Sort keys by length descending to match "기절 면역" before "기절"
      const sortedKeys = Object.keys(KEYWORD_MAP).sort((a, b) => b.length - a.length);
      const foundKw = sortedKeys.find(kw => card.desc?.includes(kw) || (card.exhaust && kw === '[소진]'));
      if (foundKw) {
        const kwData = KEYWORD_MAP[foundKw];
        doc.getElementById('stTitle').textContent = kwData.title;
        doc.getElementById('stContent').textContent = kwData.text;

        let stX = x + 172;
        let stY = y;
        if (stX + 180 > win.innerWidth) stX = x - 182;

        st.style.left = `${stX}px`;
        st.style.top = `${stY}px`;
        st.style.display = 'block';
      } else {
        st.style.display = 'none';
      }
    }
  },

  hideTooltip(deps = {}) {
    const doc = _getDoc(deps);
    _tooltipTimer = setTimeout(() => {
      doc.getElementById('cardTooltip')?.classList.remove('visible');
      const st = doc.getElementById('subTooltip');
      if (st) st.style.display = 'none';
    }, 80);
  },

  attachCardTooltips(deps = {}) {
    const doc = _getDoc(deps);
    doc.querySelectorAll('#combatHandCards .card, #deckModalCards > div').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const onclick = el.getAttribute('onclick') || '';
        const m = onclick.match(/playCard\('([^']+)'/);
        if (m) this.showTooltip(e, m[1], deps);
      });
      el.addEventListener('mouseleave', () => this.hideTooltip(deps));
    });
  },

  showItemTooltip(event, itemId, deps = {}) {
    showItemTooltipUi(event, itemId, deps);
  },

  hideItemTooltip(deps = {}) {
    hideItemTooltipUi(deps);
  },

  showGeneralTooltip(event, title, content, deps = {}) {
    showGeneralTooltipUi(event, title, content, deps);
  },

  hideGeneralTooltip(deps = {}) {
    hideGeneralTooltipUi(deps);
  }
};
