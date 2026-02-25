import { GS } from './game_state.js';


  const NODE_TYPE_CONFIG = {
    combat: { color: '#ff3366', icon: 'C' },
    elite: { color: '#f0b429', icon: 'E' },
    boss: { color: '#7b2fff', icon: 'B' },
    event: { color: '#00ffcc', icon: '?' },
    shop: { color: '#f0b429', icon: '$' },
    rest: { color: '#44ff88', icon: '+' },
  };

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  export const MapUI = {
    renderMinimap(deps = {}) {
      const gs = deps.gs;
      const canvas = deps.minimapCanvas;
      const ctx = deps.minimapCtx;
      if (!gs || !canvas || !ctx || !gs.mapNodes.length) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, w, h);

      const maxFloor = Math.max(...gs.mapNodes.map(n => n.floor));
      const floorH = (h - 20) / (maxFloor + 1);

      // 연결선 그리기
      gs.mapNodes.forEach(node => {
        if (!node.children) return;
        const nx = w * (node.pos + 1) / (node.total + 1);
        const ny = h - 10 - floorH * node.floor;

        node.children.forEach(childId => {
          const child = gs.mapNodes.find(n => n.id === childId);
          if (!child) return;
          const cx2 = w * (child.pos + 1) / (child.total + 1);
          const cy2 = h - 10 - floorH * child.floor;

          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(cx2, cy2);

          const isVisited = node.visited && child.visited;
          const isNext = node.visited && child.accessible;
          const isCurrentPath = node.id === gs.currentNode?.id || child.id === gs.currentNode?.id;

          if (isCurrentPath) {
            // 현재 위치 연결선 - 강조
            ctx.strokeStyle = 'rgba(0, 255, 204, 0.9)';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = 'rgba(0, 255, 204, 0.8)';
            ctx.shadowBlur = 8;
          } else if (isVisited) {
            // 방문한 경로 - 밝은 청록색
            ctx.strokeStyle = 'rgba(0, 255, 204, 0.6)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 0;
          } else if (isNext) {
            // 다음 이동 가능 - 보라색
            ctx.strokeStyle = 'rgba(123, 47, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 0;
          } else {
            // 방문 안 함 - 어두운 회색
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 0.5;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
          ctx.shadowBlur = 0; // 리셋
        });
      });

      // 노드 그리기
      gs.mapNodes.forEach(node => {
        const nx = w * (node.pos + 1) / (node.total + 1);
        const ny = h - 10 - floorH * node.floor;
        const r = node.type === 'boss' ? 8 : 5;
        const isCurrent = gs.currentNode?.id === node.id;

        // 노드 아이콘/이모지 렌더링
        const meta = deps.nodeMeta || (typeof NODE_META !== 'undefined' ? NODE_META : {});
        const nodeMetaInfo = meta[node.type] || { icon: '?' };

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
        } else if (node.visited) {
          // 방문한 노드 - 밝은 청록색
          ctx.shadowColor = 'rgba(0, 255, 204, 0.6)';
          ctx.shadowBlur = 6;
          ctx.fillStyle = 'rgba(0, 255, 204, 0.9)';
        } else if (node.accessible) {
          // 이동 가능 - 흰색
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.shadowBlur = 0;
        } else {
          // 방문 불가 - 어두운 회색
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.shadowBlur = 0;
        }

        ctx.font = `bold ${r * 1.5}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(nodeMetaInfo.icon || '?', nx, ny);
        ctx.shadowBlur = 0; // 리셋

        // 현재 위치 추가 강조
        if (isCurrent) {
          ctx.beginPath();
          ctx.arc(nx, ny, r + 1, 0, Math.PI * 2);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
    },

    updateNextNodes(deps = {}) {
      const gs = deps.gs;
      if (!gs) return;

      const doc = _getDoc(deps);
      const nextFloor = gs.currentFloor + 1;
      const nodes = gs.mapNodes.filter(n => n.floor === nextFloor && n.accessible && !n.visited);

      const overlay = doc.getElementById('nodeCardOverlay');
      const row = doc.getElementById('nodeCardRow');
      const title = doc.getElementById('nodeCardTitle');
      if (!overlay || !row) return;
      if (
        gs.currentScreen !== 'game' ||
        gs.combat.active ||
        gs._nodeMoveLock ||
        gs._rewardLock ||
        gs._endCombatScheduled ||
        gs._endCombatRunning
      ) {
        overlay.style.display = 'none';
        overlay.style.pointerEvents = 'none';
        return;
      }

      if (nodes.length === 0) {
        overlay.style.display = 'none';
        overlay.style.pointerEvents = 'none';
        return;
      }

      const getFloorStatusText = deps.getFloorStatusText;
      const getRegionData = deps.getRegionData || window.getRegionData;
      if (title && typeof getFloorStatusText === 'function') {
        title.textContent = `${getFloorStatusText(gs.currentRegion, gs.currentFloor)} - 이동 경로를 선택하세요`;
      }

      const moveToNodeHandlerName = deps.moveToNodeHandlerName || 'moveToNode';
      const nodeMeta = deps.nodeMeta || {};

      row.innerHTML = nodes.map((n, idx) => {
        const m = nodeMeta[n.type] || nodeMeta.combat || {
          color: '#ff3366',
          icon: NODE_TYPE_CONFIG.combat.icon,
          label: '전투',
          desc: '다음 교전을 준비합니다.',
        };
        const regionData = typeof getRegionData === 'function' ? getRegionData(gs.currentRegion, gs) : { name: '지역' };
        const pos = ['A', 'B', 'C', 'D'][n.pos] || String(n.pos + 1);
        return `<div class="node-card" style="--node-color:${m.color};animation-delay:${idx * 0.07}s;"
          onclick="${moveToNodeHandlerName}('${n.id}')">
          <div class="node-card-icon">${m.icon || NODE_TYPE_CONFIG[n.type]?.icon || '?'}</div>
          <div class="node-card-label">${m.label || '노드'}</div>
          <div class="node-card-sub">${regionData.name} ${n.floor}층 — ${pos}구역</div>
          <div class="node-card-desc">${m.desc || '다음 위치로 이동합니다.'}</div>
          <div class="node-card-cta">선택</div>
        </div>`;
      }).join('');

      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'auto';
    },

    /** 미니맵 클릭 시 전체 지도를 큰 오버레이로 표시 */
    showFullMap(deps = {}) {
      const gs = deps.gs || window.GS;
      const doc = _getDoc(deps);
      if (!gs || !gs.mapNodes.length) return;

      // 기존 오버레이가 있으면 토글(닫기)
      const existing = doc.getElementById('fullMapOverlay');
      if (existing) { existing.remove(); return; }

      const overlay = doc.createElement('div');
      overlay.id = 'fullMapOverlay';
      overlay.style.cssText = `
        position:fixed; inset:0; z-index:300;
        background:rgba(5,5,18,0.95); backdrop-filter:blur(12px);
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        cursor:pointer; animation:fadeInDown 0.3s ease both;
      `;
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.tagName !== 'CANVAS') overlay.remove();
      });

      // 타이틀
      const title = doc.createElement('div');
      title.style.cssText = `font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.3em;color:var(--echo-bright,#b388ff);margin-bottom:20px;`;
      const getRegionData = deps.getRegionData || window.getRegionData;
      const regionData = typeof getRegionData === 'function' ? getRegionData(gs.currentRegion, gs) : { name: '지역' };
      title.textContent = `📍 ${regionData.name} — ${gs.currentFloor || 0}층`;
      overlay.appendChild(title);

      // 캔버스
      const canvas = doc.createElement('canvas');
      const cw = Math.min(700, window.innerWidth - 60);
      const ch = Math.min(580, window.innerHeight - 160);
      canvas.width = cw; canvas.height = ch;
      canvas.style.cssText = `border:1px solid rgba(123,47,255,0.3);border-radius:12px;background:rgba(0,0,0,0.6);`;
      overlay.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const maxFloor = Math.max(...gs.mapNodes.map(n => n.floor));
      const padY = 35;
      const padX = 50;
      const floorH = (ch - padY * 2) / Math.max(maxFloor, 1);
      const nodeMeta = deps.nodeMeta || (typeof NODE_META !== 'undefined' ? NODE_META : {});

      // 층 라벨 (좌측)
      for (let f = 0; f <= maxFloor; f++) {
        const fy = ch - padY - floorH * f;
        ctx.fillStyle = (f === gs.currentFloor) ? '#00ffcc' : 'rgba(255,255,255,0.2)';
        ctx.font = '11px "Share Tech Mono", monospace';
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(`${f}F`, 8, fy);
        // 수평 가이드 라인
        ctx.beginPath();
        ctx.moveTo(padX - 10, fy);
        ctx.lineTo(cw - 10, fy);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 노드 위치 계산 함수
      const nodeX = (node) => padX + (cw - padX * 2) * (node.pos + 1) / (node.total + 1);
      const nodeY = (node) => ch - padY - floorH * node.floor;

      // 연결선 그리기
      gs.mapNodes.forEach(node => {
        if (!node.children) return;
        const nx = nodeX(node), ny = nodeY(node);
        node.children.forEach(childId => {
          const child = gs.mapNodes.find(n => n.id === childId);
          if (!child) return;
          const cx2 = nodeX(child), cy2 = nodeY(child);
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(cx2, cy2);

          const isPath = node.visited && child.visited;
          const isNext = node.visited && child.accessible;

          if (isPath) {
            ctx.strokeStyle = 'rgba(0, 255, 204, 0.8)';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
          } else if (isNext) {
            ctx.strokeStyle = 'rgba(123, 47, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]); // 잠긴 경로는 점선 처리
          }
          ctx.stroke();
          ctx.setLineDash([]); // 리셋
        });
      });

      // 노드 그리기
      gs.mapNodes.forEach(node => {
        const nx = nodeX(node), ny = nodeY(node);
        const meta = nodeMeta[node.type] || { color: '#666', icon: '?', label: '?' };
        const isCurrent = gs.currentNode?.id === node.id;
        const r = node.type === 'boss' ? 18 : 14;

        // 글로우 효과 (현재 위치만 최소화)
        if (isCurrent) {
          ctx.beginPath();
          ctx.arc(nx, ny, r + 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,255,204,0.2)';
          ctx.fill();
        }

        // 노드 원 장식 제거 (외곽선 및 배경 채우기 모두 제거)
        // 오직 이모지와 현재 위치 글로우만 남김

        // 아이콘
        ctx.fillStyle = isCurrent ? '#000' : '#fff';
        ctx.font = `bold ${r * 1.8}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(meta.icon || NODE_TYPE_CONFIG[node.type]?.icon || '?', nx, ny);
      });

      // 범례
      const legend = doc.createElement('div');
      legend.style.cssText = `display:flex;gap:14px;margin-top:14px;flex-wrap:wrap;justify-content:center;`;
      const types = [
        { icon: '⚔️', label: '전투', color: '#cc2244' },
        { icon: '⭐', label: '정예', color: '#d4a017' },
        { icon: '💀', label: '보스', color: '#7b2fff' },
        { icon: '🎭', label: '이벤트', color: '#0099cc' },
        { icon: '🏪', label: '상점', color: '#00cc88' },
        { icon: '🔥', label: '휴식', color: '#cc5500' },
      ];
      types.forEach(t => {
        const item = doc.createElement('span');
        item.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:11px;color:${t.color};`;
        item.textContent = `${t.icon} ${t.label}`;
        legend.appendChild(item);
      });
      overlay.appendChild(legend);

      const hint = doc.createElement('div');
      hint.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text-dim);margin-top:10px;`;
      hint.textContent = '아무 곳이나 클릭하여 닫기';
      overlay.appendChild(hint);

      doc.body.appendChild(overlay);
    },
  };
