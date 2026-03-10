/**
 * card_clone_ui.js
 * 손패 카드 ×2.0 호버 클론 모듈
 *
 * ── 역할 ──
 * - #handCardCloneLayer (fixed) 레이어를 생성/관리
 * - 카드 mouseenter/mouseleave 에 클론 show/hide 바인딩
 * - Math.random() 기반 파티클로 자연스러운 효과 연출
 * - opacity 상속 버그를 DOM 분리(fixed layer)로 완전 차단
 *
 * ── 사용법 ──
 * 1) 게임 초기화 시 1회:
 *      import { HandCardCloneUI } from './card_clone_ui.js';
 *      HandCardCloneUI.init({ doc: document });
 *      globalThis.HandCardCloneUI = HandCardCloneUI;
 *
 * 2) card_ui.js renderCombatCards() 내부,
 *    zone.textContent = ''; 바로 뒤에 추가:
 *      globalThis.HandCardCloneUI?.destroyAll({ doc });
 *
 *    zone.appendChild(el); 바로 앞에 추가:
 *      if (globalThis.HandCardCloneUI) {
 *        globalThis.HandCardCloneUI.attachToCard(el, card, {
 *          doc, canPlay, displayCost: cost, anyFree, totalDisc,
 *        });
 *      }
 *
 * 3) card_ui.js 에서 손패 카드의 showTooltipHandler / hideTooltipHandler
 *    는 제거하거나 클론과 중복되지 않도록 조건부 처리 권장.
 */

import { HAND_CARD_RARITY_BORDER_COLORS } from '../../../data/ui_rarity_styles.js';

/* ── 상수 ──────────────────────────────────────────────────── */
const _LAYER_ID       = 'handCardCloneLayer';
const _CLONE_W        = 200;   // px  (원본 100px × 2.0)
const _CLONE_H        = 292;   // px  (원본 146px × 2.0)
const _CLONE_GAP      = 16;    // 카드 상단 ~ 클론 하단 여백
const _VIEWPORT_MARGIN = 14;   // 뷰포트 끝 최소 여백
const _HOVER_ENTER_MS  = 100;  // 클론 표시 딜레이 (빠른 이동 시 깜빡임 방지)
const _HOVER_LEAVE_MS  = 60;   // 클론 숨김 딜레이

/* ── 내부 헬퍼 ─────────────────────────────────────────────── */
function _r(min, max) { return min + Math.random() * (max - min); }

function _getDoc(deps) { return deps?.doc || document; }

function _getCardTypeClass(type) {
  if (!type) return '';
  const t = type.toLowerCase();
  if (t === 'attack') return 'type-attack';
  if (t === 'skill')  return 'type-skill';
  if (t === 'power')  return 'type-power';
  return '';
}

function _getCardTypeLabelClass(type) {
  if (!type) return '';
  const t = type.toLowerCase();
  if (t === 'attack') return 'card-type-attack';
  if (t === 'skill')  return 'card-type-skill';
  if (t === 'power')  return 'card-type-power';
  return '';
}

function _detectCardTags(card) {
  const desc = card.desc || '';
  return {
    exhaust:    !!(card.exhaust || /[\[【]소진[\]】]/.test(desc)),
    persistent: /[\[【]지속[\]】]/.test(desc),
    instant:    /[\[【]즉시[\]】]/.test(desc),
  };
}

/* ── 클론 파티클 생성 (card_ui.js 의 통합 함수 사용) ──────── */
function _createCloneParticles(doc, color) {
  // 전역에 노출된 CardUI의 통합 파티클 렌더러를 빌려옴
  if (globalThis.CardUI && globalThis.CardUI.createUnifiedParticles) {
    return globalThis.CardUI.createUnifiedParticles(doc, color, { isClone: true });
  }
  // Fallback (만약 CardUI가 로드 전이거나 없을 경우 빈 div 반환)
  const wrap = doc.createElement('div');
  wrap.className = 'card-particles';
  return wrap;
}

/* ── 클론 DOM 빌드 ──────────────────────────────────────────
 * costDisplay: { displayCost, anyFree, totalDisc, canPlay }
 * ─────────────────────────────────────────────────────────── */
