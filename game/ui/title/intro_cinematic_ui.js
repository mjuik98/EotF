/**
 * intro_cinematic_ui.js — 잔향의 각인 인트로 연출
 *
 * "잔향 속으로" 버튼 클릭 시 게임 시작 전 짧은 텍스트 연출을 보여준다.
 * - 런 횟수(runCount)에 따라 대사 분기
 * - 직업(selectedClass)에 따라 각인 대사 분기
 * - 클릭 / ESC / Space 로 즉시 스킵 가능
 */

// ── 직업별 각인 대사 ──────────────────────────────────────────────
const CLASS_LINES = {
    swordsman: [
        '검이 익숙하다.',
        '이 길도 — 아마 전에 걸어본 적 있을 것이다.',
    ],
    mage: [
        '메아리가 속삭인다.',
        '아직 끝나지 않았다고.',
    ],
    hunter: [
        '소리가 없다.',
        '완벽하다. 시작하자.',
    ],
    paladin: [
        '다시 한 번.',
        '이번엔 반드시 지킨다.',
    ],
    berserker: [
        '상처가 남아있다.',
        '좋아 — 아직 살아있다는 뜻이니.',
    ],
    guardian: [
        '파동이 느껴진다.',
        '이미 여기 온 적 있다.',
    ],
};

// ── 반복 런 귀환 대사 (runCount > 1) ─────────────────────────────
const RETURN_LINES = [
    '또 왔군.',
    '잔향은 기억을 지우지 않는다.',
    '루프가 다시 시작된다.',
    '얼마나 반복했는가. 기억하는가.',
    '세계는 모든 선택을 기억한다.',
    '끝은 아직 보이지 않는다.',
    '잊혀진 이름이 다시 울린다.',
    '진실에 가까워지고 있다.',
];

function _getReturnLine(runCount) {
    return RETURN_LINES[Math.min(runCount - 2, RETURN_LINES.length - 1)];
}

// ── 내부 상태 ─────────────────────────────────────────────────────
let _overlay = null;
let _skipHandlers = [];
let _animTimer = null;
const RUN_START_HANDOFF_BLACKOUT_ID = 'runStartHandoffBlackoutOverlay';

function _cleanup() {
    _skipHandlers.forEach(({ type, fn }) => document.removeEventListener(type, fn));
    _skipHandlers = [];
    if (_animTimer) { clearTimeout(_animTimer); _animTimer = null; }
    if (_overlay) { _overlay.remove(); _overlay = null; }
}

function _installRunStartHandoffBlackout() {
    const doc = typeof document !== 'undefined' ? document : null;
    if (!doc?.body) return;

    doc.getElementById(RUN_START_HANDOFF_BLACKOUT_ID)?.remove();
    const el = doc.createElement('div');
    el.id = RUN_START_HANDOFF_BLACKOUT_ID;
    el.style.cssText = 'position:fixed;inset:0;background:#000;opacity:1;z-index:2101;pointer-events:none;';
    doc.body.appendChild(el);
}

// ── 애니메이션 헬퍼 ───────────────────────────────────────────────
function _fadeIn(el, duration = 600) {
    el.style.opacity = '0';
    el.style.transition = `opacity ${duration}ms ease`;
    requestAnimationFrame(() => { el.style.opacity = '1'; });
}

function _fadeOut(el, duration = 400) {
    return new Promise(resolve => {
        el.style.transition = `opacity ${duration}ms ease`;
        el.style.opacity = '0';
        setTimeout(resolve, duration);
    });
}

// ── 오버레이 생성 ─────────────────────────────────────────────────
function _buildOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'introCinematicOverlay';
    overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    background: #000;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    opacity: 1;
    cursor: pointer; user-select: none;
  `;

    // 글리치 파티클 캔버스
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; opacity: 0.06;
  `;
    overlay.appendChild(canvas);

    // 텍스트 컨테이너
    const textBox = document.createElement('div');
    textBox.style.cssText = `
    position: relative; z-index: 1;
    display: flex; flex-direction: column;
    align-items: center; gap: 24px;
    max-width: 560px; padding: 0 32px;
    text-align: center;
  `;
    overlay.appendChild(textBox);

    // 스킵 힌트
    const skipHint = document.createElement('div');
    skipHint.style.cssText = `
    position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; letter-spacing: 0.3em;
    color: rgba(255,255,255,0.2);
    animation: introBlink 2s ease infinite;
  `;
    skipHint.textContent = '[ CLICK OR ESC TO SKIP ]';
    overlay.appendChild(skipHint);

    // 파티클 애니메이션
    _animateParticles(canvas);

    // 블링크 키프레임 삽입 (중복 방지)
    if (!document.getElementById('introCinematicStyle')) {
        const style = document.createElement('style');
        style.id = 'introCinematicStyle';
        style.textContent = `
      @keyframes introBlink {
        0%, 100% { opacity: 0.2; }
        50%       { opacity: 0.6; }
      }
      @keyframes introGlitch {
        0%   { clip-path: inset(40% 0 61% 0); transform: skew(-0.5deg); }
        20%  { clip-path: inset(92% 0 1% 0);  transform: skew(0.3deg);  }
        40%  { clip-path: inset(43% 0 1% 0);  transform: skew(0.8deg);  }
        60%  { clip-path: inset(25% 0 58% 0); transform: skew(-1deg);   }
        80%  { clip-path: inset(54% 0 7% 0);  transform: skew(0.5deg);  }
        100% { clip-path: inset(58% 0 43% 0); transform: skew(-0.2deg); }
      }
    `;
        document.head.appendChild(style);
    }

    return { overlay, textBox };
}

