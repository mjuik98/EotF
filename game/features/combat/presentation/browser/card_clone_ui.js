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
import {
  bindCardCloneKeywordPanelInteractions,
} from './card_clone_keyword_interactions.js';
import {
  applyKeywordPanelPlacement,
  collectAvoidRects,
} from './card_clone_positioning.js';
import { createCardCloneRuntime } from './card_clone_runtime_ui.js';
import {
  createCombatSurfaceStateController,
} from './combat_surface_state.js';

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
    _cloneRuntime.setAvoidRectsResolver(() => collectAvoidRects(doc, _AVOID_SELECTOR));
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
    cloneEl.__onClonePositionChange = (position) => applyKeywordPanelPlacement(cardEl, cloneEl, {
      cloneHeight: _CLONE_H,
      clonePosition: position,
      cloneRuntime: _cloneRuntime,
      cloneWidth: _CLONE_W,
      createSurfaceStateController: createCombatSurfaceStateController,
      doc,
      hoverKeywordLayout: _HOVER_KEYWORD_LAYOUT,
      avoidSelector: _AVOID_SELECTOR,
      viewportMargin: _VIEWPORT_MARGIN,
      win,
    });
    bindCardCloneKeywordPanelInteractions(cloneEl, {
      createSurfaceStateController: createCombatSurfaceStateController,
    });

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