function _buildCloneEl(doc, cardId, card, costDisplay) {
  const rarity       = card.rarity || 'common';
  const isLegendary  = rarity === 'legendary';
  const isRare       = rarity === 'rare';
  const typeClass    = _getCardTypeClass(card.type);
  const typeLblClass = _getCardTypeLabelClass(card.type);
  const tags         = _detectCardTags(card);
  const { displayCost, anyFree, totalDisc } = costDisplay;

  const clone = doc.createElement('div');
  clone.className = [
    'card-clone',
    `clone-rarity-${rarity}`,
    card.upgraded ? 'clone-upgraded' : '',
  ].filter(Boolean).join(' ');

  // ── [1] Legendary 레인보우 테두리 ──────────────────────────
  if (isLegendary) {
    const lb = doc.createElement('div');
    lb.className = 'card-clone-legendary-border';
    clone.appendChild(lb);
  }

  // ── [2] 상단 컬러 스트립 ────────────────────────────────────
  if (rarity !== 'common') {
    const strip = doc.createElement('div');
    strip.className = `card-clone-rarity-strip card-clone-rarity-strip-${rarity}`;
    clone.appendChild(strip);
  }

  // ── [3] 크리스탈 패싯 ───────────────────────────────────────
  const facet = doc.createElement('div');
  facet.className = `card-clone-crystal-facet card-clone-crystal-facet-${typeClass || 'type-skill'}`;
  clone.appendChild(facet);

  // ── [4] 코스트 젬 ───────────────────────────────────────────
  const costEl = doc.createElement('div');
  costEl.className = 'card-clone-cost';

  if (anyFree && card.cost > 0) {
    costEl.classList.add('card-clone-cost-free');
  } else if (totalDisc > 0 && card.cost > 0) {
    costEl.classList.add('card-clone-cost-discounted');
  }
  costEl.textContent = displayCost;

  // FREE / 할인 서브배지
  if (card.cost > 0) {
    if (anyFree) {
      const fb = doc.createElement('span');
      fb.className = 'card-clone-cost-sub';
      fb.textContent = 'FREE';
      costEl.appendChild(fb);
    } else if (totalDisc > 0) {
      const db = doc.createElement('span');
      db.className = 'card-clone-cost-sub';
      db.textContent = `-${Math.min(totalDisc, card.cost)}`;
      costEl.appendChild(db);
    }
  }
  clone.appendChild(costEl);

  // ── [5] 강화 배지 ✦ ─────────────────────────────────────────
  if (card.upgraded) {
    const ub = doc.createElement('div');
    ub.className = 'card-clone-upgraded-badge';
    ub.textContent = '✦';
    clone.appendChild(ub);
  }

  // ── [6] 아이콘 ──────────────────────────────────────────────
  const icon = doc.createElement('div');
  icon.className = 'card-clone-icon';
  icon.textContent = card.icon;
  clone.appendChild(icon);

  // ── [7] 이름 ────────────────────────────────────────────────
  const name = doc.createElement('div');
  name.className = 'card-clone-name';
  name.textContent = card.name;
  clone.appendChild(name);

  // ── [8] 구분선 ──────────────────────────────────────────────
  const divider = doc.createElement('div');
  divider.className = 'card-clone-divider';
  clone.appendChild(divider);

  // ── [9] 설명 (DescriptionUtils 하이라이팅) ──────────────────
  const desc = doc.createElement('div');
  desc.className = 'card-clone-desc';
  if (globalThis.DescriptionUtils) {
    desc.innerHTML = globalThis.DescriptionUtils.highlight(card.desc);
  } else {
    desc.textContent = card.desc;
  }
  clone.appendChild(desc);

  // ── [10] 태그 (card_redesign.css 클래스 재활용) ─────────────
  if (tags.exhaust || tags.persistent || tags.instant) {
    const tagsEl = doc.createElement('div');
    tagsEl.className = 'card-clone-tags';

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
    clone.appendChild(tagsEl);
  }

  // ── [11] 카드 타입 ──────────────────────────────────────────
  const type = doc.createElement('div');
  type.className = `card-clone-type ${typeLblClass}`;
  type.textContent = card.type;
  clone.appendChild(type);

  // ── [12] Rare / Legendary 파티클 ────────────────────────────
  if (isLegendary || isRare) {
    const particleColor = isLegendary ? '#c084fc' : '#f0b429';
    clone.appendChild(_createCloneParticles(doc, particleColor));
  }

  // ── [13] 화살표 ─────────────────────────────────────────────
  const arrow = doc.createElement('div');
  arrow.className = 'card-clone-arrow';
  clone.appendChild(arrow);

  return clone;
}

