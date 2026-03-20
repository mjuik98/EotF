import { ENDING_RUNES } from './ending_screen_fx_model.js';

export function bindEndingFxViewport(win, canvases, session) {
  const resize = () => canvases.forEach((canvas) => {
    if (!canvas) return;
    canvas.width = win.innerWidth;
    canvas.height = win.innerHeight;
  });
  resize();
  win.addEventListener('resize', resize);
  session.cleanups.push(() => win.removeEventListener('resize', resize));
}

export function bindEndingFxMouse(doc, win, session) {
  const mouse = {
    x: win.innerWidth / 2,
    y: win.innerHeight / 2,
    px: 0,
    py: 0,
  };
  const onMouseMove = (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.px = ((event.clientX / win.innerWidth) - 0.5) * 2;
    mouse.py = ((event.clientY / win.innerHeight) - 0.5) * 2;
  };
  doc.addEventListener('mousemove', onMouseMove);
  session.cleanups.push(() => doc.removeEventListener('mousemove', onMouseMove));
  return mouse;
}

export function mountEndingFxRunes(doc, random = Math.random) {
  for (let i = 0; i < 24; i += 1) {
    const el = doc.createElement('div');
    el.className = 'rune-f';
    el.textContent = ENDING_RUNES[Math.floor(random() * ENDING_RUNES.length)];
    el.style.left = `${4 + (random() * 92)}%`;
    el.style.top = `${4 + (random() * 92)}%`;
    el.style.fontSize = `${11 + (random() * 24)}px`;
    el.style.animationDuration = `${14 + (random() * 22)}s`;
    el.style.animationDelay = `${-random() * 18}s`;
    doc.getElementById('pxLayer')?.appendChild(el);
  }
}

export function startEndingFxSpawner(win, wisps, session, createWisp) {
  const spawn = () => wisps.push(createWisp(win));
  const interval = win.setInterval(spawn, 105);
  session.cleanups.push(() => win.clearInterval(interval));
}
