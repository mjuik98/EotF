import { MAP_NODE_TYPE_VISUAL_FALLBACK } from '../../../data/map_node_data.js';
import { getPlayerHpPanelLevel } from '../shared/player_hp_panel_ui.js';

const NODE_EXTENSIONS = {
  combat: {
    diff: 35,
    enemies: '일반 적 1~2',
    traits: ['기본 전투', '안정적 보상'],
    rewards: ['카드', '골드'],
    preview: '',
    badge: true,
  },
  elite: {
    diff: 68,
    enemies: '정예 적 1',
    traits: ['강한 패턴', '추가 보상'],
    rewards: ['카드', '유물', '골드'],
    preview: '',
    badge: true,
  },
  mini_boss: {
    diff: 82,
    enemies: '중간 보스 1',
    traits: ['전용 기믹', '고위험'],
    rewards: ['유물', '카드', '골드'],
    preview: '',
    badge: true,
  },
  boss: {
    diff: 95,
    enemies: '지역 보스 1',
    traits: ['최종 관문', '고유 패턴'],
    rewards: ['유물', '카드', '골드'],
    preview: '',
    badge: true,
  },
  event: {
    diff: 0,
    enemies: '없음',
    traits: ['선택지', '결과 다양'],
    rewards: ['골드', '유물'],
    preview: '이동 후 특수 상황이 발생할 수 있습니다.',
    badge: false,
  },
  shop: {
    diff: 0,
    enemies: '없음',
    traits: ['구매', '정비'],
    rewards: ['카드', '유물'],
    preview: '카드 제거, 구매, 회복 관련 선택이 가능합니다.',
    badge: false,
  },
  rest: {
    diff: 0,
    enemies: '없음',
    traits: ['안전 구역', '강화 가능'],
    rewards: ['HP 회복', '카드 강화'],
    preview: '체력을 회복하거나 덱을 정비할 수 있습니다.',
    badge: false,
  },
  blessing: {
    diff: 0,
    enemies: '없음',
    traits: ['영구 강화', '희소'],
    rewards: ['축복'],
    preview: '강력한 영구 효과를 획득합니다.',
    badge: false,
  },
};

const REWARD_CLASS_MAP = {
  카드: 'nc-card-rwd',
  유물: 'relic',
  골드: 'gold',
  'HP 회복': 'hp',
  '카드 강화': 'hp',
  축복: 'relic',
};

function getDoc(deps) {
  return deps?.doc || document;
}

function resolveNodeMeta(deps = {}) {
  return deps.nodeMeta || (typeof NODE_META !== 'undefined' ? NODE_META : {});
}

function runOnNextFrame(cb) {
  if (typeof globalThis.requestAnimationFrame === 'function') {
    return globalThis.requestAnimationFrame(cb);
  }
  return setTimeout(cb, 16);
}

function hexToRgb(hex) {
  const raw = String(hex || '').replace('#', '');
  if (raw.length !== 6) return '123, 47, 255';
  return [0, 2, 4]
    .map((index) => parseInt(raw.slice(index, index + 2), 16))
    .join(', ');
}

function regionIcon(name, fallback = '🧭') {
  const firstChar = Array.from(String(name || '').trim())[0] || '';
  return /\p{Extended_Pictographic}/u.test(firstChar) ? firstChar : fallback;
}

function getRegionShortName(name) {
  const label = String(name || '').trim();
  if (!label) return '';
  const shortName = label.replace(/^\p{Extended_Pictographic}\s*/u, '').trim();
  return shortName || label;
}

function stripHtml(html, maxLen = 70) {
  const plain = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return '';
  return plain.length > maxLen ? `${plain.slice(0, maxLen).trim()}…` : plain;
}

function cleanupNextNodeOverlay(doc) {
  const overlay = doc?.getElementById?.('nodeCardOverlay');
  if (overlay?._ncKey) {
    doc.removeEventListener('keydown', overlay._ncKey);
    overlay._ncKey = null;
  }
}

function resolveTooltipUI(deps = {}) {
  return deps.tooltipUI
    || deps.TooltipUI
    || globalThis.TooltipUI
    || globalThis.GAME?.Modules?.TooltipUI;
}

