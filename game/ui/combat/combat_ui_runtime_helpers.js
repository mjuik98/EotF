import { StatusTooltipUI } from './status_tooltip_builder.js';
import { cleanupEnemyIntentTooltip } from './combat_intent_ui.js';

function getCombatWin(deps = {}) {
  return deps?.win || deps?.doc?.defaultView || null;
}

export function cleanupCombatTooltips(deps = {}) {
  const doc = deps.doc;
  if (!doc) return;

  StatusTooltipUI.hide({ doc });
  doc.getElementById('enemyStatusTooltip')?.classList.remove('visible');
  cleanupEnemyIntentTooltip({ ...deps, doc });
}

export function buildCombatEnemyHandlers(ui) {
  return {
    onShowStatusTooltip: ui.showEnemyStatusTooltip,
    onHideStatusTooltip: ui.hideEnemyStatusTooltip,
    onShowIntentTooltip: ui.showIntentTooltip,
    onHideIntentTooltip: ui.hideIntentTooltip,
  };
}

export function needsCombatEnemyFullRender(zone, enemies = [], forceFullRender = false) {
  const existing = zone?.querySelectorAll?.('.enemy-card') || [];
  const expectedCount = Array.isArray(enemies) ? enemies.length : 0;
  return forceFullRender || existing.length !== expectedCount || existing.length === 0;
}

export function renderCombatEnemyList(options = {}) {
  const {
    createEnemyCardView,
    deps = {},
    doc,
    buildEnemyViewModel,
    gs,
    data,
    handlers,
    syncCombatEnemyFloatingTooltips,
    ui,
    updateEnemyCardView,
    zone,
  } = options;

  if (!gs?.combat?.enemies || !data?.cards || !zone) return;

  const fullRender = needsCombatEnemyFullRender(zone, gs.combat.enemies, deps.forceFullRender);
  if (fullRender) {
    ui.cleanupAllTooltips({ doc, win: getCombatWin(deps) });
    zone.textContent = '';
    gs.combat.enemies.forEach((enemy, index) => {
      if (!enemy || !enemy.ai) return;
      const viewModel = buildEnemyViewModel({ enemy, index, gs, data, doc, deps, handlers });
      zone.appendChild(createEnemyCardView(viewModel));
    });
  } else {
    gs.combat.enemies.forEach((enemy, index) => {
      if (!enemy) return;
      const viewModel = buildEnemyViewModel({ enemy, index, gs, data, doc, deps, handlers });
      if (!gs.combat.playerTurn) viewModel.previewText = '';
      updateEnemyCardView(viewModel);
    });
  }

  syncCombatEnemyFloatingTooltips(doc);
}
