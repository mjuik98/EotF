import { MAP_NODE_TYPE_ORDER, MAP_NODE_TYPE_VISUAL_FALLBACK } from '../../../data/map_node_data.js';

const MINIMAP_HOVER_THRESHOLD = 12;
const FULL_MAP_HOVER_THRESHOLD = 18;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _resolveNodeMeta(deps = {}) {
  return deps.nodeMeta || (typeof NODE_META !== 'undefined' ? NODE_META : {});
}

function _groupNodesByFloor(nodes = []) {
  const byFloor = new Map();
  nodes.forEach((node) => {
    const floorNodes = byFloor.get(node.floor);
    if (floorNodes) {
      floorNodes.push(node);
    } else {
      byFloor.set(node.floor, [node]);
    }
  });
  return byFloor;
}

function _getVisibleFloors(gs) {
  const floors = new Set();
  if (!gs?.mapNodes?.length) return floors;
  gs.mapNodes.forEach((node) => {
    if (node?.visited || node?.id === gs.currentNode?.id) {
      floors.add(node.floor);
    }
  });
  if (Number.isFinite(gs?.currentFloor)) {
    floors.add(gs.currentFloor);
  }
  return floors;
}

function _getLinkedChildren(node, nodesByFloor, nodesById) {
  if (!node) return [];
  if (Array.isArray(node.children) && node.children.length > 0) {
    return node.children.map(childId => nodesById.get(childId)).filter(Boolean);
  }
  return nodesByFloor.get(node.floor + 1) || [];
}

function _toCanvasCoords(canvas, event) {
  if (!canvas || !event) return null;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function _findClosestNodeEntry(entries, x, y, threshold) {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const thresholdSq = threshold * threshold;
  let best = null;
  let bestSq = thresholdSq;
  entries.forEach((entry) => {
    const dx = entry.x - x;
    const dy = entry.y - y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= bestSq) {
      best = entry;
      bestSq = distSq;
    }
  });
  return best;
}

function _getNodeStatusText(node) {
  if (!node) return '';
  if (node.visited) return '✅ 방문함';
  if (node.accessible) return '🔓 이동 가능';
  return '🔒 잠김';
}

function _updateMinimapHint(canvas, node, nodeMeta) {
  const hint = canvas?._minimapHintEl;
  if (!hint) return;
  if (!node) {
    hint.textContent = '';
    hint.style.opacity = '0';
    return;
  }
  const meta = nodeMeta?.[node.type] || {};
  hint.textContent = `${meta.icon || '?'} ${meta.label || '노드'} — ${node.floor}층`;
  hint.style.opacity = '1';
}

function _bindMinimapHover(canvas) {
  if (!canvas || canvas._minimapHoverPatched) return;
  canvas._minimapHoverPatched = true;

  canvas.addEventListener('mousemove', (event) => {
    const hoverData = canvas._minimapHoverData;
    if (!hoverData?.entries?.length) {
      canvas.style.cursor = 'default';
      _updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
      return;
    }

    const point = _toCanvasCoords(canvas, event);
    if (!point) {
      canvas.style.cursor = 'default';
      _updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
      return;
    }

    const closest = _findClosestNodeEntry(
      hoverData.entries,
      point.x,
      point.y,
      hoverData.threshold || MINIMAP_HOVER_THRESHOLD,
    );
    const nodeMeta = canvas._minimapNodeMeta || {};
    if (closest?.node) {
      canvas.style.cursor = 'pointer';
      _updateMinimapHint(canvas, closest.node, nodeMeta);
      return;
    }

    canvas.style.cursor = 'default';
    _updateMinimapHint(canvas, null, nodeMeta);
  });

  // Full-map click handling is bound in GameCanvasSetupUI.
  // Keeping a second click handler here causes duplicate toggle calls
  // (open -> immediate close) on a single click.

  canvas.addEventListener('mouseleave', () => {
    canvas.style.cursor = 'default';
    _updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
  });
}

function _runOnNextFrame(cb) {
  if (typeof globalThis.requestAnimationFrame === 'function') {
    return globalThis.requestAnimationFrame(cb);
  }
  return setTimeout(cb, 16);
}

