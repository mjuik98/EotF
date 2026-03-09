import { SecurityUtils } from '../../utils/security.js';
import { setActionButtonLabel } from './hud_render_helpers.js';
import { resolveDrawAvailability } from '../combat/draw_availability.js';
import { RARITY_SORT_ORDER } from '../../../data/rarity_meta.js';

function resolveSetBonusSystem(deps) {
  return deps.setBonusSystem
    || deps.SetBonusSystem
    || globalThis.SetBonusSystem
    || globalThis.GAME?.Modules?.['SetBonusSystem'];
}

function resolveTooltipUI(deps) {
  return deps.tooltipUI
    || deps.TooltipUI
    || globalThis.TooltipUI
    || globalThis.GAME?.Modules?.['TooltipUI'];
}

function resolveCardCostUtils(deps) {
  return deps.cardCostUtils
    || deps.CardCostUtils
    || globalThis.CardCostUtils
    || globalThis.GAME?.Modules?.['CardCostUtils'];
}

function resolveClassMechanics(deps) {
  return deps.classMechanics || globalThis.GAME?.Modules?.['ClassMechanics'];
}

function resolveRegionAccessor(deps) {
  if (typeof deps.getRegionData === 'function') return deps.getRegionData;
  if (typeof globalThis.getRegionData === 'function') return globalThis.getRegionData;
  return null;
}

function setSpecialContent(target, content, doc) {
  if (!target) return;
  target.textContent = '';
  const htmlElement = doc?.defaultView?.HTMLElement || globalThis.HTMLElement;
  if (htmlElement && content instanceof htmlElement) {
    target.appendChild(content);
  } else if (typeof content === 'string') {
    target.textContent = content;
  }
}

function updateClassPanels({ gs, deps, doc, data, setText }) {
  const player = gs.player;
  const avatarEl = doc.getElementById('playerAvatar');
  const largeFallback = doc.getElementById('playerPortraitFallback');
  const specialEl = doc.getElementById('playerSpecialDisplay');
  const hoverSpecialEl = doc.getElementById('hoverHudSpecial');
  const classMechanics = resolveClassMechanics(deps);
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

    if (specialEl && classMechanics?.[player.class]) {
      setSpecialContent(specialEl, classMechanics[player.class].getSpecialUI(gs), doc);
      specialEl.style.display = 'flex';
    } else if (specialEl) {
      specialEl.style.display = 'none';
    }
  }

  if (hoverSpecialEl && classMechanics?.[player.class]) {
    setSpecialContent(hoverSpecialEl, classMechanics[player.class].getSpecialUI(gs), doc);
  } else if (hoverSpecialEl) {
    hoverSpecialEl.textContent = '';
    const none = doc.createElement('span');
    none.style.cssText = 'font-size:10px;color:var(--text-dim);font-style:italic;';
    none.textContent = 'None';
    hoverSpecialEl.appendChild(none);
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
  const win = deps.win || globalThis.window || globalThis;
  const tooltipUI = resolveTooltipUI(deps);
  const fallbackRegion = { name: 'Unknown Region', rule: '-', floors: 5 };
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
      const desc = region.ruleDesc || 'Regional rule is active.';
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

    regionNameEl.onmouseenter = showTooltip;
    regionNameEl.onmouseleave = hideTooltip;
    regionRuleEl.onmouseenter = showTooltip;
    regionRuleEl.onmouseleave = hideTooltip;
  }

  const maxFloors = region.floors || 5;
  const displayFloor = Math.min(maxFloors, gs.currentFloor);
  setText('regionFloor', `${displayFloor} / ${maxFloors}F`);
  setText('playerFloor', `${region.name} - ${displayFloor}F`);
}

