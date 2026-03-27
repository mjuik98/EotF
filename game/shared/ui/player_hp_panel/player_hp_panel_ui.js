import { buildFloatingPlayerHpPanel, getPlayerHpPanelLevel } from './player_hp_panel_render.js';
import {
  captureFloatingTooltipState,
  resolveStatusEffectsUI,
  restoreFloatingTooltipState,
  shouldShowFloatingPlayerHpPanel,
} from './player_hp_panel_runtime.js';

function getDoc(deps = {}) {
  return deps.doc || null;
}

export { getPlayerHpPanelLevel };

export function removeFloatingPlayerHpPanel(deps = {}) {
  const doc = getDoc(deps);
  if (!doc) return null;
  doc.getElementById('ncFloatingHpShell')?.remove();
  return null;
}

export function renderFloatingPlayerHpPanel(deps = {}) {
  const doc = getDoc(deps);
  if (!doc) return null;
  const gs = deps.gs;
  const existingShell = doc.getElementById('ncFloatingHpShell');
  const tooltipState = existingShell ? captureFloatingTooltipState(doc) : null;

  if (!shouldShowFloatingPlayerHpPanel(gs)) {
    return removeFloatingPlayerHpPanel({ doc });
  }

  const shell = existingShell || doc.createElement('div');
  shell.id = 'ncFloatingHpShell';
  shell.className = 'nc-floating-hp-shell';

  shell.textContent = '';
  shell.appendChild(buildFloatingPlayerHpPanel(doc, gs, deps, {
    panelId: 'ncFloatingHpPanel',
    statusContainerId: 'ncFloatingHpStatusBadges',
    statusEffectsUI: resolveStatusEffectsUI(deps),
  }));

  if (!existingShell) {
    doc.body?.appendChild(shell);
  }

  restoreFloatingTooltipState(doc, gs, deps, tooltipState);
  return shell;
}
