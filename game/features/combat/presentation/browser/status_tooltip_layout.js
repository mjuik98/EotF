export function buildStatusTooltipHeaderHTML(resolvedInfo, pal, meta, typeLabel, fallbackStatusKey) {
  return `
    <div class="stt-accent-bar" style="background:${pal.accent}"></div>
    <div class="stt-header">
      <div class="stt-icon">${resolvedInfo.icon ?? ''}</div>
      <div class="stt-title-block">
        <div class="stt-name" style="color:${pal.nameColor}">${resolvedInfo.name ?? fallbackStatusKey}</div>
        <div class="stt-name-en">${meta?.nameEn ?? ''}</div>
        <div class="stt-type-badge" style="background:${pal.typeBg};color:${pal.typeColor}">${typeLabel}</div>
      </div>
    </div>`;
}

export function composeStatusTooltipBodyHTML(parts) {
  return parts.filter(Boolean).join('');
}
