let _helpOpen = false;
let _pauseOpen = false;
let _hotkeysBound = false;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _isInGame(gs) {
  // game 화면이거나 combat 활성 상태이면 인게임으로 간주
  return gs?.currentScreen === 'game' || gs?.combat?.active === true;
}

export const HelpPauseUI = {
  isHelpOpen() {
    return _helpOpen;
  },

  showMobileWarning(deps = {}) {
    const doc = _getDoc(deps);
    const isMobile = window.innerWidth < 900 || 'ontouchstart' in window;
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
          <div style="font-family:'Cinzel Decorative',serif;font-size:28px;font-weight:900;color:var(--white);margin-bottom:12px;">단축키 안내</div>
          <div style="background:rgba(16,16,46,0.85);border:1px solid var(--border);border-radius:16px;padding:24px 40px;display:grid;grid-template-columns:1fr 1.2fr;gap:12px 40px;max-width:600px;width:90%;">
            ${[
          ['ESC', '일시정지 (전항목)'],
          ['D', '덱 보기'],
          ['?', '이 안내 열기'],
          ['E', 'Echo 스킬 발동 (전투 중)'],
          ['Enter', '턴 종료 (전투 중)'],
          ['1 - 0', '손패 카드 빠른 사용'],
          ['Tab', '다음 적 타겟 순환'],
        ].map(([k, v]) => `
              <div style="font-family:'Share Tech Mono',monospace;font-size:14px;color:var(--cyan);background:rgba(0,255,204,0.07);border:1px solid rgba(0,255,204,0.15);border-radius:6px;padding:5px 12px;text-align:center;">${k}</div>
              <div style="font-size:15px;color:var(--text);display:flex;align-items:center;">${v}</div>
            `).join('')}
          </div>
          <div style="margin-top:12px;font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--text-dim);">Echo 단계: 30 = ★☆☆ · 60 = ★★☆ · 100 = ★★★</div>
          <button onclick="toggleHelp()" style="font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.2em;color:var(--echo);background:rgba(123,47,255,0.1);border:1px solid var(--border);border-radius:8px;padding:14px 32px;cursor:pointer;margin-top:8px;">닫기</button>
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
    const gs = deps.gs || window.GS;
    if (!gs) return;

    const doc = _getDoc(deps);
    _pauseOpen = !_pauseOpen;
    let menu = doc.getElementById('pauseMenu');
    if (_pauseOpen) {
      menu = doc.createElement('div');
      menu.id = 'pauseMenu';
      menu.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:1000;animation:fadeIn 0.3s ease both;backdrop-filter:blur(8px);';
      menu.innerHTML = `
          <div style="font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.5em;color:var(--text-dim);">일시정지</div>
          <div style="font-family:'Cinzel Decorative',serif;font-size:48px;font-weight:900;color:var(--white);text-shadow:0 0 20px rgba(255,255,255,0.2);">PAUSED</div>
          <div style="display:flex;flex-direction:column;gap:12px;width:280px;">
            <button onclick="togglePause()" style="font-family:'Cinzel',serif;font-size:16px;letter-spacing:0.2em;color:var(--echo);background:rgba(123,47,255,0.12);border:1px solid var(--border);border-radius:8px;padding:16px;cursor:pointer;">계속하기</button>
            <div style="display:flex;gap:8px;">
              <button onclick="showDeckView();togglePause();" style="flex:1;font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.15em;color:var(--white);background:rgba(255,255,255,0.08);border:1px solid var(--border);border-radius:8px;padding:14px;cursor:pointer;">📚 덱 보기</button>
              <button onclick="openCodex();togglePause();" style="flex:1;font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.15em;color:var(--white);background:rgba(255,255,255,0.08);border:1px solid var(--border);border-radius:8px;padding:14px;cursor:pointer;">📖 도감</button>
            </div>
            <button onclick="toggleHelp();togglePause();" style="font-family:'Cinzel',serif;font-size:15px;letter-spacing:0.2em;color:var(--cyan);background:rgba(0,255,204,0.08);border:1px solid rgba(0,255,204,0.3);border-radius:8px;padding:16px;cursor:pointer;">단축키 안내 (?)</button>
            <button onclick="abandonRun()" style="font-family:'Cinzel',serif;font-size:15px;letter-spacing:0.2em;color:var(--danger);background:rgba(255,51,102,0.1);border:1px solid rgba(255,51,102,0.3);border-radius:8px;padding:16px;cursor:pointer;">⚠ 런 포기</button>
            <button onclick="location.reload()" style="font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:14px;cursor:pointer;">처음으로</button>
            <button onclick="quitGame()" style="font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.2em;color:var(--danger);background:rgba(255,51,102,0.05);border:1px solid rgba(255,51,102,0.2);border-radius:8px;padding:14px;cursor:pointer;margin-top:4px;">게임 종료</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:16px;margin-top:12px;background:rgba(255,255,255,0.03);padding:20px;border-radius:12px;width:280px;">
            <div style="display:flex;align-items:center;gap:15px;">
              <span style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.15em;color:var(--text-dim);width:45px;">마스터</span>
              <input type="range" id="volMasterSlider" min="0" max="100"
                oninput="setMasterVolume(this.value)">
              <span id="volMasterVal" style="font-family:'Share Tech Mono',monospace;font-size:13px;color:var(--white);width:40px;text-align:right;">35%</span>
            </div>
            <div style="display:flex;align-items:center;gap:15px;">
              <span style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.15em;color:var(--text-dim);width:45px;">SFX</span>
              <input type="range" id="volSfxSlider" min="0" max="100"
                oninput="setSfxVolume(this.value)">
              <span id="volSfxVal" style="font-family:'Share Tech Mono',monospace;font-size:13px;color:var(--white);width:40px;text-align:right;">70%</span>
            </div>
            <div style="display:flex;align-items:center;gap:15px;">
              <span style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.15em;color:var(--text-dim);width:45px;">BGM</span>
              <input type="range" id="volAmbientSlider" min="0" max="100"
                oninput="setAmbientVolume(this.value)">
              <span id="volAmbientVal" style="font-family:'Share Tech Mono',monospace;font-size:13px;color:var(--white);width:40px;text-align:right;">40%</span>
            </div>
          </div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:13px;color:var(--text-dim);text-align:center;">
            런 ${gs.meta.runCount} · 지역 ${gs.currentRegion + 1} · ${gs.currentFloor}층<br>
            스토리 조각 ${gs.meta.storyPieces.length}/10
          </div>
        `;
      doc.body.appendChild(menu);
      if (typeof window._syncVolumeUI === 'function') window._syncVolumeUI();
    } else {
      // 메뉴 제거
      if (menu) menu.remove();
    }
  },

  bindGlobalHotkeys(deps = {}) {
    const doc = _getDoc(deps);

    console.log('[bindGlobalHotkeys] _hotkeysBound:', _hotkeysBound);

    // 이미 바인딩된 경우 중복 방지
    if (_hotkeysBound) {
      console.log('[bindGlobalHotkeys] Already bound, skipping');
      return;
    }
    _hotkeysBound = true;

    const self = this;

    console.log('[bindGlobalHotkeys] Binding ESC key listener');

    doc.addEventListener('keydown', e => {
      // window.GS 를 직접 참조하여 최신 상태 사용
      const gs = window.GS;

      // ESC: 일시정지 또는 모달 닫기
      if (e.key === 'Escape') {
        console.log('[ESC Key] currentScreen:', gs?.currentScreen, 'combat.active:', gs?.combat?.active, 'pauseOpen:', _pauseOpen);
        const isInGame = gs?.currentScreen === 'game' || gs?.combat?.active === true;
        const isTitle = gs?.currentScreen === 'title';

        // 도감 또는 덱 모달이 열려있으면 닫기
        const deckModal = document.getElementById('deckViewModal');
        const codexModal = document.getElementById('codexModal');
        const runSettingsModal = document.getElementById('runSettingsModal');

        // 덱 모달 확인 (classList.active 사용)
        if (deckModal && deckModal.classList.contains('active')) {
          console.log('[ESC Key] Close deck modal');
          if (typeof window.closeDeckView === 'function') window.closeDeckView();
          return;
        }

        // 도감 모달 확인 (style.display 사용)
        if (codexModal && codexModal.style.display === 'block') {
          console.log('[ESC Key] Close codex modal');
          if (typeof window.closeCodex === 'function') window.closeCodex();
          return;
        }

        // 런 세팅 모달 확인
        if (runSettingsModal && runSettingsModal.style.display !== 'none') {
          console.log('[ESC Key] Close run settings modal');
          if (typeof window.closeRunSettings === 'function') window.closeRunSettings();
          return;
        }

        // combat 중이거나 game 화면이면 무조건 일시정지
        if (isInGame && !self.isHelpOpen()) {
          console.log('[ESC Key] Toggle pause');
          self.togglePause(deps);
          return;
        }

        // 타이틀 화면에서는 아무것도 안 함 (이미 메뉴가 있음)
        if (isTitle) {
          console.log('[ESC Key] Title screen - ignored');
          return;
        }

        // reward 화면에서는 ESC 무시 (명시적 선택 필요)
        if (gs?.currentScreen === 'reward') {
          console.log('[ESC Key] Reward screen - ignored (explicit selection required)');
          return;
        }
        console.log('[ESC Key] Ignored - not in game or help open');
      }

      const isInGame = window.GS?.currentScreen === 'game' || window.GS?.combat?.active === true;

      if ((e.key === '?' || e.key === '/') && isInGame) {
        e.preventDefault();
        self.toggleHelp(deps);
      }

      if ((e.key === 'd' || e.key === 'D') && isInGame && !_helpOpen) {
        const modal = doc.getElementById('deckViewModal');
        if (modal?.classList.contains('active')) {
          if (typeof deps.closeDeckView === 'function') deps.closeDeckView();
        } else if (typeof deps.showDeckView === 'function') {
          deps.showDeckView();
        }
      }

      if ((e.key === 'e' || e.key === 'E') && isInGame && window.GS?.combat?.active && window.GS?.combat?.playerTurn) {
        if (typeof deps.useEchoSkill === 'function') deps.useEchoSkill();
      }

      if (e.key === 'Enter' && isInGame && window.GS?.combat?.active && window.GS?.combat?.playerTurn) {
        e.preventDefault();
        if (typeof deps.endPlayerTurn === 'function') deps.endPlayerTurn();
      }

      if (isInGame && window.GS?.combat?.active && window.GS?.combat?.playerTurn) {
        const numKey = e.key === '0' ? 10 : parseInt(e.key, 10);
        if (!isNaN(numKey) && numKey >= 1 && numKey <= 10) {
          const idx = numKey - 1;
          if (window.GS?.player?.hand?.[idx] && typeof window.GS?.playCard === 'function') {
            window.GS.playCard(window.GS.player.hand[idx], idx);
          }
        }
      }

      if (e.key === 'Tab' && isInGame && window.GS?.combat?.active && window.GS?.combat?.playerTurn) {
        e.preventDefault();
        const enemies = window.GS?.combat?.enemies;
        const aliveIndices = enemies.map((enemy, idx) => enemy.hp > 0 ? idx : -1).filter(idx => idx >= 0);
        if (aliveIndices.length > 1) {
          const cur = aliveIndices.indexOf(window.GS._selectedTarget ?? -1);
          window.GS._selectedTarget = aliveIndices[(cur + 1) % aliveIndices.length];
          if (typeof window.GS?.addLog === 'function') {
            window.GS.addLog(`🎯 타겟: ${enemies[window.GS._selectedTarget].name}`, 'system');
          }
          if (typeof deps.renderCombatEnemies === 'function') {
            deps.renderCombatEnemies();
          }
        }
      }
    });
  },
};
