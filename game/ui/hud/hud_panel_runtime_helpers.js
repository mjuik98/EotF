import { RARITY_SORT_ORDER } from '../../../data/rarity_meta.js';
import { resolveDrawAvailability } from '../combat/draw_availability.js';
import { setActionButtonLabel } from './hud_render_helpers.js';

function resolveSetBonusSystem(deps) {
  return deps.setBonusSystem
    || deps.SetBonusSystem
    || null;
}

function resolveTooltipUI(deps) {
  return deps.tooltipUI
    || deps.TooltipUI
    || null;
}

function resolveCardCostUtils(deps) {
  return deps.cardCostUtils
    || deps.CardCostUtils
    || null;
}

export function updateItemPanels({ gs, deps, doc, data }) {
  const setBonusSystem = resolveSetBonusSystem(deps);
  const tooltipUI = resolveTooltipUI(deps);
  const win = deps.win || doc?.defaultView || null;
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

export function updateRunModifierPanel({ gs, deps, doc }) {
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

export function updateActionButtons({ gs, deps, doc, data }) {
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