function _ncHexToRgb(hex) {
  const raw = String(hex || '').replace('#', '');
  if (raw.length !== 6) return '123, 47, 255';
  return [0, 2, 4]
    .map(index => parseInt(raw.slice(index, index + 2), 16))
    .join(', ');
}

function _ncRegionIcon(name, fallback = '🧭') {
  const firstChar = Array.from(String(name || '').trim())[0] || '';
  return /\p{Extended_Pictographic}/u.test(firstChar) ? firstChar : fallback;
}

function _ncGetRegionShortName(name) {
  const label = String(name || '').trim();
  if (!label) return '';
  const shortName = label.replace(/^\p{Extended_Pictographic}\s*/u, '').trim();
  return shortName || label;
}

function _ncStripHtml(html, maxLen = 70) {
  const plain = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return '';
  return plain.length > maxLen ? `${plain.slice(0, maxLen).trim()}…` : plain;
}

function _ncCleanup(doc) {
  const overlay = doc?.getElementById?.('nodeCardOverlay');
  if (overlay?._ncKey) {
    doc.removeEventListener('keydown', overlay._ncKey);
    overlay._ncKey = null;
  }
}

function _ncEnsureOverlayStructure(doc, overlay) {
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

  return { title, row };
}

function _ncBuildFloorBar(doc, gs, regionData, nodeMeta) {
  const totalFloors = Math.max(
    1,
    Number(regionData?.floors) || Math.max(1, ...((gs?.mapNodes || []).map(node => node.floor))),
  );
  const currentFloor = Math.max(0, Number(gs?.currentFloor) || 0);
  const displayCount = Math.min(totalFloors, 9);
  const shortName = _ncGetRegionShortName(regionData?.name) || '지역';
  const wrap = doc.createElement('div');
  wrap.className = 'nc-floor-bar';

  const label = doc.createElement('div');
  label.className = 'nc-floor-bar-label';
  label.textContent = `${shortName} 진행 경로`;
  wrap.appendChild(label);

  const track = doc.createElement('div');
  track.className = 'nc-floor-track';

  for (let floor = 1; floor <= displayCount; floor += 1) {
    const visitedNode = (gs?.mapNodes || []).find(node => node.floor === floor && node.visited);
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

function _ncBuildRuleBanner(doc, regionData) {
  const banner = doc.createElement('div');
  banner.className = 'nc-rule-banner';

  const inner = doc.createElement('div');
  inner.className = 'nc-rule-inner';

  const icon = doc.createElement('span');
  icon.className = 'nc-rule-icon';
  icon.textContent = _ncRegionIcon(regionData?.name);

  const label = doc.createElement('span');
  label.className = 'nc-rule-label';
  label.textContent = regionData?.rule || '기본 규칙';

  const separator = doc.createElement('div');
  separator.className = 'nc-rule-sep';

  const desc = doc.createElement('span');
  desc.className = 'nc-rule-desc';
  desc.textContent = _ncStripHtml(
    regionData?.ruleDesc || (regionData?.rule ? `${regionData.rule}이 적용됩니다.` : ''),
  ) || '별도 제약 없이 탐색과 전투가 이어집니다.';

  inner.append(icon, label, separator, desc);
  banner.appendChild(inner);
  return banner;
}

function _ncBuildRelicPanel(doc, gs, data) {
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
      const isActive = triggers.some(trigger => activeTriggers.has(String(trigger || '').toLowerCase()));
      const rawDesc = _ncStripHtml(item.desc, 220);
      const summary = rawDesc.length > 28 ? `${rawDesc.slice(0, 28).trim()}…` : rawDesc;

      const slot = doc.createElement('div');
      slot.className = `nc-relic-slot rarity-${rarity}${isActive ? ' is-active' : ''}`;
      slot.style.setProperty('--rl-rgb', meta.rgb);

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

      const tip = doc.createElement('div');
      tip.className = 'nc-relic-tip';
      tip.style.setProperty('--rl-rgb', meta.rgb);

      const tipName = doc.createElement('div');
      tipName.className = 'nc-relic-tip-name';
      tipName.textContent = `${item.icon || '✦'} ${item.name || itemId}`;

      const tipRarity = doc.createElement('div');
      tipRarity.className = 'nc-relic-tip-rarity';
      tipRarity.style.color = meta.pip;
      tipRarity.textContent = meta.label;

      const tipDesc = doc.createElement('div');
      tipDesc.className = 'nc-relic-tip-desc';
      tipDesc.textContent = rawDesc || '설명 없음';

      tip.append(tipName, tipRarity, tipDesc);

      if (isActive) {
        const tipEffect = doc.createElement('div');
        tipEffect.className = 'nc-relic-tip-effect';
        tipEffect.textContent = '전투 시작 또는 층 진입 시 자동 발동';
        tip.appendChild(tipEffect);
      }

      slot.append(iconWrap, info, pip, tip);
      list.appendChild(slot);
    });
  }

  scrollWrap.appendChild(list);
  panel.appendChild(scrollWrap);

  const updateFades = () => {
    if (!scrollWrap.classList?.toggle) return;
    const { scrollTop = 0, scrollHeight = 0, clientHeight = 0 } = list;
    scrollWrap.classList.toggle('show-top', scrollTop > 8);
    scrollWrap.classList.toggle('show-bottom', scrollTop + clientHeight < scrollHeight - 8);
  };

  list.addEventListener?.('scroll', updateFades, { passive: true });
  _runOnNextFrame(updateFades);

  return panel;
}

