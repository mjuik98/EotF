const LORE_LINES = [
  '모든 기억은 사라지지 않는다.<br>형태만 잔향으로 남는다.',
  '죽음은 마지막이 아니다.<br>다음 메아리의 시작이다.',
  '망각의 심연 속에서도<br>기억은 서로를 부른다.',
  '기억의 문턱은 닫혔지만<br>새로운 길은 열린다.',
];

const state = {
  loreInterval: 0,
  loreSwapTimeout: 0,
  loreEnterTimeout: 0,
};

function getTimerHost(deps = {}) {
  if (deps.timerHost) return deps.timerHost;
  if (deps.win) return deps.win;
  return null;
}

function bindTimer(fn, context) {
  if (typeof fn !== 'function') return fn;
  if (typeof fn.bind !== 'function') return fn;
  return fn.bind(context);
}

function getTimerApi(deps = {}) {
  const timerHost = getTimerHost(deps);
  const timerContext = deps.timerContext || timerHost;
  return {
    setInterval: bindTimer(
      deps.setInterval || timerHost?.setInterval || setInterval,
      timerContext,
    ),
    clearInterval: bindTimer(
      deps.clearInterval || timerHost?.clearInterval || clearInterval,
      timerContext,
    ),
    setTimeout: bindTimer(
      deps.setTimeout || timerHost?.setTimeout || setTimeout,
      timerContext,
    ),
    clearTimeout: bindTimer(
      deps.clearTimeout || timerHost?.clearTimeout || clearTimeout,
      timerContext,
    ),
  };
}

function getRandom(deps = {}) {
  return deps.random || Math.random;
}

export function startLoreTicker(doc, deps = {}) {
  const el = doc.getElementById('titleLoreText');
  if (!el) return;
  const timers = getTimerApi(deps);
  const random = getRandom(deps);

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
      const spreadX = (random() - 0.5) * 56;
      const spreadY = (random() - 0.5) * 26;
      const rotate = (random() - 0.5) * 36;
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
  state.loreEnterTimeout = timers.setTimeout(() => {
    el.classList.remove('is-entering');
  }, 1100);

  let loreIndex = 0;
  state.loreInterval = timers.setInterval(() => {
    loreIndex = (loreIndex + 1) % LORE_LINES.length;
    el.classList.remove('is-entering');
    seedDrift();
    el.classList.add('is-exiting');

    if (state.loreSwapTimeout) timers.clearTimeout(state.loreSwapTimeout);
    if (state.loreEnterTimeout) timers.clearTimeout(state.loreEnterTimeout);

    state.loreSwapTimeout = timers.setTimeout(() => {
      el.classList.remove('is-exiting');
      setLoreLine(LORE_LINES[loreIndex]);
      el.classList.add('is-entering');
      state.loreEnterTimeout = timers.setTimeout(() => {
        el.classList.remove('is-entering');
      }, 1100);
    }, 520);
  }, 4200);
}

export function stopLoreTicker(deps = {}) {
  const timers = getTimerApi(deps);
  if (state.loreInterval) timers.clearInterval(state.loreInterval);
  if (state.loreSwapTimeout) timers.clearTimeout(state.loreSwapTimeout);
  if (state.loreEnterTimeout) timers.clearTimeout(state.loreEnterTimeout);
  state.loreInterval = 0;
  state.loreSwapTimeout = 0;
  state.loreEnterTimeout = 0;
}
