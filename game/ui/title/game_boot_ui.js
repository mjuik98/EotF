function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin() {
  return globalThis.window || globalThis;
}

const LORE_LINES = [
  '모든 기억은 사라지지 않는다.<br>형태만 잔향으로 남는다.',
  '죽음은 마지막이 아니다.<br>다음 메아리의 시작이다.',
  '망각의 심연 속에서도<br>기억은 서로를 부른다.',
  '기억을 붙든 자만이<br>새로운 길을 열 수 있다.',
];

let waveRaf = 0;
let loreInterval = 0;
let loreSwapTimeout = 0;
let loreEnterTimeout = 0;
let navIndex = -1;
let navItems = [];
let navBound = false;

function _countUp(el, target, durationMs, suffix = '') {
  if (!el) return;
  let startTs = 0;
  const win = _getWin();

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

function _startAudioWave(doc) {
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
  const win = _getWin();

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
      waveRaf = win.requestAnimationFrame(draw);
    }
  };

  draw();
}

function _stopAudioWave() {
  const win = _getWin();
  if (waveRaf && typeof win.cancelAnimationFrame === 'function') {
    win.cancelAnimationFrame(waveRaf);
  }
  waveRaf = 0;
}

function _fireWarpBurst(doc, onDone = () => { }) {
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

  const win = _getWin();
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

function _startLoreTicker(doc) {
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
  loreEnterTimeout = globalThis.setTimeout(() => {
    el.classList.remove('is-entering');
  }, 1100);

  let loreIndex = 0;
  loreInterval = globalThis.setInterval(() => {
    loreIndex = (loreIndex + 1) % LORE_LINES.length;
    el.classList.remove('is-entering');
    seedDrift();
    el.classList.add('is-exiting');

    if (loreSwapTimeout) globalThis.clearTimeout(loreSwapTimeout);
    if (loreEnterTimeout) globalThis.clearTimeout(loreEnterTimeout);

    loreSwapTimeout = globalThis.setTimeout(() => {
      el.classList.remove('is-exiting');
      setLoreLine(LORE_LINES[loreIndex]);
      el.classList.add('is-entering');
      loreEnterTimeout = globalThis.setTimeout(() => {
        el.classList.remove('is-entering');
      }, 1100);
    }, 520);
  }, 4200);
}

function _stopLoreTicker() {
  if (loreInterval) globalThis.clearInterval(loreInterval);
  if (loreSwapTimeout) globalThis.clearTimeout(loreSwapTimeout);
  if (loreEnterTimeout) globalThis.clearTimeout(loreEnterTimeout);
  loreInterval = 0;
  loreSwapTimeout = 0;
  loreEnterTimeout = 0;
}

function _setText(doc, id, value) {
  const el = doc.getElementById(id);
  if (el) el.textContent = value;
}

function _populateSaveTooltip(doc, saveSystem, gs) {
  try {
    const saveLoaded = saveSystem?.loadRun?.({ gs });
    if (!saveLoaded || !gs?.player) return;

    const player = gs.player;
    const classNames = {
      swordsman: '검사',
      mage: '마법사',
      rogue: '도적',
      paladin: '성기사',
    };

    const className = classNames[player.class] || player.class || '-';
    _setText(doc, 'sttClass', className);
    _setText(doc, 'sttFloor', `${gs.currentFloor || 1}층 · ${gs.currentRegion || 0}구역`);
    _setText(doc, 'sttAscension', `A${gs.meta?.runConfig?.ascension ?? 0}`);
    _setText(doc, 'sttHp', `${player.hp ?? '-'} / ${player.maxHp ?? '-'}`);
    _setText(doc, 'sttGold', `${player.gold ?? 0}`);
    _setText(doc, 'titleContinueMeta', `${gs.currentFloor || 1}층 · ${className} · A${gs.meta?.runConfig?.ascension ?? 0}`);

    const pillsEl = doc.getElementById('sttDeckPills');
    if (pillsEl) {
      const deckSize = Array.isArray(player.deck) ? player.deck.length : 0;
      pillsEl.innerHTML = [
        `<span class="title-stt-pill title-stt-pill--attack">덱 ${deckSize}장</span>`,
        `<span class="title-stt-pill title-stt-pill--skill">손패 ${player.hand?.length || 0}장</span>`,
      ].join('');
    }

    const relicsEl = doc.getElementById('sttRelics');
    if (relicsEl) {
      const items = Array.isArray(player.items) ? player.items.slice(0, 6) : [];
      relicsEl.innerHTML = items.map((item) => {
        const title = item?.name || item?.id || '';
        const icon = item?.icon || '◆';
        return `<span class="title-stt-relic" title="${title}">${icon}</span>`;
      }).join('');
    }
  } catch (error) {
    console.warn('[GameBootUI] Save tooltip populate failed:', error);
  }
}

function _setupKeyboardNav(doc) {
  navItems = Array.from(doc.querySelectorAll('#mainTitleSubScreen [data-nav]'));
  if (!navItems.length) return;

  const cursorEl = doc.getElementById('titleNavCursor');
  const menuPanel = doc.getElementById('titleMenuPanel');

  const updateCursor = (index) => {
    if (!cursorEl || !menuPanel) return;
    if (index < 0) {
      cursorEl.style.opacity = '0';
      return;
    }

    const target = navItems[index];
    if (!target) return;
    const panelRect = menuPanel.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    cursorEl.style.opacity = '1';
    cursorEl.style.top = `${targetRect.top - panelRect.top + 4}px`;
    cursorEl.style.height = `${Math.max(18, targetRect.height - 8)}px`;
  };

  const setFocus = (index) => {
    navItems.forEach((item, itemIndex) => item.classList.toggle('kb-focus', itemIndex === index));
    navIndex = index;
    updateCursor(index);
  };

  const getNextVisibleIndex = (currentIndex, direction) => {
    let nextIndex = currentIndex;
    if (nextIndex < 0) {
      nextIndex = direction > 0 ? -1 : 0;
    }
    for (let i = 0; i < navItems.length; i++) {
      nextIndex = (nextIndex + direction + navItems.length) % navItems.length;
      const rect = navItems[nextIndex].getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return nextIndex;
      }
    }
    return Math.max(0, currentIndex);
  };

  navItems.forEach((item) => item.addEventListener('mouseenter', () => setFocus(-1)));

  if (navBound) return;
  navBound = true;

  doc.addEventListener('keydown', (event) => {
    const titleScreen = doc.getElementById('titleScreen');
    const mainScreen = doc.getElementById('mainTitleSubScreen');
    if (!titleScreen?.classList.contains('active') || mainScreen?.style.display === 'none') return;

    if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
      event.preventDefault();
      setFocus(getNextVisibleIndex(navIndex, 1));
      return;
    }

    if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
      event.preventDefault();
      setFocus(getNextVisibleIndex(navIndex, -1));
      return;
    }

    if (event.key === 'Enter' && navIndex >= 0) {
      navItems[navIndex]?.click();
      return;
    }

    if (event.key === 'n' || event.key === 'N') {
      const idx = navItems.findIndex((item) => item.id === 'mainStartBtn');
      if (idx >= 0) setFocus(idx);
      return;
    }

    if (event.key === 'c' || event.key === 'C') {
      const continueBtn = doc.getElementById('mainContinueBtn');
      if (!continueBtn || continueBtn.closest('#titleContinueWrap')?.style.display === 'none') return;
      const idx = navItems.findIndex((item) => item === continueBtn);
      if (idx >= 0) setFocus(idx);
    }
  });
}

