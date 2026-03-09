const RANKS = [
  { min: 200, glyph: 'S', color: '#f0d472', glow: 'rgba(240,212,114,.55)', title: '전설의 정복자', label: 'LEGENDARY' },
  { min: 120, glyph: 'A', color: '#c084fc', glow: 'rgba(192,132,252,.5)', title: '숙련된 공명자', label: 'MASTER' },
  { min: 60, glyph: 'B', color: '#4af3cc', glow: 'rgba(74,243,204,.45)', title: '루프의 항해자', label: 'EXPERT' },
  { min: 0, glyph: 'C', color: '#9b8ab8', glow: 'rgba(155,138,184,.35)', title: '생존한 잔향', label: 'SURVIVOR' },
];

const REGIONS = ['rgba(74,243,204,', 'rgba(155,127,232,', 'rgba(74,120,243,', 'rgba(232,121,200,', 'rgba(240,212,114,'];

export const ROOT_ID = 'endingScreen';
export const STYLE_ID = 'ending-screen-styles';
export const FRAGMENT_CHOICES = [
  { icon: '⚡', name: 'Echo 강화', desc: '다음 런 시작 시 Echo +30', effect: 'echo_boost' },
  { icon: '🛡️', name: '회복력', desc: '최대 체력 +10', effect: 'resilience' },
  { icon: '🍀', name: '행운', desc: '시작 골드 +25', effect: 'fortune' },
];

export const docOf = (deps) => deps?.doc || document;
export const winOf = (deps) => deps?.win || window;
export const rafOf = (deps) => deps?.requestAnimationFrame?.bind(deps) || winOf(deps).requestAnimationFrame.bind(winOf(deps));
export const cafOf = (deps) => deps?.cancelAnimationFrame?.bind(deps) || winOf(deps).cancelAnimationFrame.bind(winOf(deps));

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const fmt = (value) => Math.max(0, Math.floor(num(value, 0))).toLocaleString('ko-KR');
const tfmt = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(num(ms, 0) / 1000));
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
};
const insLv = (gs, id) => {
  const value = gs?.meta?.inscriptions?.[id];
  return typeof value === 'boolean' ? (value ? 1 : 0) : Math.max(0, Math.floor(num(value, 0)));
};
const rankOf = (score) => RANKS.find((rank) => score >= rank.min) || RANKS[RANKS.length - 1];

