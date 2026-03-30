import { DomSafe } from '../../../../platform/browser/dom/public.js';
import {
  getInputBindingCode,
  inputCodeToLabel,
} from '../../../ui/ports/public_input_capabilities.js';

function regionIcon(name, fallback = '🧭') {
  const firstChar = Array.from(String(name || '').trim())[0] || '';
  return /\p{Extended_Pictographic}/u.test(firstChar) ? firstChar : fallback;
}

function buildRuleBanner(doc, regionData) {
  const banner = doc.createElement('div');
  banner.className = 'nc-rule-banner';
  const inner = doc.createElement('div');
  inner.className = 'nc-rule-inner';

  const icon = doc.createElement('span');
  icon.className = 'nc-rule-icon';
  icon.textContent = regionIcon(regionData?.name);

  const label = doc.createElement('span');
  label.className = 'nc-rule-label';
  label.textContent = regionData?.rule || '기본 규칙';

  const separator = doc.createElement('div');
  separator.className = 'nc-rule-sep';

  const desc = doc.createElement('span');
  desc.className = 'nc-rule-desc';
  DomSafe.setHighlightedText(
    desc,
    regionData?.ruleDesc || (regionData?.rule ? `${regionData.rule}이 적용됩니다.` : '') || '별도 제약 없이 탐색과 전투가 이어집니다.',
  );

  inner.append(icon, label, separator, desc);
  banner.appendChild(inner);
  return banner;
}

export function buildBottomDock(doc, regionData, options = {}) {
  const {
    keybindings = null,
    nodeCount = 0,
    onShowFullMap = null,
    onToggleDeckView = null,
  } = options;
  const bar = doc.createElement('div');
  bar.className = 'nc-bottom-bar';
  const deckViewKeyLabel = inputCodeToLabel(getInputBindingCode('deckView', undefined, keybindings)) || 'D';
  const pauseKeyLabel = inputCodeToLabel(getInputBindingCode('pause', undefined, keybindings)) || 'ESC';
  const items = [
    { keys: ['M'], label: '전체 지도', action: onShowFullMap },
    { keys: [deckViewKeyLabel], label: '덱 보기', action: onToggleDeckView },
    { keys: Array.from({ length: Math.max(1, Math.min(3, nodeCount)) }, (_, index) => String(index + 1)), label: '경로 선택', action: null },
    { keys: [pauseKeyLabel], label: '일시정지', action: null },
  ];

  items.forEach((item, index) => {
    const entry = doc.createElement('div');
    entry.className = 'nc-bottom-item';
    if (typeof item.action === 'function') {
      entry.classList.add('is-actionable');
      entry.tabIndex = 0;
      entry.setAttribute('role', 'button');
      entry.addEventListener('click', () => item.action());
      entry.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        item.action();
      });
    }

    item.keys.forEach((key) => {
      const keyEl = doc.createElement('span');
      keyEl.className = 'nc-bottom-kbd';
      keyEl.textContent = key;
      entry.appendChild(keyEl);
    });

    const label = doc.createElement('span');
    label.className = 'nc-bottom-label';
    label.textContent = item.label;
    entry.appendChild(label);
    bar.appendChild(entry);

    if (index < items.length - 1) {
      const sep = doc.createElement('div');
      sep.className = 'nc-bottom-sep';
      bar.appendChild(sep);
    }
  });

  const dock = doc.createElement('div');
  dock.id = 'ncBottomDock';
  dock.className = 'nc-bottom-dock';
  dock.append(buildRuleBanner(doc, regionData), bar);
  return dock;
}