/* ══════════════════════════════════════════════════════════════
   CloneManager — 클론 생명주기 관리 (싱글톤 IIFE)
   ═══════════════════════════════════════════════════════════════ */
const _CloneManager = (() => {
  let _layer  = null;   // #handCardCloneLayer 엘리먼트
  let _active = null;   // 현재 호버 중인 카드 엘리먼트
  const _map  = new WeakMap(); // cardEl → cloneEl

  /** fixed 레이어 참조 설정 (init 에서 호출) */
  function setLayer(el) { _layer = el; }

  /** 카드 → 클론 매핑 등록 */
  function register(cardEl, cloneEl) { _map.set(cardEl, cloneEl); }

  /** 클론 위치 계산 + 뷰포트 끝 보정 */
  function _calcPosition(cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const vw   = window.innerWidth;
    const cx   = rect.left + rect.width / 2;

    let left      = cx - _CLONE_W / 2;
    let arrowLeft = _CLONE_W / 2; // 화살표 기본값: 클론 중앙

    // 오른쪽 overflow 보정
    if (left + _CLONE_W > vw - _VIEWPORT_MARGIN) {
      const over = (left + _CLONE_W) - (vw - _VIEWPORT_MARGIN);
      left      -= over;
      arrowLeft += over;
    }
    // 왼쪽 overflow 보정
    if (left < _VIEWPORT_MARGIN) {
      const over = _VIEWPORT_MARGIN - left;
      left      += over;
      arrowLeft -= over;
    }
    // 화살표 클로내 범위 클램프 (테두리 안쪽 20px)
    arrowLeft = Math.max(20, Math.min(_CLONE_W - 20, arrowLeft));

    return {
      left,
      top: rect.top - _CLONE_H - _CLONE_GAP,
      arrowLeft,
    };
  }

  /** 클론 표시 */
  function show(cardEl, cloneEl, handZoneEl) {
    if (!_layer) return;
    if (_active && _active !== cardEl) hide();

    _active = cardEl;
    const { left, top, arrowLeft } = _calcPosition(cardEl);

    cloneEl.style.left = `${left}px`;
    cloneEl.style.top  = `${top}px`;

    const arrow = cloneEl.querySelector('.card-clone-arrow');
    if (arrow) arrow.style.left = `${arrowLeft}px`;

    _layer.appendChild(cloneEl);

    // 두 프레임 후 class 추가 → CSS transition 발동 (translateY 제거로 파티클 위치 정확)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => cloneEl.classList.add('card-clone-visible'))
    );

    cardEl.classList.add('card-clone-dimmed');
    handZoneEl?.classList.add('has-active-clone');
  }

  /** 클론 숨김 (transition out 후 DOM 제거) */
  function hide(handZoneEl) {
    if (!_active) return;
    const cloneEl = _map.get(_active);
    if (cloneEl) {
      cloneEl.classList.remove('card-clone-visible');
      const onEnd = () => {
        cloneEl.removeEventListener('transitionend', onEnd);
        if (cloneEl.parentNode === _layer) _layer.removeChild(cloneEl);
      };
      cloneEl.addEventListener('transitionend', onEnd);
    }
    _active.classList.remove('card-clone-dimmed');
    handZoneEl?.classList.remove('has-active-clone');
    _active = null;
  }

  /** 즉시 제거 (renderCombatCards 재렌더 시 호출) */
  function hideImmediate(handZoneEl) {
    if (!_layer) return;
    // 레이어 내 모든 클론 즉시 제거
    while (_layer.firstChild) _layer.removeChild(_layer.firstChild);
    if (_active) {
      _active.classList.remove('card-clone-dimmed');
      _active = null;
    }
    handZoneEl?.classList.remove('has-active-clone');
  }

  /** 창 크기 변경 / 스크롤 시 활성 클론 위치 재계산 */
  function _reposition() {
    if (!_active || !_layer) return;
    const cloneEl = _map.get(_active);
    if (!cloneEl?.parentNode) return;
    const { left, top, arrowLeft } = _calcPosition(_active);
    cloneEl.style.left = `${left}px`;
    cloneEl.style.top  = `${top}px`;
    const arrow = cloneEl.querySelector('.card-clone-arrow');
    if (arrow) arrow.style.left = `${arrowLeft}px`;
  }

  // 전역 이벤트 (한 번만 등록)
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', _reposition);
    window.addEventListener('scroll', _reposition, true);
  }

  return { setLayer, register, show, hide, hideImmediate };
})();

