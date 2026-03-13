export const STATUS_TOOLTIP_COPY = Object.freeze({
  nextTurn: '\u25B6 \uB2E4\uC74C \uD134',
  duration: '\uC9C0\uC18D\uC2DC\uAC04',
  durationShort: '\uC9C0\uC18D',
  turnUnit: '\uD134',
  urgentSuffix: '\uD134 \uB0A8\uC74C',
  infinite: '\u221E \uBB34\uD55C',
  countdown: '\uD134 \uD6C4<br>\uD3ED\uBC1C',
  buff: '\uBC84\uD504',
  infiniteBuff: '\uBC84\uD504 \u00B7 \uBB34\uD55C',
  debuff: '\uB514\uBC84\uD504',
  enemySourceIcon: '\u2694',
  selfSourceIcon: '\u2726',
});

export function getStatusTooltipTypeLabel(metaTypeLabel, isBuff, isInfinite) {
  if (metaTypeLabel) return metaTypeLabel;
  if (isBuff) return isInfinite ? STATUS_TOOLTIP_COPY.infiniteBuff : STATUS_TOOLTIP_COPY.buff;
  return STATUS_TOOLTIP_COPY.debuff;
}

export function getStatusTooltipSourceIcon(sourceType) {
  return sourceType === 'enemy'
    ? STATUS_TOOLTIP_COPY.enemySourceIcon
    : STATUS_TOOLTIP_COPY.selfSourceIcon;
}

export function formatStatusTooltipUrgentDuration(turns) {
  return `\u26A0 ${turns}${STATUS_TOOLTIP_COPY.urgentSuffix}`;
}
