import { startEchoRippleDissolve } from '../effects/echo_ripple_transition.js';

function _getGS(deps) {
  return deps?.gs;
}

function _getData(deps) {
  return deps?.data;
}

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getInscriptionLevel(gs, id) {
  const inscriptions = gs?.meta?.inscriptions;
  if (!inscriptions) return 0;
  const val = inscriptions[id];
  if (typeof val === 'boolean') return val ? 1 : 0;
  return Math.max(0, Math.floor(Number(val) || 0));
}

function _setInscriptionLevel(gs, id, level) {
  if (!gs?.meta) return;
  if (!gs.meta.inscriptions) gs.meta.inscriptions = {};
  gs.meta.inscriptions[id] = Math.max(0, Math.floor(Number(level) || 0));
}

export const StoryUI = {
  unlockNextFragment(deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    if (!gs?.meta || !data?.storyFragments) return;
    const run = gs.meta.runCount;
    const frag = data.storyFragments.find(f => f.run === run);
    if (frag && !gs.meta.storyPieces.includes(frag.id)) {
      gs.meta.storyPieces.push(frag.id);
    }
  },

  showRunFragment(deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    if (!gs?.meta || !data?.storyFragments) return false;

    const run = gs.meta.runCount;
    const frag = data.storyFragments.find((f) => f.run === run);
    const fallbackFrag = {
      id: '-',
      title: '\uC5EC\uC815 \uC2DC\uC791',
      text: '\uBA54\uC544\uB9AC\uAC00 \uB2E4\uC2DC \uC6B8\uB9B0\uB2E4.\n\uB2E4\uC74C \uCE35\uC73C\uB85C \uB0B4\uB824\uAC00\uB77C.',
    };

    const pickedFrag = frag || fallbackFrag;
    const alreadyUnlocked = !!frag && gs.meta.storyPieces.includes(frag.id);
    if (frag && !alreadyUnlocked) gs.meta.storyPieces.push(frag.id);

    const shown = this.displayFragment(pickedFrag, deps);
    if (shown === false) return false;

    if (frag && !alreadyUnlocked && gs.meta.storyPieces.length > 4) {
      if (_getInscriptionLevel(gs, 'echo_memory') === 0 && data.inscriptions?.echo_memory) {
        _setInscriptionLevel(gs, 'echo_memory', 1);
        setTimeout(() => {
          if (typeof deps.showWorldMemoryNotice === 'function') {
            deps.showWorldMemoryNotice('\uC0C8\uB85C\uC6B4 \uAC01\uC778 \uD574\uAE08: \uC794\uD5A5\uC758 \uAE30\uC5B5');
          }
        }, 300);
      }
    }

    if (frag && !alreadyUnlocked && gs.meta.storyPieces.length > 7 && !gs.meta._hiddenEndingHinted) {
      gs.meta._hiddenEndingHinted = true;
      setTimeout(() => {
        if (typeof deps.showWorldMemoryNotice === 'function') {
          deps.showWorldMemoryNotice('\uC9C4\uC2E4\uC5D0 \uAC00\uAE4C\uC6CC\uC9C0\uACE0 \uC788\uB2E4 - \uAC01\uC778 \uC5C6\uC774 \uD074\uB9AC\uC5B4\uD558\uB77C');
        }
      }, 500);
    }

    return true;
  },

  displayFragment(frag, deps = {}) {
    const doc = _getDoc(deps);
    const el = doc.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;padding:28px 20px;box-sizing:border-box;z-index:2000;animation:fadeIn 1s ease both;';
    const head = doc.createElement('div');
    head.style.cssText = "font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.32em;color:rgba(123,47,255,0.72);";
    head.textContent = `FRAGMENT ${frag.id} - ${frag.title}`;

    const body = doc.createElement('div');
    body.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(20px,3vw,31px);color:var(--text);max-width:760px;text-align:center;line-height:1.7;animation:fadeInUp 1s ease 0.35s both;opacity:0;";
    body.textContent = frag.text;

    const bar = doc.createElement('div');
    bar.style.cssText = 'width:72px;height:2px;background:var(--echo);animation:fadeInUp 1s ease 0.75s both;opacity:0;';

    const btn = doc.createElement('button');
    btn.id = 'storyContinueBtn';
    btn.style.cssText = "font-family:'Cinzel',serif;font-size:15px;letter-spacing:0.16em;color:var(--text-dim);background:rgba(123,47,255,0.16);border:1px solid var(--border);border-radius:8px;padding:13px 36px;cursor:pointer;opacity:1;transition:all 0.3s;";
    btn.textContent = '\uACC4\uC18D';
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
  },

  checkHiddenEnding(deps = {}) {
    const gs = _getGS(deps);
    if (!gs?.meta) return false;
    const noIns = !Object.values(gs.meta.inscriptions).some(v => v);
    return noIns && gs.meta.storyPieces.length > 9;
  },

  showNormalEnding(deps = {}) {
    this.showEnding(false, deps);
  },

  showHiddenEnding(deps = {}) {
    this.showEnding(true, deps);
  },

  showEnding(isHidden, deps = {}) {
    const gs = _getGS(deps);
    if (!gs?.meta || !gs.player || !gs.stats) return;

    const doc = _getDoc(deps);
    const el = doc.createElement('div');
    el.id = 'endingScreen';
    el.style.cssText = 'position:fixed;inset:0;background:var(--void);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;z-index:3000;animation:fadeIn 2s ease both;';
    const glowColor = isHidden ? 'rgba(0,255,204,0.7)' : 'var(--echo-glow)';

    if (isHidden) {
      const h1 = doc.createElement('div');
      h1.style.cssText = "font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.5em;color:var(--cyan);animation:fadeInDown 1s ease 0.5s both;opacity:0;";
      h1.textContent = 'TRUE ENDING — 초월';

      const h2 = doc.createElement('div');
      h2.style.cssText = `font-family:'Cinzel Decorative',serif;font-size:clamp(28px,5vw,56px);font-weight:900;color:var(--cyan);text-shadow:0 0 40px ${glowColor};animation:titleReveal 1.5s ease 0.8s both;opacity:0;`;
      h2.textContent = '루프의 끝';
      const subH2 = doc.createElement('span');
      subH2.style.cssText = 'font-size:0.5em;color:var(--text-dim);';
      subH2.textContent = ' THE END OF ECHOES';
      h2.appendChild(subH2);

      const body = doc.createElement('div');
      body.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(14px,1.8vw,19px);color:var(--text);max-width:520px;text-align:center;line-height:1.9;animation:fadeInUp 1s ease 1.8s both;opacity:0;";
      body.innerHTML = '"잔향자는 처음으로 손을 내려놓았다.<br>각인의 힘도, 과거의 기억도 사용하지 않은 채.<br>그것이 진짜 선택이었다.<br><br>세계는 침묵을 되찾았다.<br>그리고 마침내 — 쉬었다."';

      const btnCont = doc.createElement('div');
      btnCont.style.cssText = 'animation:fadeInUp 1s ease 3s both;opacity:0;';
      const btn = doc.createElement('button');
      btn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,var(--cyan),var(--echo));border:none;border-radius:8px;padding:14px 32px;cursor:pointer;";
      btn.textContent = '새로운 잔향';
      btn.onclick = () => { if (typeof deps.restartFromEnding === 'function') deps.restartFromEnding(); };
      btnCont.appendChild(btn);

      const foot = doc.createElement('div');
      foot.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text-dim);animation:fadeInUp 1s ease 3.5s both;opacity:0;";
      foot.textContent = `TRUE ENDING UNLOCKED — ${gs.meta.storyPieces.length}/10 fragments`;

      const data = _getData(deps);
      if (_getInscriptionLevel(gs, 'void_heritage') === 0 && data?.inscriptions?.void_heritage) {
        _setInscriptionLevel(gs, 'void_heritage', 1);
        const unlockMsg = doc.createElement('div');
        unlockMsg.style.cssText = "font-family:'Cinzel',serif;font-size:11px;color:var(--cyan);margin-top:8px;animation:fadeInUp 1s ease 4s both;opacity:0;";
        unlockMsg.textContent = '궁극의 각인 해금: 공허의 유산';
        foot.appendChild(unlockMsg);
      }

      el.append(h1, h2, body, btnCont, foot);
    } else {
      const h1 = doc.createElement('div');
      h1.style.cssText = "font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.5em;color:var(--echo);animation:fadeInDown 1s ease 0.5s both;opacity:0;";
      h1.textContent = 'ENDING — 클리어';

      const h2 = doc.createElement('div');
      h2.style.cssText = `font-family:'Cinzel Decorative',serif;font-size:clamp(26px,4.5vw,50px);font-weight:900;color:var(--white);text-shadow:0 0 30px ${glowColor};animation:titleReveal 1.5s ease 0.8s both;opacity:0;`;
      h2.textContent = '메아리의 근원 정복';
      const subH2 = doc.createElement('span');
      subH2.style.cssText = 'font-size:0.45em;color:var(--text-dim);';
      subH2.textContent = ' RESONANT VICTOR';
      h2.appendChild(subH2);

      const body = doc.createElement('div');
      body.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(14px,1.8vw,18px);color:var(--text);max-width:500px;text-align:center;line-height:1.9;animation:fadeInUp 1s ease 1.8s both;opacity:0;";
      body.innerHTML = '"잔향자는 에코의 핵심을 돌파했다.<br>하지만 루프는 아직 끝나지 않았다.<br>진실을 알기에는 — 아직 이르다."';

      const statsCont = doc.createElement('div');
      statsCont.style.cssText = 'display:flex;gap:28px;animation:fadeInUp 1s ease 2.5s both;opacity:0;flex-wrap:wrap;justify-content:center;';
      [
        { n: gs.player.kills, l: '처치 수' },
        { n: gs.stats.maxChain, l: '최고 체인' },
        { n: gs.stats.damageDealt, l: '총 피해' },
        { n: gs.meta.runCount, l: '런 횟수' },
        { n: `${gs.meta.storyPieces.length}/10`, l: '스토리 조각' },
      ].forEach(s => {
        const sDiv = doc.createElement('div');
        sDiv.style.textAlign = 'center';
        const val = doc.createElement('div'); val.style.cssText = "font-family:'Cinzel Decorative',serif;font-size:28px;font-weight:900;color:var(--echo);"; val.textContent = s.n;
        const lbl = doc.createElement('div'); lbl.style.cssText = "font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:var(--text-dim);margin-top:4px;"; lbl.textContent = s.l;
        sDiv.append(val, lbl);
        statsCont.appendChild(sDiv);
      });

      const btnCont = doc.createElement('div');
      btnCont.style.cssText = 'animation:fadeInUp 1s ease 3s both;opacity:0;';
      const btn = doc.createElement('button');
      btn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,var(--echo),var(--echo-bright));border:none;border-radius:8px;padding:14px 32px;cursor:pointer;";
      btn.textContent = '다시 잔향 속으로';
      btn.onclick = () => { if (typeof deps.restartFromEnding === 'function') deps.restartFromEnding(); };
      btnCont.appendChild(btn);

      const foot = doc.createElement('div');
      foot.style.cssText = "font-family:'Crimson Pro',serif;font-size:13px;font-style:italic;color:var(--text-dim);animation:fadeInUp 1s ease 3.5s both;opacity:0;line-height:1.6;max-width:450px;";
      foot.innerHTML = '✦ 각인이란? — 사망 시 획득하는 영구 강화입니다.<br><span style="font-size:0.9em;opacity:0.8;">· 잔향 증폭: 다음 런 잔향 +30으로 시작<br>· 회복력: 다음 런 최대 HP +10<br>· 행운: 다음 런 골드 25로 시작</span><br>각인을 하나도 선택하지 않고 클리어하면 — 다른 결말이 기다립니다.';

      el.append(h1, h2, body, statsCont, btnCont, foot);
    }

    doc.body.appendChild(el);
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          deps.particleSystem?.burstEffect?.(innerWidth * (0.2 + Math.random() * 0.6), innerHeight * (0.2 + Math.random() * 0.6));
        }, i * 300);
      }
      deps.audioEngine?.playResonanceBurst?.();
    }, 2000);
  },
};
