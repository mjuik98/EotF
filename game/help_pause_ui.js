'use strict';

(function initHelpPauseUI(globalObj) {
  let _helpOpen = false;
  let _pauseOpen = false;
  let _hotkeysBound = false;

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _isInGame(gs) {
    return gs?.currentScreen === 'game';
  }

  const HelpPauseUI = {
    isHelpOpen() {
      return _helpOpen;
    },

    showMobileWarning(deps = {}) {
      const doc = _getDoc(deps);
      const isMobile = globalObj.innerWidth < 900 || 'ontouchstart' in globalObj;
      if (!isMobile || doc.getElementById('mobileWarn')) return;

      const warn = doc.createElement('div');
      warn.id = 'mobileWarn';
      warn.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:9999;backdrop-filter:blur(8px);padding:24px;text-align:center;';
      warn.innerHTML = `
        <div style="font-size:48px;">📱</div>
        <div style="font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);">PC 권장</div>
        <div style="font-family:'Crimson Pro',serif;font-size:15px;color:var(--text);max-width:320px;line-height:1.7;">이 게임은 키보드와 마우스 환경에 최적화되어 있습니다.<br>세로 모드 또는 모바일에서는 일부 UI가 잘릴 수 있습니다.</div>
        <button onclick="document.getElementById('mobileWarn')?.remove()" style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,var(--echo),var(--echo-bright));border:none;border-radius:8px;padding:12px 28px;cursor:pointer;margin-top:8px;">그래도 계속하기</button>
      `;
      doc.body.appendChild(warn);
    },

    toggleHelp(deps = {}) {
      const doc = _getDoc(deps);
      _helpOpen = !_helpOpen;
      let menu = doc.getElementById('helpMenu');
      if (_helpOpen) {
        menu = doc.createElement('div');
        menu.id = 'helpMenu';
        menu.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;z-index:1000;animation:fadeIn 0.3s ease both;backdrop-filter:blur(8px);';
        menu.innerHTML = `
          <div style="font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);margin-bottom:8px;">단축키 안내</div>
          <div style="background:rgba(16,16,46,0.8);border:1px solid var(--border);border-radius:12px;padding:20px 32px;display:grid;grid-template-columns:1fr 1fr;gap:8px 32px;max-width:480px;width:90%;">
            ${[
              ['ESC', '일시정지 (전투 외)'],
              ['D', '덱 보기'],
              ['?', '이 안내 열기'],
              ['E', 'Echo 스킬 발동 (전투 중)'],
              ['Enter', '턴 종료 (전투 중)'],
              ['1 - 5', '손패 카드 빠른 사용'],
              ['Tab', '다음 적 타겟 순환'],
            ].map(([k, v]) => `
              <div style="font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--cyan);background:rgba(0,255,204,0.07);border:1px solid rgba(0,255,204,0.15);border-radius:4px;padding:3px 8px;text-align:center;">${k}</div>
              <div style="font-size:12px;color:var(--text);display:flex;align-items:center;">${v}</div>
            `).join('')}
          </div>
          <div style="margin-top:8px;font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.2em;color:var(--text-dim);">Echo 단계: 30 = ★☆☆ · 60 = ★★☆ · 100 = ★★★</div>
          <button onclick="toggleHelp()" style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:var(--echo);background:rgba(123,47,255,0.1);border:1px solid var(--border);border-radius:6px;padding:10px 24px;cursor:pointer;margin-top:4px;">닫기</button>
        `;
        doc.body.appendChild(menu);
      } else {
        menu?.remove();
      }
    },

    abandonRun(deps = {}) {
      const doc = _getDoc(deps);
      const confirmEl = doc.createElement('div');
      confirmEl.id = 'abandonConfirm';
      confirmEl.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.96);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:2000;animation:fadeIn 0.2s ease;backdrop-filter:blur(12px);';
      confirmEl.innerHTML = `
        <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--danger);opacity:0.8;">경고</div>
        <div style="font-family:'Cinzel Decorative',serif;font-size:28px;font-weight:900;color:var(--white);">런을 포기하시겠습니까?</div>
        <div style="font-family:'Crimson Pro',serif;font-style:italic;font-size:15px;color:var(--text-dim);text-align:center;max-width:320px;line-height:1.7;">
          현재 런의 모든 진행이 초기화됩니다.<br>
          세계의 기억과 조각은 보존됩니다.
        </div>
        <div style="display:flex;gap:12px;">
          <button onclick="document.getElementById('abandonConfirm')?.remove()"
            style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--echo);background:rgba(123,47,255,0.1);border:1px solid var(--border);border-radius:6px;padding:12px 24px;cursor:pointer;">
            계속하기
          </button>
          <button onclick="confirmAbandon()"
            style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,#ff3366,#cc2244);border:none;border-radius:6px;padding:12px 24px;cursor:pointer;box-shadow:0 4px 16px rgba(255,51,102,0.4);">
            포기한다
          </button>
        </div>
      `;
      doc.body.appendChild(confirmEl);
    },

    confirmAbandon(deps = {}) {
      const gs = deps.gs;
      if (!gs) return;

      const doc = _getDoc(deps);
      doc.getElementById('abandonConfirm')?.remove();
      doc.getElementById('pauseMenu')?.remove();
      _pauseOpen = false;

      if (gs.combat.active) {
        gs.combat.active = false;
        doc.getElementById('combatOverlay')?.classList.remove('active');
      }

      if (typeof deps.finalizeRunOutcome === 'function') {
        deps.finalizeRunOutcome('defeat', { echoFragments: 2 });
      }

      const deathFloor = doc.getElementById('deathFloor');
      const deathKills = doc.getElementById('deathKills');
      const deathChain = doc.getElementById('deathChain');
      const deathRun = doc.getElementById('deathRun');
      const deathQuote = doc.getElementById('deathQuote');
      if (deathFloor) deathFloor.textContent = gs.currentFloor;
      if (deathKills) deathKills.textContent = gs.player.kills;
      if (deathChain) deathChain.textContent = gs.stats.maxChain;
      if (deathRun) deathRun.textContent = gs.meta.runCount - 1;
      if (deathQuote) deathQuote.textContent = '스스로 멈추기로 한 자의 잔향은... 더 오래 남는다.';

      if (typeof gs.generateFragmentChoices === 'function') {
        gs.generateFragmentChoices();
      }

      const wmEl = doc.getElementById('deathWorldMemory');
      if (wmEl) {
        const wm = gs.meta.worldMemory;
        const hints = [];
        if ((wm.savedMerchant || 0) > 0) hints.push(`🤝 상인을 구함 ×${wm.savedMerchant}`);
        if (gs.meta.storyPieces.length > 0) hints.push(`📖 스토리 ${gs.meta.storyPieces.length}/10 해금`);
        wmEl.innerHTML = hints.length
          ? '<div style="font-family:\'Cinzel\',serif;font-size:9px;letter-spacing:0.3em;color:var(--text-dim);width:100%;text-align:center;margin-bottom:6px;">◈ 세계의 기억 ◈</div>' + hints.map(h => `<span class="wm-badge">${h}</span>`).join('')
          : '';
      }

      if (typeof deps.switchScreen === 'function') {
        deps.switchScreen('death');
      }
    },

    togglePause(deps = {}) {
      const gs = deps.gs;
      if (!gs) return;

      const doc = _getDoc(deps);
      _pauseOpen = !_pauseOpen;
      let menu = doc.getElementById('pauseMenu');
      if (_pauseOpen) {
        menu = doc.createElement('div');
        menu.id = 'pauseMenu';
        menu.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:1000;animation:fadeIn 0.3s ease both;backdrop-filter:blur(8px);';
        menu.innerHTML = `
          <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.5em;color:var(--text-dim);">일시정지</div>
          <div style="font-family:'Cinzel Decorative',serif;font-size:32px;font-weight:900;color:var(--white);">PAUSED</div>
          <div style="display:flex;flex-direction:column;gap:8px;width:200px;">
            <button onclick="togglePause()" style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--echo);background:rgba(123,47,255,0.1);border:1px solid var(--border);border-radius:6px;padding:12px;cursor:pointer;">계속하기</button>
            <button onclick="toggleHelp();togglePause();" style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--cyan);background:rgba(0,255,204,0.06);border:1px solid rgba(0,255,204,0.2);border-radius:6px;padding:12px;cursor:pointer;">단축키 안내 (?)</button>
            <button onclick="abandonRun()" style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--danger);background:rgba(255,51,102,0.08);border:1px solid rgba(255,51,102,0.25);border-radius:6px;padding:12px;cursor:pointer;">⚠ 런 포기</button>
            <button onclick="location.reload()" style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.05);border-radius:6px;padding:12px;cursor:pointer;">처음으로</button>
          </div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:4px;">
            <span style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.15em;color:var(--text-dim);">음량</span>
            <input type="range" min="0" max="100" value="35" style="width:120px;accent-color:var(--echo);"
              oninput="AudioEngine.setVolume(this.value/100)">
          </div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text-dim);text-align:center;">
            런 ${gs.meta.runCount} · 지역 ${gs.currentRegion + 1} · ${gs.currentFloor}층<br>
            스토리 조각 ${gs.meta.storyPieces.length}/10
          </div>
        `;
        doc.body.appendChild(menu);
      } else {
        menu?.remove();
      }
    },

    bindGlobalHotkeys(deps = {}) {
      const gs = deps.gs;
      if (!gs || _hotkeysBound) return;
      const doc = _getDoc(deps);
      const self = this;

      _hotkeysBound = true;
      doc.addEventListener('keydown', e => {
        if (e.key === 'Escape' && _isInGame(gs) && !gs.combat.active) {
          self.togglePause(deps);
        }

        if ((e.key === '?' || e.key === '/') && _isInGame(gs)) {
          e.preventDefault();
          self.toggleHelp(deps);
        }

        if ((e.key === 'd' || e.key === 'D') && _isInGame(gs) && !_helpOpen) {
          const modal = doc.getElementById('deckViewModal');
          if (modal?.classList.contains('active')) {
            if (typeof deps.closeDeckView === 'function') deps.closeDeckView();
          } else if (typeof deps.showDeckView === 'function') {
            deps.showDeckView();
          }
        }

        if ((e.key === 'e' || e.key === 'E') && _isInGame(gs) && gs.combat.active && gs.combat.playerTurn) {
          if (typeof deps.useEchoSkill === 'function') deps.useEchoSkill();
        }

        if (e.key === 'Enter' && _isInGame(gs) && gs.combat.active && gs.combat.playerTurn) {
          e.preventDefault();
          if (typeof deps.endPlayerTurn === 'function') deps.endPlayerTurn();
        }

        if (_isInGame(gs) && gs.combat.active && gs.combat.playerTurn) {
          const num = parseInt(e.key, 10);
          if (num >= 1 && num <= 5) {
            const idx = num - 1;
            if (gs.player.hand[idx] && typeof gs.playCard === 'function') {
              gs.playCard(gs.player.hand[idx], idx);
            }
          }
        }

        if (e.key === 'Tab' && _isInGame(gs) && gs.combat.active && gs.combat.playerTurn) {
          e.preventDefault();
          const enemies = gs.combat.enemies;
          const aliveIndices = enemies.map((enemy, idx) => enemy.hp > 0 ? idx : -1).filter(idx => idx >= 0);
          if (aliveIndices.length > 1) {
            const cur = aliveIndices.indexOf(gs._selectedTarget ?? -1);
            gs._selectedTarget = aliveIndices[(cur + 1) % aliveIndices.length];
            if (typeof gs.addLog === 'function') {
              gs.addLog(`🎯 타겟: ${enemies[gs._selectedTarget].name}`, 'system');
            }
            if (typeof deps.renderCombatEnemies === 'function') {
              deps.renderCombatEnemies();
            }
          }
        }
      });
    },
  };

  globalObj.HelpPauseUI = HelpPauseUI;
})(window);
