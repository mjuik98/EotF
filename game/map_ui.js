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
  };

  globalObj.MapUI = MapUI;
})(window);
