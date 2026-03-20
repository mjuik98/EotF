import { resolveDrawAvailability } from './draw_availability.js';
import { setActionButtonLabel } from './hud_render_helpers.js';

function resolveCardCostUtils(deps) {
  return deps.cardCostUtils
    || deps.CardCostUtils
    || null;
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
