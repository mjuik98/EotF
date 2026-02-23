'use strict';

(function initMapUI(globalObj) {
  let _mapAutoCloseTimer = null;
  const NODE_TYPE_CONFIG = {
    combat: { color: '#ff3366', icon: '⚔' },
    elite: { color: '#f0b429', icon: '⭐' },
    boss: { color: '#7b2fff', icon: '💀' },
    event: { color: '#00ffcc', icon: '🎭' },
    shop: { color: '#f0b429', icon: '🏪' },
    rest: { color: '#44ff88', icon: '🔥' },
  };

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  const MapUI = {
    renderMapOverlay(deps = {}) {
      const gs = deps.gs;
      if (!gs) return;

      const doc = _getDoc(deps);
      const canvas = doc.getElementById(deps.mapCanvasId || 'mapCanvas');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#07071a';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(123,47,255,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (!gs.mapNodes.length) return;

      const maxFloor = Math.max(...gs.mapNodes.map(n => n.floor));
      const floorH = h / (maxFloor + 1);

      gs.mapNodes.forEach(node => {
        const nx = w * (node.pos + 1) / (node.total + 1);
        const ny = h - floorH * node.floor;

        const nextFloor = gs.mapNodes.filter(n => n.floor === node.floor + 1);
        nextFloor.forEach(next => {
          const nnx = w * (next.pos + 1) / (next.total + 1);
          const nny = h - floorH * next.floor;
          ctx.beginPath();
          ctx.strokeStyle = node.visited ? 'rgba(123,47,255,0.4)' : 'rgba(123,47,255,0.12)';
          ctx.lineWidth = 1.5;
          ctx.moveTo(nx, ny);
          ctx.lineTo(nnx, nny);
          ctx.stroke();
        });
      });

      gs.mapNodes.forEach(node => {
        const nx = w * (node.pos + 1) / (node.total + 1);
        const ny = h - floorH * node.floor;
        const cfg = NODE_TYPE_CONFIG[node.type] || { color: '#606088', icon: '?' };
        const r = node.type === 'boss' ? 16 : 12;

        ctx.save();
        if (node.visited) {
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        } else if (node.accessible) {
          ctx.fillStyle = `${cfg.color}33`;
          ctx.strokeStyle = cfg.color;
          ctx.shadowColor = cfg.color;
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = 'rgba(96,96,136,0.1)';
          ctx.strokeStyle = 'rgba(96,96,136,0.2)';
        }

        ctx.lineWidth = node.accessible && !node.visited ? 2 : 1;
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = `${r}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = node.visited ? 'rgba(255,255,255,0.2)' : node.accessible ? '#fff' : 'rgba(255,255,255,0.15)';
        ctx.fillText(cfg.icon, nx, ny);
        ctx.restore();

        if (gs.currentNode?.id === node.id) {
          ctx.save();
          ctx.strokeStyle = '#00ffcc';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#00ffcc';
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(nx, ny, r + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        node._canvasX = nx;
        node._canvasY = ny;
      });
    },

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
      if (!overlay || !row || gs.combat.active) return;

      if (nodes.length === 0) {
        overlay.style.display = 'none';
        return;
      }

      const getFloorStatusText = deps.getFloorStatusText;
      if (title && typeof getFloorStatusText === 'function') {
        title.textContent = `${getFloorStatusText(gs.currentRegion, gs.currentFloor)}  —  이동할 곳을 선택하세요`;
      }

      const moveToNodeHandlerName = deps.moveToNodeHandlerName || 'moveToNode';
      const nodeMeta = deps.nodeMeta || {};
      row.innerHTML = nodes.map((n, idx) => {
        const m = nodeMeta[n.type] || nodeMeta.combat || {
          color: '#ff3366',
          icon: '⚔',
          label: '전투',
          desc: '적과 조우합니다',
        };
        const pos = ['A', 'B', 'C'][n.pos] || n.pos;
        return `<div class="node-card" style="--node-color:${m.color};animation-delay:${idx * 0.07}s;"
          onclick="${moveToNodeHandlerName}('${n.id}')">
          <div class="node-card-icon">${m.icon}</div>
          <div class="node-card-label">${m.label}</div>
          <div class="node-card-sub">${n.floor}층 · ${pos}구역</div>
          <div class="node-card-desc">${m.desc}</div>
          <div class="node-card-cta">▶ 이동</div>
        </div>`;
      }).join('');
      overlay.style.display = 'flex';
    },

    handleMapClick(event, deps = {}) {
      if (typeof deps.closeMapOverlay === 'function') deps.closeMapOverlay();
    },

    showOverlay(autoClose = false, deps = {}) {
      const doc = _getDoc(deps);
      if (typeof deps.renderMapOverlay === 'function') deps.renderMapOverlay();

      doc.getElementById('mapOverlay')?.classList.add('active');
      const bar = doc.getElementById('mapTimerBar');
      const fill = doc.getElementById('mapTimerFill');
      if (autoClose && bar && fill) {
        bar.style.display = 'block';
        fill.style.transition = 'none';
        fill.style.width = '100%';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          fill.style.transition = 'width 2.8s linear';
          fill.style.width = '0%';
        }));
        clearTimeout(_mapAutoCloseTimer);
        _mapAutoCloseTimer = setTimeout(() => {
          if (doc.getElementById('mapOverlay')?.classList.contains('active')) {
            this.closeOverlay(deps);
          }
        }, 2800);
      } else if (bar) {
        bar.style.display = 'none';
        clearTimeout(_mapAutoCloseTimer);
      }
    },

    closeOverlay(deps = {}) {
      const doc = _getDoc(deps);
      clearTimeout(_mapAutoCloseTimer);
      doc.getElementById('mapOverlay')?.classList.remove('active');
      const bar = doc.getElementById('mapTimerBar');
      if (bar) bar.style.display = 'none';
    },
  };

  globalObj.MapUI = MapUI;
})(window);