export function buildEndingPayload(gs, data) {
  const storyCount = Array.isArray(gs?.meta?.storyPieces) ? gs.meta.storyPieces.length : 0;
  const storyTotal = Array.isArray(data?.storyFragments) ? data.storyFragments.length : 10;
  const blocked = [gs?.stats?.damageBlocked, gs?.stats?.shieldGained, gs?.stats?.blockGained, gs?.stats?.totalBlocked, gs?.stats?.damageTaken]
    .find((value) => Number.isFinite(Number(value)));
  const score = (num(gs?.player?.kills) * 3) + (num(gs?.stats?.maxChain) * 5) + Math.floor(num(gs?.stats?.damageDealt) / 100);
  const rank = rankOf(score);
  const regions = [];
  const defs = Array.isArray(data?.regions) ? data.regions : [];

  for (let i = 0; i <= Math.max(0, Math.floor(num(gs?.currentRegion))); i += 1) {
    const route = gs?.regionRoute?.[String(i)];
    const id = Number.isFinite(Number(route)) ? Number(route) : i;
    const def = defs.find((entry) => Number(entry?.id) === id) || defs[i] || {};
    regions.push({
      name: String(def.name || `지역 ${i + 1}`),
      icon: String(def.icon || def.emoji || ['🌲', '⛰', '🌀', '🕯', '💀'][i] || '✦'),
      accent: String(def.accentBase || REGIONS[i] || 'rgba(155,127,232,'),
      time: tfmt(gs?.stats?.regionClearTimes?.[i]),
      boss: i === Math.max(0, Math.floor(num(gs?.currentRegion))),
    });
  }

  const cards = data?.cards || {};
  const deck = (Array.isArray(gs?.player?.deck) ? gs.player.deck : []).slice(0, 14).map((id, index) => {
    const card = cards[id] || {};
    const rarity = String(card.rarity || 'common');
    return {
      id: String(id),
      icon: String(card.icon || card.emoji || ['⚡', '🕯', '🗡', '🌀', '💧', '☄'][index % 6]),
      title: String(card.name || id),
      cls: rarity === 'legendary' ? 'l' : ((rarity === 'epic' || rarity === 'rare' || rarity === 'uncommon') ? 'r' : ''),
    };
  });
  const inscriptions = Object.keys(gs?.meta?.inscriptions || {}).map((id) => ({
    id,
    level: insLv(gs, id),
    icon: String(data?.inscriptions?.[id]?.icon || '✦'),
    name: String(data?.inscriptions?.[id]?.name || id),
  })).filter((entry) => entry.level > 0);

  return {
    score,
    rank,
    title: '메아리의 근원 정복',
    subtitle: '공명하는 승리자.',
    eyebrow: '엔딩 기록 · 공명하는 승리자',
    quote: '"잔향자는 에코의 핵심을 돌파했다.\n하지만 루프는 아직 끝나지 않았다.\n진실을 알기에는 아직 이르다."',
    storyText: `${storyCount}/${storyTotal}`,
    clear: tfmt(gs?.stats?.clearTimeMs),
    stats: [
      { id: 'sv0', icon: '⚔', label: '처치 수', value: num(gs?.player?.kills), tip: `처치 x 3 = ${fmt(num(gs?.player?.kills) * 3)}pt` },
      { id: 'sv1', icon: '⚡', label: '최고 체인', value: num(gs?.stats?.maxChain), tip: `체인 x 5 = ${fmt(num(gs?.stats?.maxChain) * 5)}pt` },
      { id: 'sv2', icon: '✹', label: '총 피해', value: num(gs?.stats?.damageDealt), tip: `피해 / 100 = ${fmt(Math.floor(num(gs?.stats?.damageDealt) / 100))}pt` },
      { id: 'sv3', icon: '🛡', label: '총 방어', value: num(blocked), tip: '최종 방어 누적량' },
      { id: 'sv4', icon: '🃏', label: '사용 카드', value: num(gs?.stats?.cardsPlayed), tip: '이번 런 카드 사용 수' },
      { id: 'sv5', icon: '🜂', label: '스토리', value: `${storyCount}/${storyTotal}`, tip: '스토리 조각 수집 현황', static: true },
    ],
    chips: [
      !num(gs?.stats?.deathCount) ? '노 데스' : '',
      storyCount >= storyTotal ? '풀 스토리' : '',
      `${Math.max(1, Math.floor(num(gs?.meta?.runCount, 1)))}회차`,
    ].filter(Boolean),
    regions,
    deck,
    inscriptions,
  };
}

export function decorateEndingPayloadForOutcome(payload, outcome = 'victory') {
  if (!payload || outcome === 'victory') return payload;

  if (outcome === 'abandon') {
    payload.title = '멈춘 메아리';
    payload.subtitle = '스스로 닫힌 귀환';
    payload.eyebrow = '포기한 런의 기록';
    payload.quote = '"끝까지 닿지 못했더라도\n이 선택 또한 하나의 흔적이다.\n멈춘 자리의 메아리가 다음 길을 비춘다."';
    payload.chips = Array.from(new Set(['런 포기', ...payload.chips]));
    return payload;
  }

  payload.title = '무너진 메아리';
  payload.subtitle = '부서진 귀환';
  payload.eyebrow = '패배한 런의 기록';
  payload.quote = '"메아리는 꺾였지만\n기억은 여기서 끝나지 않는다.\n남은 잔향이 다시 길을 만든다."';
  payload.chips = Array.from(new Set(['패배', ...payload.chips]));
  return payload;
}

