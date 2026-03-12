import { getRaf } from '../../utils/runtime_deps.js';

let _uiPending = false;

export function resolvePartialHudDeps(gs, deps = {}, getDoc) {
  const resolvedDoc = getDoc(deps);
  const resolvedWin = deps?.win || resolvedDoc?.defaultView || null;

  return {
    ...deps,
    gs,
    doc: deps?.doc || resolvedDoc,
    win: deps?.win || resolvedWin,
  };
}

export function updateEndButtonWarn(gs, doc) {
  if (!gs) return;
  const btn = doc.getElementById('combatOverlay')?.querySelector('.action-btn-end');
  if (!btn) return;
  const hasEnergy = gs.player.energy > 0 && gs.combat.active && gs.combat.playerTurn;
  btn.classList.toggle('energy-warn', hasEnergy);
}

export function scheduleHudUpdate(deps = {}, refresh) {
  const isGameStarted = typeof deps.isGameStarted === 'function'
    ? deps.isGameStarted()
    : !!deps.gameStarted;

  if (!isGameStarted) {
    refresh();
    return;
  }

  if (_uiPending) return;
  _uiPending = true;

  const raf = getRaf(deps);
  if (typeof raf === 'function') {
    raf(() => {
      _uiPending = false;
      refresh();
    });
    return;
  }

  _uiPending = false;
  refresh();
}

export function processHudDirtyFlags(gs, deps = {}, updateUI) {
  if (!gs || !gs.isDirty()) return;

  if (gs.hasDirtyFlag('hud')) {
    updateUI();
  }

  const renderCombatEnemies = deps.renderCombatEnemies;
  if (gs.hasDirtyFlag('enemies') && typeof renderCombatEnemies === 'function') {
    renderCombatEnemies();
  }

  const renderCombatCards = deps.renderCombatCards;
  if (gs.hasDirtyFlag('hand') && typeof renderCombatCards === 'function') {
    renderCombatCards();
  }

  gs.clearDirty();
}

export function performHudRefresh({
  gs,
  deps = {},
  doc,
  setText,
  renderFloatingPlayerHpPanel,
  updatePlayerStatsUI,
  updateCombatEnergyUI,
  updateHudPanels,
  updateEndBtnWarn,
}) {
  const player = gs?.player;
  if (!gs || !player) return;

  const data = deps.data;
  const domDeps = deps?.doc ? deps : { ...deps, doc };
  const setDomText = (id, val) => setText(id, val, domDeps);

  renderFloatingPlayerHpPanel({ ...deps, doc, gs });
  updatePlayerStatsUI(gs, domDeps);
  updateCombatEnergyUI(gs, domDeps);

  if (typeof deps.updateNoiseWidget === 'function') deps.updateNoiseWidget();

  updateHudPanels({ gs, deps, doc, data, setText: setDomText });

  const updateStatusDisplay = deps.updateStatusDisplay;
  if (typeof updateStatusDisplay === 'function') updateStatusDisplay();
  updateEndBtnWarn?.();

  gs.clearDirtyFlag('hud');
}
