const STYLE_ID = 'ending-screen-styles';
const ROOT_ID = 'endingScreen';
const RANKS = [
  { min: 200, glyph: 'S', color: '#f0d472', glow: 'rgba(240,212,114,.55)', title: '전설의 정복자', label: 'LEGENDARY' },
  { min: 120, glyph: 'A', color: '#c084fc', glow: 'rgba(192,132,252,.5)', title: '숙련된 공명자', label: 'MASTER' },
  { min: 60, glyph: 'B', color: '#4af3cc', glow: 'rgba(74,243,204,.45)', title: '루프의 항해자', label: 'EXPERT' },
  { min: 0, glyph: 'C', color: '#9b8ab8', glow: 'rgba(155,138,184,.35)', title: '생존한 잔향', label: 'SURVIVOR' },
];
const REGIONS = ['rgba(74,243,204,', 'rgba(155,127,232,', 'rgba(74,120,243,', 'rgba(232,121,200,', 'rgba(240,212,114,'];
const RUNES = '✦✧✶✷✹✺☽☾⌘⟡✴✵';
const WCOLORS = ['rgba(155,127,232,', 'rgba(74,243,204,', 'rgba(232,121,200,', 'rgba(240,208,128,', 'rgba(236,232,255,'];
let _session = null;

const docOf = (d) => d?.doc || document;
const winOf = (d) => d?.win || window;
const rafOf = (d) => d?.requestAnimationFrame?.bind(d) || winOf(d).requestAnimationFrame.bind(winOf(d));
const cafOf = (d) => d?.cancelAnimationFrame?.bind(d) || winOf(d).cancelAnimationFrame.bind(winOf(d));
const num = (v, f = 0) => (Number.isFinite(Number(v)) ? Number(v) : f);
const fmt = (v) => Math.max(0, Math.floor(num(v, 0))).toLocaleString('ko-KR');
const tfmt = (ms) => {
  const s = Math.max(0, Math.floor(num(ms, 0) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const insLv = (gs, id) => {
  const v = gs?.meta?.inscriptions?.[id];
  return typeof v === 'boolean' ? (v ? 1 : 0) : Math.max(0, Math.floor(num(v, 0)));
};
const rankOf = (score) => RANKS.find((r) => score >= r.min) || RANKS[RANKS.length - 1];
const FRAGMENT_CHOICES = [
  { icon: '⚡', name: 'Echo 강화', desc: '다음 런 시작 시 Echo +30', effect: 'echo_boost' },
  { icon: '🛡️', name: '회복력', desc: '최대 체력 +10', effect: 'resilience' },
  { icon: '🍀', name: '행운', desc: '시작 골드 +25', effect: 'fortune' },
];

function ensureStyle(doc) {
  if (!doc?.head || doc.getElementById(STYLE_ID)) return;
  const link = doc.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = '/css/ending_screen.css';
  doc.head.appendChild(link);
}

function payloadOf(gs, data) {
  const storyCount = Array.isArray(gs?.meta?.storyPieces) ? gs.meta.storyPieces.length : 0;
  const storyTotal = Array.isArray(data?.storyFragments) ? data.storyFragments.length : 10;
  const blocked = [gs?.stats?.damageBlocked, gs?.stats?.shieldGained, gs?.stats?.blockGained, gs?.stats?.totalBlocked, gs?.stats?.damageTaken]
    .find((v) => Number.isFinite(Number(v)));
  const score = (num(gs?.player?.kills) * 3) + (num(gs?.stats?.maxChain) * 5) + Math.floor(num(gs?.stats?.damageDealt) / 100);
  const rank = rankOf(score);
  const regions = [];
  const defs = Array.isArray(data?.regions) ? data.regions : [];
  for (let i = 0; i <= Math.max(0, Math.floor(num(gs?.currentRegion))); i += 1) {
    const route = gs?.regionRoute?.[String(i)];
    const id = Number.isFinite(Number(route)) ? Number(route) : i;
    const def = defs.find((x) => Number(x?.id) === id) || defs[i] || {};
    regions.push({
      name: String(def.name || `지역 ${i + 1}`),
      icon: String(def.icon || def.emoji || ['🌲', '⛰', '🌀', '🕯', '💀'][i] || '✦'),
      accent: String(def.accentBase || REGIONS[i] || 'rgba(155,127,232,'),
      time: tfmt(gs?.stats?.regionClearTimes?.[i]),
      boss: i === Math.max(0, Math.floor(num(gs?.currentRegion))),
    });
  }
  const cards = data?.cards || {};
  const deck = (Array.isArray(gs?.player?.deck) ? gs.player.deck : []).slice(0, 14).map((id, i) => {
    const c = cards[id] || {};
    const r = String(c.rarity || 'common');
    return {
      id: String(id),
      icon: String(c.icon || c.emoji || ['⚡', '🕯', '🗡', '🌀', '💧', '☄'][i % 6]),
      title: String(c.name || id),
      cls: r === 'legendary' ? 'l' : ((r === 'epic' || r === 'rare' || r === 'uncommon') ? 'r' : ''),
    };
  });
  const inscriptions = Object.keys(gs?.meta?.inscriptions || {}).map((id) => ({
    id,
    level: insLv(gs, id),
    icon: String(data?.inscriptions?.[id]?.icon || '✦'),
    name: String(data?.inscriptions?.[id]?.name || id),
  })).filter((x) => x.level > 0);
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

function decoratePayloadForOutcome(payload, outcome = 'victory') {
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

function showOutcomeScreen(outcome = 'victory', deps = {}) {
  const doc = docOf(deps);
  const gs = deps?.gs;
  const data = deps?.data;
  if (!doc?.body || !gs?.meta || !gs?.player || !gs?.stats) return false;

  EndingScreenUI.cleanup({ doc });
  ensureStyle(doc);
  const p = decoratePayloadForOutcome(payloadOf(gs, data), outcome);
  const root = buildDOM(doc, p);
  doc.body.appendChild(root);
  _session = { cleanups: [], timers: [], payload: p };
  buildMeta(doc, p);
  buildFragmentChoices(doc, deps, outcome);
  applyRank(doc, p.rank, p.score);
  const { wisps } = initFx(doc, deps, p);
  const sigil = doc.getElementById('sigilWrap');
  let ri = RANKS.findIndex((r) => r.glyph === p.rank.glyph);
  const onSigil = () => {
    ri = (ri + 1) % RANKS.length;
    applyRank(doc, RANKS[ri], p.score);
    const rect = sigil?.getBoundingClientRect?.();
    if (rect) burst(wisps, rect.left + (rect.width / 2), rect.top + (rect.height / 2), 12);
  };
  sigil?.addEventListener('click', onSigil);
  _session.cleanups.push(() => sigil?.removeEventListener('click', onSigil));

  const btnR = doc.getElementById('btnR');
  const onR = () => {
    const rect = btnR?.getBoundingClientRect?.();
    const audio = deps.audioEngine || globalThis.GAME?.Audio || globalThis.AudioEngine;
    const restart = deps.restartFromEnding || globalThis.GAME?.API?.restartFromEnding || globalThis.restartFromEnding;

    if (rect) {
      for (let i = 0; i < 5; i += 1) {
        _session.timers.push(
          winOf(deps).setTimeout(
            () => burst(wisps, rect.left + (rect.width / 2) + ((Math.random() - 0.5) * rect.width * 0.85), rect.top + (rect.height / 2), 14),
            i * 70,
          ),
        );
      }
    }
    audio?.playResonanceBurst?.();
    _session.timers.push(winOf(deps).setTimeout(() => {
      EndingScreenUI.cleanup({ doc });
      if (typeof restart === 'function') restart();
    }, 420));
  };
  btnR?.addEventListener('click', onR);
  _session.cleanups.push(() => btnR?.removeEventListener('click', onR));

  runScene(doc, deps, p, wisps);
  return true;
}

function buildDOM(doc, p) {
  const root = doc.createElement('div');
  root.id = ROOT_ID;
  root.innerHTML = `
    <div id="endingCurtain"></div>
    <canvas id="endingCvA"></canvas><canvas id="endingCvS"></canvas><canvas id="endingCvW"></canvas><canvas id="endingCvT"></canvas>
    <div class="vignette"></div><div class="noise"></div><div id="pxLayer"></div><div id="cDot"></div><div id="cRing"></div>
    <div id="stage">
      <div class="eyebrow sc" id="s0">${p.eyebrow}</div>
      <div class="title-row sc" id="s1">
        <div class="main-title">${p.title}<span class="title-sub">${p.subtitle}</span></div>
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
      <div class="stats-row sc" id="s4">${p.stats.map((s) => `<div class="sorb"><div class="s-ic">${s.icon}</div><div class="s-v" id="${s.id}">${s.static ? s.value : '0'}</div><div class="s-l">${s.label}</div><div class="tip">${s.tip}</div></div>`).join('')}</div>
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

function applyRank(doc, rank, score) {
  const g = doc.getElementById('sg'); const n = doc.getElementById('sn'); const s = doc.getElementById('ss');
  if (!g || !n || !s) return;
  g.textContent = rank.glyph; g.style.color = rank.color; g.style.textShadow = `0 0 18px ${rank.glow},0 0 36px ${rank.glow}`;
  n.textContent = rank.title; n.style.color = rank.color; s.textContent = `${rank.label} · ${fmt(score)}pt`;
  ['sr1', 'sr2', 'sr3'].forEach((id) => { const el = doc.getElementById(id); if (el) { el.setAttribute('stroke', rank.color); el.setAttribute('stroke-opacity', '.55'); } });
  const tri = doc.getElementById('stri'); const dot = doc.getElementById('sdot'); const sigil = doc.getElementById('sigilEl');
  if (tri) { tri.setAttribute('stroke', rank.color); tri.setAttribute('stroke-opacity', '.35'); }
  if (dot) dot.setAttribute('fill', rank.color);
  if (sigil) sigil.style.filter = `drop-shadow(0 0 8px ${rank.glow})`;
}

function buildMeta(doc, p) {
  const tl = doc.getElementById('tlNodes'); const dg = doc.getElementById('deckGrid'); const chips = doc.getElementById('chipRow'); const pills = doc.getElementById('pillRow');
  p.regions.forEach((r, i) => {
    const node = doc.createElement('div'); node.className = `tl-node${r.boss ? ' boss' : ''}`;
    node.style.cssText = `opacity:0;transition:opacity .4s ease ${i * .1}s,transform .4s ease ${i * .1}s;transform:translateY(8px);`;
    node.innerHTML = `<div class="tl-dot" style="border-color:${r.accent}.45);box-shadow:0 0 10px ${r.accent}.18);">${r.icon}</div><div class="tl-name">${r.name}</div><div class="tl-time">${r.time}</div>`;
    tl?.appendChild(node);
    _session.timers.push(winOf({}).setTimeout(() => { node.style.opacity = '1'; node.style.transform = 'translateY(0)'; }, 300 + (i * 100)));
  });
  p.deck.forEach((c, i) => {
    const el = doc.createElement('div');
    el.className = `mcard ${c.cls}`.trim();
    el.textContent = c.icon;
    el.title = c.title;
    el.style.animation = `cardIn .35s ease ${i * .05}s forwards`;
    dg?.appendChild(el);
  });
  p.chips.forEach((text) => { const el = doc.createElement('div'); el.className = 'chip'; el.textContent = text; chips?.appendChild(el); });
  p.inscriptions.forEach((entry) => { const el = doc.createElement('div'); el.className = 'pill'; el.textContent = `${entry.icon} ${entry.name}${entry.level > 1 ? ` Lv.${entry.level}` : ''}`; pills?.appendChild(el); });
}

function buildFragmentChoices(doc, deps, outcome) {
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
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'frag-card';
    btn.innerHTML = `<div class="frag-icon">${entry.icon}</div><div class="frag-name">${entry.name}</div><div class="frag-desc">${entry.desc}</div>`;
    const onPick = () => {
      if (btn.disabled) return;
      grid.querySelectorAll('.frag-card').forEach((el) => { el.disabled = true; });
      deps.audioEngine?.playClick?.();
      pick(entry.effect);
      _session.timers.push(winOf(deps).setTimeout(() => EndingScreenUI.cleanup({ doc }), 420));
    };
    btn.addEventListener('click', onPick);
    _session.cleanups.push(() => btn.removeEventListener('click', onPick));
    grid.appendChild(btn);
  });

  wrap.append(title, grid);
  anchor.parentNode.insertBefore(wrap, anchor);
}

function initFx(doc, deps, p) {
  const cvA = doc.getElementById('endingCvA'), cvS = doc.getElementById('endingCvS'), cvW = doc.getElementById('endingCvW'), cvT = doc.getElementById('endingCvT');
  const xA = cvA?.getContext?.('2d'), xS = cvS?.getContext?.('2d'), xW = cvW?.getContext?.('2d'), xT = cvT?.getContext?.('2d');
  if (!xA || !xS || !xW || !xT) return { wisps: [], trail: [] };
  const w = winOf(deps), raf = rafOf(deps), caf = cafOf(deps), trail = [], wisps = [];
  const orb = [
    { x: .15, y: .22, r: .54, h: 'rgba(85,45,195,', p: 0, s: .00027 }, { x: .85, y: .18, r: .46, h: 'rgba(28,165,148,', p: 1.7, s: .00035 },
    { x: .48, y: .85, r: .58, h: 'rgba(148,45,215,', p: .85, s: .00021 }, { x: .07, y: .65, r: .40, h: 'rgba(45,88,198,', p: 2.3, s: .00031 },
    { x: .93, y: .56, r: .42, h: 'rgba(198,65,138,', p: 3.2, s: .00028 }, { x: .38, y: .38, r: .32, h: 'rgba(75,155,198,', p: 1.1, s: .00042 },
  ];
  const stars = Array.from({ length: 220 }, () => ({ x: Math.random(), y: Math.random(), z: .25 + (Math.random() * 1.5), b: .15 + (Math.random() * .75), t: .0003 + (Math.random() * .0025), p: Math.random() * Math.PI * 2, n: [] }));
  stars.forEach((s, i) => stars.slice(i + 1).forEach((t, j) => { if (Math.hypot((s.x - t.x) * 1920, (s.y - t.y) * 1080) < 90 && Math.random() < .09) s.n.push(i + 1 + j); }));
  const resize = () => [cvA, cvS, cvW, cvT].forEach((c) => { c.width = w.innerWidth; c.height = w.innerHeight; });
  resize(); w.addEventListener('resize', resize); _session.cleanups.push(() => w.removeEventListener('resize', resize));
  const mouse = { x: w.innerWidth / 2, y: w.innerHeight / 2, rx: w.innerWidth / 2, ry: w.innerHeight / 2, px: 0, py: 0 };
  const mm = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.px = ((e.clientX / w.innerWidth) - .5) * 2; mouse.py = ((e.clientY / w.innerHeight) - .5) * 2; trail.push({ x: mouse.x, y: mouse.y, life: 1 }); if (trail.length > 32) trail.shift(); };
  doc.addEventListener('mousemove', mm); _session.cleanups.push(() => doc.removeEventListener('mousemove', mm));
  for (let i = 0; i < 24; i += 1) { const el = doc.createElement('div'); el.className = 'rune-f'; el.textContent = RUNES[Math.floor(Math.random() * RUNES.length)]; el.style.left = `${4 + (Math.random() * 92)}%`; el.style.top = `${4 + (Math.random() * 92)}%`; el.style.fontSize = `${11 + (Math.random() * 24)}px`; el.style.animationDuration = `${14 + (Math.random() * 22)}s`; el.style.animationDelay = `${-Math.random() * 18}s`; doc.getElementById('pxLayer')?.appendChild(el); }
  const spawn = () => wisps.push({ x: Math.random() * w.innerWidth, y: w.innerHeight + 6, vx: (Math.random() - .5) * 13, vy: -(6 + (Math.random() * 22)), life: 5 + (Math.random() * 6), ml: 11, sz: .8 + (Math.random() * 2.2), c: WCOLORS[Math.floor(Math.random() * 3)], a: true });
  const interval = w.setInterval(spawn, 105); _session.cleanups.push(() => w.clearInterval(interval));
  let id = 0;
  const loop = (ts) => {
    xA.clearRect(0, 0, cvA.width, cvA.height); xS.clearRect(0, 0, cvS.width, cvS.height); xW.clearRect(0, 0, cvW.width, cvW.height); xT.clearRect(0, 0, cvT.width, cvT.height);
    orb.forEach((o) => { const px = (o.x + (Math.sin(ts * o.s + o.p) * .13)) * cvA.width, py = (o.y + (Math.cos(ts * o.s * .7 + o.p) * .11)) * cvA.height, r = o.r * Math.min(cvA.width, cvA.height), a = .05 + (Math.sin(ts * .00046 + o.p) * .018), g = xA.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `${o.h}${a + .025})`); g.addColorStop(.5, `${o.h}${a * .35})`); g.addColorStop(1, `${o.h}0)`); xA.fillStyle = g; xA.beginPath(); xA.ellipse(px, py, r, r * .62, (ts * .00005) + (o.p * .28), 0, Math.PI * 2); xA.fill(); });
    stars.forEach((s) => { const a = s.b * (.42 + (.58 * Math.sin(ts * s.t + s.p))), sx = s.x * cvS.width, sy = s.y * cvS.height; s.n.forEach((j) => { const t = stars[j]; if (!t) return; const la = Math.max(0, (1 - (Math.hypot((s.x - t.x) * cvS.width, (s.y - t.y) * cvS.height) / 90)) * .07 * a); xS.strokeStyle = `rgba(155,127,232,${la})`; xS.lineWidth = .4; xS.beginPath(); xS.moveTo(sx, sy); xS.lineTo(t.x * cvS.width, t.y * cvS.height); xS.stroke(); }); if (s.z > 1) { const g = xS.createRadialGradient(sx, sy, 0, sx, sy, s.z * 3.5); g.addColorStop(0, `rgba(210,195,255,${a * .35})`); g.addColorStop(1, 'rgba(210,195,255,0)'); xS.fillStyle = g; xS.beginPath(); xS.arc(sx, sy, s.z * 3.5, 0, Math.PI * 2); xS.fill(); } xS.globalAlpha = a; xS.fillStyle = '#ece8ff'; xS.beginPath(); xS.arc(sx, sy, s.z, 0, Math.PI * 2); xS.fill(); }); xS.globalAlpha = 1;
    for (let i = wisps.length - 1; i >= 0; i -= 1) { const wisp = wisps[i]; wisp.x += wisp.vx / 60; wisp.y += wisp.vy / 60; wisp.vy += wisp.a ? 0 : (110 / 60); wisp.life -= 1 / 60; if (wisp.life <= 0) { wisps.splice(i, 1); continue; } const r = wisp.life / wisp.ml, a = wisp.a ? Math.sin(r * Math.PI) * .35 : Math.pow(r, 1.6) * .88, g = xW.createRadialGradient(wisp.x, wisp.y, 0, wisp.x, wisp.y, wisp.sz * 5.5); g.addColorStop(0, `${wisp.c}${a * .65})`); g.addColorStop(1, `${wisp.c}0)`); xW.fillStyle = g; xW.beginPath(); xW.arc(wisp.x, wisp.y, wisp.sz * 5.5, 0, Math.PI * 2); xW.fill(); xW.globalAlpha = a; xW.fillStyle = `${wisp.c}1)`; xW.beginPath(); xW.arc(wisp.x, wisp.y, wisp.sz, 0, Math.PI * 2); xW.fill(); } xW.globalAlpha = 1;
    for (let i = trail.length - 1; i >= 0; i -= 1) { const pnt = trail[i]; pnt.life -= .055; if (pnt.life <= 0) { trail.splice(i, 1); continue; } const a = pnt.life * .4, r = 2.5 * pnt.life, g = xT.createRadialGradient(pnt.x, pnt.y, 0, pnt.x, pnt.y, r * 5); g.addColorStop(0, `rgba(74,243,204,${a * .6})`); g.addColorStop(1, 'rgba(74,243,204,0)'); xT.fillStyle = g; xT.beginPath(); xT.arc(pnt.x, pnt.y, r * 5, 0, Math.PI * 2); xT.fill(); xT.globalAlpha = a; xT.fillStyle = 'rgba(74,243,204,.9)'; xT.beginPath(); xT.arc(pnt.x, pnt.y, r, 0, Math.PI * 2); xT.fill(); } xT.globalAlpha = 1;
    mouse.rx += (mouse.x - mouse.rx) * .12; mouse.ry += (mouse.y - mouse.ry) * .12; const dot = doc.getElementById('cDot'), ring = doc.getElementById('cRing'), px = doc.getElementById('pxLayer'); if (dot && ring) { dot.style.left = `${mouse.x}px`; dot.style.top = `${mouse.y}px`; ring.style.left = `${mouse.rx}px`; ring.style.top = `${mouse.ry}px`; } if (px) px.style.transform = `translate(${mouse.px * w.innerWidth * .018}px,${mouse.py * w.innerHeight * .018}px)`;
    id = raf(loop);
  };
  id = raf(loop); _session.cleanups.push(() => caf(id));
  return { wisps };
}

function burst(wisps, x, y, n = 16) {
  for (let i = 0; i < n; i += 1) {
    const ang = ((i / n) * Math.PI * 2) + (Math.random() * .5), sp = 40 + (Math.random() * 125);
    wisps.push({ x, y, vx: Math.cos(ang) * sp, vy: (Math.sin(ang) * sp) - 28, life: .9 + (Math.random() * 1.1), ml: 2, sz: 1.2 + (Math.random() * 3), c: WCOLORS[Math.floor(Math.random() * WCOLORS.length)], a: false });
  }
}

function runScene(doc, deps, p, wisps) {
  const reveal = [{ id: 's0', d: 400 }, { id: 's1', d: 900 }, { id: 's2', d: 1600 }, { id: 's3', d: 3800 }, { id: 's4', d: 4100 }, { id: 's5', d: 4600 }, { id: 's6', d: 5200 }, { id: 's6b', d: 5600 }, { id: 's7', d: 5900 }, { id: 's8', d: 6300 }];
  reveal.forEach((s) => _session.timers.push(winOf(deps).setTimeout(() => doc.getElementById(s.id)?.classList.add('show'), s.d)));
  const quote = doc.getElementById('quote'), cur = doc.getElementById('qcursor'); if (quote && cur) { quote.textContent = ''; quote.appendChild(cur); let i = 0; const step = () => { if (i >= p.quote.length) { _session.timers.push(winOf(deps).setTimeout(() => { cur.style.display = 'none'; }, 1200)); return; } const ch = p.quote[i]; if (ch === '\n') quote.insertBefore(doc.createElement('br'), cur); else { const s = doc.createElement('span'); s.textContent = ch; quote.insertBefore(s, cur); } i += 1; _session.timers.push(winOf(deps).setTimeout(step, 38)); }; _session.timers.push(winOf(deps).setTimeout(step, 1600)); }
  [['sv0', p.stats[0].value, 550], ['sv1', p.stats[1].value, 500], ['sv2', p.stats[2].value, 950], ['sv3', p.stats[3].value, 850], ['sv4', p.stats[4].value, 700]].forEach(([id, target, dur], idx) => _session.timers.push(winOf(deps).setTimeout(() => { const el = doc.getElementById(id); if (!el) return; const start = performance.now(), raf = rafOf(deps), caf = cafOf(deps); let rid = 0; const tick = (now) => { const t = Math.min((now - start) / dur, 1), e = 1 - ((1 - t) ** 3); el.textContent = fmt(Math.floor(num(target) * e)); if (t < 1) rid = raf(tick); }; rid = raf(tick); _session.cleanups.push(() => caf(rid)); }, 4100 + (idx * 120))));
  _session.timers.push(winOf(deps).setTimeout(() => { const line = doc.getElementById('tlLine'), track = doc.querySelector('.tl-track'); if (line && track) line.style.width = `${track.offsetWidth - 32}px`; }, 4800));
  _session.timers.push(winOf(deps).setTimeout(() => { const clr = doc.getElementById('clrT'); if (clr) clr.textContent = p.clear; }, 5200));
  _session.timers.push(winOf(deps).setTimeout(() => { for (let i = 0; i < 8; i += 1) _session.timers.push(winOf(deps).setTimeout(() => burst(wisps, winOf(deps).innerWidth * (.12 + (Math.random() * .76)), winOf(deps).innerHeight * (.12 + (Math.random() * .76)), 13), i * 200)); (deps.audioEngine || globalThis.GAME?.Audio || globalThis.AudioEngine)?.playResonanceBurst?.(); }, 1200));
}

export const EndingScreenUI = {
  show(isHidden, deps = {}) {
    if (isHidden) return false;
    return showOutcomeScreen('victory', deps);
  },

  showOutcome(outcome = 'victory', deps = {}) {
    return showOutcomeScreen(outcome, deps);
  },

  cleanup(deps = {}) {
    const doc = docOf(deps);
    if (_session) {
      _session.timers.forEach((t) => winOf({ doc }).clearTimeout(t));
      _session.cleanups.forEach((fn) => { try { fn?.(); } catch {} });
      _session = null;
    }
    doc?.getElementById?.(ROOT_ID)?.remove?.();
  },
};