export function buildEndingScreenDOM(doc, payload) {
  const root = doc.createElement('div');
  root.id = ROOT_ID;
  root.innerHTML = `
    <div id="endingCurtain"></div>
    <canvas id="endingCvA"></canvas><canvas id="endingCvS"></canvas><canvas id="endingCvW"></canvas><canvas id="endingCvT"></canvas>
    <div class="vignette"></div><div class="noise"></div><div id="pxLayer"></div>
    <div id="stage">
      <div class="eyebrow sc" id="s0">${payload.eyebrow}</div>
      <div class="title-row sc" id="s1">
        <div class="main-title">${payload.title}<span class="title-sub">${payload.subtitle}</span></div>
        <div class="sigil-wrap" id="sigilWrap">
          <div class="sigil" id="sigilEl">
            <svg viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="34" cy="34" r="31" stroke-width=".6" id="sr1"></circle>
              <circle cx="34" cy="34" r="23" stroke-width=".4" stroke-dasharray="3.5 2.8" id="sr2"></circle>
              <circle cx="34" cy="34" r="14" stroke-width=".45" stroke-dasharray="2 3.5" id="sr3"></circle>
              <polygon points="34,7 60,52 8,52" stroke-width=".5" fill="none" id="stri" opacity=".4"></polygon>
              <circle cx="34" cy="34" r="2.8" id="sdot"></circle>
            </svg><div class="sigil-glyph" id="sg"></div>
          </div><div class="sigil-lore" id="sn"></div><div class="sigil-score" id="ss"></div>
        </div>
      </div>
      <div class="quote-wrap sc" id="s2"><div class="quote" id="quote"><span class="quote-cursor" id="qcursor"></span></div></div>
      <div class="rdiv sc" id="s3"><span>✦ ✧ ✦ ✧ ✦ ✧ ✦</span></div>
      <div class="stats-row sc" id="s4">${payload.stats.map((stat) => `<div class="sorb"><div class="s-ic">${stat.icon}</div><div class="s-v" id="${stat.id}">${stat.static ? stat.value : '0'}</div><div class="s-l">${stat.label}</div><div class="tip">${stat.tip}</div></div>`).join('')}</div>
      <div class="tl-wrap sc" id="s5"><div class="blk-label">클리어 여정</div><div class="tl-track"><div class="tl-bg-line"></div><div class="tl-draw-line" id="tlLine"></div><div class="tl-nodes" id="tlNodes"></div></div></div>
      <div class="btm-row sc" id="s6">
        <div class="deck-col"><div class="blk-label">이번 덱</div><div class="deck-grid" id="deckGrid"></div></div>
        <div class="info-col">
          <div><div class="blk-label">클리어 기록</div><div class="clr-v" id="clrT">00:00</div><div class="clr-l">클리어 시간</div><div class="chip-row" id="chipRow"></div></div>
          <div><div class="blk-label">각인</div><div class="pills" id="pillRow"></div></div>
        </div>
      </div>
      <div class="btn-row sc" id="s7"><button class="btn-p" id="btnR">다시 잔향 속으로</button><button class="btn-g" id="btnCodex">도감 보기</button></div>
      <div class="fnote sc" id="s8">각인 없이 클리어하면 다른 결말이 기다립니다.<br><span class="h">무각인 클리어는 숨겨진 결말 조건입니다.</span></div>
    </div>`;
  root.innerHTML = root.innerHTML.replace(/<button class="btn-g" id="btnCodex">[\s\S]*?<\/button>/, '');
  return root;
}

export function applyEndingRank(doc, rank, score) {
  const glyph = doc.getElementById('sg');
  const name = doc.getElementById('sn');
  const summary = doc.getElementById('ss');
  if (!glyph || !name || !summary) return;

  glyph.textContent = rank.glyph;
  glyph.style.color = rank.color;
  glyph.style.textShadow = `0 0 18px ${rank.glow},0 0 36px ${rank.glow}`;
  name.textContent = rank.title;
  name.style.color = rank.color;
  summary.textContent = `${rank.label} · ${fmt(score)}pt`;

  ['sr1', 'sr2', 'sr3'].forEach((id) => {
    const element = doc.getElementById(id);
    if (!element) return;
    element.setAttribute('stroke', rank.color);
    element.setAttribute('stroke-opacity', '.55');
  });

  const triangle = doc.getElementById('stri');
  const dot = doc.getElementById('sdot');
  const sigil = doc.getElementById('sigilEl');
  if (triangle) {
    triangle.setAttribute('stroke', rank.color);
    triangle.setAttribute('stroke-opacity', '.35');
  }
  if (dot) dot.setAttribute('fill', rank.color);
  if (sigil) sigil.style.filter = `drop-shadow(0 0 8px ${rank.glow})`;
}

