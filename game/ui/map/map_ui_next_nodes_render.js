import { getMapNodeVisualFallback } from '../../features/run/domain/map_node_content.js';
import { getPlayerHpPanelLevel } from '../shared/player_hp_panel_ui.js';

export const NODE_EXTENSIONS = {
  combat: { diff: 35, enemies: '일반 적 1~2', traits: ['기본 전투', '안정적 보상'], rewards: ['카드', '골드'], preview: '', badge: true },
  elite: { diff: 68, enemies: '정예 적 1', traits: ['강한 패턴', '추가 보상'], rewards: ['카드', '유물', '골드'], preview: '', badge: true },
  mini_boss: { diff: 82, enemies: '중간 보스 1', traits: ['전용 기믹', '고위험'], rewards: ['유물', '카드', '골드'], preview: '', badge: true },
  boss: { diff: 95, enemies: '지역 보스 1', traits: ['최종 관문', '고유 패턴'], rewards: ['유물', '카드', '골드'], preview: '', badge: true },
  event: { diff: 0, enemies: '없음', traits: ['선택지', '결과 다양'], rewards: ['골드', '유물'], preview: '이동 후 특수 상황이 발생할 수 있습니다.', badge: false },
  shop: { diff: 0, enemies: '없음', traits: ['구매', '정비'], rewards: ['카드', '유물'], preview: '카드 제거, 구매, 회복 관련 선택이 가능합니다.', badge: false },
  rest: { diff: 0, enemies: '없음', traits: ['안전 구역', '강화 가능'], rewards: ['HP 회복', '카드 강화'], preview: '체력을 회복하거나 덱을 정비할 수 있습니다.', badge: false },
  blessing: { diff: 0, enemies: '없음', traits: ['영구 강화', '희소'], rewards: ['축복'], preview: '강력한 영구 효과를 획득합니다.', badge: false },
};

const REWARD_CLASS_MAP = {
  카드: 'nc-card-rwd',
  유물: 'relic',
  골드: 'gold',
  'HP 회복': 'hp',
  '카드 강화': 'hp',
  축복: 'relic',
};

export function runOnNextFrame(cb, deps = {}) {
  const raf = deps?.requestAnimationFrame;
  if (typeof raf === 'function') return raf(cb);
  const win = deps?.win || deps?.doc?.defaultView || null;
  if (typeof win?.requestAnimationFrame === 'function') {
    return win.requestAnimationFrame(cb);
  }
  return setTimeout(cb, 16);
}

export function hexToRgb(hex) {
  const raw = String(hex || '').replace('#', '');
  if (raw.length !== 6) return '123, 47, 255';
  return [0, 2, 4].map((index) => parseInt(raw.slice(index, index + 2), 16)).join(', ');
}

export function getRegionShortName(name) {
  const label = String(name || '').trim();
  if (!label) return '';
  const shortName = label.replace(/^\p{Extended_Pictographic}\s*/u, '').trim();
  return shortName || label;
}

export function stripHtml(html, maxLen = 70) {
  const plain = String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!plain) return '';
  return plain.length > maxLen ? `${plain.slice(0, maxLen).trim()}…` : plain;
}

function regionIcon(name, fallback = '🧭') {
  const firstChar = Array.from(String(name || '').trim())[0] || '';
  return /\p{Extended_Pictographic}/u.test(firstChar) ? firstChar : fallback;
}

export function ensureOverlayStructure(doc, overlay) {
  let title = doc.getElementById('nodeCardTitle');
  if (!title) {
    title = doc.createElement('div');
    title.id = 'nodeCardTitle';
    title.className = 'node-card-title-special';
    overlay.appendChild(title);
  }

  let row = doc.getElementById('nodeCardRow');
  if (!row) {
    row = doc.createElement('div');
    row.id = 'nodeCardRow';
    row.className = 'node-card-row-special';
    overlay.appendChild(row);
  }

  return { row, title };
}

