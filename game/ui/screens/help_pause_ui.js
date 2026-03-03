let _helpOpen = false;
let _pauseOpen = false;
let _hotkeysBound = false;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _isInGame(gs) {
  // game 화면이거나 combat 활성 상태면 게임 내 상태로 간주
  return gs?.currentScreen === 'game' || gs?.combat?.active === true;
}

function _isVisibleModal(el, doc) {
  if (!el) return false;
  if (el.classList?.contains('active')) return true;

  const inlineDisplay = String(el.style?.display || '').trim().toLowerCase();
  if (inlineDisplay === 'none') return false;
  if (inlineDisplay) return true;

  const view = doc?.defaultView || globalThis;
  if (typeof view?.getComputedStyle !== 'function') return true;
  return view.getComputedStyle(el).display !== 'none';
}

export const HelpPauseUI = {
  isHelpOpen() {
    return _helpOpen;
  },

  showMobileWarning(deps = {}) {
    const doc = _getDoc(deps);
    const isMobile = globalThis.innerWidth < 900 || 'ontouchstart' in globalThis;
    if (!isMobile || doc.getElementById('mobileWarn')) return;

    const warn = doc.createElement('div');
    warn.id = 'mobileWarn';
    warn.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:9999;backdrop-filter:blur(8px);padding:24px;text-align:center;';
    const icon = doc.createElement('div'); icon.style.fontSize = '48px'; icon.textContent = '⚠️';
    const head = doc.createElement('div'); head.style.cssText = "font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);"; head.textContent = 'PC 환경 권장';
    const body = doc.createElement('div'); body.style.cssText = "font-family:'Crimson Pro',serif;font-size:15px;color:var(--text);max-width:320px;line-height:1.7;";
    body.innerHTML = '이 게임은 키보드와 마우스 조작 환경에 최적화되어 있습니다.<br>세로 모드 또는 모바일에서는 일부 UI가 불편할 수 있습니다.';
    const btn = doc.createElement('button'); btn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,var(--echo),var(--echo-bright));border:none;border-radius:8px;padding:12px 28px;cursor:pointer;margin-top:8px;";
    btn.textContent = '그래도 계속하기';
    btn.onclick = () => warn.remove();

    warn.append(icon, head, body, btn);
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
      const head = doc.createElement('div');
      head.style.cssText = "font-family:'Cinzel Decorative',serif;font-size:28px;font-weight:900;color:var(--white);margin-bottom:12px;";
      head.textContent = '컨트롤 안내';

      const grid = doc.createElement('div');
      grid.style.cssText = 'background:rgba(16,16,46,0.85);border:1px solid var(--border);border-radius:16px;padding:24px 40px;display:grid;grid-template-columns:1fr 1.2fr;gap:12px 40px;max-width:600px;width:90%;';

      [
        ['ESC', '일시정지 (창 닫기)'],
        ['D', '덱 보기'],
        ['?', '도움말 열기'],
        ['E', 'Echo 스킬 발동 (전투 중)'],
        ['Q', '카드 뽑기 (전투 중)'],
        ['Enter', '턴 종료 (전투 중)'],
        ['1 - 0', '손패 카드 빠른 사용'],
        ['Tab', '다음 적 대상 전환'],
      ].forEach(([k, v]) => {
        const keyBox = doc.createElement('div');
        keyBox.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:11px;font-weight:bold;color:var(--white);background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:4px;padding:2px 8px;text-align:center;min-width:40px;height:fit-content;box-shadow: 0 2px 0 rgba(0,0,0,0.3);";
        keyBox.textContent = k;
        const valBox = doc.createElement('div');
        valBox.style.cssText = 'font-size:15px;color:var(--text);display:flex;align-items:center;';
        valBox.textContent = v;
        grid.append(keyBox, valBox);
      });

      const subInfo = doc.createElement('div');
      subInfo.style.cssText = "margin-top:12px;font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--text-dim);";
      subInfo.textContent = 'Echo tiers: 30 = Tier 1 | 60 = Tier 2 | 100 = Tier 3';

      const btn = doc.createElement('button');
      btn.className = 'action-btn action-btn-secondary';
      btn.style.marginTop = '16px';
      btn.innerHTML = '닫기<span class="kbd-hint">ESC</span>';
      btn.onclick = () => this.toggleHelp(deps);

      menu.append(head, grid, subInfo, btn);
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
    const eyebrow = doc.createElement('div');
    eyebrow.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--danger);opacity:0.8;";
    eyebrow.textContent = '경고';

    const head = doc.createElement('div');
    head.style.cssText = "font-family:'Cinzel Decorative',serif;font-size:28px;font-weight:900;color:var(--white);";
    head.textContent = '런을 포기하시겠습니까?';

    const body = doc.createElement('div');
    body.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:15px;color:var(--text-dim);text-align:center;max-width:320px;line-height:1.7;";
    body.innerHTML = '현재 런의 모든 진행이 초기화됩니다.<br>세계의 기억과 조각은 보존됩니다.';

    const btns = doc.createElement('div');
    btns.style.display = 'flex'; btns.style.gap = '12px';

    const backBtn = doc.createElement('button');
    backBtn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--echo);background:rgba(123,47,255,0.1);border:1px solid var(--border);border-radius:6px;padding:12px 24px;cursor:pointer;";
    backBtn.textContent = '계속하기';
    backBtn.onclick = () => confirmEl.remove();

    const quitBtn = doc.createElement('button');
    quitBtn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,#ff3366,#cc2244);border:none;border-radius:6px;padding:12px 24px;cursor:pointer;box-shadow:0 4px 16px rgba(255,51,102,0.4);";
    quitBtn.textContent = '포기한다';
    quitBtn.onclick = () => this.confirmAbandon(deps);

    btns.append(backBtn, quitBtn);
    confirmEl.append(eyebrow, head, body, btns);
    doc.body.appendChild(confirmEl);
  },

  confirmReturnToTitle(deps = {}) {
    const doc = _getDoc(deps);
    const old = doc.getElementById('returnTitleConfirm');
    if (old) {
      old.remove();
      return;
    }

    const confirmEl = doc.createElement('div');
    confirmEl.id = 'returnTitleConfirm';
    confirmEl.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.96);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:2000;animation:fadeIn 0.2s ease;backdrop-filter:blur(12px);';

    const eyebrow = doc.createElement('div');
    eyebrow.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--text-dim);opacity:0.85;";
    eyebrow.textContent = '확인';

    const head = doc.createElement('div');
    head.style.cssText = "font-family:'Cinzel Decorative',serif;font-size:28px;font-weight:900;color:var(--white);";
    head.textContent = '처음 화면으로 돌아가시겠습니까?';

    const body = doc.createElement('div');
    body.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:15px;color:var(--text-dim);text-align:center;max-width:340px;line-height:1.7;";
    body.innerHTML = '현재 진행 중인 런은 종료됩니다.<br>실수 클릭 방지를 위해 한 번 더 확인합니다.';

    const btns = doc.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '12px';

    const backBtn = doc.createElement('button');
    backBtn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--echo);background:rgba(123,47,255,0.1);border:1px solid var(--border);border-radius:6px;padding:12px 24px;cursor:pointer;";
    backBtn.textContent = '취소';
    backBtn.onclick = () => confirmEl.remove();

    const okBtn = doc.createElement('button');
    okBtn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,#5a6cff,#3a4bff);border:none;border-radius:6px;padding:12px 24px;cursor:pointer;box-shadow:0 4px 16px rgba(90,108,255,0.35);";
    okBtn.textContent = '처음으로';
    okBtn.onclick = () => {
      confirmEl.remove();
      location.reload();
    };

    btns.append(backBtn, okBtn);
    confirmEl.append(eyebrow, head, body, btns);
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

    // Bug fix: 월드 메모리 힌트 구성
    const wmEl = doc.getElementById('deathWorldMemory');
    if (wmEl) {
      const wm = gs.worldMemory || gs.meta?.worldMemory || {};
      const hints = [];
      if ((wm.savedMerchant || 0) > 0) hints.push(`🛒 상인을 구함 ×${wm.savedMerchant}`);
      if (wm.stoleFromMerchant) hints.push('상인에게서 물건을 훔쳤다');
      if (wm['killed_ancient_echo']) hints.push(`💀 태고의 잔향 처치 ×${wm['killed_ancient_echo']}`);
      if (wm['killed_void_herald']) hints.push(`🕳️ 파멸의 전령 처치 ×${wm['killed_void_herald']}`);
      if (wm['killed_memory_sovereign']) hints.push(`👑 기억의 군주 처치 ×${wm['killed_memory_sovereign']}`);
      const storyCount = gs.meta?.storyPieces?.length || 0;
      if (storyCount > 0) hints.push(`📜 스토리 조각 ${storyCount}/10 획득`);

      wmEl.textContent = '';

      if (hints.length) {
        const hTitle = doc.createElement('div');
        hTitle.style.cssText = "font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.3em;color:var(--text-dim);width:100%;text-align:center;margin-bottom:6px;";
        hTitle.textContent = 'World Memory';
        wmEl.appendChild(hTitle);
        hints.forEach(h => {
          const badge = doc.createElement('span');
          badge.className = 'wm-badge';
          badge.textContent = h;
          wmEl.appendChild(badge);
        });
      }
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
      const eyebrow = doc.createElement('div');
      eyebrow.style.cssText = "font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.5em;color:var(--text-dim);";
      eyebrow.textContent = '일시정지';

      const head = doc.createElement('div');
      head.style.cssText = "font-family:'Cinzel Decorative',serif;font-size:48px;font-weight:900;color:var(--white);text-shadow:0 0 20px rgba(255,255,255,0.2);";
      head.textContent = 'PAUSED';

      const mainBtns = doc.createElement('div');
      mainBtns.style.cssText = 'display:flex;flex-direction:column;gap:12px;width:280px;';

      const resBtn = doc.createElement('button');
      resBtn.style.cssText = "font-family:'Cinzel',serif;font-size:16px;letter-spacing:0.2em;color:var(--echo);background:rgba(123,47,255,0.12);border:1px solid var(--border);border-radius:8px;padding:16px;cursor:pointer;";
      resBtn.textContent = '계속하기';
      resBtn.onclick = () => this.togglePause(deps);

      const midRow = doc.createElement('div'); midRow.style.display = 'flex'; midRow.style.gap = '8px';
      const deckBtn = doc.createElement('button');
      deckBtn.style.cssText = "flex:1;font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.15em;color:var(--white);background:rgba(255,255,255,0.08);border:1px solid var(--border);border-radius:8px;padding:14px;cursor:pointer;";
      deckBtn.textContent = '덱 보기';
      deckBtn.onclick = () => { if (typeof deps.showDeckView === 'function') deps.showDeckView(); this.togglePause(deps); };
      const codexBtn = doc.createElement('button');
      codexBtn.style.cssText = "flex:1;font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.15em;color:var(--white);background:rgba(255,255,255,0.08);border:1px solid var(--border);border-radius:8px;padding:14px;cursor:pointer;";
      codexBtn.textContent = '도감';
      codexBtn.onclick = () => { if (typeof deps.openCodex === 'function') deps.openCodex(); this.togglePause(deps); };
      midRow.append(deckBtn, codexBtn);

      const helpBtn = doc.createElement('button');
      helpBtn.style.cssText = "font-family:'Cinzel',serif;font-size:15px;letter-spacing:0.2em;color:var(--cyan);background:rgba(0,255,204,0.08);border:1px solid rgba(0,255,204,0.3);border-radius:8px;padding:16px;cursor:pointer;";
      helpBtn.textContent = '컨트롤 안내 (?)';
      helpBtn.onclick = () => { this.toggleHelp(deps); this.togglePause(deps); };

      const abnBtn = doc.createElement('button');
      abnBtn.style.cssText = "font-family:'Cinzel',serif;font-size:15px;letter-spacing:0.2em;color:var(--danger);background:rgba(255,51,102,0.1);border:1px solid rgba(255,51,102,0.3);border-radius:8px;padding:16px;cursor:pointer;";
      abnBtn.textContent = '런 포기하기';
      abnBtn.onclick = () => this.abandonRun(deps);

      const startBtn = doc.createElement('button');
      startBtn.style.cssText = "font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:14px;cursor:pointer;";
      startBtn.textContent = '처음으로';
      startBtn.onclick = () => this.confirmReturnToTitle(deps);

      const quitBtn = doc.createElement('button');
      quitBtn.style.cssText = "font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.2em;color:var(--danger);background:rgba(255,51,102,0.05);border:1px solid rgba(255,51,102,0.2);border-radius:8px;padding:14px;cursor:pointer;margin-top:4px;";
      quitBtn.textContent = '게임 종료';
      quitBtn.onclick = () => { if (typeof deps.quitGame === 'function') deps.quitGame(); };

      mainBtns.append(resBtn, midRow, helpBtn, abnBtn, startBtn, quitBtn);

      const volPanel = doc.createElement('div');
      volPanel.style.cssText = 'display:flex;flex-direction:column;gap:16px;margin-top:12px;background:rgba(255,255,255,0.03);padding:20px;border-radius:12px;width:280px;';

      const createSliderRow = (label, id, handler) => {
        const row = doc.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:15px;';
        const lbl = doc.createElement('span'); lbl.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.15em;color:var(--text-dim);width:45px;"; lbl.textContent = label;
        const input = doc.createElement('input'); input.type = 'range'; input.id = id; input.min = '0'; input.max = '100'; input.oninput = (e) => handler(e.target.value);
        const val = doc.createElement('span'); val.id = `${id}Val`; val.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:13px;color:var(--white);width:40px;text-align:right;";
        // 초기값 설정
        const currentVol = (deps.audioEngine || globalThis.AudioEngine)?.getVolumes?.() || {};
        let initialV = 0;
        if (id === 'volMasterSlider') initialV = Math.round((currentVol.master ?? 0.35) * 100);
        else if (id === 'volSfxSlider') initialV = Math.round((currentVol.sfx ?? 0.7) * 100);
        else if (id === 'volAmbientSlider') initialV = Math.round((currentVol.ambient ?? 0.4) * 100);
        input.value = initialV;
        input.style.setProperty('--fill-percent', initialV + '%');
        val.textContent = initialV + '%';
        row.append(lbl, input, val);
        return row;
      };

      volPanel.append(
        createSliderRow('MASTER', 'volMasterSlider', (v) => { if (typeof deps.setMasterVolume === 'function') deps.setMasterVolume(v); }),
        createSliderRow('SFX', 'volSfxSlider', (v) => { if (typeof deps.setSfxVolume === 'function') deps.setSfxVolume(v); }),
        createSliderRow('BGM', 'volAmbientSlider', (v) => { if (typeof deps.setAmbientVolume === 'function') deps.setAmbientVolume(v); })
      );

      const info = doc.createElement('div');
      info.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:13px;color:var(--text-dim);text-align:center;";
      // The info element already uses textContent with a template literal, which is a safe method.
      info.textContent = `총 ${gs.meta.runCount}회차 | 지역 ${gs.currentRegion + 1} | ${gs.currentFloor}층 | 스토리 조각 ${gs.meta.storyPieces.length}/10`;

      menu.append(eyebrow, head, mainBtns, volPanel, info);
      doc.body.appendChild(menu);
      if (typeof deps._syncVolumeUI === 'function') deps._syncVolumeUI();
    } else {
      // 硫붾돱 ?쒓굅
      if (menu) menu.remove();
    }
  },

  bindGlobalHotkeys(deps = {}) {
    const doc = _getDoc(deps);

    // ?대? 諛붿씤?⑸맂 寃쎌슦 以묐났 諛⑹?
    if (_hotkeysBound) {
      return;
    }
    _hotkeysBound = true;

    const self = this;

    doc.addEventListener('keydown', e => {
      // deps를 통해 현재 상태를 직접 참조
      const gs = deps.gs;

      // ESC: 일시정지 또는 모달 닫기
      if (e.key === 'Escape') {
        const battleChronicle = doc.getElementById('battleChronicleOverlay');
        if (_isVisibleModal(battleChronicle, doc)) {
          if (typeof deps.closeBattleChronicle === 'function') {
            deps.closeBattleChronicle();
          } else if (globalThis.GAME?.API?.closeBattleChronicle) {
            globalThis.GAME.API.closeBattleChronicle();
          }
          return;
        }

        const returnTitleConfirm = doc.getElementById('returnTitleConfirm');
        if (returnTitleConfirm) {
          returnTitleConfirm.remove();
          return;
        }

        const abandonConfirm = doc.getElementById('abandonConfirm');
        if (abandonConfirm) {
          abandonConfirm.remove();
          return;
        }

        const helpMenu = doc.getElementById('helpMenu');
        if (helpMenu && helpMenu.style.display !== 'none') {
          this.toggleHelp(deps);
          return; // Exit early if help menu was handled
        }

        const isInGame = gs?.currentScreen === 'game' || gs?.combat?.active === true || gs?.currentScreen === 'reward';
        const isTitle = gs?.currentScreen === 'title';

        // 도감 및 기타 모달이 열려 있으면 먼저 닫기
        const deckModal = doc.getElementById('deckViewModal');
        const codexModal = doc.getElementById('codexModal');
        const runSettingsModal = doc.getElementById('runSettingsModal');

        // 덱 모달 확인
        if (_isVisibleModal(deckModal, doc)) {
          if (typeof deps.closeDeckView === 'function') deps.closeDeckView();
          return;
        }

        // 도감 모달 확인
        if (_isVisibleModal(codexModal, doc)) {
          if (typeof deps.closeCodex === 'function') deps.closeCodex();
          return;
        }

        // 런 설정 모달 확인
        if (_isVisibleModal(runSettingsModal, doc)) {
          if (typeof deps.closeRunSettings === 'function') deps.closeRunSettings();
          return;
        }

        // 전투 중이거나 게임 화면이면 일시정지 토글
        if (isInGame && !self.isHelpOpen()) {
          self.togglePause(deps);
          return;
        }

        // 타이틀 화면에서는 무시 (타이틀 메뉴가 별도 존재)
        if (isTitle) {
          return;
        }

        // 보상 화면에서도 일시정지 메뉴 사용 허용
      }

      const isInGame = gs?.currentScreen === 'game' || gs?.combat?.active === true || gs?.currentScreen === 'reward';

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

      if ((e.key === 'e' || e.key === 'E') && isInGame && gs?.combat?.active && gs?.combat?.playerTurn) {
        if (typeof deps.useEchoSkill === 'function') deps.useEchoSkill();
      }

      if ((e.key === 'q' || e.key === 'Q') && isInGame && gs?.combat?.active && gs?.combat?.playerTurn) {
        e.preventDefault();
        if (typeof deps.drawCard === 'function') deps.drawCard();
        // 카드 뽑기 버튼 시각적 효과
        if (deps.buttonFeedback) {
          deps.buttonFeedback.triggerDrawButton();
        }
      }

      if (e.key === 'Enter' && isInGame && gs?.combat?.active && gs?.combat?.playerTurn) {
        e.preventDefault();
        if (typeof deps.endPlayerTurn === 'function') deps.endPlayerTurn();
      }

      if (isInGame && gs?.combat?.active && gs?.combat?.playerTurn) {
        const numKey = e.key === '0' ? 10 : parseInt(e.key, 10);
        if (!isNaN(numKey) && numKey >= 1 && numKey <= 10) {
          const idx = numKey - 1;
          if (gs?.player?.hand?.[idx] && typeof gs?.playCard === 'function') {
            gs.playCard(gs.player.hand[idx], idx);
          }
        }
      }

      if (e.key === 'Tab' && isInGame && gs?.combat?.active && gs?.combat?.playerTurn) {
        e.preventDefault();
        const enemies = gs?.combat?.enemies;
        const aliveIndices = enemies.map((enemy, idx) => enemy.hp > 0 ? idx : -1).filter(idx => idx >= 0);
        if (aliveIndices.length > 1) {
          const cur = aliveIndices.indexOf(gs._selectedTarget ?? -1);
          gs._selectedTarget = aliveIndices[(cur + 1) % aliveIndices.length];
          if (typeof gs?.addLog === 'function') {
            gs.addLog(`🎯 대상: ${enemies[gs._selectedTarget].name}`, 'system');
          }
          if (typeof deps.renderCombatEnemies === 'function') {
            deps.renderCombatEnemies();
          }
        }
      }
    });
  },
};