export const GameBootUI = {
  bootGame(deps = {}) {
    const gs = deps.gs;
    const doc = _getDoc(deps);
    const audioEngine = deps.audioEngine;
    const runRules = deps.runRules;
    const saveSystem = deps.saveSystem;

    try {
      doc.addEventListener('click', () => {
        try {
          audioEngine?.init?.();
          audioEngine?.resume?.();
        } catch {
          // Ignore gesture-locked audio errors.
        }
      }, { once: false });

      try {
        saveSystem?.loadMeta?.(deps.saveSystemDeps || {});
      } catch (error) {
        console.error('[GameBootUI] loadMeta error:', error);
      }

      try {
        runRules?.ensureMeta?.(gs?.meta);
      } catch (error) {
        console.error('[GameBootUI] ensureMeta error:', error);
      }

      globalThis.setTimeout(() => {
        deps.initTitleCanvas?.();
        if (typeof globalThis.resizeTitleCanvas === 'function') {
          globalThis.resizeTitleCanvas();
        }
      }, 100);

      try {
        deps.updateUI?.();
      } catch (error) {
        console.warn('[GameBootUI] updateUI error:', error);
      }
      deps.refreshRunModePanel?.();

      _startAudioWave(doc);
      _startLoreTicker(doc);
      _setupKeyboardNav(doc);

      const runCount = Math.max(0, (gs?.meta?.runCount ?? 1) - 1);
      if (runCount > 0) {
        const statsBlock = doc.getElementById('titleStatsBlock');
        if (statsBlock) statsBlock.style.display = 'block';
        globalThis.setTimeout(() => {
          _countUp(doc.getElementById('titleTotalRuns'), runCount, 1100);
          _countUp(doc.getElementById('titleTotalKills'), gs?.meta?.totalKills ?? 0, 1250);
          _countUp(doc.getElementById('titleBestChain'), gs?.meta?.bestChain ?? 0, 1350);
        }, 350);
      }

      const hasSave = saveSystem?.hasSave?.() ?? false;
      const continueWrap = doc.getElementById('titleContinueWrap');
      const menuDivider = doc.getElementById('titleMenuDivider');
      if (continueWrap) continueWrap.style.display = hasSave ? 'block' : 'none';
      if (menuDivider) menuDivider.style.display = hasSave ? 'block' : 'none';
      if (hasSave) {
        _populateSaveTooltip(doc, saveSystem, gs);
      }
    } catch (error) {
      console.error('[GameBootUI] boot error:', error);
    }
  },

  fireWarpTransition(doc, onComplete = () => { }) {
    _fireWarpBurst(doc, onComplete);
  },

  teardown() {
    _stopAudioWave();
    _stopLoreTicker();
  },

  bootWhenReady(deps = {}) {
    const doc = _getDoc(deps);
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', () => this.bootGame(deps));
      return;
    }
    this.bootGame(deps);
  },
};
