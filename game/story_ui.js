function _getGS(deps) {
    return deps?.gs || window.GS;
  }

  function _getData(deps) {
    return deps?.data || window.DATA;
  }

  function _getDoc(deps) {
    return deps?.doc || document;
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
      if (!gs?.meta || !data?.storyFragments) return;
      const run = gs.meta.runCount;
      const frag = data.storyFragments.find(f => f.run === run);
      if (!frag || gs.meta.storyPieces.includes(frag.id)) return;
      gs.meta.storyPieces.push(frag.id);
      this.displayFragment(frag, deps);
      if (gs.meta.storyPieces.length >= 8 && !gs.meta._hiddenEndingHinted) {
        gs.meta._hiddenEndingHinted = true;
        setTimeout(() => {
          if (typeof deps.showWorldMemoryNotice === 'function') {
            deps.showWorldMemoryNotice('진실에 가까워지고 있다 — 각인 없이 클리어하라');
          }
        }, 500);
      }
    },

    displayFragment(frag, deps = {}) {
      const doc = _getDoc(deps);
      const el = doc.createElement('div');
      el.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;z-index:2000;animation:fadeIn 1s ease both;';
      el.innerHTML = `
        <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.5em;color:rgba(123,47,255,0.6);">FRAGMENT ${frag.id} — ${frag.title}</div>
        <div style="font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(15px,2vw,20px);color:var(--text);max-width:560px;text-align:center;line-height:1.9;animation:fadeInUp 1s ease 0.5s both;opacity:0;">${frag.text}</div>
        <div style="width:40px;height:1px;background:var(--echo);animation:fadeInUp 1s ease 1s both;opacity:0;"></div>
        <button onclick="this.parentElement.remove();" style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.3em;color:var(--text-dim);background:none;border:1px solid var(--border);border-radius:6px;padding:10px 28px;cursor:pointer;animation:fadeInUp 1s ease 1.5s both;opacity:0;transition:all 0.3s;" onmouseover="this.style.color='var(--white)'" onmouseout="this.style.color='var(--text-dim)'">계속</button>
      `;
      doc.body.appendChild(el);
      deps.audioEngine?.playHeal?.();
    },

    checkHiddenEnding(deps = {}) {
      const gs = _getGS(deps);
      if (!gs?.meta) return false;
      const noIns = !Object.values(gs.meta.inscriptions).some(v => v);
      return noIns && gs.meta.storyPieces.length >= 10;
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

      el.innerHTML = isHidden ? `
        <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.5em;color:var(--cyan);animation:fadeInDown 1s ease 0.5s both;opacity:0;">TRUE ENDING — 초월</div>
        <div style="font-family:'Cinzel Decorative',serif;font-size:clamp(28px,5vw,56px);font-weight:900;color:var(--cyan);text-shadow:0 0 40px ${glowColor};animation:titleReveal 1.5s ease 0.8s both;opacity:0;">루프의 끝<br><span style="font-size:0.5em;color:var(--text-dim);">THE END OF ECHOES</span></div>
        <div style="font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(14px,1.8vw,19px);color:var(--text);max-width:520px;text-align:center;line-height:1.9;animation:fadeInUp 1s ease 1.8s both;opacity:0;">"잔향자는 처음으로 손을 내려놓았다.<br>각인의 힘도, 과거의 기억도 사용하지 않은 채.<br>그것이 진짜 선택이었다.<br><br>세계는 침묵을 되찾았다.<br>그리고 마침내 — 쉬었다."</div>
        <div style="animation:fadeInUp 1s ease 3s both;opacity:0;">
          <button onclick="restartFromEnding()" style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,var(--cyan),var(--echo));border:none;border-radius:8px;padding:14px 32px;cursor:pointer;">새로운 잔향</button>
        </div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text-dim);animation:fadeInUp 1s ease 3.5s both;opacity:0;">TRUE ENDING UNLOCKED — ${gs.meta.storyPieces.length}/10 fragments</div>
      ` : `
        <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.5em;color:var(--echo);animation:fadeInDown 1s ease 0.5s both;opacity:0;">ENDING — 클리어</div>
        <div style="font-family:'Cinzel Decorative',serif;font-size:clamp(26px,4.5vw,50px);font-weight:900;color:var(--white);text-shadow:0 0 30px ${glowColor};animation:titleReveal 1.5s ease 0.8s both;opacity:0;">메아리의 근원 정복<br><span style="font-size:0.45em;color:var(--text-dim);">RESONANT VICTOR</span></div>
        <div style="font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(14px,1.8vw,18px);color:var(--text);max-width:500px;text-align:center;line-height:1.9;animation:fadeInUp 1s ease 1.8s both;opacity:0;">"잔향자는 에코의 핵심을 돌파했다.<br>하지만 루프는 아직 끝나지 않았다.<br>진실을 알기에는 — 아직 이르다."</div>
        <div style="display:flex;gap:28px;animation:fadeInUp 1s ease 2.5s both;opacity:0;flex-wrap:wrap;justify-content:center;">
          ${[
        { n: gs.player.kills, l: '처치 수' },
        { n: gs.stats.maxChain, l: '최고 체인' },
        { n: gs.stats.damageDealt, l: '총 피해' },
        { n: gs.meta.runCount, l: '런 횟수' },
        { n: `${gs.meta.storyPieces.length}/10`, l: '스토리 조각' },
      ].map(s => `<div style="text-align:center;"><div style="font-family:'Cinzel Decorative',serif;font-size:28px;font-weight:900;color:var(--echo);">${s.n}</div><div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:var(--text-dim);margin-top:4px;">${s.l}</div></div>`).join('')}
        </div>
        <div style="animation:fadeInUp 1s ease 3s both;opacity:0;">
          <button onclick="restartFromEnding()" style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,var(--echo),var(--echo-bright));border:none;border-radius:8px;padding:14px 32px;cursor:pointer;">다시 잔향 속으로</button>
        </div>
        <div style="font-family:'Crimson Pro',serif;font-size:13px;font-style:italic;color:var(--text-dim);animation:fadeInUp 1s ease 3.5s both;opacity:0;line-height:1.6;max-width:450px;">
          ✦ 각인이란? — 사망 시 획득하는 영구 강화입니다.<br>
          <span style="font-size:0.9em;opacity:0.8;">
            · 에코 증폭: 다음 런 Echo +30으로 시작<br>
            · 회복력: 다음 런 최대 HP +10<br>
            · 행운: 다음 런 골드 25로 시작
          </span><br>
          각인을 하나도 선택하지 않고 클리어하면 — 다른 결말이 기다립니다.
        </div>
      `;

      doc.body.appendChild(el);
      setTimeout(() => {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            deps.particleSystem?.burstEffect?.(window.innerWidth * (0.2 + Math.random() * 0.6), window.innerHeight * (0.2 + Math.random() * 0.6));
          }, i * 300);
        }
        deps.audioEngine?.playResonanceBurst?.();
      }, 2000);
    },
  };
