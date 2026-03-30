import { SecurityUtils } from '../../ports/presentation/public_combat_browser_support_capabilities.js';
import { bindTooltipTrigger } from '../../../../shared/ui/tooltip/public.js';
import { COMBAT_TEXT } from './combat_copy.js';
import {
  updateActionButtons,
  updateItemPanels,
  updateRunModifierPanel,
} from './hud_panel_runtime_helpers.js';

function resolveTooltipUI(deps) {
  return deps.tooltipUI
    || deps.TooltipUI
    || null;
}

function resolveRegionAccessor(deps) {
  if (typeof deps.getRegionData === 'function') return deps.getRegionData;
  return null;
}

function updateClassPanels({ gs, deps, doc, data, setText }) {
  const player = gs.player;
  const avatarEl = doc.getElementById('playerAvatar');
  const largeFallback = doc.getElementById('playerPortraitFallback');
  const classMeta = data?.classes?.[player.class];

  if (player.class) {
    const avatarEmoji = classMeta?.emoji || '?';
    const className = classMeta?.name || player.class;

    if (avatarEl) {
      avatarEl.style.display = 'block';
      avatarEl.textContent = avatarEmoji;
      avatarEl.style.fontSize = '24px';
    }

    if (largeFallback) {
      largeFallback.textContent = avatarEmoji;
      largeFallback.style.fontSize = '80px';
      largeFallback.style.display = 'flex';
    }

    setText('playerNameDisplay', SecurityUtils.escapeHtml(className));
    setText('playerClassDisplay', className);
  }
}

function updateRunStats({ gs, setText }) {
  setText('hudGoldText', gs.player.gold);
  setText('runCount', gs.meta.runCount);
  setText('killCount', gs.player.kills);
  setText('goldCount', gs.player.gold);
}

function updateResourceCounts({ gs, setText }) {
  setText('deckCount', gs.player.deck.length);
  setText('graveCount', gs.player.graveyard.length);
  setText('deckSize', gs.player.deck.length);
  setText('graveyardSize', gs.player.graveyard.length);
  setText('exhaustSize', gs.player.exhausted.length);
  setText('combatDeckCount', gs.player.deck.length);
  setText('combatGraveCount', gs.player.graveyard.length);
  setText('combatExhaustCount', gs.player.exhausted.length);
}

function updateRegionPanels({ gs, deps, doc, setText }) {
  const getRegionData = resolveRegionAccessor(deps);
  const win = deps.win || { innerWidth: 1280, innerHeight: 720 };
  const tooltipUI = resolveTooltipUI(deps);
  const fallbackRegion = COMBAT_TEXT.regionFallback;
  const region = typeof getRegionData === 'function'
    ? (getRegionData(gs.currentRegion, gs) || fallbackRegion)
    : fallbackRegion;

  setText('regionName', region.name);
  setText('regionRule', region.rule);

  const regionNameEl = doc.getElementById('regionName');
  const regionRuleEl = doc.getElementById('regionRule');
  if (regionNameEl && regionRuleEl) {
    const showTooltip = (event) => {
      const title = `${region.name} - ${region.rule}`;
      const desc = region.ruleDesc || COMBAT_TEXT.regionFallback.ruleDesc;
      if (typeof tooltipUI?.showGeneralTooltip === 'function') {
        tooltipUI.showGeneralTooltip(event, title, desc, { doc, win });
      } else if (typeof deps.showGeneralTooltip === 'function') {
        deps.showGeneralTooltip(event, title, desc, { doc, win });
      }
    };
    const hideTooltip = () => {
      if (typeof tooltipUI?.hideGeneralTooltip === 'function') {
        tooltipUI.hideGeneralTooltip();
      } else if (typeof deps.hideGeneralTooltip === 'function') {
        deps.hideGeneralTooltip();
      }
    };

    [regionNameEl, regionRuleEl].forEach((el) => {
      const ariaLabel = `${region.name}. ${region.rule}. ${region.ruleDesc || COMBAT_TEXT.regionFallback.ruleDesc}`;
      bindTooltipTrigger(el, {
        bindMode: 'property',
        label: ariaLabel,
        show: showTooltip,
        hide: hideTooltip,
      });
    });
  }

  const maxFloors = region.floors || 5;
  const displayFloor = Math.min(maxFloors, gs.currentFloor);
  setText('regionFloor', `${displayFloor} / ${maxFloors}F`);
  setText('playerFloor', `${region.name} - ${displayFloor}F`);
}

export function updateHudPanels({ gs, deps, doc, data, setText }) {
  updateClassPanels({ gs, deps, doc, data, setText });
  updateRunStats({ gs, setText });
  updateResourceCounts({ gs, setText });
  updateRegionPanels({ gs, deps, doc, setText });
  updateItemPanels({ gs, deps, doc, data });
  updateRunModifierPanel({ gs, deps, doc });
  updateActionButtons({ gs, deps, doc, data });
  doc.getElementById('hoverHud')?.classList.toggle('low-hp', (gs.player.hp / gs.player.maxHp) * 100 <= 30);
}
