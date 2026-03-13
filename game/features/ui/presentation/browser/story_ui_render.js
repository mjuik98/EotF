import { startEchoRippleDissolve } from '../../../../platform/browser/effects/echo_ripple_transition.js';
import { playStatusHeal } from '../../../../domain/audio/audio_event_helpers.js';
import { getDoc } from './story_ui_helpers.js';

export { renderHiddenEndingOverlay } from './story_ui_hidden_ending_render.js';

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
  playStatusHeal(deps.audioEngine);
  return true;
}
