export const INTRO_CLASS_LINES = {
  swordsman: [
    '검은 익숙하다.',
    '이번에도 마지막 앞에 걸어보는 것이다.',
  ],
  mage: [
    '메아리가 또렷하다.',
    '아직 끝나지 않았다.',
  ],
  hunter: [
    '소리는 없다.',
    '괜찮다. 시작하자.',
  ],
  paladin: [
    '다시 한 번.',
    '이번엔 바닥을 지운다.',
  ],
  berserker: [
    '적혈이 살아난다.',
    '좋아. 난 아직 남아있다는 뜻이다.',
  ],
  guardian: [
    '진동은 이어진다.',
    '여긴 아직 무너지지 않았다.',
  ],
};

export const INTRO_RETURN_LINES = [
  '또 돌아왔다.',
  '잔향은 기억을 지우지 않는다.',
  '루프가 다시 시작된다.',
  '얼마나 반복했는가. 기억하는가.',
  '경계는 모든 선택을 기억한다.',
  '답은 아직 보이지 않는다.',
  '잊힌 이름이 다시 흐른다.',
  '진실은 가까워지고 있다.',
];

export const INTRO_STYLE_ID = 'introCinematicStyle';
export const RUN_START_HANDOFF_BLACKOUT_ID = 'runStartHandoffBlackoutOverlay';

export function getReturnLine(runCount) {
  return INTRO_RETURN_LINES[Math.min(runCount - 2, INTRO_RETURN_LINES.length - 1)];
}

export function makeIntroLine(doc, text, opts = {}) {
  const el = doc.createElement('div');
  el.style.cssText = `
    font-family: ${opts.mono ? "'Share Tech Mono', monospace" : "'Cinzel', serif"};
    font-size: ${opts.size || '15px'};
    font-weight: ${opts.bold ? '700' : '400'};
    letter-spacing: ${opts.spacing || '0.25em'};
    color: ${opts.color || 'rgba(255,255,255,0.75)'};
    line-height: 1.6;
    opacity: 0;
    transform: translateY(${opts.fromBelow ? '12px' : '0'});
    transition: opacity 700ms ease, transform 700ms ease;
  `;
  el.textContent = text;
  return el;
}

export function makeIntroDivider(doc) {
  const el = doc.createElement('div');
  el.dataset.kind = 'divider';
  el.style.cssText = `
    width: 1px; height: 0;
    background: linear-gradient(to bottom, transparent, rgba(123,47,255,0.6), transparent);
    opacity: 0; transition: height 600ms ease, opacity 600ms ease;
  `;
  return el;
}

export function buildIntroSequence(doc, selectedClass, runCount) {
  const classLines = INTRO_CLASS_LINES[selectedClass] || INTRO_CLASS_LINES.swordsman;
  const isFirstRun = runCount <= 1;

  const nodes = isFirstRun
    ? [
      makeIntroLine(doc, '"기억은 사라지지 않는다"', { size: '13px', spacing: '0.3em', color: 'rgba(255,255,255,0.4)', mono: true }),
      makeIntroLine(doc, '"잔향은 문을 연다"', { size: '13px', spacing: '0.3em', color: 'rgba(255,255,255,0.4)', mono: true }),
      makeIntroDivider(doc),
      makeIntroLine(doc, classLines[0], { size: '22px', bold: true, spacing: '0.1em', color: '#fff', fromBelow: true }),
      makeIntroLine(doc, classLines[1], { size: '16px', spacing: '0.15em', color: 'rgba(0,255,204,0.8)', fromBelow: true }),
    ]
    : [
      makeIntroLine(doc, `RUN ${runCount}`, { size: '11px', spacing: '0.5em', color: 'rgba(123,47,255,0.6)', mono: true }),
      makeIntroLine(doc, `"${getReturnLine(runCount)}"`, { size: '20px', bold: true, spacing: '0.1em', color: '#fff', fromBelow: true }),
      makeIntroDivider(doc),
      makeIntroLine(doc, classLines[0], { size: '15px', spacing: '0.15em', color: 'rgba(0,255,204,0.7)', fromBelow: true }),
      makeIntroLine(doc, classLines[1], { size: '15px', spacing: '0.15em', color: 'rgba(0,255,204,0.7)', fromBelow: true }),
    ];

  const delays = isFirstRun
    ? [400, 1000, 1700, 1900, 2700]
    : [300, 600, 1400, 1700, 2200];

  return {
    delays,
    isFirstRun,
    nodes,
    totalDuration: isFirstRun ? 4800 : 3800,
  };
}

export function ensureIntroStyle(doc) {
  if (doc.getElementById(INTRO_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = INTRO_STYLE_ID;
  style.textContent = `
    @keyframes introBlink {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.6; }
    }
  `;
  doc.head.appendChild(style);
}

export function buildIntroOverlay(doc) {
  const overlay = doc.createElement('div');
  overlay.id = 'introCinematicOverlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    background: #000;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    opacity: 1;
    cursor: pointer; user-select: none;
  `;

  const canvas = doc.createElement('canvas');
  canvas.style.cssText = `
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; opacity: 0.06;
  `;
  overlay.appendChild(canvas);

  const textBox = doc.createElement('div');
  textBox.style.cssText = `
    position: relative; z-index: 1;
    display: flex; flex-direction: column;
    align-items: center; gap: 24px;
    max-width: 560px; padding: 0 32px;
    text-align: center;
  `;
  overlay.appendChild(textBox);

  const skipHint = doc.createElement('div');
  skipHint.style.cssText = `
    position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; letter-spacing: 0.3em;
    color: rgba(255,255,255,0.2);
    animation: introBlink 2s ease infinite;
  `;
  skipHint.textContent = '[ CLICK OR ESC TO SKIP ]';
  overlay.appendChild(skipHint);

  return { canvas, overlay, skipHint, textBox };
}

export function createIntroParticles(width, height, count = 60) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vy: -0.3 - Math.random() * 0.5,
    r: Math.random() * 1.5,
  }));
}

export function mountRunStartHandoffBlackout(doc) {
  if (!doc?.body) return;
  doc.getElementById(RUN_START_HANDOFF_BLACKOUT_ID)?.remove();
  const el = doc.createElement('div');
  el.id = RUN_START_HANDOFF_BLACKOUT_ID;
  el.style.cssText = 'position:fixed;inset:0;background:#000;opacity:1;z-index:2101;pointer-events:none;';
  doc.body.appendChild(el);
}
