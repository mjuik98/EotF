import { startEchoRippleDissolve } from '../effects/echo_ripple_transition.js';
import { getData, getDoc, getGS, getInscriptionLevel, setInscriptionLevel } from './story_ui_helpers.js';

export function renderStoryFragmentOverlay(frag, deps = {}) {
  const doc = getDoc(deps);
  const el = doc.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;padding:28px 20px;box-sizing:border-box;z-index:2000;opacity:1;';

  const head = doc.createElement('div');
  head.style.cssText = "font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.32em;color:rgba(123,47,255,0.72);";
  head.textContent = `조각 ${frag.id} - ${frag.title}`;

  const body = doc.createElement('div');
  body.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(20px,3vw,31px);color:var(--text);max-width:760px;text-align:center;line-height:1.7;animation:fadeInUp 1s ease 0.35s both;opacity:0;";
  body.textContent = frag.text;

  const bar = doc.createElement('div');
  bar.style.cssText = 'width:72px;height:2px;background:var(--echo);animation:fadeInUp 1s ease 0.75s both;opacity:0;';

  const btn = doc.createElement('button');
  btn.id = 'storyContinueBtn';
  btn.style.cssText = "font-family:'Cinzel',serif;font-size:15px;letter-spacing:0.16em;color:var(--text-dim);background:rgba(123,47,255,0.16);border:1px solid var(--border);border-radius:8px;padding:13px 36px;cursor:pointer;opacity:1;transition:all 0.3s;";
  btn.textContent = '계속';
  btn.onmouseover = () => { btn.style.color = 'var(--white)'; };
  btn.onmouseout = () => { btn.style.color = 'var(--text-dim)'; };

  let completed = false;
  const finish = () => {
    if (completed) return;
    completed = true;
    if (typeof deps.onFragmentClosed === 'function') deps.onFragmentClosed();
  };

  btn.onclick = () => {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.style.pointerEvents = 'none';
    const closeEffect = deps?.closeEffect || 'ripple';

    if (closeEffect === 'none') {
      el.remove();
      finish();
      return;
    }

    if (closeEffect === 'fade') {
      el.style.transition = 'opacity 0.34s ease, filter 0.34s ease';
      el.style.filter = 'blur(6px)';
      el.style.opacity = '0';
      setTimeout(() => {
        el.remove();
        finish();
      }, 350);
      return;
    }

    startEchoRippleDissolve(el, {
      doc,
      win: deps?.win,
      requestAnimationFrame: deps?.requestAnimationFrame,
      cancelAnimationFrame: deps?.cancelAnimationFrame,
      onComplete: finish,
    });
  };

  el.append(head, body, bar, btn);
  doc.body.appendChild(el);
  deps.audioEngine?.playHeal?.();
  return true;
}

export function renderHiddenEndingOverlay(deps = {}) {
  const gs = getGS(deps);
  const doc = getDoc(deps);
  const el = doc.createElement('div');
  el.id = 'endingScreen';
  el.style.cssText = 'position:fixed;inset:0;background:var(--void);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;z-index:3000;animation:fadeIn 2s ease both;';
  const glowColor = 'rgba(0,255,204,0.7)';

  const h1 = doc.createElement('div');
  h1.style.cssText = "font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.5em;color:var(--cyan);animation:fadeInDown 1s ease 0.5s both;opacity:0;";
  h1.textContent = '진실을 초월';

  const h2 = doc.createElement('div');
  h2.style.cssText = `font-family:'Cinzel Decorative',serif;font-size:clamp(28px,5vw,56px);font-weight:900;color:var(--cyan);text-shadow:0 0 40px ${glowColor};animation:titleReveal 1.5s ease 0.8s both;opacity:0;`;
  h2.textContent = '루프의 바깥';
  const subH2 = doc.createElement('span');
  subH2.style.cssText = 'font-size:0.5em;color:var(--text-dim);';
  subH2.textContent = '메아리의 끝';
  h2.appendChild(subH2);

  const body = doc.createElement('div');
  body.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(14px,1.8vw,19px);color:var(--text);max-width:520px;text-align:center;line-height:1.9;animation:fadeInUp 1s ease 1.8s both;opacity:0;";
  body.innerHTML = '"메아리는 처음으로 자신을 내려놓았다.<br>각인의 과거와 기억을 두지 않은 채,<br>그럼에도 진짜 선택을 내렸다.<br><br>경계는 침묵으로 갈라졌고,<br>마침내 없는 밖으로 걸어 나갔다."';

  const btnCont = doc.createElement('div');
  btnCont.style.cssText = 'animation:fadeInUp 1s ease 3s both;opacity:0;';
  const btn = doc.createElement('button');
  btn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,var(--cyan),var(--echo));border:none;border-radius:8px;padding:14px 32px;cursor:pointer;";
  btn.textContent = '메아리로 돌아가기';
  btn.onclick = () => { if (typeof deps.restartFromEnding === 'function') deps.restartFromEnding(); };
  btnCont.appendChild(btn);

  const foot = doc.createElement('div');
  foot.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text-dim);animation:fadeInUp 1s ease 3.5s both;opacity:0;";
  foot.textContent = `히든 엔딩 해금 ${gs.meta.storyPieces.length}/10 fragments`;

  const data = getData(deps);
  if (getInscriptionLevel(gs, 'void_heritage') === 0 && data?.inscriptions?.void_heritage) {
    setInscriptionLevel(gs, 'void_heritage', 1);
    const unlockMsg = doc.createElement('div');
    unlockMsg.style.cssText = "font-family:'Cinzel',serif;font-size:11px;color:var(--cyan);margin-top:8px;animation:fadeInUp 1s ease 4s both;opacity:0;";
    unlockMsg.textContent = '권역 각인 해금: 공허의 유산';
    foot.appendChild(unlockMsg);
  }

  el.append(h1, h2, body, btnCont, foot);
  doc.body.appendChild(el);

  setTimeout(() => {
    const view = deps?.win || doc.defaultView || globalThis;
    for (let i = 0; i < 5; i += 1) {
      setTimeout(() => {
        deps.particleSystem?.burstEffect?.(
          view.innerWidth * (0.2 + (Math.random() * 0.6)),
          view.innerHeight * (0.2 + (Math.random() * 0.6)),
        );
      }, i * 300);
    }
    deps.audioEngine?.playResonanceBurst?.();
  }, 2000);
}
