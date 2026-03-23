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
 *      HandCardCloneUI.init({ doc });
 *      expose HandCardCloneUI through your host runtime if needed.
 *
 * 2) card_ui.js renderCombatCards() 내부,
 *    zone.textContent = ''; 바로 뒤에 추가:
 *      HandCardCloneUI?.destroyAll({ doc });
 *
 *    zone.appendChild(el); 바로 앞에 추가:
 *      if (HandCardCloneUI) {
 *        HandCardCloneUI.attachToCard(el, card, {
 *          doc, canPlay, displayCost: cost, anyFree, totalDisc,
 *        });
 *      }
 *
 * 3) card_ui.js 에서 손패 카드의 showTooltipHandler / hideTooltipHandler
 *    는 제거하거나 클론과 중복되지 않도록 조건부 처리 권장.
 */
import {
  createHandCardCloneElement,
  DEFAULT_HOVER_KEYWORD_LAYOUT,
} from './card_clone_render_ui.js';
import { createCardCloneRuntime } from './card_clone_runtime_ui.js';
import {
  createUiSurfaceStateController,
} from '../../../../shared/ui/state/ui_surface_state_controller.js';

/* ── 상수 ──────────────────────────────────────────────────── */
const _LAYER_ID       = 'handCardCloneLayer';
const _CLONE_W        = 200;   // px  (원본 100px × 2.0)
const _CLONE_H        = 292;   // px  (원본 146px × 2.0)
const _CLONE_GAP      = 16;    // 카드 상단 ~ 클론 하단 여백
const _VIEWPORT_MARGIN = 14;   // 뷰포트 끝 최소 여백
const _HOVER_KEYWORD_LAYOUT = DEFAULT_HOVER_KEYWORD_LAYOUT;
const _HOVER_ENTER_MS  = 100;  // 클론 표시 딜레이 (빠른 이동 시 깜빡임 방지)
const _HOVER_LEAVE_MS  = 60;   // 클론 숨김 딜레이
const _AVOID_SELECTOR = [
  '#combatRelicRail',
  '#recentCombatFeed',
  '#combatDrawCardBtn',
  '#useEchoSkillBtn',
  '.enemy-card',
  '.enemy-intent',
].join(',');

/* ── 내부 헬퍼 ─────────────────────────────────────────────── */
function _getDoc(deps) { return deps?.doc || deps?.win?.document || null; }
function _getWin(deps) { return deps?.win || deps?.doc?.defaultView || null; }

function _getRectArea(rect = {}) {
  return Math.max(0, (rect.right || 0) - (rect.left || 0)) * Math.max(0, (rect.bottom || 0) - (rect.top || 0));
}

function _getOverlapArea(leftRect, rightRect) {
  const overlapW = Math.max(0, Math.min(leftRect.right, rightRect.right) - Math.max(leftRect.left, rightRect.left));
  const overlapH = Math.max(0, Math.min(leftRect.bottom, rightRect.bottom) - Math.max(leftRect.top, rightRect.top));
  return overlapW * overlapH;
}

function _isWithinElement(target, root) {
  let current = target || null;
  while (current) {
    if (current === root) return true;
    current = current.parentNode || null;
  }
  return false;
}

function _collectAvoidRects(doc) {
  return Array.from(doc?.querySelectorAll?.(_AVOID_SELECTOR) || [])
    .filter((element) => typeof element?.getBoundingClientRect === 'function')
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => _getRectArea(rect) > 0);
}

function _applyArrowPlacement(cloneEl, cardPlacement) {
  const arrow = cloneEl?.querySelector?.('.card-clone-arrow');
  if (!arrow) return;

  if (cardPlacement === 'below') {
    arrow.style.top = '-10px';
    arrow.style.bottom = 'auto';
    arrow.style.borderTop = '0';
    arrow.style.borderBottom = '10px solid rgba(80, 70, 130, 0.45)';
    return;
  }

  arrow.style.top = 'auto';
  arrow.style.bottom = '-10px';
  arrow.style.borderBottom = '0';
  arrow.style.borderTop = '10px solid rgba(80, 70, 130, 0.45)';
}