export function applyHpDangerClass(overlay, gs) {
  if (!overlay?.classList) return;
  overlay.classList.remove('nc-danger-critical', 'nc-danger-low');
  const level = getPlayerHpPanelLevel(gs);
  if (level === 'critical') overlay.classList.add('nc-danger-critical');
  if (level === 'low') overlay.classList.add('nc-danger-low');
}

export function buildFloorBar(doc, gs, regionData, nodeMeta) {
  const totalFloors = Math.max(1, Number(regionData?.floors) || Math.max(1, ...((gs?.mapNodes || []).map((node) => node.floor))));
  const currentFloor = Math.max(0, Number(gs?.currentFloor) || 0);
  const displayCount = Math.min(totalFloors, 9);
  const shortName = getRegionShortName(regionData?.name) || '지역';
  const wrap = doc.createElement('div');
  wrap.className = 'nc-floor-bar';

  const label = doc.createElement('div');
  label.className = 'nc-floor-bar-label';
  label.textContent = `${shortName} 진행 경로`;
  wrap.appendChild(label);

  const track = doc.createElement('div');
  track.className = 'nc-floor-track';

  for (let floor = 1; floor <= displayCount; floor += 1) {
    const visitedNode = (gs?.mapNodes || []).find((node) => node.floor === floor && node.visited);
    const nodeType = visitedNode?.type || (floor === totalFloors ? 'boss' : 'combat');
    const icon = nodeMeta?.[nodeType]?.icon || getMapNodeVisualFallback(nodeType)?.icon || '•';
    const isCurrent = floor === currentFloor + 1;
    const isVisited = floor <= currentFloor;
    const isBoss = floor === totalFloors;

    const floorNode = doc.createElement('div');
    floorNode.className = 'nc-fn' + (isVisited ? ' visited' : '') + (isCurrent ? ' current' : '') + (isBoss ? ' boss' : '');

    const dot = doc.createElement('div');
    dot.className = 'nc-fn-dot';
    dot.textContent = isVisited || isCurrent ? icon : (isBoss ? '👑' : '•');

    const floorLabel = doc.createElement('div');
    floorLabel.className = 'nc-fn-lbl';
    floorLabel.textContent = `${floor}F`;

    floorNode.append(dot, floorLabel);
    track.appendChild(floorNode);

    if (floor < displayCount) {
      const connector = doc.createElement('div');
      connector.className = `nc-fc${isVisited ? ' visited' : ''}`;
      track.appendChild(connector);
    }
  }

  wrap.appendChild(track);
  return wrap;
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
  desc.textContent = stripHtml(regionData?.ruleDesc || (regionData?.rule ? `${regionData.rule}이 적용됩니다.` : '')) || '별도 제약 없이 탐색과 전투가 이어집니다.';

  inner.append(icon, label, separator, desc);
  banner.appendChild(inner);
  return banner;
}

