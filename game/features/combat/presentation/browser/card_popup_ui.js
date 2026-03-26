import { getDoc as _getDoc } from '../../ports/presentation/public_combat_browser_support_capabilities.js';

const EXCLUDED_LOG_TYPES = new Set(['system', 'turn-divider']);

export function typeToCategory(type) {
  const normalized = String(type || '').toLowerCase();
  if (normalized === 'system' || normalized === 'turn-divider') return 'system';
  if (normalized === 'damage' || normalized === 'card-log' || normalized === 'action') return 'action';
  if (normalized === 'heal' || normalized === 'shield' || normalized === 'buff' || normalized === 'support') return 'support';
  return 'status';
}

export function collectCardResultLines(gs, logLengthBefore = 0) {
  const logs = gs?.combat?.log;
  if (!Array.isArray(logs)) return [];

  const start = Number.isFinite(logLengthBefore) ? logLengthBefore : 0;
  return logs
    .slice(start)
    .filter((entry) => !EXCLUDED_LOG_TYPES.has(entry?.type))
    .map((entry) => ({
      text: entry?.msg || '',
      category: typeToCategory(entry?.type),
    }))
    .filter((line) => line.text.length > 0);
}

function _buildPopup(doc, lines) {
  const popup = doc.createElement('div');
  popup.className = 'card-action-popup';

  lines.forEach(({ text, category }) => {
    const line = doc.createElement('div');
    line.className = `popup-line ${category || ''}`.trim();
    line.textContent = text;
    popup.appendChild(line);
  });

  return popup;
}

function _getContainer(doc) {
  return doc.getElementById('cardActionPopupContainer');
}

export const CardPopupUI = {
  show(cardElement, lines, deps = {}) {
    if (!cardElement) return;
    const rect = cardElement.getBoundingClientRect?.();
    if (!rect) return;
    this.showAtRect(rect, lines, deps);
  },

  showAtRect(rect, lines, deps = {}) {
    if (!rect || !lines?.length) return;

    const doc = _getDoc(deps);
    const container = _getContainer(doc);
    if (!container) return;

    const popup = _buildPopup(doc, lines);
    const centerX = rect.left + rect.width / 2;
    const placeAbove = rect.top > 72;

    popup.style.left = `${centerX}px`;
    if (placeAbove) {
      popup.style.top = `${rect.top - 12}px`;
      popup.style.transform = 'translate(-50%, -100%)';
    } else {
      popup.style.top = `${rect.bottom + 12}px`;
      popup.style.transform = 'translate(-50%, 0)';
    }

    container.appendChild(popup);

    setTimeout(() => {
      popup.classList.add('fade-out');
      popup.addEventListener('animationend', () => popup.remove(), { once: true });
    }, 1500);
  },
};
