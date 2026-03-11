import { playUiClick } from '../../domain/audio/audio_event_helpers.js';
import { FRAGMENT_CHOICES, ROOT_ID, STYLE_ID, winOf } from './ending_screen_helpers.js';

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const fmt = (value) => Math.max(0, Math.floor(num(value, 0))).toLocaleString('ko-KR');

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
  const pick = deps.selectFragment;
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
      playUiClick(deps.audioEngine);
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