export function populateEndingMeta(doc, payload, session, deps = {}) {
  const tl = doc.getElementById('tlNodes');
  const deckGrid = doc.getElementById('deckGrid');
  const chipRow = doc.getElementById('chipRow');
  const pillRow = doc.getElementById('pillRow');

  payload.regions.forEach((region, index) => {
    const node = doc.createElement('div');
    node.className = `tl-node${region.boss ? ' boss' : ''}`;
    node.style.cssText = `opacity:0;transition:opacity .4s ease ${index * 0.1}s,transform .4s ease ${index * 0.1}s;transform:translateY(8px);`;
    node.innerHTML = `<div class="tl-dot" style="border-color:${region.accent}.45);box-shadow:0 0 10px ${region.accent}.18);">${region.icon}</div><div class="tl-name">${region.name}</div><div class="tl-time">${region.time}</div>`;
    tl?.appendChild(node);
    session.timers.push(winOf(deps).setTimeout(() => {
      node.style.opacity = '1';
      node.style.transform = 'translateY(0)';
    }, 300 + (index * 100)));
  });

  payload.deck.forEach((card, index) => {
    const element = doc.createElement('div');
    element.className = `mcard ${card.cls}`.trim();
    element.textContent = card.icon;
    element.title = card.title;
    element.style.animation = `cardIn .35s ease ${index * 0.05}s forwards`;
    deckGrid?.appendChild(element);
  });

  payload.chips.forEach((text) => {
    const element = doc.createElement('div');
    element.className = 'chip';
    element.textContent = text;
    chipRow?.appendChild(element);
  });

  payload.inscriptions.forEach((entry) => {
    const element = doc.createElement('div');
    element.className = 'pill';
    element.textContent = `${entry.icon} ${entry.name}${entry.level > 1 ? ` Lv.${entry.level}` : ''}`;
    pillRow?.appendChild(element);
  });
}

export function appendEndingFragmentChoices(doc, deps, outcome, session, cleanup) {
  const gs = deps?.gs;
  if (!gs?.meta || outcome === 'victory') return;

  const shardCount = Math.max(0, Math.floor(num(gs.meta.echoFragments, 0)));
  const pick = deps.selectFragment || globalThis.GAME?.API?.selectFragment || globalThis.selectFragment;
  if (!shardCount || typeof pick !== 'function') return;

  const anchor = doc.getElementById('s7');
  if (!anchor?.parentNode) return;

  const wrap = doc.createElement('div');
  wrap.id = 's6b';
  wrap.className = 'frag-wrap sc';

  const title = doc.createElement('div');
  title.className = 'frag-title';
  title.textContent = `메아리 조각 ${shardCount}개 - 각인을 선택하라`;

  const grid = doc.createElement('div');
  grid.className = 'frag-grid';

  FRAGMENT_CHOICES.forEach((entry) => {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'frag-card';
    button.innerHTML = `<div class="frag-icon">${entry.icon}</div><div class="frag-name">${entry.name}</div><div class="frag-desc">${entry.desc}</div>`;

    const onPick = () => {
      if (button.disabled) return;
      grid.querySelectorAll('.frag-card').forEach((element) => {
        element.disabled = true;
      });
      deps.audioEngine?.playClick?.();
      pick(entry.effect);
      session.timers.push(winOf(deps).setTimeout(() => cleanup({ doc }), 420));
    };

    button.addEventListener('click', onPick);
    session.cleanups.push(() => button.removeEventListener('click', onPick));
    grid.appendChild(button);
  });

  wrap.append(title, grid);
  anchor.parentNode.insertBefore(wrap, anchor);
}

export function ensureEndingScreenStyle(doc) {
  if (!doc?.head || doc.getElementById(STYLE_ID)) return;
  const link = doc.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = '/css/ending_screen.css';
  doc.head.appendChild(link);
}

export function findRankIndexByGlyph(glyph) {
  return RANKS.findIndex((rank) => rank.glyph === glyph);
}

export function getEndingRanks() {
  return RANKS;
}