function _animateParticles(canvas) {
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vy: -0.3 - Math.random() * 0.5,
        r: Math.random() * 1.5,
    }));

    const draw = () => {
        if (!canvas.isConnected) { cancelAnimationFrame(raf); return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.y += p.vy;
            if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
            ctx.fillStyle = `rgba(123,47,255,0.8)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
        raf = requestAnimationFrame(draw);
    };
    draw();
}

// ── 텍스트 라인 생성 ──────────────────────────────────────────────
function _makeLine(text, opts = {}) {
    const el = document.createElement('div');
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

function _makeDivider() {
    const el = document.createElement('div');
    el.style.cssText = `
    width: 1px; height: 0;
    background: linear-gradient(to bottom, transparent, rgba(123,47,255,0.6), transparent);
    opacity: 0; transition: height 600ms ease, opacity 600ms ease;
  `;
    return el;
}

// ── 메인 재생 함수 ────────────────────────────────────────────────
/**
 * @param {object} deps
 *   - gs      : GameState
 *   - getSelectedClass : () => string
 * @param {function} onComplete - 연출 완료 후 실행할 콜백 (실제 startGame)
 */
export const IntroCinematicUI = {
    play(deps = {}, onComplete) {
        const gs = deps.gs;
        const selectedClass = deps.getSelectedClass?.() || 'swordsman';
        const runCount = gs?.meta?.runCount ?? 1;
        const isFirstRun = runCount <= 1;

        console.log('[IntroCinematicUI] play()', { selectedClass, runCount, isFirstRun });

        _cleanup();

        const { overlay, textBox } = _buildOverlay();
        _overlay = overlay;
        document.body.appendChild(overlay);

        // ── 스킵 바인딩 ──
        let skipped = false;
        const skip = () => {
            if (skipped) return;
            skipped = true;
            if (typeof onComplete === 'function') _installRunStartHandoffBlackout();
            _cleanup();
            onComplete?.();
        };

        const onKey = (e) => { if (e.key === 'Escape' || e.key === ' ') skip(); };
        document.addEventListener('keydown', onKey);
        overlay.addEventListener('click', skip);
        _skipHandlers.push({ type: 'keydown', fn: onKey });

        // ── 라인 구성 ──
        const classLines = CLASS_LINES[selectedClass] || CLASS_LINES.swordsman;

        const lines = isFirstRun
            ? [
                _makeLine('"기억은 사라지지 않는다."', { size: '13px', spacing: '0.3em', color: 'rgba(255,255,255,0.4)', mono: true }),
                _makeLine('"잔향이 될 뿐."', { size: '13px', spacing: '0.3em', color: 'rgba(255,255,255,0.4)', mono: true }),
                _makeDivider(),
                _makeLine(classLines[0], { size: '22px', bold: true, spacing: '0.1em', color: '#fff', fromBelow: true }),
                _makeLine(classLines[1], { size: '16px', spacing: '0.15em', color: 'rgba(0,255,204,0.8)', fromBelow: true }),
            ]
            : [
                _makeLine(`— RUN ${runCount} —`, { size: '11px', spacing: '0.5em', color: 'rgba(123,47,255,0.6)', mono: true }),
                _makeLine(`"${_getReturnLine(runCount)}"`, { size: '20px', bold: true, spacing: '0.1em', color: '#fff', fromBelow: true }),
                _makeDivider(),
                _makeLine(classLines[0], { size: '15px', spacing: '0.15em', color: 'rgba(0,255,204,0.7)', fromBelow: true }),
                _makeLine(classLines[1], { size: '15px', spacing: '0.15em', color: 'rgba(0,255,204,0.7)', fromBelow: true }),
            ];

        lines.forEach(l => textBox.appendChild(l));

        // ── 타임라인 ──
        const totalDuration = isFirstRun ? 4800 : 3800;

        // 각 라인 순차 등장
        const delays = isFirstRun
            ? [400, 1000, 1700, 1900, 2700]
            : [300, 600, 1400, 1700, 2200];

        delays.forEach((delay, i) => {
            _animTimer = setTimeout(() => {
                if (skipped) return;
                const el = lines[i];
                if (el.tagName === 'DIV' && el.style.width === '1px') {
                    // 구분선
                    el.style.height = '40px';
                    el.style.opacity = '1';
                } else {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }
            }, delay);
        });

        // 자동 종료
        _animTimer = setTimeout(() => {
            if (skipped) return;
            skipped = true;
            if (typeof onComplete === 'function') _installRunStartHandoffBlackout();
            _cleanup();
            onComplete?.();
        }, totalDuration);
    },
};