export function buildBottomDock(doc, regionData, options = {}) {
  const { nodeCount = 0, onShowFullMap = null, onToggleDeckView = null } = options;
  const bar = doc.createElement('div');
  bar.className = 'nc-bottom-bar';
  const items = [
    { keys: ['M'], label: '전체 지도', action: onShowFullMap },
    { keys: ['TAB'], label: '덱 보기', action: onToggleDeckView },
    { keys: Array.from({ length: Math.max(1, Math.min(3, nodeCount)) }, (_, index) => String(index + 1)), label: '경로 선택', action: null },
    { keys: ['ESC'], label: '설정', action: null },
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

export function buildRelicPanel(doc, gs, data, tooltipUI, deps = {}) {
  const rarityMeta = {
    legendary: { pip: '#c084fc', rgb: '192, 132, 252' },
    boss: { pip: '#ff3366', rgb: '255, 51, 102' },
    rare: { pip: '#f0b429', rgb: '240, 180, 41' },
    uncommon: { pip: '#00ffcc', rgb: '0, 255, 204' },
    common: { pip: '#8c9fc8', rgb: '140, 159, 200' },
  };
  const rarityOrder = { legendary: 0, boss: 0, rare: 1, uncommon: 2, common: 3 };
  const activeTriggers = new Set(['combat_start', 'floor_start', 'on_enter']);
  const items = Array.isArray(gs?.player?.items) ? gs.player.items : [];
  const win = deps?.win || doc?.defaultView || null;
  const panel = doc.createElement('div');
  panel.className = 'nc-relic-panel';

  const title = doc.createElement('div');
  title.className = 'nc-relic-panel-title';
  title.textContent = '현재 유물';
  panel.appendChild(title);

  const scrollWrap = doc.createElement('div');
  scrollWrap.className = 'nc-relic-scroll-wrap';
  const list = doc.createElement('div');
  list.className = 'nc-relic-list';

  if (items.length === 0) {
    const empty = doc.createElement('div');
    empty.className = 'nc-relic-empty';
    empty.textContent = '보유 유물 없음';
    list.appendChild(empty);
  } else {
    const sortedItems = [...items].sort((leftId, rightId) => (rarityOrder[data?.items?.[leftId]?.rarity || 'common'] ?? 3) - (rarityOrder[data?.items?.[rightId]?.rarity || 'common'] ?? 3));
    sortedItems.forEach((itemId) => {
      const item = data?.items?.[itemId];
      if (!item) return;
      const rarity = String(item.rarity || 'common').toLowerCase();
      const meta = rarityMeta[rarity] || rarityMeta.common;
      const triggers = Array.isArray(item.trigger) ? item.trigger : [item.trigger];
      const isActive = triggers.some((trigger) => activeTriggers.has(String(trigger || '').toLowerCase()));
      const rawDesc = stripHtml(item.desc, 220);
      const summary = rawDesc.length > 28 ? `${rawDesc.slice(0, 28).trim()}…` : rawDesc;

      const slot = doc.createElement('div');
      slot.className = `nc-relic-slot rarity-${rarity}${isActive ? ' is-active' : ''}`;
      slot.style.setProperty('--rl-rgb', meta.rgb);
      slot.tabIndex = 0;
      slot.setAttribute('role', 'note');
      slot.setAttribute('aria-label', `${item.name || itemId}: ${rawDesc || ''}`);

      const iconWrap = doc.createElement('div');
      iconWrap.className = 'nc-relic-icon-wrap';
      iconWrap.textContent = item.icon || '✦';
      const info = doc.createElement('div');
      info.className = 'nc-relic-info';
      const name = doc.createElement('div');
      name.className = 'nc-relic-name';
      name.textContent = item.name || itemId;
      const effect = doc.createElement('div');
      effect.className = 'nc-relic-effect';
      effect.textContent = summary || '효과 정보 없음';
      info.append(name, effect);

      const pip = doc.createElement('div');
      pip.className = 'nc-relic-pip';
      pip.style.cssText = `background:${meta.pip};box-shadow:0 0 5px ${meta.pip};`;
      const showTooltip = (event) => tooltipUI?.showItemTooltip?.(event, itemId, { doc, win, gs, data });
      const hideTooltip = () => tooltipUI?.hideItemTooltip?.({ doc, win });
      slot.addEventListener('mouseenter', showTooltip);
      slot.addEventListener('mouseleave', hideTooltip);
      slot.addEventListener('focus', showTooltip);
      slot.addEventListener('blur', hideTooltip);

      slot.append(iconWrap, info, pip);
      list.appendChild(slot);
    });
  }

  scrollWrap.appendChild(list);
  panel.appendChild(scrollWrap);

  const updateFades = () => {
    if (!scrollWrap.classList?.toggle) return;
    const { scrollTop = 0, scrollHeight = 0, clientHeight = 0 } = scrollWrap;
    scrollWrap.classList.toggle('show-top', scrollTop > 8);
    scrollWrap.classList.toggle('show-bottom', scrollTop + clientHeight < scrollHeight - 8);
  };
  const handleWheel = (event) => {
    const canScroll = (scrollWrap.scrollHeight || 0) > (scrollWrap.clientHeight || 0) + 4;
    if (!canScroll) return;
    event.preventDefault?.();
    scrollWrap.scrollTop = (scrollWrap.scrollTop || 0) + (event.deltaY || 0);
    tooltipUI?.hideGeneralTooltip?.({ doc, win });
    updateFades();
  };
  scrollWrap.addEventListener?.('scroll', updateFades, { passive: true });
  scrollWrap.addEventListener?.('wheel', handleWheel, { passive: false });
  runOnNextFrame(updateFades, deps);

  return panel;
}

export function buildNextNodeCard(doc, options = {}) {
  const { node, index = 0, meta = {}, shortRegionName = '지역' } = options;
  const ext = NODE_EXTENSIONS[node?.type] || NODE_EXTENSIONS.combat;
  const rgb = hexToRgb(meta.color);
  const pos = ['A', 'B', 'C', 'D', 'E'][node?.pos] || String((node?.pos || 0) + 1);
  const dangerLevel = ext.diff <= 0 ? 0 : (ext.diff < 50 ? 1 : (ext.diff < 75 ? 2 : 3));
  const rewardsHtml = ext.rewards.map((reward) => `<span class="nc-reward-tag ${REWARD_CLASS_MAP[reward] || 'gold'}">${reward}</span>`).join('');
  const traitsHtml = ext.traits.map((trait) => `<span class="nc-trait-tag${ext.diff === 0 ? ' neutral' : ''}">${trait}</span>`).join('');
  const skullsHtml = ext.diff > 0 ? `<div class="nc-danger-skulls">${[0, 1, 2].map((idx) => `<span class="nc-skull${idx < dangerLevel ? ' on' : ''}">☠</span>`).join('')}</div>` : '';

  const card = doc.createElement('div');
  card.className = 'node-card';
  card.dataset.cardIdx = String(index);
  card.dataset.nodeId = node.id;
  card.style.setProperty('--node-color', meta.color);
  card.style.setProperty('--node-rgb', rgb);
  card.style.animationDelay = `${index * 0.08}s`;
  card.innerHTML = `
    <div class="nc-kbd-badge">${index + 1}</div>
    ${ext.badge ? `<div class="nc-floor-badge">${node.floor}F</div>` : ''}
    <div class="nc-icon-area">
      <div class="nc-icon-bg"></div>
      <div class="nc-icon-grid"></div>
      <div class="node-card-icon">${meta.icon || MAP_NODE_TYPE_VISUAL_FALLBACK[node.type]?.icon || '?'}</div>
      ${skullsHtml}
    </div>
    <div class="nc-body">
      <div>
        <div class="node-card-label">${meta.label || '노드'}</div>
        <div class="node-card-sub">${shortRegionName} ${node.floor}층 · ${pos} 구역</div>
      </div>
      <div class="node-card-desc">${meta.desc || '다음 위치로 이동합니다.'}</div>
      ${ext.preview ? `<div class="nc-preview-hint">예상: ${ext.preview}</div>` : ''}
      ${ext.diff > 0 ? `<div class="nc-diff-row"><span class="nc-diff-label">위험도</span><div class="nc-diff-track"><div class="nc-diff-fill" style="width:${ext.diff}%"></div></div><span class="nc-diff-val">${ext.diff}</span></div>` : ''}
      <div class="nc-info-grid">
        <div class="nc-info-cell">
          <span class="nc-info-cell-label">상대</span>
          <span class="nc-info-cell-value">${ext.enemies}</span>
        </div>
        <div class="nc-info-cell">
          <span class="nc-info-cell-label">특징</span>
          <div class="nc-traits-wrap">${traitsHtml}</div>
        </div>
      </div>
      <div class="nc-rewards-wrap">${rewardsHtml}</div>
    </div>
    <div class="node-card-cta">선택</div>
  `;

  return { card, rgb };
}
