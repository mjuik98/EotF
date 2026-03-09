import { getWin } from './game_boot_ui_helpers.js';

const LORE_LINES = [
  '모든 기억은 사라지지 않는다.<br>형태만 잔향으로 남는다.',
  '죽음은 마지막이 아니다.<br>다음 메아리의 시작이다.',
  '망각의 심연 속에서도<br>기억은 서로를 부른다.',
  '기억의 문턱은 닫혔지만<br>새로운 길은 열린다.',
];

const state = {
  waveRaf: 0,
  loreInterval: 0,
  loreSwapTimeout: 0,
  loreEnterTimeout: 0,
  navIndex: -1,
  navItems: [],
  navBound: false,
};

export function countUp(el, target, durationMs, suffix = '') {
  if (!el) return;
  let startTs = 0;
  const win = getWin();

  const step = (ts) => {
    if (!startTs) startTs = ts;
    const progress = Math.min((ts - startTs) / durationMs, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${Math.floor(eased * target)}${suffix}`;
    if (progress < 1 && typeof win.requestAnimationFrame === 'function') {
      win.requestAnimationFrame(step);
      return;
    }
    el.textContent = `${target}${suffix}`;
  };

  if (typeof win.requestAnimationFrame === 'function') {
    win.requestAnimationFrame(step);
  } else {
    el.textContent = `${target}${suffix}`;
  }
}

export function startAudioWave(doc) {
  const canvas = doc.getElementById('titleAudioWave');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const centerY = height / 2;
  const points = Array.from({ length: 72 }, () => ({
    amp: Math.random() * 6 + 2,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.016 + 0.009,
  }));
  const win = getWin();

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const t = Date.now() * 0.001;

    ctx.beginPath();
    points.forEach((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = centerY + Math.sin(t * 50 * point.speed + point.phase) * point.amp;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(123,47,255,0)');
    gradient.addColorStop(0.2, 'rgba(123,47,255,0.55)');
    gradient.addColorStop(0.5, 'rgba(0,255,204,0.66)');
    gradient.addColorStop(0.8, 'rgba(123,47,255,0.55)');
    gradient.addColorStop(1, 'rgba(123,47,255,0)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (typeof win.requestAnimationFrame === 'function') {
      state.waveRaf = win.requestAnimationFrame(draw);
    }
  };

  draw();
}

export function stopAudioWave() {
  const win = getWin();
  if (state.waveRaf && typeof win.cancelAnimationFrame === 'function') {
    win.cancelAnimationFrame(state.waveRaf);
  }
  state.waveRaf = 0;
}

export function fireWarpBurst(doc, onDone = () => {}) {
  const canvas = doc.getElementById('titleWarpCanvas');
  if (!canvas) {
    onDone();
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    onDone();
    return;
  }

  const win = getWin();
  const width = canvas.clientWidth || win.innerWidth || 1280;
  const height = canvas.clientHeight || win.innerHeight || 720;
  canvas.width = width;
  canvas.height = height;
  canvas.style.opacity = '1';

  const centerX = width / 2;
  const centerY = height / 2;
  const particles = Array.from({ length: 180 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 14 + 4;
    return {
      x: centerX + (Math.random() - 0.5) * 50,
      y: centerY + (Math.random() - 0.5) * 50,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.9 + 0.1,
      purple: Math.random() < 0.65,
      life: 1,
    };
  });

  let tickCount = 0;
  const tick = () => {
    tickCount += 1;
    ctx.clearRect(0, 0, width, height);
    const progress = Math.min(tickCount / 40, 1);
    ctx.globalCompositeOperation = 'lighter';

    particles.forEach((particle) => {
      const accel = 1 + progress * 3;
      particle.x += particle.vx * accel;
      particle.y += particle.vy * accel;
      particle.life -= 0.024 + progress * 0.04;
      if (particle.life <= 0) return;

      const color = particle.purple
        ? `rgba(123,47,255,${particle.life * particle.alpha})`
        : `rgba(0,255,204,${particle.life * particle.alpha})`;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
    const done = particles.every((particle) => particle.life <= 0) || tickCount >= 70;
    if (!done && typeof win.requestAnimationFrame === 'function') {
      win.requestAnimationFrame(tick);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    canvas.style.opacity = '0';
    onDone();
  };

  if (typeof win.requestAnimationFrame === 'function') {
    win.requestAnimationFrame(tick);
  } else {
    onDone();
  }
}

export function startLoreTicker(doc) {
  const el = doc.getElementById('titleLoreText');
  if (!el) return;

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const renderLoreMarkup = (line) => {
    let order = 0;
    return line.split('<br>').map((segment) => {
      const chars = Array.from(segment).map((char) => {
        if (char === ' ') {
          order += 1;
          return `<span class="title-lore-char title-lore-char--space" style="--char-order:${order};">&nbsp;</span>`;
        }
        order += 1;
        return `<span class="title-lore-char" style="--char-order:${order};">${escapeHtml(char)}</span>`;
      }).join('');
      return `<span class="title-lore-row">${chars}</span>`;
    }).join('');
  };

  const seedDrift = () => {
    el.querySelectorAll('.title-lore-char').forEach((charEl, index) => {
      const spreadX = (Math.random() - 0.5) * 56;
      const spreadY = (Math.random() - 0.5) * 26;
      const rotate = (Math.random() - 0.5) * 36;
      const glow = index % 2 === 0 ? 'rgba(123,47,255,0.44)' : 'rgba(0,255,204,0.28)';
      charEl.style.setProperty('--drift-x', `${spreadX.toFixed(2)}px`);
      charEl.style.setProperty('--drift-y', `${spreadY.toFixed(2)}px`);
      charEl.style.setProperty('--drift-rotate', `${rotate.toFixed(2)}deg`);
      charEl.style.setProperty('--lore-glow', glow);
    });
  };

  const setLoreLine = (line) => {
    el.innerHTML = renderLoreMarkup(line);
    seedDrift();
  };

  setLoreLine(LORE_LINES[0]);
  el.classList.add('is-entering');
  state.loreEnterTimeout = globalThis.setTimeout(() => {
    el.classList.remove('is-entering');
  }, 1100);

  let loreIndex = 0;
  state.loreInterval = globalThis.setInterval(() => {
    loreIndex = (loreIndex + 1) % LORE_LINES.length;
    el.classList.remove('is-entering');
    seedDrift();
    el.classList.add('is-exiting');

    if (state.loreSwapTimeout) globalThis.clearTimeout(state.loreSwapTimeout);
    if (state.loreEnterTimeout) globalThis.clearTimeout(state.loreEnterTimeout);

    state.loreSwapTimeout = globalThis.setTimeout(() => {
      el.classList.remove('is-exiting');
      setLoreLine(LORE_LINES[loreIndex]);
      el.classList.add('is-entering');
      state.loreEnterTimeout = globalThis.setTimeout(() => {
        el.classList.remove('is-entering');
      }, 1100);
    }, 520);
  }, 4200);
}

export function stopLoreTicker() {
  if (state.loreInterval) globalThis.clearInterval(state.loreInterval);
  if (state.loreSwapTimeout) globalThis.clearTimeout(state.loreSwapTimeout);
  if (state.loreEnterTimeout) globalThis.clearTimeout(state.loreEnterTimeout);
  state.loreInterval = 0;
  state.loreSwapTimeout = 0;
  state.loreEnterTimeout = 0;
}

export function setupKeyboardNav(doc) {
  state.navItems = Array.from(doc.querySelectorAll('#mainTitleSubScreen [data-nav]'));
  if (!state.navItems.length) return;

  const cursorEl = doc.getElementById('titleNavCursor');
  const menuPanel = doc.getElementById('titleMenuPanel');

  const updateCursor = (index) => {
    if (!cursorEl || !menuPanel) return;
    if (index < 0) {
      cursorEl.style.opacity = '0';
      return;
    }

    const target = state.navItems[index];
    if (!target) return;
    const panelRect = menuPanel.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    cursorEl.style.opacity = '1';
    cursorEl.style.top = `${targetRect.top - panelRect.top + 4}px`;
    cursorEl.style.height = `${Math.max(18, targetRect.height - 8)}px`;
  };

  const setFocus = (index) => {
    state.navItems.forEach((item, itemIndex) => item.classList.toggle('kb-focus', itemIndex === index));
    state.navIndex = index;
    updateCursor(index);
  };

  const getNextVisibleIndex = (currentIndex, direction) => {
    let nextIndex = currentIndex;
    if (nextIndex < 0) {
      nextIndex = direction > 0 ? -1 : 0;
    }
    for (let i = 0; i < state.navItems.length; i += 1) {
      nextIndex = (nextIndex + direction + state.navItems.length) % state.navItems.length;
      const rect = state.navItems[nextIndex].getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return nextIndex;
      }
    }
    return Math.max(0, currentIndex);
  };

  state.navItems.forEach((item) => item.addEventListener('mouseenter', () => setFocus(-1)));
  if (state.navBound) return;
  state.navBound = true;

  doc.addEventListener('keydown', (event) => {
    const titleScreen = doc.getElementById('titleScreen');
    const mainScreen = doc.getElementById('mainTitleSubScreen');
    if (!titleScreen?.classList.contains('active') || mainScreen?.style.display === 'none') return;

    if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
      event.preventDefault();
      setFocus(getNextVisibleIndex(state.navIndex, 1));
      return;
    }

    if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
      event.preventDefault();
      setFocus(getNextVisibleIndex(state.navIndex, -1));
      return;
    }

    if (event.key === 'Enter' && state.navIndex >= 0) {
      state.navItems[state.navIndex]?.click();
      return;
    }

    if (event.key === 'n' || event.key === 'N') {
      const idx = state.navItems.findIndex((item) => item.id === 'mainStartBtn');
      if (idx >= 0) setFocus(idx);
      return;
    }

    if (event.key === 'c' || event.key === 'C') {
      const continueBtn = doc.getElementById('mainContinueBtn');
      if (!continueBtn || continueBtn.closest('#titleContinueWrap')?.style.display === 'none') return;
      const idx = state.navItems.findIndex((item) => item === continueBtn);
      if (idx >= 0) setFocus(idx);
    }
  });
}

export function teardownTitleFx() {
  stopAudioWave();
  stopLoreTicker();
  state.navIndex = -1;
  state.navItems = [];
  state.navBound = false;
}
