export function resolveStatusEffectsUI(deps = {}) {
  return deps.StatusEffectsUI
    || deps.statusEffectsUI
    || null;
}

export function resolveStatusTooltipUI(deps = {}) {
  return deps.StatusTooltipUI
    || deps.statusTooltipUI
    || null;
}

export function shouldShowFloatingPlayerHpPanel(gs) {
  return !!gs?.player && (
    gs?.combat?.active === true
    || gs?.currentScreen === 'game'
    || gs?.currentScreen === 'combat'
  );
}

export function findBadgeByBuffKey(root, buffKey) {
  if (!root || !buffKey) return null;
  const stack = [root];
  while (stack.length) {
    const node = stack.shift();
    if (node?.dataset?.buffKey === buffKey) return node;
    const children = Array.isArray(node?.children) ? node.children : [];
    children.forEach((child) => stack.push(child));
  }
  return null;
}

export function captureFloatingTooltipState(doc) {
  const tooltipEl = doc.getElementById('statusTooltip');
  if (!tooltipEl?.classList?.contains('visible')) return null;
  if (tooltipEl.dataset?.statusContainerId !== 'ncFloatingHpStatusBadges') return null;

  const statusKey = tooltipEl.dataset?.statusKey;
  if (!statusKey) return null;
  return { statusKey };
}

export function restoreFloatingTooltipState(doc, gs, deps, tooltipState) {
  if (!tooltipState?.statusKey || !gs?.player?.buffs) return;

  const buff = gs.player.buffs[tooltipState.statusKey];
  if (!buff) return;

  const statusEffectsUI = resolveStatusEffectsUI(deps);
  const info = statusEffectsUI?.getStatusMap?.()?.[tooltipState.statusKey];
  if (!info) return;
  const statusTooltipUI = resolveStatusTooltipUI(deps);
  if (typeof statusTooltipUI?.showForAnchor !== 'function') return;

  const shell = doc.getElementById('ncFloatingHpShell');
  const badge = findBadgeByBuffKey(shell, tooltipState.statusKey);
  if (!badge) return;

  statusTooltipUI.showForAnchor(badge, tooltipState.statusKey, info, buff, {
    doc,
    win: deps.win || doc?.defaultView || null,
    statusContainerId: 'ncFloatingHpStatusBadges',
  });
}
