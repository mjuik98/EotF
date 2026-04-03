import { getDoc as getRuntimeDoc, getWin as getRuntimeWin } from '../../../../platform/browser/dom/public.js';

export const TITLE_CLASS_NAMES = Object.freeze({
  swordsman: '검사',
  mage: '마법사',
  hunter: '사냥꾼',
  paladin: '성기사',
  berserker: '광전사',
  guardian: '수호자',
  rogue: '도적',
});

export const TITLE_OUTCOME_LABELS = Object.freeze({
  victory: '승리',
  defeat: '패배',
  abandon: '런 중단',
});

export function getDoc(deps) {
  return getRuntimeDoc(deps);
}

export function getWin(deps) {
  return getRuntimeWin(deps);
}

export function setText(doc, id, value) {
  const el = doc.getElementById(id);
  if (el) el.textContent = value;
}

export function bindEventOnce(element, eventName, handler, cacheKey) {
  if (!element || typeof handler !== 'function') return;
  if (element[cacheKey] && typeof element.removeEventListener === 'function') {
    element.removeEventListener(eventName, element[cacheKey]);
  }
  element[cacheKey] = handler;
  element.addEventListener?.(eventName, handler);
}

export function resolveTitleClassName(classId) {
  return TITLE_CLASS_NAMES[String(classId || '')] || String(classId || '-');
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatClearTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(Number(ms || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function buildTitleAssetPreviewUrl(data, domain, id) {
  return data?.assetPreview?.resolveUrl?.(domain, id) || '';
}

export function buildTitleClassAssetMarkup(classId, data) {
  const previewId = String(classId || '');
  if (!previewId) return '';
  const previewUrl = buildTitleAssetPreviewUrl(data, 'characters', previewId);
  if (!previewUrl) return '';
  return `<span class="title-class-preview" data-asset-preview="characters.${escapeHtml(previewId)}" style="display:inline-flex;width:26px;height:26px;border-radius:9px;background-image:url('${previewUrl}');background-size:cover;background-position:center;box-shadow:0 8px 16px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.12);flex-shrink:0;"></span>`;
}