/* ══════════════════════════════════════════════════════════════
   HandCardCloneUI — 외부 공개 API
   ═══════════════════════════════════════════════════════════════ */
export const HandCardCloneUI = {

  /**
   * 초기화 — 게임 시작 시 1회 호출
   * @param {object} deps
   * @param {Document} [deps.doc]
   */
  init(deps = {}) {
    const doc = _getDoc(deps);
    if (doc.getElementById(_LAYER_ID)) return; // 중복 방지

    const layer = doc.createElement('div');
    layer.id = _LAYER_ID;
    doc.body.appendChild(layer);
    _CloneManager.setLayer(layer);
  },

  /**
   * renderCombatCards() 내 각 카드 엘리먼트에 클론 호버 바인딩
   *
   * ※ zone.textContent = '' 직후에 destroyAll() 을 먼저 호출하고,
   *   zone.appendChild(el) 직전에 이 메서드를 호출할 것.
   *
   * @param {HTMLElement} cardEl     — 카드 루트 엘리먼트
   * @param {string}      cardId     — 카드 ID
   * @param {object}      card       — cards 데이터 객체
   * @param {object}      costDisplay
   * @param {string|number} costDisplay.displayCost  — 표시 코스트
   * @param {boolean}     costDisplay.canPlay        — 사용 가능 여부
   * @param {boolean}     costDisplay.anyFree        — 무료 여부
   * @param {number}      costDisplay.totalDisc      — 총 할인량
   * @param {object}      deps
   * @param {Document}    [deps.doc]
   */
  attachToCard(cardEl, cardId, card, costDisplay, deps = {}) {
    // 에너지 부족 카드는 클론 미표시 — 기존 not-allowed 커서 그대로
    if (!costDisplay.canPlay) return;

    const doc         = _getDoc(deps);
    const handZoneEl  = doc.getElementById('combatHandCards');
    const cloneEl     = _buildCloneEl(doc, cardId, card, costDisplay);

    _CloneManager.register(cardEl, cloneEl);

    let enterTimer = null;
    let leaveTimer = null;

    cardEl.addEventListener('mouseenter', () => {
      clearTimeout(leaveTimer);
      enterTimer = setTimeout(
        () => _CloneManager.show(cardEl, cloneEl, handZoneEl),
        _HOVER_ENTER_MS
      );
    });

    cardEl.addEventListener('mouseleave', () => {
      clearTimeout(enterTimer);
      leaveTimer = setTimeout(
        () => _CloneManager.hide(handZoneEl),
        _HOVER_LEAVE_MS
      );
    });
  },

  /**
   * 모든 클론 즉시 파기 — renderCombatCards 재렌더 직전에 호출
   * @param {object} deps
   * @param {Document} [deps.doc]
   */
  destroyAll(deps = {}) {
    const doc        = _getDoc(deps);
    const handZoneEl = doc.getElementById('combatHandCards');
    _CloneManager.hideImmediate(handZoneEl);
  },
};
