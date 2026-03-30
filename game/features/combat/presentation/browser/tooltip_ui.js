import { ensureCombatTooltipBrowserModules } from '../../platform/browser/ensure_combat_tooltip_browser_modules.js';
import { bindTooltipTrigger } from '../../../../shared/ui/tooltip/public.js';

let _tooltipTimer = null;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

async function resolveTooltipCardId(el) {
  const tooltipModules = await ensureCombatTooltipBrowserModules();
  return tooltipModules?.extractTooltipCardId?.(el?.getAttribute?.('onclick'));
}

export const TooltipUI = {
  async preloadTooltipModules() {
    return ensureCombatTooltipBrowserModules();
  },

  async showTooltip(event, cardId, deps = {}) {
    const data = deps.data;
    const gs = deps.gs;
    if (!data?.cards || !gs) return;

    if (cardId === 'remove_card') {
      this.showGeneralTooltip(
        event,
        '🔥 스킬 소각',
        '덱에서 원하는 카드 1장을 영구히 제거합니다.\n\n조건: 덱에 카드가 있어야 합니다.',
        deps,
      );
      return;
    }

    const card = data.cards[cardId];
    if (!card) return;
    clearTimeout(_tooltipTimer);
    const doc = _getDoc(deps);
    const win = _getWin(deps);
    const tt = doc.getElementById('cardTooltip');
    if (!tt) return;

    const tooltipModules = await ensureCombatTooltipBrowserModules();
    tooltipModules?.renderCardTooltipContent?.(doc, card, gs, { cardId });
    const position = tooltipModules?.positionCardTooltip?.(event, tt, win);
    tt.classList.add('visible');
    tooltipModules?.syncCardKeywordTooltip?.(doc, card, position, win);
  },

  async hideTooltip(deps = {}) {
    const doc = _getDoc(deps);
    _tooltipTimer = setTimeout(() => {
      doc.getElementById('cardTooltip')?.classList.remove('visible');
      const st = doc.getElementById('subTooltip');
      if (st) st.style.display = 'none';
    }, 80);
  },

  attachCardTooltips(deps = {}) {
    const doc = _getDoc(deps);
    doc.querySelectorAll('#combatHandCards .card, #deckModalCards > div').forEach((el) => {
      bindTooltipTrigger(el, {
        label: el.getAttribute?.('aria-label') || el.getAttribute?.('title') || '카드 설명 보기',
        show: (event) => {
          void resolveTooltipCardId(el).then((cardId) => {
            if (cardId) return this.showTooltip(event, cardId, deps);
            return undefined;
          });
        },
        hide: () => {
          void this.hideTooltip(deps);
        },
      });
    });
  },

  async showItemTooltip(event, itemId, deps = {}) {
    const tooltipModules = await ensureCombatTooltipBrowserModules();
    tooltipModules?.showItemTooltipUi?.(event, itemId, deps);
  },

  async hideItemTooltip(deps = {}) {
    const tooltipModules = await ensureCombatTooltipBrowserModules();
    tooltipModules?.hideItemTooltipUi?.(deps);
  },

  async showGeneralTooltip(event, title, content, deps = {}) {
    const tooltipModules = await ensureCombatTooltipBrowserModules();
    tooltipModules?.showGeneralTooltipUi?.(event, title, content, deps);
  },

  async hideGeneralTooltip(deps = {}) {
    const tooltipModules = await ensureCombatTooltipBrowserModules();
    tooltipModules?.hideGeneralTooltipUi?.(deps);
  },
};
