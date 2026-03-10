import { HAND_CARD_RARITY_BORDER_COLORS } from '../../../data/ui_rarity_styles.js';
import { HandCardCloneUI } from './card_clone_ui.js';

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getCardTypeClass(type) {
  if (!type) return '';
  const t = type.toLowerCase();
  if (t === 'attack') return 'type-attack';
  if (t === 'skill') return 'type-skill';
  if (t === 'power') return 'type-power';
  return '';
}

function _getCardTypeLabelClass(type) {
  if (!type) return '';
  const t = type.toLowerCase();
  if (t === 'attack') return 'card-type-attack';
  if (t === 'skill') return 'card-type-skill';
  if (t === 'power') return 'card-type-power';
  return '';
}

/** desc 문자열에서 태그 키워드([소진]/[지속]/[즉시]) 를 감지 */
function _detectCardTags(card) {
  const desc = card.desc || '';
  return {
    exhaust: !!(card.exhaust || /[\[【]소진[\]】]/.test(desc)),
    persistent: /[\[【]지속[\]】]/.test(desc),
    instant: /[\[【]즉시[\]】]/.test(desc),
  };
}

/** 파티클 통합 함수 (원본 & 클론 공용) 
 *  Math.random() 기반에 CSS 변수(--drift-x, --rise-y)를 활용
 */
function _createUnifiedParticles(doc, color, options = {}) {
  const { isClone = false } = options;
  const wrap = doc.createElement('div');
  wrap.className = 'card-particles'; // 공통 클래스 사용

  const count = isClone ? 8 : 6;
  const scaleMult = isClone ? 1.8 : 1.0; 
  const baseRise = isClone ? 80 : 45; // 클론은 더 높이 상승

  for (let i = 0; i < count; i++) {
    const p = doc.createElement('div');
    p.className = 'card-particle';

    const size = (2 + Math.random() * 2) * scaleMult;
    const left = isClone ? (10 + Math.random() * 80) : (10 + i * 14);
    
    // CSS 애니메이션용 변수
    const driftX = (Math.random() * 20 - 10) * scaleMult; 
    const riseY  = baseRise + Math.random() * 15;

    p.style.cssText = `
      left: ${left}%;
      bottom: ${isClone ? (15 + Math.random() * 20) : 28}px;
      width: ${size}px; 
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${4 * scaleMult}px ${color};
      animation-duration: ${2 + Math.random() * 1.5}s;
      animation-delay: ${Math.random() * 1.5}s;
      --drift-x: ${driftX}px;
      --rise-y: ${riseY}px;
    `;
    wrap.appendChild(p);
  }
  return wrap;
}

