'use strict';

(function initMapUI(globalObj) {
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

  const MapUI = {
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

      gs.mapNodes.forEach(node => {
        const nx = w * (node.pos + 1) / (node.total + 1);
        const ny = h - 10 - floorH * node.floor;
        const r = node.type === 'boss' ? 5 : 3;

        ctx.beginPath();
        if (node.visited) ctx.fillStyle = 'rgba(255,255,255,0.2)';
        else if (node.accessible) ctx.fillStyle = '#7b2fff';
        else ctx.fillStyle = 'rgba(96,96,136,0.3)';

        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fill();

        if (gs.currentNode?.id === node.id) {
          ctx.strokeStyle = '#00ffcc';
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
        const pos = ['A', 'B', 'C', 'D'][n.pos] || String(n.pos + 1);
        return `<div class="node-card" style="--node-color:${m.color};animation-delay:${idx * 0.07}s;"
          onclick="${moveToNodeHandlerName}('${n.id}')">
          <div class="node-card-icon">${m.icon || NODE_TYPE_CONFIG[n.type]?.icon || '?'}</div>
          <div class="node-card-label">${m.label || '노드'}</div>
          <div class="node-card-sub">${n.floor}층 - ${pos}구역</div>
          <div class="node-card-desc">${m.desc || '다음 위치로 이동합니다.'}</div>
          <div class="node-card-cta">선택</div>
        </div>`;
      }).join('');

      overlay.style.display = 'flex';
      overlay.style.pointerEvents = 'auto';
    },

    /** 미니맵 클릭 시 전체 지도를 큰 오버레이로 표시 */
    showFullMap(deps = {}) {
      const gs = deps.gs;
      const doc = _getDoc(deps);
      if (!gs || !gs.mapNodes.length) return;

      // 기존 오버레이가 있으면 토글(닫기)
      const existing = doc.getElementById('fullMapOverlay');
      if (existing) { existing.remove(); return; }

      const overlay = doc.createElement('div');
      overlay.id = 'fullMapOverlay';
      overlay.style.cssText = `
        position:fixed; inset:0; z-index:300;
        background:rgba(5,5,18,0.92); backdrop-filter:blur(10px);
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        cursor:pointer; animation:fadeInDown 0.3s ease both;
      `;
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.id === 'fullMapCloseBtn') overlay.remove();
      });

      const title = doc.createElement('div');
      title.style.cssText = `font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.3em;color:var(--text-dim);margin-bottom:16px;`;
      title.textContent = `📍 ${gs.currentRegion || '지역'} — ${gs.currentFloor || 0}층`;
      overlay.appendChild(title);

      const canvas = doc.createElement('canvas');
      const cw = Math.min(600, window.innerWidth - 40);
      const ch = Math.min(500, window.innerHeight - 120);
      canvas.width = cw; canvas.height = ch;
      canvas.style.cssText = `border:1px solid var(--border);border-radius:10px;background:rgba(0,0,0,0.5);`;
      overlay.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const maxFloor = Math.max(...gs.mapNodes.map(n => n.floor));
      const floorH = (ch - 40) / (maxFloor + 1);
      const nodeMeta = deps.nodeMeta || (typeof NODE_META !== 'undefined' ? NODE_META : {});

      // 연결선 먼저 그리기
      gs.mapNodes.forEach(node => {
        if (!node.children) return;
        const nx = cw * (node.pos + 1) / (node.total + 1);
        const ny = ch - 20 - floorH * node.floor;
        node.children.forEach(childId => {
          const child = gs.mapNodes.find(n => n.id === childId);
          if (!child) return;
          const cx2 = cw * (child.pos + 1) / (child.total + 1);
          const cy2 = ch - 20 - floorH * child.floor;
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(cx2, cy2);
          ctx.strokeStyle = 'rgba(123,47,255,0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      });

      // 노드 그리기
      gs.mapNodes.forEach(node => {
        const nx = cw * (node.pos + 1) / (node.total + 1);
        const ny = ch - 20 - floorH * node.floor;
        const meta = nodeMeta[node.type] || { color: '#666', icon: '?' };
        const r = node.type === 'boss' ? 10 : 7;

        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        if (gs.currentNode?.id === node.id) {
          ctx.fillStyle = '#00ffcc';
          ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 2; ctx.stroke();
        } else if (node.visited) {
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
        } else if (node.accessible) {
          ctx.fillStyle = meta.color || '#7b2fff';
        } else {
          ctx.fillStyle = 'rgba(96,96,136,0.3)';
        }
        ctx.fill();

        // 아이콘 텍스트
        ctx.fillStyle = '#fff';
        ctx.font = `${r}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(NODE_TYPE_CONFIG[node.type]?.icon || '?', nx, ny);
      });

      const hint = doc.createElement('div');
      hint.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text-dim);margin-top:12px;`;
      hint.textContent = '클릭하여 닫기';
      overlay.appendChild(hint);

      doc.body.appendChild(overlay);
    },
  };

  globalObj.MapUI = MapUI;
})(window);
