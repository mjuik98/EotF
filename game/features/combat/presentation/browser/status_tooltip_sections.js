import {
  formatStatusTooltipUrgentDuration,
  getStatusTooltipSourceIcon,
  STATUS_TOOLTIP_COPY,
} from './status_tooltip_copy.js';

export function buildStatusTooltipNextTurnHTML(meta, buff, rawValue) {
  if (!meta?.nextTurnText) return '';
  const text = meta.nextTurnText(buff, rawValue);
  const dmg = meta.nextTurnDmg?.(buff, rawValue) ?? null;

  if (dmg !== null) {
    return `<div class="stt-next-turn">
      <span class="stt-next-turn-arrow">${STATUS_TOOLTIP_COPY.nextTurn}</span>
      <span class="stt-next-turn-value">-${dmg}</span>
      <span class="stt-next-turn-label">${text}</span>
    </div>`;
  }

  return `<div class="stt-next-turn stt-next-turn--info">
    <span class="stt-next-turn-arrow">${STATUS_TOOLTIP_COPY.nextTurn}</span>
    <span class="stt-next-turn-label" style="margin-left:4px">${text}</span>
  </div>`;
}

export function buildStatusTooltipGaugeHTML(stacks, isInfinite, color) {
  if (isInfinite) {
    return `<div class="stt-gauge-area">
      <div class="stt-gauge-label"><span>${STATUS_TOOLTIP_COPY.duration}</span><span style="color:${color}">${STATUS_TOOLTIP_COPY.infinite}</span></div>
      <div class="stt-gauge-track">
        <div class="stt-gauge-fill" style="width:100%;background:linear-gradient(90deg,#334155,#475569,#334155);background-size:300%;animation:sttShimmer 2s linear infinite;opacity:.8"></div>
      </div>
    </div>`;
  }

  const cur = Math.floor(Number(stacks));
  const urgent = cur <= 1;
  const fillColor = urgent ? 'var(--danger)' : color;
  const pct = Math.min(100, Math.max(10, cur * 20));
  const urgentClass = urgent ? ' urgent' : '';
  const urgentLabel = urgent
    ? `<span class="urgent-text">${formatStatusTooltipUrgentDuration(cur)}</span>`
    : `<span style="color:${color}">${cur}</span>`;

  return `<div class="stt-gauge-area">
    <div class="stt-gauge-label"><span>${STATUS_TOOLTIP_COPY.duration}</span>${urgentLabel}</div>
    <div class="stt-gauge-track">
      <div class="stt-gauge-fill${urgentClass}" style="width:${pct}%;background:${fillColor};opacity:.8"></div>
    </div>
  </div>`;
}

export function buildStatusTooltipCountdownHTML(value) {
  return `<div class="stt-countdown">
    <div class="stt-countdown-num">${value}</div>
    <div class="stt-countdown-label">${STATUS_TOOLTIP_COPY.countdown}</div>
  </div>`;
}

export function buildStatusTooltipTagsHTML(tags) {
  if (!tags?.length) return '';
  const items = tags.map((tag) =>
    `<span class="stt-tag" style="background:${tag.bg};color:${tag.color};border:1px solid ${tag.border}">${tag.label}</span>`
  ).join('');
  return `<div class="stt-tag-row">${items}</div>`;
}

export function buildStatusTooltipStatsHTML(meta, buff, rawValue) {
  if (!meta?.statLabel) return '';
  const val = meta.statValue?.(buff, rawValue) ?? '?';
  const unit = meta.statUnit ?? '';
  const col = meta.statColor ?? 'var(--white)';
  const stacks = Number(rawValue ?? buff?.stacks ?? buff);
  const rightVal = Number.isFinite(stacks) && stacks < 99 ? stacks : '\u221E';

  return `<div class="stt-stats">
    <div class="stt-stat">
      <div class="stt-stat-label">${meta.statLabel}</div>
      <div class="stt-stat-value" style="color:${col}">${val}<span class="stt-stat-unit">${unit}</span></div>
    </div>
    <div class="stt-stat">
      <div class="stt-stat-label">${STATUS_TOOLTIP_COPY.durationShort}</div>
      <div class="stt-stat-value">${rightVal}<span class="stt-stat-unit">${STATUS_TOOLTIP_COPY.turnUnit}</span></div>
    </div>
  </div>`;
}

export function buildStatusTooltipSourceHTML(source) {
  if (!source) return '';
  const typeIcon = getStatusTooltipSourceIcon(source.type);
  return `<div class="stt-source">
    <div class="stt-source-dot" style="background:${source.color ?? '#aaa'}"></div>
    <span class="stt-source-label">${typeIcon} ${source.label}</span>
    <span class="stt-source-name" style="color:${source.color ?? '#aaa'}">${source.name}</span>
  </div>`;
}