function updateItemPanels({ gs, deps, doc, data }) {
  const setBonusSystem = resolveSetBonusSystem(deps);
  const tooltipUI = resolveTooltipUI(deps);
  const win = deps.win || globalThis.window || globalThis;
  const itemEl = doc.getElementById('itemSlots');
  if (!itemEl) return;

  itemEl.textContent = '';
  if (!gs.player.items.length) {
    const none = doc.createElement('span');
    none.style.cssText = 'font-size:11px;color:var(--text-dim);font-style:italic;';
    none.textContent = 'Empty';
    itemEl.appendChild(none);
  } else {
    const sortedItems = [...gs.player.items].sort((a, b) => {
      const ra = RARITY_SORT_ORDER[data?.items?.[a]?.rarity || 'common'] ?? 3;
      const rb = RARITY_SORT_ORDER[data?.items?.[b]?.rarity || 'common'] ?? 3;
      return ra - rb;
    });

    const showItemTooltip = (event, itemId) => {
      if (typeof deps.showItemTooltip === 'function') {
        deps.showItemTooltip(event, itemId);
        return;
      }
      if (typeof tooltipUI?.showItemTooltip === 'function') {
        tooltipUI.showItemTooltip(event, itemId, { doc, win, data, gs, setBonusSystem });
      }
    };

    const hideItemTooltip = () => {
      if (typeof deps.hideItemTooltip === 'function') {
        deps.hideItemTooltip();
        return;
      }
      if (typeof tooltipUI?.hideItemTooltip === 'function') {
        tooltipUI.hideItemTooltip({ doc, win });
      }
    };

    sortedItems.forEach((id) => {
      const item = data?.items?.[id];
      if (!item) return;
      const slot = doc.createElement('div');
      slot.className = `hud-item-slot ${item.rarity ? `item-slot-${item.rarity}` : ''}`;
      const inSet = setBonusSystem
        ? Object.values(setBonusSystem.sets || {}).some((setInfo) => setInfo.items.includes(id))
        : false;
      if (inSet) slot.style.outline = '1px dashed rgba(0,255,204,0.4)';
      slot.textContent = item.icon;
      slot.addEventListener('mouseenter', (event) => showItemTooltip(event, id));
      slot.addEventListener('mouseleave', () => hideItemTooltip());
      itemEl.appendChild(slot);
    });
  }

  const setBonusPanel = doc.getElementById('setBonusPanel');
  if (!setBonusPanel) return;

  const activeSets = setBonusSystem?.getActiveSets?.(gs) || [];
  setBonusPanel.textContent = '';
  if (activeSets.length > 0) {
    setBonusPanel.style.display = 'block';
    activeSets.forEach((setInfo) => {
      const div = doc.createElement('div');
      div.style.cssText = 'background:rgba(0,255,204,0.06);border:1px solid rgba(0,255,204,0.2);border-radius:6px;padding:5px 8px;margin-bottom:4px;';
      const name = doc.createElement('div');
      name.style.cssText = "font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.2em;color:var(--cyan);";
      name.textContent = `${setInfo.name} [${setInfo.count}/3]`;
      const bonus = doc.createElement('div');
      bonus.style.cssText = 'font-size:9px;color:var(--text-dim);margin-top:2px;';
      bonus.textContent = setInfo.bonus?.label || '';
      div.append(name, bonus);
      setBonusPanel.appendChild(div);
    });
    setBonusSystem?.applyPassiveBonuses?.(gs);
  } else {
    setBonusPanel.style.display = 'none';
  }
}

function updateRunModifierPanel({ gs, deps, doc }) {
  const modEl = doc.getElementById('hudRunModifiers');
  if (!modEl) return;

  modEl.textContent = '';
  const runRules = deps.runRules;
  const asc = runRules?.getAscension?.(gs) || 0;
  const endless = runRules?.isEndless?.(gs);

  const topCont = doc.createElement('div');
  topCont.style.cssText = 'display:flex; gap:6px; flex-direction:column;';
  if (asc > 0) {
    const ascDiv = doc.createElement('div');
    ascDiv.style.cssText = "font-family:'Cinzel',serif; font-size:10px; color:var(--danger); letter-spacing:0.1em; background:rgba(255,51,102,0.1); border:1px solid rgba(255,51,102,0.2); border-radius:4px; padding:4px 8px; display:inline-block;";
    ascDiv.textContent = `Ascension ${asc}`;
    topCont.appendChild(ascDiv);
  }
  if (endless) {
    const endDiv = doc.createElement('div');
    endDiv.style.cssText = "font-family:'Cinzel',serif; font-size:10px; color:var(--cyan); letter-spacing:0.1em; background:rgba(0,255,204,0.1); border:1px solid rgba(0,255,204,0.2); border-radius:4px; padding:4px 8px; display:inline-block;";
    endDiv.textContent = 'Endless Mode';
    topCont.appendChild(endDiv);
  }
  modEl.appendChild(topCont);

  const curseId = gs.runConfig?.curse || 'none';
  const disabledInscriptions = new Set(gs.runConfig?.disabledInscriptions || []);
  const activeInscriptions = Object.entries(gs.meta?.inscriptions || {})
    .filter(([, value]) => Number(value) > 0)
    .filter(([id]) => !disabledInscriptions.has(id));

  if (activeInscriptions.length === 0 && curseId === 'none') return;

  const midCont = doc.createElement('div');
  midCont.style.cssText = 'margin-top:4px; display:flex; flex-direction:column; gap:4px;';
  if (activeInscriptions.length > 0) {
    const previewIds = activeInscriptions.slice(0, 3).map(([id]) => id);
    const previewNames = previewIds
      .map((id) => deps.data?.inscriptions?.[id]?.name)
      .filter(Boolean);
    const remaining = activeInscriptions.length - previewNames.length;
    const inscDiv = doc.createElement('div');
    inscDiv.style.cssText = 'font-size:11px; color:var(--echo-bright); background:rgba(123,47,255,0.08); border-radius:4px; padding:3px 8px; border:1px solid rgba(123,47,255,0.15); cursor:help;';
    inscDiv.title = previewNames.join(', ');
    inscDiv.textContent = remaining > 0
      ? `Inscriptions ${activeInscriptions.length}: ${previewNames.join(', ')} +${remaining}`
      : `Inscriptions ${activeInscriptions.length}${previewNames.length ? `: ${previewNames.join(', ')}` : ''}`;
    midCont.appendChild(inscDiv);
  }

  if (curseId !== 'none') {
    const curseInfo = runRules?.curses?.[curseId];
    if (curseInfo) {
      const curseDiv = doc.createElement('div');
      curseDiv.style.cssText = 'font-size:11px; color:var(--danger); background:rgba(255,51,102,0.08); border-radius:4px; padding:3px 8px; border:1px solid rgba(255,51,102,0.15); cursor:help;';
      curseDiv.title = curseInfo.desc;
      curseDiv.textContent = `${curseInfo.name}`;
      midCont.appendChild(curseDiv);
    }
  }

  modEl.appendChild(midCont);
}

