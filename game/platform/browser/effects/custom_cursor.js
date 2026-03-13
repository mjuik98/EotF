let cursorSession = null;

function getDoc(deps = {}) {
  return deps.doc || document;
}

function getWin(deps = {}) {
  return deps.win || window;
}

export const CustomCursor = {
  init(deps = {}) {
    const doc = getDoc(deps);
    const win = getWin(deps);

    if (cursorSession) this.cleanup(deps);

    const cDot = doc.getElementById('cDot');
    const cRing = doc.getElementById('cRing');
    const canvas = doc.getElementById('cursorCanvas');
    const ctx = canvas?.getContext('2d');

    if (!cDot || !cRing || !canvas || !ctx) {
      console.warn('[CustomCursor] Required elements not found in DOM');
      return;
    }

    cDot.style.display = 'block';
    cRing.style.display = 'block';

    const state = {
      mouse: { x: win.innerWidth / 2, y: win.innerHeight / 2, rx: win.innerWidth / 2, ry: win.innerHeight / 2 },
      trail: [],
      rafId: 0,
      cleanups: [],
    };

    const onMove = (event) => {
      state.mouse.x = event.clientX;
      state.mouse.y = event.clientY;
      state.trail.push({ x: event.clientX, y: event.clientY, life: 1 });
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
      state.mouse.rx += (state.mouse.x - state.mouse.rx) * 0.15;
      state.mouse.ry += (state.mouse.y - state.mouse.ry) * 0.15;

      cDot.style.left = `${state.mouse.x}px`;
      cDot.style.top = `${state.mouse.y}px`;
      cRing.style.left = `${state.mouse.rx}px`;
      cRing.style.top = `${state.mouse.ry}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = state.trail.length - 1; i >= 0; i -= 1) {
        const point = state.trail[i];
        point.life -= 0.05;
        if (point.life <= 0) {
          state.trail.splice(i, 1);
          continue;
        }

        const alpha = point.life * 0.4;
        const radius = 2.5 * point.life;
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * 5);
        gradient.addColorStop(0, `rgba(0, 255, 204, ${alpha * 0.6})`);
        gradient.addColorStop(1, 'rgba(0, 255, 204, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0, 255, 204, 0.9)';
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      state.rafId = win.requestAnimationFrame(loop);
    };

    state.rafId = win.requestAnimationFrame(loop);
    cursorSession = state;
  },

  cleanup(deps = {}) {
    if (!cursorSession) return;

    const win = getWin(deps);
    win.cancelAnimationFrame(cursorSession.rafId);
    cursorSession.cleanups.forEach((cleanup) => cleanup());
    cursorSession = null;
  },
};