function _ncPlaySelectAnim(doc, card, color, rgb, onDone) {
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
  const clone = doc.createElement('div');
  clone.className = 'nc-select-clone';
  clone.style.cssText = [
    `left:${rect.left}px`,
    `top:${rect.top}px`,
    `width:${rect.width}px`,
    `height:${rect.height}px`,
    'background:linear-gradient(160deg,rgba(14,10,38,.98),rgba(7,5,22,.99))',
    `border:2px solid ${color}`,
    `box-shadow:0 0 55px rgba(${rgb},.5)`,
  ].join(';');
  overlay.appendChild(clone);

  _runOnNextFrame(() => _runOnNextFrame(() => {
    const targetWidth = Math.min(rect.width * 1.08, 280);
    const targetHeight = rect.height * 1.05;
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
      onDone?.();
    }, 300);
  }, 400);
}

export const MapUI = {
  renderMinimap(deps = {}) {
    const gs = deps.gs;
    const canvas = deps.minimapCanvas;
    const ctx = deps.minimapCtx;
    if (!gs || !canvas || !ctx || !gs.mapNodes.length) {
      if (canvas?._minimapHintEl) {
        _updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
      }
      return;
    }

    const doc = _getDoc(deps);
    const nodeMeta = _resolveNodeMeta(deps);
    const minimapHint = deps.minimapNodeHint || doc.getElementById('minimapNodeHint');
    canvas._minimapHintEl = minimapHint || null;
    canvas._minimapNodeMeta = nodeMeta;
    _bindMinimapHover(canvas);

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, w, h);

    const maxFloor = Math.max(...gs.mapNodes.map(n => n.floor));
    const floorH = (h - 20) / (maxFloor + 1);
    const nodeEntries = [];
    const nodesByFloor = _groupNodesByFloor(gs.mapNodes);
    const nodesById = new Map(gs.mapNodes.map(node => [node.id, node]));
    const visibleFloors = _getVisibleFloors(gs);
    const visibleNodeIds = new Set(
      gs.mapNodes
        .filter((node) => visibleFloors.has(node.floor))
        .map((node) => node.id),
    );

    // 연결선 그리기
    gs.mapNodes.forEach(node => {
      if (!visibleNodeIds.has(node.id)) return;
      const linkedChildren = _getLinkedChildren(node, nodesByFloor, nodesById);
      if (!linkedChildren.length) return;
      const nx = w * (node.pos + 1) / (node.total + 1);
      const ny = h - 10 - floorH * node.floor;

      linkedChildren.forEach((child) => {
        if (!visibleNodeIds.has(child.id)) return;
        const cx2 = w * (child.pos + 1) / (child.total + 1);
        const cy2 = h - 10 - floorH * child.floor;

        const isVisited = node.visited && child.visited;
        const isCurrentMove = node.id === gs.currentNode?.id && child.accessible;

        // [단순화] 이미 지나온 노드들 간의 경로(Visited)만 보라색 실선으로 표시
        if (isVisited) {
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(cx2, cy2);
          ctx.strokeStyle = 'rgba(123, 47, 255, 0.4)'; // 투명도 약간 조정
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
          ctx.stroke();
        }
      });
    });

    // 노드 그리기
    gs.mapNodes.forEach(node => {
      if (!visibleNodeIds.has(node.id)) return;
      const nx = w * (node.pos + 1) / (node.total + 1);
      const ny = h - 10 - floorH * node.floor;
      const r = node.type === 'boss' ? 8 : (node.type === 'mini_boss' ? 7 : 5);
      const isCurrent = gs.currentNode?.id === node.id;
      nodeEntries.push({ node, x: nx, y: ny });

      // 노드 아이콘/이모지 렌더링
      const nodeMetaInfo = nodeMeta[node.type] || { icon: '?' };

      // 방문한 노드 - 밝은 청록색, 현재 위치 - 흰색 글로우, 그 외 - 회색
      if (isCurrent) {
        // 현재 위치 - 흰색 글로우
        ctx.beginPath();
        ctx.arc(nx, ny, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#fff';
      } else if (node.accessible && !node.visited && node.floor === gs.currentFloor + 1) {
        // [단순화] 이동 가능한 다음 노드만 살짝 노출
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 0;
      } else if (node.visited) {
        // [반전] 방문한 노드는 좀 더 잘 보이게 (0.7)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 0;
      } else {
        // [반전] 지나친 노드 및 비활성 노드는 거의 안 보이게 (0.1)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.shadowBlur = 0;
      }

      ctx.font = `bold ${r * 1.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nodeMetaInfo.icon || '?', nx, ny);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.globalAlpha = 1.0; // 복구

      // 현재 위치 추가 강조
      if (isCurrent) {
        ctx.beginPath();
        ctx.arc(nx, ny, r + 1, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    canvas._minimapHoverData = {
      entries: nodeEntries,
      threshold: MINIMAP_HOVER_THRESHOLD,
    };
  },

  updateNextNodes(deps = {}) {
    const gs = deps.gs;
    if (!gs) return;

    const doc = _getDoc(deps);
    const nextFloor = gs.currentFloor + 1;
    const nodes = gs.mapNodes.filter(n => n.floor === nextFloor && n.accessible && !n.visited);

    const overlay = doc.getElementById('nodeCardOverlay');
    if (!overlay) return;
    const { row, title } = _ncEnsureOverlayStructure(doc, overlay);
    if (
      gs.currentScreen !== 'game' ||
      gs.combat.active ||
      gs._nodeMoveLock ||
      gs._rewardLock ||
      gs._endCombatScheduled ||
      gs._endCombatRunning ||
      nodes.length === 0
    ) {
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      _ncCleanup(doc);
      return;
    }

    const getFloorStatusText = deps.getFloorStatusText;
    const getRegionData = deps.getRegionData || globalThis.getRegionData;
    const moveToNodeHandlerName = deps.moveToNodeHandlerName || 'moveToNode';
    const nodeMeta = _resolveNodeMeta(deps);
    const data = deps.data || globalThis.DATA || {};
    const regionData = (typeof getRegionData === 'function'
      ? getRegionData(gs.currentRegion, gs)
      : null) || { name: '지역' };
    const shortRegionName = _ncGetRegionShortName(regionData.name) || regionData.name || '지역';
    const accent = regionData.accent || nodeMeta[nodes[0]?.type]?.color || '#44aa66';
    const accentRgb = _ncHexToRgb(accent);
    const nodeExt = {
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
        preview: '선택에 따라 이득과 리스크가 달라집니다.',
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
    const rewardClassMap = {
      카드: 'nc-card-rwd',
      유물: 'relic',
      골드: 'gold',
      'HP 회복': 'hp',
      '카드 강화': 'hp',
      축복: 'relic',
    };

    if (title) {
      title.style.display = 'none';
      if (typeof getFloorStatusText === 'function') {
        title.textContent = `${getFloorStatusText(gs.currentRegion, gs.currentFloor)} - 이동 경로를 선택하세요`;
      }
    }

    doc.getElementById('ncMainArea')?.remove();
    doc.getElementById('ncRelicPanel')?.remove();
    doc.getElementById('ncHoverTint')?.remove();
    _ncCleanup(doc);

    overlay.style.setProperty('--nc-accent', accent);
    overlay.style.setProperty('--nc-accent-rgb', accentRgb);

    const hoverTint = doc.createElement('div');
    hoverTint.id = 'ncHoverTint';
    hoverTint.className = 'nc-hover-tint';
    overlay.insertBefore(hoverTint, overlay.firstChild);

    const mainArea = doc.createElement('div');
    mainArea.id = 'ncMainArea';
    mainArea.className = 'nc-main-area';
    mainArea.appendChild(_ncBuildFloorBar(doc, gs, regionData, nodeMeta));

    const titleArea = doc.createElement('div');
    titleArea.className = 'nc-title-area';

    const tag = doc.createElement('div');
    tag.className = 'nc-region-tag';
    const dot = doc.createElement('div');
    dot.className = 'nc-region-dot';
    const tagText = doc.createElement('span');
    tagText.textContent = `${shortRegionName} · ${regionData.rule || '이동 경로'}`;
    tag.append(dot, tagText);

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
      const ext = nodeExt[node.type] || nodeExt.combat;
      const rgb = _ncHexToRgb(meta.color);
      const pos = ['A', 'B', 'C', 'D', 'E'][node.pos] || String((node.pos || 0) + 1);
      const dangerLevel = ext.diff <= 0 ? 0 : (ext.diff < 50 ? 1 : (ext.diff < 75 ? 2 : 3));
      const rewardsHtml = ext.rewards
        .map(reward => `<span class="nc-reward-tag ${rewardClassMap[reward] || 'gold'}">${reward}</span>`)
        .join('');
      const traitsHtml = ext.traits
        .map(trait => `<span class="nc-trait-tag${ext.diff === 0 ? ' neutral' : ''}">${trait}</span>`)
        .join('');
      const skullsHtml = ext.diff > 0
        ? `<div class="nc-danger-skulls">${[0, 1, 2].map(
          idx => `<span class="nc-skull${idx < dangerLevel ? ' on' : ''}">☠</span>`,
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
        hoverTint.style.background =
          `radial-gradient(ellipse at 50% 58%,rgba(${rgb},.065) 0%,transparent 62%)`;
      });
      card.addEventListener('mouseleave', () => {
        hoverTint.style.background = 'transparent';
      });
      card.addEventListener('click', () => {
        _ncPlaySelectAnim(doc, card, meta.color, rgb, triggerMove);
      });

      row.appendChild(card);
    });

    mainArea.appendChild(row);
    mainArea.appendChild(_ncBuildRuleBanner(doc, regionData));
    overlay.appendChild(mainArea);

    const relicPanel = _ncBuildRelicPanel(doc, gs, data);
    relicPanel.id = 'ncRelicPanel';
    overlay.appendChild(relicPanel);

    const keyHandler = (event) => {
      if (overlay.style.display === 'none') return;
      const index = parseInt(event.key, 10) - 1;
      if (!Number.isFinite(index) || index < 0 || index >= nodes.length) return;
      const cards = typeof row.querySelectorAll === 'function'
        ? Array.from(row.querySelectorAll('.node-card'))
        : Array.from(row.children || []).filter(child => String(child.className || '').includes('node-card'));
      const targetCard = cards[index];
      if (!targetCard) return;

      const meta = nodeMeta[nodes[index].type] || nodeMeta.combat || { color: '#7b2fff' };
      const rgb = _ncHexToRgb(meta.color);
      _ncPlaySelectAnim(doc, targetCard, meta.color, rgb, () => {
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
  },

  /** 미니맵 클릭 시 전체 지도를 큰 오버레이로 표시 */
  showFullMap(deps = {}) {
    const gs = deps.gs;
    const doc = _getDoc(deps);
    if (!gs || !gs.mapNodes.length) return;

    // 기존 오버레이가 있으면 토글(닫기)
    const existing = doc.getElementById('fullMapOverlay');
    if (existing) {
      if (typeof existing._closeFullMap === 'function') existing._closeFullMap();
      else existing.remove();
      return;
    }

    const overlay = doc.createElement('div');
    overlay.id = 'fullMapOverlay';
    overlay.style.cssText = `
        position:fixed; inset:0; z-index:300;
        background:rgba(5,5,18,0.96); backdrop-filter:blur(12px);
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        cursor:default; animation:fadeInDown 0.3s ease both;
      `;
    let closed = false;
    let onOverlayKeyDown = null;
    const closeOverlay = () => {
      if (closed) return;
      closed = true;
      if (onOverlayKeyDown) {
        doc.removeEventListener('keydown', onOverlayKeyDown, true);
      }
      if (typeof animFrame === 'number') {
        cancelAnimationFrame(animFrame);
      }
      overlay.remove();
    };
    overlay._closeFullMap = closeOverlay;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });
    onOverlayKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
      closeOverlay();
    };
    doc.addEventListener('keydown', onOverlayKeyDown, true);

    // 타이틀
    const title = doc.createElement('div');
    title.style.cssText = `font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.3em;color:var(--echo-bright,#b388ff);margin-bottom:20px;`;
    const getRegionData = deps.getRegionData || globalThis.getRegionData;
    const regionData = typeof getRegionData === 'function' ? getRegionData(gs.currentRegion, gs) : { name: '지역' };
    title.textContent = `📍 ${regionData.name} — ${gs.currentFloor || 0}층`;
    overlay.appendChild(title);

    // 캔버스
    // [개선 3] 맵 세로 스크롤 지원 컨테이너
    const viewportW = Number(globalThis.innerWidth || 1280);
    const viewportH = Number(globalThis.innerHeight || 720);
    const cw = Math.min(720, viewportW - 60);
    const ch = Math.min(600, viewportH - 200);
    const canvasContainer = doc.createElement('div');
    canvasContainer.style.cssText = `
      width:${cw}px; height:${ch}px; overflow-y:auto; overflow-x:hidden;
      border:1px solid rgba(123,47,255,0.25); border-radius:12px;
      background:rgba(0,0,0,0.45); scrollbar-width:thin;
      scrollbar-color:rgba(123,47,255,0.4) transparent;
    `;

    const canvas = doc.createElement('canvas');
    const maxFloorNum = Math.max(...gs.mapNodes.map(n => n.floor));
    const floorSpacing = 110;
    const contentHeight = Math.max(ch, (maxFloorNum + 1) * floorSpacing + 80);
    canvas.width = cw;
    canvas.height = contentHeight;
    canvas.style.display = 'block';
    canvasContainer.appendChild(canvas);
    overlay.appendChild(canvasContainer);

    // [연출 4] 디지털 클리치 효과용 캔버스 (오버레이)
    const glitchCanvas = doc.createElement('canvas');
    glitchCanvas.width = cw; glitchCanvas.height = ch;
    glitchCanvas.style.cssText = `position:absolute; top:calc(50% - ${ch / 2}px); left:calc(50% - ${cw / 2}px); pointer-events:none; z-index:500; opacity:0;`;
    overlay.appendChild(glitchCanvas);
    const gctx = glitchCanvas.getContext('2d');
    let glitchTimer = 22;

    // [연출 1] 파티클 초기화 (지역별 테마)
    const particles = [];
    const particleColor = 'rgba(155, 79, 255, ';
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * cw,
        y: Math.random() * contentHeight,
        r: Math.random() * 2 + 1,
        vy: -0.2 - Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        life: Math.random(),
      });
    }

    const tooltip = doc.createElement('div');
    tooltip.style.cssText = `
      position:fixed; z-index:1000; pointer-events:none;
      background:rgba(5,5,18,0.95); border:1px solid rgba(123,47,255,0.7);
      border-radius:8px; padding:12px 16px; font-family:'Share Tech Mono',monospace;
      font-size:12px; color:#fff; transition:opacity 0.15s; opacity:0;
      box-shadow: 0 0 20px rgba(123,47,255,0.5);
      max-width: 260px;
    `;
    const tooltipTitle = doc.createElement('div');
    tooltipTitle.style.cssText = `font-weight:700;margin-bottom:6px;font-size:14px;`;
    const tooltipDesc = doc.createElement('div');
    tooltipDesc.style.cssText = `color:rgba(255,255,255,0.85);line-height:1.5;margin-bottom:8px;`;
    const tooltipStatus = doc.createElement('div');
    tooltipStatus.style.cssText = `color:rgba(255,255,255,0.6);font-size:11px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1);`;
    tooltip.append(tooltipTitle, tooltipDesc, tooltipStatus);
    overlay.appendChild(tooltip);

    const ctx = canvas.getContext('2d');
    const padX = 60;
    const nodeMeta = _resolveNodeMeta(deps);
    const nodeMap = new Map(gs.mapNodes.map(node => [node.id, node]));
    const nodesByFloor = _groupNodesByFloor(gs.mapNodes);
    const visibleFloors = _getVisibleFloors(gs);
    const visibleNodes = gs.mapNodes.filter((node) => visibleFloors.has(node.floor));
    const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));

    const nodeX = (node) => padX + (cw - padX * 2) * (node.pos + 1) / (node.total + 1);
    const nodeY = (node) => contentHeight - 65 - floorSpacing * node.floor;
    const nodeEntries = visibleNodes.map(node => ({
      node,
      x: nodeX(node),
      y: nodeY(node),
    }));
    const nodeEntryById = new Map(nodeEntries.map(entry => [entry.node.id, entry]));

    // flowOffset 제거 (미사용)
    let animFrame = null;

    const draw = () => {
      if (closed) return;
      ctx.clearRect(0, 0, cw, contentHeight);

      // [연출 1] 배경 파티클 상시 렌더링
      particles.forEach(p => {
        p.y += p.vy; p.x += p.vx;
        if (p.y < 0) p.y = contentHeight;
        if (p.x < 0) p.x = cw; if (p.x > cw) p.x = 0;
        ctx.fillStyle = particleColor + (0.12 + Math.random() * 0.05) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });

      // [개선 2] 층 인디케이터 강조
      for (let f = 0; f <= maxFloorNum; f++) {
        const fy = contentHeight - 65 - floorSpacing * f;
        const isCurrentFloor = f === gs.currentFloor;

        ctx.strokeStyle = isCurrentFloor ? 'rgba(0, 255, 204, 0.2)' : 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(padX - 25, fy); ctx.lineTo(cw - 25, fy); ctx.stroke();

        ctx.fillStyle = isCurrentFloor ? '#00ffcc' : 'rgba(255,255,255,0.25)';
        ctx.font = isCurrentFloor ? 'bold 16px "Share Tech Mono"' : '12px "Share Tech Mono"';
        ctx.textAlign = 'right';
        ctx.fillText(`${f}F`, padX - 35, fy + 5);
      }

      // [연출 2] 경로 연결선 단순화 (지난 경로만 점선 표시)
      gs.mapNodes.forEach(node => {
        if (!visibleNodeIds.has(node.id)) return;
        const linkedChildren = _getLinkedChildren(node, nodesByFloor, nodeMap);
        if (!linkedChildren.length) return;
        const entry = nodeEntryById.get(node.id);
        if (!entry) return;
        linkedChildren.forEach(child => {
          if (!visibleNodeIds.has(child.id)) return;
          const cEntry = nodeEntryById.get(child.id);
          if (!cEntry) return;

          const isVisited = node.visited && child.visited;

          if (isVisited) {
            ctx.beginPath(); ctx.moveTo(entry.x, entry.y); ctx.lineTo(cEntry.x, cEntry.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 8]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      });

      // [개선 1] 노드 중요도별 시각화
      const nowTs = Date.now();
      const pulseVal = Math.sin(nowTs / 450) * 0.5 + 0.5;

      nodeEntries.forEach(entry => {
        const { node, x, y } = entry;
        const metaInfo = nodeMeta[node.type] || { color: '#666', icon: '?' };
        const isPlayerAt = gs.currentNode?.id === node.id;

        let radius = 16;
        if (node.type === 'boss') radius = 25;
        else if (node.type === 'mini_boss') radius = 22;
        else if (node.type === 'elite') radius = 20;

        if (isPlayerAt) {
          ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 18 + pulseVal * 12;
          ctx.beginPath(); ctx.arc(x, y, radius + 6 + pulseVal * 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 255, 204, 0.18)'; ctx.fill();
        }

        ctx.save();
        if (node.visited && !isPlayerAt) {
          ctx.globalAlpha = 0.8; // [반전] 방문 노드 시안성 강화
          ctx.filter = 'grayscale(30%) brightness(0.9)'; // 흑백화 완화
        }

        // 아이콘 텍스트
        const isTarget = node.accessible && !node.visited && node.floor === gs.currentFloor + 1;
        const isInactive = !isPlayerAt && !isTarget;
        ctx.fillStyle = isPlayerAt ? '#00ffcc' : (isTarget ? '#fff' : (node.visited ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)'));
        ctx.font = `bold ${radius * 1.6}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(metaInfo.icon || '?', x, y);

        // [연출 3] 포그 오브 워 (가려진 먼 층)
        if (node.floor > gs.currentFloor + 1) {
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.75, (node.floor - gs.currentFloor - 0.4) * 0.45)})`;
          ctx.beginPath(); ctx.arc(x, y, radius + 3, 0, Math.PI * 2); ctx.fill();
        }

        ctx.restore(); ctx.shadowBlur = 0;
      });

      // [연출 4] 클리치 효과 처리
      if (glitchTimer > 0) {
        gctx.clearRect(0, 0, cw, ch);
        glitchCanvas.style.opacity = (glitchTimer / 20).toString();
        for (let i = 0; i < 6; i++) {
          gctx.fillStyle = `rgba(155, 79, 255, ${0.2 + Math.random() * 0.2})`;
          gctx.fillRect(Math.random() * cw, Math.random() * ch, Math.random() * 120, Math.random() * 4);
        }
        glitchTimer--;
      } else {
        glitchCanvas.style.opacity = '0';
      }

      animFrame = requestAnimationFrame(draw);
    };

    draw(); // 애니메이션 루프 시작

    const updateTooltip = (node, event) => {
      if (!node || !event) { tooltip.style.opacity = '0'; return; }
      const meta = nodeMeta[node.type] || { icon: '?', label: '노드', color: '#fff', desc: '' };
      tooltipTitle.style.color = meta.color || '#fff';
      tooltipTitle.textContent = `${meta.icon || '?'} ${meta.label || '노드'}`;
      tooltipDesc.textContent = meta.desc || '다음 위치로 이동합니다.';
      tooltipStatus.textContent = `${node.floor}층 — ${_getNodeStatusText(node)}`;
      tooltip.style.opacity = '1';

      const rectT = tooltip.getBoundingClientRect();
      let lx = event.clientX + 20;
      let ly = event.clientY + 20;
      const viewportW = Number(globalThis.innerWidth || 1280);
      const viewportH = Number(globalThis.innerHeight || 720);
      if (lx + rectT.width > viewportW) lx = event.clientX - rectT.width - 20;
      if (ly + rectT.height > viewportH) ly = event.clientY - rectT.height - 20;
      tooltip.style.left = `${lx}px`; tooltip.style.top = `${ly}px`;
    };

    canvas.addEventListener('mousemove', (e) => {
      const rectC = canvas.getBoundingClientRect();
      const mx = (e.clientX - rectC.left);
      const my = (e.clientY - rectC.top);
      const closest = _findClosestNodeEntry(nodeEntries, mx, my, FULL_MAP_HOVER_THRESHOLD + 5);
      updateTooltip(closest?.node || null, e);
      canvas.style.cursor = closest ? 'pointer' : 'default';
    });
    canvas.addEventListener('mouseleave', () => updateTooltip(null));

    // 범례
    const legend = doc.createElement('div');
    legend.style.cssText = `display:flex;gap:18px;margin-top:20px;flex-wrap:wrap;justify-content:center;`;
    MAP_NODE_TYPE_ORDER.forEach(type => {
      const meta = nodeMeta[type]; if (!meta) return;
      const item = doc.createElement('span');
      item.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:12px;color:${meta.color || '#fff'};opacity:0.8;`;
      item.textContent = `${meta.icon || '?'} ${meta.label || '노드'}`;
      legend.appendChild(item);
    });
    overlay.appendChild(legend);

    const closeBtn = doc.createElement('button');
    closeBtn.className = 'action-btn action-btn-secondary';
    closeBtn.innerHTML = '닫기<span class="kbd-hint">ESC</span>';
    closeBtn.style.marginTop = '20px';

    // [연출 4] 닫기 시 클리치 효과 후 제거 로직 (선택적) 또는 즉시 종료
    closeBtn.onclick = closeOverlay;
    overlay.appendChild(closeBtn);

    doc.body.appendChild(overlay);

    // [개선 3] 현재 층으로 스크롤 자동 이동
    const startY = nodeY({ floor: gs.currentFloor });
    canvasContainer.scrollTop = startY - ch / 2;
  },
};
