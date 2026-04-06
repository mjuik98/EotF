import {
  getMapNodeVisualFallback,
  MAP_NODE_TYPE_VISUAL_FALLBACK,
} from '../../application/map_node_content_queries.js';
import { getPlayerHpPanelLevel } from '../../ports/public_player_hp_panel_runtime_capabilities.js';

export { MAP_NODE_TYPE_VISUAL_FALLBACK };

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

export const REWARD_CLASS_MAP = {
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
  const wrap = doc.createElement('div');
  wrap.className = 'nc-floor-bar';

  const label = doc.createElement('div');
  label.className = 'nc-floor-bar-label';
  label.textContent = '지역 진행';
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