function _applyKeywordPanelPlacement(cardEl, cloneEl, win, doc, clonePosition = null) {
  const keywordPanel = cloneEl?.querySelector?.('.card-clone-keyword-panel');
  if (!keywordPanel) return;
  const cloneState = createUiSurfaceStateController({ element: cloneEl });

  const position = clonePosition || _cloneRuntime.calcPosition(cardEl);
  const {
    left,
    top,
    cardPlacement,
    keywordPlacement: preferredPlacement = 'right',
  } = position;
  const viewportWidth = Number(win?.innerWidth) || 0;
  const viewportHeight = Number(win?.innerHeight) || 0;
  const avoidRects = _collectAvoidRects(doc);
  const cloneBox = {
    left,
    top,
    right: left + _CLONE_W,
    bottom: top + _CLONE_H,
  };
  const candidates = [
    {
      placement: 'right',
      rect: {
        left: cloneBox.right + _HOVER_KEYWORD_LAYOUT.panelGap,
        top: cloneBox.top + (_CLONE_H - _HOVER_KEYWORD_LAYOUT.panelEstimatedHeight) / 2,
        right: cloneBox.right + _HOVER_KEYWORD_LAYOUT.panelGap + _HOVER_KEYWORD_LAYOUT.panelWidth,
        bottom: cloneBox.top + (_CLONE_H - _HOVER_KEYWORD_LAYOUT.panelEstimatedHeight) / 2 + _HOVER_KEYWORD_LAYOUT.panelEstimatedHeight,
      },
    },
    {
      placement: 'left',
      rect: {
        left: cloneBox.left - _HOVER_KEYWORD_LAYOUT.panelGap - _HOVER_KEYWORD_LAYOUT.panelWidth,
        top: cloneBox.top + (_CLONE_H - _HOVER_KEYWORD_LAYOUT.panelEstimatedHeight) / 2,
        right: cloneBox.left - _HOVER_KEYWORD_LAYOUT.panelGap,
        bottom: cloneBox.top + (_CLONE_H - _HOVER_KEYWORD_LAYOUT.panelEstimatedHeight) / 2 + _HOVER_KEYWORD_LAYOUT.panelEstimatedHeight,
      },
    },
    {
      placement: 'bottom',
      rect: {
        left: cloneBox.left + (_CLONE_W - _HOVER_KEYWORD_LAYOUT.panelWidth) / 2,
        top: cloneBox.bottom + _HOVER_KEYWORD_LAYOUT.panelGap + _HOVER_KEYWORD_LAYOUT.bottomOffset,
        right: cloneBox.left + (_CLONE_W - _HOVER_KEYWORD_LAYOUT.panelWidth) / 2 + _HOVER_KEYWORD_LAYOUT.panelWidth,
        bottom: cloneBox.bottom + _HOVER_KEYWORD_LAYOUT.panelGap + _HOVER_KEYWORD_LAYOUT.bottomOffset + _HOVER_KEYWORD_LAYOUT.panelEstimatedHeight,
      },
    },
  ].map((candidate) => {
    const overflowPenalty = Math.max(0, _VIEWPORT_MARGIN - candidate.rect.left)
      + Math.max(0, _VIEWPORT_MARGIN - candidate.rect.top)
      + Math.max(0, candidate.rect.right + _VIEWPORT_MARGIN - viewportWidth)
      + Math.max(0, candidate.rect.bottom + _VIEWPORT_MARGIN - viewportHeight);
    const overlapPenalty = avoidRects.reduce((total, rect) => total + _getOverlapArea(candidate.rect, rect), 0);
    const preferenceBias = candidate.placement === preferredPlacement
      ? 0
      : candidate.placement === 'right'
        ? 10
        : candidate.placement === 'left'
          ? 20
          : 40;
    return {
      ...candidate,
      score: overflowPenalty * 1000 + overlapPenalty + preferenceBias,
    };
  }).sort((leftCandidate, rightCandidate) => leftCandidate.score - rightCandidate.score);

  const best = candidates[0];
  cloneState.setValue('cardPlacement', cardPlacement);
  cloneState.setValue('keywordPlacement', best.placement);
  _applyArrowPlacement(cloneEl, cardPlacement);
}

function _bindKeywordPanelInteractions(cloneEl) {
  const mechanicsRow = cloneEl?.querySelector?.('.card-hover-mechanics');
  const keywordPanel = cloneEl?.querySelector?.('.card-clone-keyword-panel');
  if (!mechanicsRow || !keywordPanel) return;
  const cloneState = createUiSurfaceStateController({ element: cloneEl });
  const keywordPanelState = createUiSurfaceStateController({ element: keywordPanel });

  const triggers = Array.from(mechanicsRow.children || []);
  const setOpen = (open) => {
    cloneState.setBoolean('keywordPanelOpen', open);
    keywordPanelState.setOpen(open);
  };
  const isTriggerTarget = (target) => triggers.includes(target);
  const activateTrigger = (trigger) => {
    const index = Number(trigger?.dataset?.keywordIndex || 0);
    keywordPanel.__setActiveKeyword?.(index);
    setOpen(true);
  };

  setOpen(false);

  triggers.forEach((trigger) => {
    const closeIfLeaving = (event = {}) => {
      if (_isWithinElement(event.relatedTarget, keywordPanel) || isTriggerTarget(event.relatedTarget)) return;
      setOpen(false);
    };
    trigger.addEventListener('mouseenter', () => activateTrigger(trigger));
    trigger.addEventListener('focus', () => activateTrigger(trigger));
    trigger.addEventListener('click', () => activateTrigger(trigger));
    trigger.addEventListener('mouseleave', closeIfLeaving);
    trigger.addEventListener('blur', closeIfLeaving);
  });

  keywordPanel.addEventListener('mouseenter', () => setOpen(true));
  keywordPanel.addEventListener('focusin', () => setOpen(true));
  keywordPanel.addEventListener('mouseleave', (event = {}) => {
    if (isTriggerTarget(event.relatedTarget) || _isWithinElement(event.relatedTarget, keywordPanel)) return;
    setOpen(false);
  });
  keywordPanel.addEventListener('focusout', (event = {}) => {
    if (isTriggerTarget(event.relatedTarget) || _isWithinElement(event.relatedTarget, keywordPanel)) return;
    setOpen(false);
  });
}

