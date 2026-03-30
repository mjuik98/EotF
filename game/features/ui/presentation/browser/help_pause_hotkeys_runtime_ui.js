import {
  closeTopEscapeSurface,
  getRunHotkeyPolicy,
  getRunHotkeyState,
  isVisibleModal,
} from '../../../run_session/ports/public_hotkey_capabilities.js';

export function closeOverlayOnEscape(event, element, onClose, swallowEscape) {
  if (!element) return false;
  swallowEscape(event);
  onClose();
  return true;
}

export function closeVisibleModalById(event, doc, id, onClose, swallowEscape) {
  const el = doc.getElementById(id);
  if (!isVisibleModal(el, doc)) return false;
  swallowEscape(event);
  onClose(el);
  return true;
}

export function cycleNextTarget(gs, deps) {
  if (typeof deps?.cycleNextCombatTarget === 'function') {
    return deps.cycleNextCombatTarget(gs, deps);
  }

  const enemies = gs?.combat?.enemies || [];
  const aliveIndices = enemies
    .map((enemy, idx) => (enemy.hp > 0 ? idx : -1))
    .filter((idx) => idx >= 0);

  if (aliveIndices.length <= 1) return false;

  const current = aliveIndices.indexOf(gs?._selectedTarget ?? -1);
  const nextTarget = aliveIndices[(current + 1) % aliveIndices.length];
  gs._selectedTarget = nextTarget;
  if (typeof gs?.addLog === 'function') {
    gs.addLog(`🎯 대상: ${enemies[nextTarget].name}`, 'system');
  }
  if (typeof deps?.renderCombatEnemies === 'function') {
    deps.renderCombatEnemies();
  }
  return true;
}

export function handleEscapeHotkey(event, { deps, doc, gs, ui, swallowEscape }) {
  const runHotkeyState = getRunHotkeyState(doc, gs);
  const hotkeyPolicy = getRunHotkeyPolicy(runHotkeyState.mode);

  if (closeTopEscapeSurface(event, {
    deps,
    doc,
    scope: 'run',
    swallowEscape,
    ui,
  })) {
    return true;
  }

  if (hotkeyPolicy.pause && !ui.isHelpOpen()) {
    swallowEscape(event);
    ui.togglePause(deps);
    return true;
  }

  return runHotkeyState.mode === 'title';
}