export const CardUI = {
  getCardTypeClass(type) {
    return _getCardTypeClass(type);
  },

  getCardTypeLabelClass(type) {
    return _getCardTypeLabelClass(type);
  },

  createUnifiedParticles(doc, color, options) {
    return _createUnifiedParticles(doc, color, options);
  },

  renderCombatCards(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    if (!gs?.player?.hand || !data?.cards) return;

    const doc = _getDoc(deps);
    const zone = doc.getElementById('combatHandCards');
    if (!zone) return;

    const playCardHandler = deps.playCardHandler;
    const dragStartHandler = deps.dragStartHandler || globalThis.handleCardDragStart;
    const dragEndHandler = deps.dragEndHandler || globalThis.handleCardDragEnd;

    // 클론 레이어를 body 에 생성 (최초 1회 동작)
    HandCardCloneUI.init({ doc });

    const handSize = gs.player.hand.length;
    const cardScale = handSize <= 5 ? 1.2 : handSize <= 7 ? 1.05 : 0.95;
    const cardW = Math.round(100 * cardScale);
    const cardH = Math.round(146 * cardScale);
    const cardFontScale = cardScale < 1 ? `font-size:${Math.round(10 * cardScale)}px;` : '';

    zone.textContent = '';

    // 기존 클론 즉각 파기
    HandCardCloneUI.destroyAll({ doc });

    gs.player.hand.forEach((cardId, i) => {
      const card = data.cards[cardId];
      if (!card) return;

      const rarity = card.rarity || 'common';
      const rarityClass = `rarity-${rarity}`;
      const isLegendary = rarity === 'legendary';
      const isRare = rarity === 'rare';

      const displayMax = globalThis.CardCostUtils.getCostDisplay(cardId, card, gs.player, i);
      const { displayCost: cost, isFree, isDiscounted } = displayMax;
      const effectiveCost = globalThis.CardCostUtils.calcEffectiveCost(cardId, card, gs.player, i);
      const canPlay = gs.player.energy >= effectiveCost;

      const nextDisc = gs.player._nextCardDiscount || 0;
      const baseDisc = gs.player.costDiscount || 0;
      const traitDisc = globalThis.CardCostUtils?.hasTraitDiscount?.(cardId, gs.player) ? 1 : 0;
      const totalDisc = nextDisc + baseDisc + traitDisc;

      const isCascadeFree = globalThis.CardCostUtils.isCascadeFree(cardId, gs.player, i);
      const isChargeFree = globalThis.CardCostUtils.isChargeFree(cardId, gs.player, i);
      const anyFree = isCascadeFree || isChargeFree;

      const rarityBorderColor = HAND_CARD_RARITY_BORDER_COLORS[rarity] || '';
      const typeClass = _getCardTypeClass(card.type);
      const typeLabelClass = _getCardTypeLabelClass(card.type);
      const tags = _detectCardTags(card);

      // ── 카드 루트 엘리먼트 ─────────────────────────────────────
      const el = doc.createElement('div');
      el.className = [
        'card',
        canPlay ? 'playable' : '',
        typeClass,
        rarityClass,
        card.upgraded ? 'card-upgraded' : '',
      ].filter(Boolean).join(' ');

      // 인라인 스타일: 크기·등급 테두리·애니메이션 딜레이만 유지
      let inlineStyle = `width:${cardW}px;height:${cardH}px;${cardFontScale}animation-delay:${i * 0.05}s;`;
      if (rarityBorderColor) inlineStyle += `border-color:${rarityBorderColor};`;
      el.style.cssText = inlineStyle;

      el.draggable = true;
      el.dataset.cardId = cardId;
      el.dataset.handIdx = String(i);

      // ── 이벤트 핸들러 ──────────────────────────────────────────
      if (playCardHandler) {
        el.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (zone.dataset.locked === 'true') return;
          zone.dataset.locked = 'true';
          zone.style.pointerEvents = 'none';
          try {
            await playCardHandler(cardId, i);
          } finally {
            zone.dataset.locked = 'false';
            zone.style.pointerEvents = '';
          }
        });
      }
      if (dragStartHandler) el.addEventListener('dragstart', (e) => dragStartHandler(e, cardId, i));
      if (dragEndHandler) el.addEventListener('dragend', (e) => dragEndHandler(e));

      // ── [1] Legendary 레인보우 테두리 ─────────────────────────
      if (isLegendary) {
        const legBorder = doc.createElement('div');
        legBorder.className = 'card-legendary-border';
        el.appendChild(legBorder);
      }

      // ── [2] 등급 상단 컬러 스트립 (common 제외) ───────────────
      if (rarity !== 'common') {
        const strip = doc.createElement('div');
        strip.className = `card-rarity-strip card-rarity-strip-${rarity}`;
        el.appendChild(strip);
      }

      // ── [3] 크리스탈 패싯 (우상단 코너 장식) ──────────────────
      const facet = doc.createElement('div');
      facet.className = `card-crystal-facet card-crystal-facet-${typeClass || 'type-skill'}`;
      el.appendChild(facet);

      // ── [4] 단축키 (1~5번) ────────────────────────────────────
      if (i < 5) {
        const hotkey = doc.createElement('div');
        hotkey.className = `card-hotkey ${canPlay ? '' : 'disabled'}`;
        hotkey.textContent = i + 1;
        el.appendChild(hotkey);
      }

      // ── [5] 코스트 젬 ─────────────────────────────────────────
      const costEl = doc.createElement('div');
      costEl.className = 'card-cost';

      if (!canPlay) {
        costEl.style.cssText = 'background:rgba(60,60,60,0.4);border-color:rgba(120,120,120,0.3);color:rgba(180,180,180,0.5);';
      } else if (anyFree && card.cost > 0) {
        costEl.className += ' card-cost-free';
      } else if (totalDisc > 0 && card.cost > 0) {
        costEl.className += ' card-cost-discounted';
      }
      costEl.textContent = cost;

      // FREE / 할인 서브배지
      if (card.cost > 0) {
        if (anyFree) {
          const fb = doc.createElement('span');
          fb.className = 'card-cost-sub';
          fb.textContent = 'FREE';
          costEl.appendChild(fb);
        } else if (totalDisc > 0) {
          const db = doc.createElement('span');
          db.className = 'card-cost-sub';
          db.textContent = `-${Math.min(totalDisc, card.cost)}`;
          costEl.appendChild(db);
        }
      }
      el.appendChild(costEl);

      // ── [6] 강화 배지 ✦ ───────────────────────────────────────
      if (card.upgraded) {
        const upgBadge = doc.createElement('div');
        upgBadge.className = 'card-upgraded-badge';
        upgBadge.textContent = '✦';
        el.appendChild(upgBadge);
      }

      // ── [7] 아이콘 ────────────────────────────────────────────
      const icon = doc.createElement('div');
      icon.className = 'card-icon';
      icon.style.fontSize = cardScale < 1 ? `${Math.round(40 * cardScale)}px` : '40px';
      icon.textContent = card.icon;
      el.appendChild(icon);

      // ── [8] 카드 이름 (강화 표시는 배지로 분리) ───────────────
      const name = doc.createElement('div');
      name.className = 'card-name';
      name.style.fontSize = cardScale < 1 ? `${Math.round(12 * cardScale)}px` : '14px';
      name.textContent = card.name;
      el.appendChild(name);

      // ── [9] 설명 부분 제거 (클론에서 전담) ────────────────
      // 원본 카드에서 텍스트 노출 안 함

      // ── [10] 태그 뱃지 (소진 / 지속 / 즉시) ──────────────────
      if (tags.exhaust || tags.persistent || tags.instant) {
        const tagsEl = doc.createElement('div');
        tagsEl.className = 'card-tags';

        if (tags.exhaust) {
          const t = doc.createElement('span');
          t.className = 'card-tag card-tag-exhaust';
          t.textContent = '소진';
          tagsEl.appendChild(t);
        }
        if (tags.persistent) {
          const t = doc.createElement('span');
          t.className = 'card-tag card-tag-persistent';
          t.textContent = '지속';
          tagsEl.appendChild(t);
        }
        if (tags.instant) {
          const t = doc.createElement('span');
          t.className = 'card-tag card-tag-instant';
          t.textContent = '즉시';
          tagsEl.appendChild(t);
        }
        el.appendChild(tagsEl);
      }

      // ── [11] 카드 타입 ────────────────────────────────────────
      const type = doc.createElement('div');
      type.className = `card-type ${typeLabelClass}`;
      type.textContent = card.type;
      el.appendChild(type);

      // ── [12] 사용 불가 오버레이 ───────────────────────────────
      if (!canPlay) {
        const overlay = doc.createElement('div');
        overlay.className = 'card-no-energy';
        const label = doc.createElement('span');
        label.className = 'card-no-energy-label';
        label.textContent = '에너지 부족';
        overlay.appendChild(label);
        el.appendChild(overlay);
      }

      // ── [13] Rare/Legendary 파티클 ────────────────────────────
      if (isLegendary || isRare) {
        const particleColor = isLegendary ? '#c084fc' : '#f0b429';
        el.appendChild(_createUnifiedParticles(doc, particleColor));
      }

      // ── 호버 클론 생성 및 이벤트 바인딩 ───────────────────────
      HandCardCloneUI.attachToCard(el, cardId, card, {
        displayCost: cost, canPlay, anyFree, totalDisc: Math.min(totalDisc, card.cost || 0),
      }, { doc });

      zone.appendChild(el);
    });

    this.updateHandFanEffect({ doc });
  },

  renderHand(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    if (!gs?.player?.hand || !data?.cards) return;

    const doc = _getDoc(deps);
    const zone = doc.getElementById('handCards');
    if (!zone) return;

    const playCardHandler = deps.playCardHandler;
    const renderCombatCardsHandler = deps.renderCombatCardsHandler || globalThis.renderCombatCards;

    zone.textContent = '';
    gs.player.hand.forEach((cardId, i) => {
      const card = data.cards[cardId];
      if (!card) return;

      const el = doc.createElement('div');
      el.className = `card rarity-${card.rarity || 'common'}`;
      el.title = card.desc;

      el.addEventListener('click', () => {
        if (playCardHandler) playCardHandler(cardId, i);
        if (renderCombatCardsHandler) renderCombatCardsHandler();
      });

      const cost = doc.createElement('div'); cost.className = 'card-cost'; cost.textContent = card.cost;
      const icon = doc.createElement('div'); icon.className = 'card-icon'; icon.textContent = card.icon;
      const name = doc.createElement('div'); name.className = 'card-name'; name.textContent = card.name;
      // 설명 텍스트 창 제거
      const type = doc.createElement('div'); type.className = 'card-type'; type.textContent = card.type;
      el.append(cost, icon, name, type);
      zone.appendChild(el);
    });
  },

  updateHandFanEffect(deps = {}) {
    const doc = _getDoc(deps);
    const cards = doc.querySelectorAll('#combatHandCards .card');
    const n = cards.length;
    if (n === 0) return;

    const mid = (n - 1) / 2;
    const spread = Math.min(16, Math.max(6, n * 2));
    cards.forEach((card, i) => {
      const ratio = mid === 0 ? 0 : (i - mid) / mid;
      const rot = ratio * spread;
      const lift = -Math.abs(ratio) * 5;
      card.style.setProperty('--fan-rot', `${rot}deg`);
      card.style.setProperty('--fan-lift', `${lift}px`);
    });
  },
};
