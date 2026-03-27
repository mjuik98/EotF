import { FRAGMENT_CHOICES, ROOT_ID, STYLE_ID, winOf } from './ending_screen_helpers.js';
import { resolveEndingActions } from './ending_screen_action_helpers.js';
import {
  buildEndingFragmentChoiceViewModel,
  presentEndingFragmentChoices,
} from './ending_fragment_choice_presenter.js';
import { createEndingFragmentChoiceActions } from './ending_fragment_choice_actions.js';

const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const fmt = (value) => Math.max(0, Math.floor(num(value, 0))).toLocaleString('ko-KR');

function ensureEndingDeckDetail(doc, deckGrid) {
  const host = deckGrid?.parentNode;
  if (!doc || !host) return null;

  let detail = doc.getElementById?.('endingDeckDetail');
  if (detail) return detail;

  detail = doc.createElement('div');
  detail.id = 'endingDeckDetail';
  detail.className = 'ending-deck-detail';
  detail.dataset.open = 'false';
  detail.setAttribute?.('aria-hidden', 'true');

  const icon = doc.createElement('div');
  icon.id = 'endingDeckDetailIcon';
  icon.className = 'ending-deck-detail-icon';

  const title = doc.createElement('div');
  title.id = 'endingDeckDetailTitle';
  title.className = 'ending-deck-detail-title';

  const meta = doc.createElement('div');
  meta.id = 'endingDeckDetailMeta';
  meta.className = 'ending-deck-detail-meta';

  const desc = doc.createElement('div');
  desc.id = 'endingDeckDetailDesc';
  desc.className = 'ending-deck-detail-desc';

  detail.append(icon, title, meta, desc);
  host.appendChild(detail);
  return detail;
}

function setEndingDeckDetailState(detail, card = null, open = false) {
  if (!detail?.dataset) return;
  detail.dataset.open = open ? 'true' : 'false';
  detail.setAttribute?.('aria-hidden', open ? 'false' : 'true');
  if (!card) return;

  const icon = detail.ownerDocument?.getElementById?.('endingDeckDetailIcon')
    || detail.children?.[0]
    || null;
  const title = detail.ownerDocument?.getElementById?.('endingDeckDetailTitle')
    || detail.children?.[1]
    || null;
  const meta = detail.ownerDocument?.getElementById?.('endingDeckDetailMeta')
    || detail.children?.[2]
    || null;
  const desc = detail.ownerDocument?.getElementById?.('endingDeckDetailDesc')
    || detail.children?.[3]
    || null;

  if (icon) icon.textContent = card.icon || '?';
  if (title) title.textContent = card.title || card.id || '';
  if (meta) meta.textContent = `${card.typeLabel || '카드'} · ${card.rarityLabel || '일반'} · 비용 ${card.costText || '-'}`;
  if (desc) desc.textContent = card.desc || '설명 없음';
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
          ${payload.progressionSummary?.length ? '<div><div class="blk-label">이번 귀환</div><div class="pills" id="progressionRow"></div></div>' : ''}
          ${payload.achievements?.length ? '<div><div class="blk-label">이번 업적</div><div class="pills" id="achievementRow"></div></div>' : ''}
          ${payload.unlocks?.length ? '<div><div class="blk-label">새 해금</div><div class="pills" id="unlockRow"></div></div>' : ''}
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
  const progressionRow = doc.getElementById('progressionRow');
  const achievementRow = doc.getElementById('achievementRow');
  const unlockRow = doc.getElementById('unlockRow');
  const deckDetail = ensureEndingDeckDetail(doc, deckGrid);

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
    element.tabIndex = 0;
    element.style.animation = `cardIn .35s ease ${index * 0.05}s forwards`;
    const showDetail = () => setEndingDeckDetailState(deckDetail, card, true);
    const hideDetail = () => setEndingDeckDetailState(deckDetail, card, false);
    element.addEventListener?.('mouseenter', showDetail);
    element.addEventListener?.('focus', showDetail);
    element.addEventListener?.('mouseleave', hideDetail);
    element.addEventListener?.('blur', hideDetail);
    session.cleanups?.push?.(() => {
      element.removeEventListener?.('mouseenter', showDetail);
      element.removeEventListener?.('focus', showDetail);
      element.removeEventListener?.('mouseleave', hideDetail);
      element.removeEventListener?.('blur', hideDetail);
    });
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

  payload.progressionSummary?.forEach((entry) => {
    const element = doc.createElement('div');
    element.className = 'pill';
    element.textContent = entry;
    progressionRow?.appendChild(element);
  });

  payload.achievements?.forEach((entry) => {
    const element = doc.createElement('div');
    element.className = 'pill';
    element.textContent = `${entry.icon} ${entry.title}`;
    if (entry.description) element.title = entry.description;
    achievementRow?.appendChild(element);
  });

  payload.unlocks?.forEach((entry) => {
    const element = doc.createElement('div');
    element.className = 'pill';
    element.textContent = entry.label;
    unlockRow?.appendChild(element);
  });
}

export function appendEndingFragmentChoices(doc, deps, outcome, session, cleanup) {
  const { selectFragment: pick } = resolveEndingActions(deps);
  if (typeof pick !== 'function') return;

  const viewModel = buildEndingFragmentChoiceViewModel({
    choices: FRAGMENT_CHOICES,
    gs: deps?.gs,
    outcome,
  });
  if (!viewModel) return;

  const anchor = doc.getElementById('s7');
  let ui = null;
  const actions = createEndingFragmentChoiceActions({
    audioEngine: deps.audioEngine,
    disableChoices: () => {
      ui?.buttons?.forEach((button) => {
        button.disabled = true;
      });
    },
    pick,
    scheduleCleanup: () => {
      session.timers.push(winOf(deps).setTimeout(() => cleanup({ doc }), 420));
    },
  });

  ui = presentEndingFragmentChoices({
    anchor,
    doc,
    onChoose: (effect, { button } = {}) => {
      if (button?.disabled) return;
      actions.choose(effect);
    },
    session,
    viewModel,
  });
}

export function ensureEndingScreenStyle(doc) {
  if (!doc?.head || doc.getElementById(STYLE_ID)) return;
  const link = doc.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = '/css/ending_screen.css';
  doc.head.appendChild(link);
}
