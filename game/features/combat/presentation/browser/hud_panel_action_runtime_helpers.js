import { resolveDrawAvailability } from './draw_availability.js';
import {
  applyCombatDrawButtonCopy,
  formatEchoSkillButtonText,
  setActionButtonLabel,
} from './hud_render_helpers.js';

function resolveCardCostUtils(deps) {
  return deps.cardCostUtils
    || deps.CardCostUtils
    || null;
}

export function updateActionButtons({ gs, deps, doc, data }) {
  const player = gs.player;
  const cardCostUtils = resolveCardCostUtils(deps);
  const triggerItems = typeof gs?.triggerItems === 'function'
    ? gs.triggerItems.bind(gs)
    : gs?.triggerItems;
  const endBtn = doc.querySelector('.action-btn-end');
  if (endBtn && gs.combat.active && gs.combat.playerTurn) {
    const hasPlayable = player.hand.some((id, handIndex) => {
      const card = data?.cards?.[id];
      if (!card) return false;
      return typeof cardCostUtils?.canPlay === 'function'
        ? cardCostUtils.canPlay(id, card, player, handIndex, { triggerItems })
        : player.energy >= card.cost;
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
      echoBtn.disabled = tier === 0;
      echoBtn.style.opacity = tier === 0 ? '0.45' : '1';
      setActionButtonLabel(echoBtn, formatEchoSkillButtonText(echoValue), 'E');
    }
  }

  const drawBtn = doc.getElementById('combatDrawCardBtn');
  if (!drawBtn) return;

  const drawState = resolveDrawAvailability(gs);
  drawBtn.disabled = !drawState.canDraw;
  drawBtn.classList.toggle('hand-full', drawState.handFull);
  drawBtn.style.opacity = drawState.canDraw ? '1' : '0.4';
  applyCombatDrawButtonCopy(drawBtn, drawState, 'Q');
}
