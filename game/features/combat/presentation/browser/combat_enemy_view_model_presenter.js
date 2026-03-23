import { CardCostUtils } from '../../ports/public_presentation_support_capabilities.js';
import { COMBAT_TEXT } from './combat_copy.js';
import { calcSelectedPreview, enemyHpColor, selectedPreviewText } from './combat_render_helpers.js';
import { buildEnemyStatusBadges } from './combat_enemy_status_badges_ui.js';
import {
  formatEnemyIntentLabel,
  getEnemyIntentIcon,
  resolveEnemyIntent,
} from './combat_intent_ui.js';

function getCombatWin(deps = {}) {
  return deps?.win || window;
}

function calcEnemySelectedPreview(gs, data, enemy) {
  return calcSelectedPreview(gs, data, enemy, CardCostUtils);
}

export function buildEnemyHpText(enemy) {
  return `${enemy.hp} / ${enemy.maxHp}${enemy.shield ? ` (${COMBAT_TEXT.shieldLabel} ${enemy.shield})` : ''}`;
}

export function buildEnemyViewModel({ enemy, index, gs, data, doc, deps, handlers }) {
  const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  const intent = resolveEnemyIntent(enemy, gs.combat.turn);
  let intentIcon = getEnemyIntentIcon(intent);
  let intentLabel = formatEnemyIntentLabel(intent);
  let intentDmgVal = intent.dmg;

  if (gs.combat.turn <= 0) {
    intentIcon = '?';
    intentLabel = '행동 없음';
    intentDmgVal = 0;
  }

  const isSelected = gs._selectedTarget === index && enemy.hp > 0;
  const preview = isSelected ? calcEnemySelectedPreview(gs, data, enemy) : null;

  return {
    doc,
    enemy,
    index,
    hpPct,
    isSelected,
    hpText: buildEnemyHpText(enemy),
    spriteIcon: enemy.icon || '?',
    intentIcon,
    intentLabelHtml: intentLabel,
    intentDmgVal,
    statusFragment: buildEnemyStatusBadges(enemy.statusEffects, doc, handlers),
    previewText: preview ? selectedPreviewText(preview) : '',
    hpBarBackground: enemyHpColor(hpPct),
    selectedMarkerText: '',
    onSelectTarget: enemy.hp > 0
      ? () => {
        const selectHandler = deps.selectTarget || getCombatWin(deps)[deps.selectTargetHandlerName || 'selectTarget'];
        if (typeof selectHandler === 'function') selectHandler(index);
      }
      : null,
    onIntentEnter: (event) => handlers.onShowIntentTooltip(event, index, deps),
    onIntentLeave: () => handlers.onHideIntentTooltip(deps),
  };
}
