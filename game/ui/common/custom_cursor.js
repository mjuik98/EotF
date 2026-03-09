/**
 * Global Custom Cursor System
 * Manages custom cursor DOT, RING and CANVAS trail effects.
 */

let _cursorSession = null;

export const CustomCursor = {
  init(deps = {}) {
    const doc = deps.doc || document;
    const win = deps.win || window;
    
    if (_cursorSession) this.cleanup(deps);

    const cDot = doc.getElementById('cDot');
    const cRing = doc.getElementById('cRing');
    const canvas = doc.getElementById('cursorCanvas');
    const ctx = canvas?.getContext('2d');

    if (!cDot || !cRing || !canvas || !ctx) {
      console.warn('[CustomCursor] Required elements not found in DOM');
      return;
    }

    // Show elements
    cDot.style.display = 'block';
    cRing.style.display = 'block';

    const state = {
      mouse: { x: win.innerWidth / 2, y: win.innerHeight / 2, rx: win.innerWidth / 2, ry: win.innerHeight / 2 },
      trail: [],
      rafId: 0,
      cleanups: []
    };

    const onMove = (e) => {
      state.mouse.x = e.clientX;
      state.mouse.y = e.clientY;
      state.trail.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (state.trail.length > 32) state.trail.shift();
    };

    const onResize = () => {
      canvas.width = win.innerWidth;
      canvas.height = win.innerHeight;
    };

    doc.addEventListener('mousemove', onMove);
    win.addEventListener('resize', onResize);
    onResize();

    state.cleanups.push(() => doc.removeEventListener('mousemove', onMove));
    state.cleanups.push(() => win.removeEventListener('resize', onResize));

    const loop = () => {
      // Smooth ring movement
      state.mouse.rx += (state.mouse.x - state.mouse.rx) * 0.15;
      state.mouse.ry += (state.mouse.y - state.mouse.ry) * 0.15;

      cDot.style.left = `${state.mouse.x}px`;
      cDot.style.top = `${state.mouse.y}px`;
      cRing.style.left = `${state.mouse.rx}px`;
      cRing.style.top = `${state.mouse.ry}px`;

      // Draw trail on canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = state.trail.length - 1; i >= 0; i--) {
        const p = state.trail[i];
        p.life -= 0.05;
        if (p.life <= 0) {
          state.trail.splice(i, 1);
          continue;
        }

        const a = p.life * 0.4;
        const r = 2.5 * p.life;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
        g.addColorStop(0, `rgba(0, 255, 204, ${a * 0.6})`);
        g.addColorStop(1, 'rgba(0, 255, 204, 0)');
        
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(0, 255, 204, 0.9)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      state.rafId = win.requestAnimationFrame(loop);
    };

    state.rafId = win.requestAnimationFrame(loop);
    _cursorSession = state;
  },

  cleanup(deps = {}) {
    if (!_cursorSession) return;
    const win = deps.win || window;
    win.cancelAnimationFrame(_cursorSession.rafId);
    _cursorSession.cleanups.forEach(fn => fn());
    _cursorSession = null;
  }
};
