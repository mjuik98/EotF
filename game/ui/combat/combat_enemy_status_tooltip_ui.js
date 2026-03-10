import { StatusTooltipUI } from './status_tooltip_builder.js';
import { DEBUFF_STATUS_KEYS } from '../../../data/status_key_data.js';
import { getEnemyStatusMeta, getEnemyStatusName } from '../../../data/status_effects_data.js';

export function normalizeEnemyStatusTooltipArgs(statusValueOrDeps = null, deps = {}) {
  const statusValue = typeof statusValueOrDeps === 'number' ? statusValueOrDeps : null;
  const resolvedDeps = (statusValueOrDeps && typeof statusValueOrDeps === 'object')
    ? statusValueOrDeps
    : deps;
  return { statusValue, resolvedDeps };
}

export function resolveEnemyStatusTooltipPayload(statusKey) {
  const statusMeta = getEnemyStatusMeta(statusKey);
  if (!statusMeta) return null;

  const buff = !DEBUFF_STATUS_KEYS.includes(statusKey);
  return {
    infoKR: {
      icon: statusMeta.icon,
      name: getEnemyStatusName(statusKey) || statusKey,
      buff,
      desc: statusMeta.desc,
    },
    source: {
      type: 'enemy',
      label: 'Enemy',
      name: 'Enemy status',
      color: buff ? '#88ccff' : '#ff6688',
    },
  };
}

export function showEnemyStatusTooltipOverlay(event, statusKey, statusValueOrDeps = null, deps = {}) {
  const { statusValue, resolvedDeps } = normalizeEnemyStatusTooltipArgs(statusValueOrDeps, deps);
  const payload = resolveEnemyStatusTooltipPayload(statusKey);
  if (!payload) return;

  const doc = resolvedDeps?.doc ?? globalThis.document;
  const win = resolvedDeps?.win ?? globalThis.window ?? globalThis;
  StatusTooltipUI.show(event, statusKey, payload.infoKR, statusValue, {
    rawValue: statusValue,
    source: payload.source,
    doc,
    win,
    poisonDuration: resolvedDeps.poisonDuration,
  });
}

export function hideEnemyStatusTooltipOverlay(deps = {}) {
  const doc = deps?.doc ?? globalThis.document;
  StatusTooltipUI.hide({ doc });
}
