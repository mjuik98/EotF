import { enemyHpColor } from './combat_render_helpers.js';
import { syncEnemyIntentTooltipAnchor } from './combat_intent_ui.js';
import { buildEnemyHpText } from './combat_enemy_view_model_ui.js';

export function syncCombatEnemyFloatingTooltips(doc) {
  const statusTip = doc.getElementById('enemyStatusTooltip');
  if (statusTip?.classList.contains('visible') && !doc.querySelector('.enemy-status-badge:hover')) {
    statusTip.classList.remove('visible');
  }

  syncEnemyIntentTooltipAnchor(doc);
}

export function buildEnemyHpUpdateViewModel({ doc, index, enemy }) {
  const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  return {
    doc,
    index,
    enemy,
    hpPct,
    hpText: buildEnemyHpText(enemy),
    hpBarBackground: enemyHpColor(hpPct),
  };
}