/* ══════════════════════════════════════════════════════════════
   CloneManager — 클론 생명주기 관리 (싱글톤 IIFE)
   ═══════════════════════════════════════════════════════════════ */
const _cloneRuntime = createCardCloneRuntime({
  cloneWidth: _CLONE_W,
  cloneHeight: _CLONE_H,
  cloneGap: _CLONE_GAP,
  keywordPanelGap: _HOVER_KEYWORD_LAYOUT.panelGap,
  keywordPanelWidth: _HOVER_KEYWORD_LAYOUT.panelWidth,
  viewportMargin: _VIEWPORT_MARGIN,
});

let _boundView = null;

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
    const win = _getWin(deps);
    if (!doc) return;
    if (doc.getElementById(_LAYER_ID)) return; // 중복 방지

    _cloneRuntime.setView(win);
    _cloneRuntime.setRequestFrame(
      typeof win?.requestAnimationFrame === 'function'
        ? win.requestAnimationFrame.bind(win)
        : ((callback) => setTimeout(callback, 16)),
    );
    _cloneRuntime.setAvoidRectsResolver(() => _collectAvoidRects(doc));
    if (win && _boundView !== win) {
      _boundView?.removeEventListener?.('resize', _cloneRuntime.reposition);
      _boundView?.removeEventListener?.('scroll', _cloneRuntime.reposition, true);
      win.addEventListener?.('resize', _cloneRuntime.reposition);
      win.addEventListener?.('scroll', _cloneRuntime.reposition, true);
      _boundView = win;
    }

    const layer = doc.createElement('div');
    layer.id = _LAYER_ID;
    doc.body.appendChild(layer);
    _cloneRuntime.setLayer(layer);
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
    const doc         = _getDoc(deps);
    const win         = _getWin(deps);
    if (!doc) return;
    const handZoneEl  = doc.getElementById('combatHandCards');
    doc.descriptionUtils = deps.descriptionUtils || deps.DescriptionUtils || doc.descriptionUtils || null;
    const cloneEl     = createHandCardCloneElement(doc, cardId, card, costDisplay, {
      hoverKeywordLayout: _HOVER_KEYWORD_LAYOUT,
    });
    cloneEl.style.pointerEvents = 'auto';
    // Clone hover owns the hand-card preview contract. Keep all hover/panel state on the clone tree.
    cloneEl.__onClonePositionChange = (position) => _applyKeywordPanelPlacement(cardEl, cloneEl, win, doc, position);
    _bindKeywordPanelInteractions(cloneEl);

    _cloneRuntime.register(cardEl, cloneEl);

    let enterTimer = null;
    let leaveTimer = null;
    const cancelLeave = () => clearTimeout(leaveTimer);
    const queueHide = () => {
      clearTimeout(enterTimer);
      leaveTimer = setTimeout(
        () => _cloneRuntime.hide(handZoneEl),
        _HOVER_LEAVE_MS
      );
    };

    cloneEl.addEventListener('mouseenter', cancelLeave);
    cloneEl.addEventListener('mouseleave', queueHide);

    cardEl.addEventListener('mouseenter', () => {
      cancelLeave();
      enterTimer = setTimeout(
        () => _cloneRuntime.show(cardEl, cloneEl, handZoneEl),
        _HOVER_ENTER_MS
      );
    });

    cardEl.addEventListener('mouseleave', queueHide);
  },

  /**
   * 모든 클론 즉시 파기 — renderCombatCards 재렌더 직전에 호출
   * @param {object} deps
   * @param {Document} [deps.doc]
   */
  destroyAll(deps = {}) {
    const doc        = _getDoc(deps);
    if (!doc) return;
    const handZoneEl = doc.getElementById('combatHandCards');
    _cloneRuntime.hideImmediate(handZoneEl);
  },
};