function updateActionButtons({ gs, deps, doc, data }) {
  const player = gs.player;
  const cardCostUtils = resolveCardCostUtils(deps);
  const endBtn = doc.querySelector('.action-btn-end');
  if (endBtn && gs.combat.active && gs.combat.playerTurn) {
    const hasPlayable = player.hand.some((id, handIndex) => {
      const card = data?.cards?.[id];
      if (!card) return false;
      const cost = typeof cardCostUtils?.calcEffectiveCost === 'function'
        ? cardCostUtils.calcEffectiveCost(id, card, player, handIndex)
        : card.cost;
      return player.energy >= cost;
    });
    endBtn.classList.toggle('energy-warn', hasPlayable && player.energy > 0);
  }

  const echoBtn = doc.getElementById('useEchoSkillBtn');
  if (echoBtn) {
    if (typeof deps.updateEchoSkillBtn === 'function') {
      deps.updateEchoSkillBtn({ ...deps, gs });
    } else {
      const echoValue = Math.floor(player.echo);
      const tier = echoValue >= 100 ? 3 : echoValue >= 60 ? 2 : echoValue >= 30 ? 1 : 0;
      const nextTarget = echoValue < 30 ? 30 : (echoValue < 60 ? 60 : 100);
      echoBtn.disabled = tier === 0;
      echoBtn.style.opacity = tier === 0 ? '0.45' : '1';
      setActionButtonLabel(echoBtn, `Echo Skill (${echoValue}/${nextTarget})`, 'E');
    }
  }

  const drawBtn = doc.getElementById('combatDrawCardBtn');
  if (!drawBtn) return;

  const drawState = resolveDrawAvailability(gs);
  drawBtn.disabled = !drawState.canDraw;
  drawBtn.classList.toggle('hand-full', drawState.handFull);
  drawBtn.style.opacity = drawState.canDraw ? '1' : '0.4';
  if (drawState.inCombat) {
    if (!drawState.playerTurn) {
      setActionButtonLabel(drawBtn, 'Turn Locked', 'Q');
      drawBtn.title = 'Cannot draw cards during the enemy turn.';
    } else if (drawState.handFull) {
      setActionButtonLabel(drawBtn, 'Hand Full', 'Q');
      drawBtn.title = `Your hand is full (max ${drawState.maxHand}).`;
    } else if (!drawState.hasEnergy) {
      setActionButtonLabel(drawBtn, 'No Energy', 'Q');
      drawBtn.title = 'Drawing a card costs 1 energy.';
    } else {
      setActionButtonLabel(drawBtn, 'Draw Card (1 Energy)', 'Q');
      drawBtn.title = 'Draw 1 card for 1 energy.';
    }
  } else {
    setActionButtonLabel(drawBtn, 'Draw Card (1 Energy)', 'Q');
    drawBtn.title = 'This action is available during combat.';
  }
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
