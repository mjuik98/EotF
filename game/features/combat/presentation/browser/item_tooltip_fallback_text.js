export function buildItemTooltipFallbackParts(item, itemId = '') {
  const title = String(item?.name || itemId || '').trim();
  const desc = String(item?.desc || item?.passive || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/^\[세트:\s*.+\]$/.test(line))
    .join('\n');
  return { title, desc };
}

export function buildItemTooltipFallbackText(item, itemId = '') {
  const { title, desc } = buildItemTooltipFallbackParts(item, itemId);
  if (title && desc) return `${title}\n${desc}`;
  return title || desc || '';
}