function ensureOverlayStructure(doc, overlay) {
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

function applyHpDangerClass(overlay, gs) {
  if (!overlay?.classList) return;
  overlay.classList.remove('nc-danger-critical', 'nc-danger-low');
  const level = getPlayerHpPanelLevel(gs);
  if (level === 'critical') overlay.classList.add('nc-danger-critical');
  if (level === 'low') overlay.classList.add('nc-danger-low');
}

function buildFloorBar(doc, gs, regionData, nodeMeta) {
  const totalFloors = Math.max(
    1,
    Number(regionData?.floors) || Math.max(1, ...((gs?.mapNodes || []).map((node) => node.floor))),
  );
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
    const icon = nodeMeta?.[nodeType]?.icon || MAP_NODE_TYPE_VISUAL_FALLBACK[nodeType]?.icon || '•';
    const isCurrent = floor === currentFloor + 1;
    const isVisited = floor <= currentFloor;
    const isBoss = floor === totalFloors;

    const floorNode = doc.createElement('div');
    floorNode.className = 'nc-fn'
      + (isVisited ? ' visited' : '')
      + (isCurrent ? ' current' : '')
      + (isBoss ? ' boss' : '');

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
  desc.textContent = stripHtml(
    regionData?.ruleDesc || (regionData?.rule ? `${regionData.rule}이 적용됩니다.` : ''),
  ) || '별도 제약 없이 탐색과 전투가 이어집니다.';

  inner.append(icon, label, separator, desc);
  banner.appendChild(inner);
  return banner;
}

function buildBottomBar(doc, options = {}) {
  const {
    nodeCount = 0,
    onShowFullMap = null,
    onToggleDeckView = null,
  } = options;
  const bar = doc.createElement('div');
  bar.className = 'nc-bottom-bar';

  const items = [
    { keys: ['M'], label: '전체 지도', action: onShowFullMap },
    { keys: ['TAB'], label: '덱 보기', action: onToggleDeckView },
    {
      keys: Array.from({ length: Math.max(1, Math.min(3, nodeCount)) }, (_, index) => String(index + 1)),
      label: '경로 선택',
      action: null,
    },
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

  return bar;
}

function buildBottomDock(doc, regionData, options = {}) {
  const dock = doc.createElement('div');
  dock.id = 'ncBottomDock';
  dock.className = 'nc-bottom-dock';
  dock.append(
    buildRuleBanner(doc, regionData),
    buildBottomBar(doc, options),
  );
  return dock;
}

function buildRelicPanel(doc, gs, data, tooltipUI) {
  const rarityMeta = {
    legendary: { pip: '#c084fc', rgb: '192, 132, 252', label: '전설' },
    boss: { pip: '#ff3366', rgb: '255, 51, 102', label: '보스' },
    rare: { pip: '#f0b429', rgb: '240, 180, 41', label: '희귀' },
    uncommon: { pip: '#00ffcc', rgb: '0, 255, 204', label: '고급' },
    common: { pip: '#8c9fc8', rgb: '140, 159, 200', label: '일반' },
  };
  const rarityOrder = { legendary: 0, boss: 0, rare: 1, uncommon: 2, common: 3 };
  const activeTriggers = new Set(['combat_start', 'floor_start', 'on_enter']);
  const items = Array.isArray(gs?.player?.items) ? gs.player.items : [];
  const win = globalThis.window || globalThis;

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
    const sortedItems = [...items].sort((leftId, rightId) => {
      const leftRarity = data?.items?.[leftId]?.rarity || 'common';
      const rightRarity = data?.items?.[rightId]?.rarity || 'common';
      return (rarityOrder[leftRarity] ?? 3) - (rarityOrder[rightRarity] ?? 3);
    });

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
      const showTooltip = (event) => {
        if (typeof tooltipUI?.showItemTooltip !== 'function') return;
        tooltipUI.showItemTooltip(event, itemId, { doc, win, gs, data });
      };
      const hideTooltip = () => {
        if (typeof tooltipUI?.hideItemTooltip !== 'function') return;
        tooltipUI.hideItemTooltip({ doc, win });
      };

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
  runOnNextFrame(updateFades);

  return panel;
}

function playSelectAnim(doc, card, rgb, onDone) {
  if (!doc?.body || !card?.getBoundingClientRect) {
    onDone?.();
    return;
  }

  let overlay = doc.getElementById('ncSelectOverlay');
  let flash = doc.getElementById('ncSelectFlash');

  if (!overlay) {
    overlay = doc.createElement('div');
    overlay.id = 'ncSelectOverlay';
    flash = doc.createElement('div');
    flash.id = 'ncSelectFlash';
    overlay.appendChild(flash);
    doc.body.appendChild(overlay);
  } else if (!flash) {
    flash = doc.createElement('div');
    flash.id = 'ncSelectFlash';
    overlay.appendChild(flash);
  }

  overlay.classList.add('active');
  const rect = card.getBoundingClientRect();
  const clone = card.cloneNode(true);
  clone.classList.add('nc-select-clone');
  clone.classList.add('is-cloned');
  clone.style.position = 'fixed';
  clone.style.margin = '0';
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.zIndex = '9999';
  clone.style.pointerEvents = 'none';
  clone.style.transition = 'all 0.45s cubic-bezier(0.23, 1, 0.32, 1)';

  overlay.appendChild(clone);
  const prevVisibility = card.style.visibility;
  card.style.visibility = 'hidden';

  runOnNextFrame(() => runOnNextFrame(() => {
    const targetWidth = Math.min(rect.width * 1.12, 340);
    const targetHeight = rect.height * 1.08;

    clone.style.left = `${((globalThis.innerWidth || 1280) - targetWidth) / 2}px`;
    clone.style.top = `${((globalThis.innerHeight || 720) - targetHeight) / 2}px`;
    clone.style.width = `${targetWidth}px`;
    clone.style.height = `${targetHeight}px`;
  }));

  setTimeout(() => {
    if (flash) flash.style.background = `rgba(${rgb},.2)`;
    clone.style.opacity = '0';
    clone.style.transform = 'scale(1.12)';

    setTimeout(() => {
      if (flash) flash.style.background = 'transparent';
      overlay.classList.remove('active');
      clone.remove();
      card.style.visibility = prevVisibility;
      onDone?.();
    }, 300);
  }, 400);
}

export function getAccessibleNextNodes(gs) {
  if (!gs?.mapNodes?.length) return [];
  const nextFloor = Number(gs.currentFloor) + 1;
  return gs.mapNodes.filter((node) => node.floor === nextFloor && node.accessible && !node.visited);
}

export function updateNextNodesOverlay(deps = {}) {
  const gs = deps.gs;
  if (!gs) return;

  const doc = getDoc(deps);
  const nodes = getAccessibleNextNodes(gs);
  const overlay = doc.getElementById('nodeCardOverlay');
  if (!overlay) return;

  const { row, title } = ensureOverlayStructure(doc, overlay);
  if (
    gs.currentScreen !== 'game'
    || gs.combat.active
    || gs._nodeMoveLock
    || gs._rewardLock
    || gs._endCombatScheduled
    || gs._endCombatRunning
    || nodes.length === 0
  ) {
    overlay.style.display = 'none';
    overlay.style.pointerEvents = 'none';
    overlay.classList.remove('nc-danger-critical', 'nc-danger-low');
    cleanupNextNodeOverlay(doc);
    return;
  }

  const getFloorStatusText = deps.getFloorStatusText;
  const getRegionData = deps.getRegionData || globalThis.getRegionData;
  const moveToNodeHandlerName = deps.moveToNodeHandlerName || 'moveToNode';
  const nodeMeta = resolveNodeMeta(deps);
  const data = deps.data || globalThis.DATA || {};
  const regionData = (typeof getRegionData === 'function'
    ? getRegionData(gs.currentRegion, gs)
    : null) || { name: '지역' };
  const shortRegionName = getRegionShortName(regionData.name) || regionData.name || '지역';
  const accent = regionData.accent || nodeMeta[nodes[0]?.type]?.color || '#44aa66';
  const accentRgb = hexToRgb(accent);
  const tooltipUI = resolveTooltipUI(deps);
  const win = globalThis.window || globalThis;

  if (title) {
    title.style.display = 'none';
    if (typeof getFloorStatusText === 'function') {
      title.textContent = `${getFloorStatusText(gs.currentRegion, gs.currentFloor)} - 이동 경로를 선택하세요`;
    }
  }

  doc.getElementById('ncMainArea')?.remove();
  doc.getElementById('ncBottomDock')?.remove();
  doc.getElementById('ncRelicPanel')?.remove();
  doc.getElementById('ncHoverTint')?.remove();
  cleanupNextNodeOverlay(doc);

  overlay.style.setProperty('--nc-accent', accent);
  overlay.style.setProperty('--nc-accent-rgb', accentRgb);

  const hoverTint = doc.createElement('div');
  hoverTint.id = 'ncHoverTint';
  hoverTint.className = 'nc-hover-tint';
  overlay.insertBefore(hoverTint, overlay.firstChild);

  const mainArea = doc.createElement('div');
  mainArea.id = 'ncMainArea';
  mainArea.className = 'nc-main-area';
  mainArea.appendChild(buildFloorBar(doc, gs, regionData, nodeMeta));
  applyHpDangerClass(overlay, gs);

  const titleArea = doc.createElement('div');
  titleArea.className = 'nc-title-area';

  const tag = doc.createElement('div');
  tag.className = 'nc-region-tag';
  tag.tabIndex = 0;
  tag.setAttribute('role', 'note');
  const dot = doc.createElement('div');
  dot.className = 'nc-region-dot';
  const tagText = doc.createElement('span');
  tagText.textContent = `${shortRegionName} · ${regionData.rule || '이동 경로'}`;
  tag.append(dot, tagText);
  const tagTooltipTitle = `${regionData.name || shortRegionName} - ${regionData.rule || '기본 규칙'}`;
  const tagTooltipBody = regionData.ruleDesc || regionData.desc || '이 지역의 규칙 설명이 아직 준비되지 않았습니다.';
  const showRegionTooltip = (event) => {
    if (typeof tooltipUI?.showGeneralTooltip !== 'function') return;
    tooltipUI.showGeneralTooltip(event, tagTooltipTitle, tagTooltipBody, { doc, win });
  };
  const hideRegionTooltip = () => {
    if (typeof tooltipUI?.hideGeneralTooltip !== 'function') return;
    tooltipUI.hideGeneralTooltip({ doc, win });
  };
  tag.addEventListener('mouseenter', showRegionTooltip);
  tag.addEventListener('mouseleave', hideRegionTooltip);
  tag.addEventListener('focus', showRegionTooltip);
  tag.addEventListener('blur', hideRegionTooltip);

  const subtitle = doc.createElement('div');
  subtitle.className = 'nc-subtitle';
  subtitle.textContent = '이동 경로를 선택하세요';

  titleArea.append(tag, subtitle);
  mainArea.appendChild(titleArea);

  row.textContent = '';
  row.className = 'node-card-row-special';

  nodes.forEach((node, index) => {
    if (index > 0) {
      const divider = doc.createElement('div');
      divider.className = 'nc-or-divider';
      divider.innerHTML = [
        '<div class="nc-or-line"></div>',
        '<div class="nc-or-text">OR</div>',
        '<div class="nc-or-line"></div>',
      ].join('');
      row.appendChild(divider);
    }

    const meta = nodeMeta[node.type] || nodeMeta.combat || {
      color: MAP_NODE_TYPE_VISUAL_FALLBACK[node.type]?.color || '#7b2fff',
      icon: MAP_NODE_TYPE_VISUAL_FALLBACK[node.type]?.icon || '?',
      label: node.type,
      desc: '다음 경로를 준비합니다.',
    };
    const ext = NODE_EXTENSIONS[node.type] || NODE_EXTENSIONS.combat;
    const rgb = hexToRgb(meta.color);
    const pos = ['A', 'B', 'C', 'D', 'E'][node.pos] || String((node.pos || 0) + 1);
    const dangerLevel = ext.diff <= 0 ? 0 : (ext.diff < 50 ? 1 : (ext.diff < 75 ? 2 : 3));
    const rewardsHtml = ext.rewards
      .map((reward) => `<span class="nc-reward-tag ${REWARD_CLASS_MAP[reward] || 'gold'}">${reward}</span>`)
      .join('');
    const traitsHtml = ext.traits
      .map((trait) => `<span class="nc-trait-tag${ext.diff === 0 ? ' neutral' : ''}">${trait}</span>`)
      .join('');
    const skullsHtml = ext.diff > 0
      ? `<div class="nc-danger-skulls">${[0, 1, 2].map(
        (idx) => `<span class="nc-skull${idx < dangerLevel ? ' on' : ''}">☠</span>`,
      ).join('')}</div>`
      : '';

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
        ${ext.diff > 0 ? `
          <div class="nc-diff-row">
            <span class="nc-diff-label">위험도</span>
            <div class="nc-diff-track"><div class="nc-diff-fill" style="width:${ext.diff}%"></div></div>
            <span class="nc-diff-val">${ext.diff}</span>
          </div>` : ''}
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

    const triggerMove = () => {
      const handler = globalThis[moveToNodeHandlerName];
      if (typeof handler === 'function') handler(node.id);
    };

    card.addEventListener('mouseenter', () => {
      hoverTint.style.background = `radial-gradient(ellipse at 50% 58%,rgba(${rgb},.065) 0%,transparent 62%)`;
    });
    card.addEventListener('mouseleave', () => {
      hoverTint.style.background = 'transparent';
    });
    card.addEventListener('click', () => {
      playSelectAnim(doc, card, rgb, triggerMove);
    });

    row.appendChild(card);
  });

  mainArea.appendChild(row);
  overlay.appendChild(mainArea);

  const relicPanel = buildRelicPanel(doc, gs, data, tooltipUI);
  relicPanel.id = 'ncRelicPanel';
  overlay.appendChild(relicPanel);

  const toggleDeckView = () => {
    const deckModal = doc.getElementById('deckViewModal');
    const isOpen = deckModal?.classList?.contains('active');
    if (isOpen) {
      deps.closeDeckView?.();
    } else {
      deps.showDeckView?.();
    }
  };

  overlay.appendChild(buildBottomDock(doc, regionData, {
    nodeCount: nodes.length,
    onShowFullMap: typeof deps.showFullMap === 'function' ? () => deps.showFullMap() : null,
    onToggleDeckView: (typeof deps.showDeckView === 'function' || typeof deps.closeDeckView === 'function')
      ? toggleDeckView
      : null,
  }));

  const keyHandler = (event) => {
    if (overlay.style.display === 'none') return;
    if (event.key === 'm' || event.key === 'M') {
      if (typeof deps.showFullMap === 'function') {
        deps.showFullMap();
        event.preventDefault();
      }
      return;
    }
    if (event.key === 'Tab') {
      if (typeof deps.showDeckView === 'function' || typeof deps.closeDeckView === 'function') {
        event.preventDefault();
        toggleDeckView();
      }
      return;
    }
    const index = parseInt(event.key, 10) - 1;
    if (!Number.isFinite(index) || index < 0 || index >= nodes.length) return;
    const cards = typeof row.querySelectorAll === 'function'
      ? Array.from(row.querySelectorAll('.node-card'))
      : Array.from(row.children || []).filter((child) => String(child.className || '').includes('node-card'));
    const targetCard = cards[index];
    if (!targetCard) return;

    const meta = nodeMeta[nodes[index].type] || nodeMeta.combat || { color: '#7b2fff' };
    const rgb = hexToRgb(meta.color);
    playSelectAnim(doc, targetCard, rgb, () => {
      const handler = globalThis[moveToNodeHandlerName];
      if (typeof handler === 'function') handler(nodes[index].id);
    });
  };
  doc.addEventListener('keydown', keyHandler);
  overlay._ncKey = keyHandler;

  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'row';
  overlay.style.alignItems = 'stretch';
  overlay.style.pointerEvents = 'auto';
}
