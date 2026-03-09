function createNullGeneralTooltipApi() {
  return {
    hideGeneralTooltip() {},
    showGeneralTooltip() {},
  };
}

function createNullCardTooltipApi() {
  return {
    hideTooltip() {},
    showTooltip() {},
  };
}

export function renderCharacterInfoPanel({
  panel,
  selectedChar,
  classProgress,
  roadmap,
  buildSectionLabel,
  buildRadar,
  cards,
  generalTooltipUI,
  cardTooltipUI,
  doc,
  win,
  hover,
  echo,
  openModal,
} = {}) {
  if (!panel || !selectedChar || !classProgress) return;

  const generalTooltip = generalTooltipUI || createNullGeneralTooltipApi();
  const cardTooltip = cardTooltipUI || createNullCardTooltipApi();
  generalTooltip.hideGeneralTooltip({ doc, win });

  const rel = selectedChar.startRelic;
  const roadmapRows = (roadmap || []).map((row) => {
    const earned = row.lv <= classProgress.level;
    const current = row.lv === classProgress.level + 1;
    const classes = ['csm-roadmap-row', earned ? 'earned' : '', current ? 'current' : ''].filter(Boolean).join(' ');
    return `
      <div class="${classes}">
        <span class="csm-roadmap-lv">Lv.${row.lv}</span>
        <span class="csm-roadmap-icon">${row.icon}</span>
        <span class="csm-roadmap-desc">${row.desc}</span>
      </div>
    `;
  }).join('');
  const progressPct = Math.round(classProgress.progress * 100);
  const echoSkill = selectedChar.echoSkill;

  panel.style.setProperty('--char-accent', selectedChar.accent);
  panel.style.setProperty('--char-color', selectedChar.color);
  panel.innerHTML = `
    <div class="char-info-shell">
      <div class="char-info-tabs" role="tablist" aria-label="캐릭터 상세">
        <button class="char-info-tab is-active" type="button" role="tab" aria-selected="true" data-tab="mastery">
          마스터리 + 특성
        </button>
        <button class="char-info-tab" type="button" role="tab" aria-selected="false" data-tab="loadout">
          스탯 + 시작 장비
        </button>
      </div>
      <div class="char-info-body">
        <section class="char-info-pane is-active" data-pane="mastery" role="tabpanel">
          <div class="csm-mastery-panel" style="border-color:${selectedChar.accent}2f;background:${selectedChar.accent}0a;">
            <div class="csm-mastery-head">
              <div>
                <div class="csm-mastery-title" style="color:${selectedChar.accent}">CLASS MASTERY</div>
                <div class="csm-mastery-level">${classProgress.nextLevelXp === null ? 'MAX' : `Lv.${classProgress.level}`}</div>
              </div>
              <div class="csm-mastery-xp">
                ${classProgress.nextLevelXp === null ? 'MAX LEVEL' : `${classProgress.totalXp} / ${classProgress.nextLevelXp} XP`}
              </div>
            </div>
            <div class="csm-mastery-bar">
              <div class="csm-mastery-fill" style="width:${progressPct}%;background:${selectedChar.accent};box-shadow:0 0 10px ${selectedChar.accent}55"></div>
            </div>
            <details class="csm-roadmap-details">
              <summary class="csm-roadmap-summary">마스터리 로드맵</summary>
              <div class="csm-roadmap">${roadmapRows}</div>
            </details>
          </div>

          <div class="char-info-block" style="border-color:${selectedChar.accent}22;background:${selectedChar.accent}06;">
            ${buildSectionLabel('고유 특성', selectedChar.accent)}
            <p class="char-info-heading" style="color:${selectedChar.accent}">${selectedChar.traitTitle}</p>
            <p class="char-info-text">${selectedChar.traitDesc}</p>
          </div>

          <div class="char-info-block">
            ${buildSectionLabel('에코 스킬', selectedChar.accent)}
            <button id="echoBadge" class="echo-badge char-echo-badge" style="background:linear-gradient(135deg,${selectedChar.accent}0e,${selectedChar.color}08);border:1px solid ${selectedChar.accent}44;">
              <div class="char-echo-icon" style="border-color:${selectedChar.accent}55;background:${selectedChar.accent}14;">${echoSkill.icon}</div>
              <div class="char-echo-copy">
                <div class="char-echo-name" style="color:${selectedChar.accent}">${echoSkill.name}</div>
                <div class="char-echo-desc">${echoSkill.desc}</div>
              </div>
              <div class="char-echo-cost" style="border-color:${selectedChar.accent}33;color:${selectedChar.accent}99;background:${selectedChar.accent}0a;">${echoSkill.echoCost}</div>
            </button>
          </div>
        </section>

        <section class="char-info-pane" data-pane="loadout" role="tabpanel">
          <div class="char-loadout-grid">
            <div class="char-info-block">
              ${buildSectionLabel('스탯', selectedChar.accent)}
              <div class="char-radar-wrap">${buildRadar(selectedChar.stats, selectedChar.accent, null, 210)}</div>
            </div>

            <div class="char-info-block">
              ${buildSectionLabel('시작 유물', selectedChar.accent)}
              <div class="relic-wrap">
                <div class="relic-inner" style="border:1px solid ${selectedChar.accent}33;background:${selectedChar.accent}08;padding:10px 16px">
                  <span style="font-size:24px">${rel.icon}</span>
                  <div>
                    <div style="font-size:13px;color:${selectedChar.accent};font-family:'Share Tech Mono',monospace;letter-spacing:.5px">${rel.name}</div>
                    <div style="font-size:11px;color:${selectedChar.accent}66;font-family:'Share Tech Mono',monospace">유물</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="char-info-block">
            ${buildSectionLabel('시작 덱', selectedChar.accent)}
            <div class="char-start-deck">${selectedChar.startDeck.map((cardId) => {
              const card = cards?.[cardId] || { name: cardId };
              return `<span class="deck-card" data-cid="${cardId}" style="border:1px solid ${selectedChar.accent}1a;padding:4px 10px;font-size:11px;background:${selectedChar.accent}05;cursor:help">${card.name}</span>`;
            }).join('')}</div>
          </div>
        </section>
      </div>
    </div>`;

  const tabButtons = panel.querySelectorAll('.char-info-tab');
  const tabPanes = panel.querySelectorAll('.char-info-pane');
  const activateTab = (tabName) => {
    tabButtons.forEach((btn) => {
      const active = btn.dataset.tab === tabName;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    tabPanes.forEach((pane) => pane.classList.toggle('is-active', pane.dataset.pane === tabName));
  };
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('is-active')) hover?.();
      activateTab(btn.dataset.tab);
    });
  });

  const echoBadge = panel.querySelector('#echoBadge');
  if (echoBadge) {
    echoBadge.addEventListener('mouseenter', () => {
      hover?.();
      echoBadge.style.borderColor = `${selectedChar.accent}aa`;
      echoBadge.style.background = `linear-gradient(135deg,${selectedChar.accent}1e,${selectedChar.color}1a)`;
      echoBadge.style.boxShadow = `0 0 16px ${selectedChar.accent}33`;
    });
    echoBadge.addEventListener('mouseleave', () => {
      echoBadge.style.borderColor = `${selectedChar.accent}44`;
      echoBadge.style.background = `linear-gradient(135deg,${selectedChar.accent}0e,${selectedChar.color}08)`;
      echoBadge.style.boxShadow = 'none';
    });
    echoBadge.addEventListener('click', () => {
      echo?.();
      openModal?.(selectedChar.echoSkill, selectedChar.accent);
    });
  }

  const relicBadge = panel.querySelector('.relic-inner');
  if (relicBadge) {
    const relicTitle = `${rel.icon} ${rel.name}`;
    relicBadge.addEventListener('mouseenter', (event) => {
      hover?.();
      generalTooltip.showGeneralTooltip(event, relicTitle, rel.desc, { doc, win });
    });
    relicBadge.addEventListener('mouseleave', () => generalTooltip.hideGeneralTooltip({ doc, win }));
  }

  const mockGs = { getBuff: () => null, player: { echoChain: 0 } };
  panel.querySelectorAll('.deck-card').forEach((element) => {
    element.addEventListener('mouseenter', (event) => {
      hover?.();
      cardTooltip.showTooltip(event, element.dataset.cid, { data: { cards }, gs: mockGs });
    });
    element.addEventListener('mouseleave', () => cardTooltip.hideTooltip());
  });
}

export function renderCharacterPhase({
  state,
  selectedChar,
  resolveById,
  stopTyping,
  rerender,
  onStart,
  timers = globalThis,
} = {}) {
  const overlay = resolveById?.('phaseOverlay');
  const circle = resolveById?.('phaseCircle');
  const content = resolveById?.('phaseContent');
  if (!overlay) return;

  overlay.className = '';
  if (state?.phase === 'select') {
    overlay.style.display = 'none';
    return;
  }

  if (state?.phase === 'burst') {
    overlay.style.display = 'flex';
    overlay.className = 'burst';
    circle.style.background = `radial-gradient(circle,${selectedChar.accent}55 0%,${selectedChar.color}22 35%,transparent 60%)`;
    circle.style.width = '0';
    circle.style.height = '0';
    content.innerHTML = '';
    timers.setTimeout?.(() => {
      circle.style.width = '250vw';
      circle.style.height = '250vw';
    }, 20);
    return;
  }

  if (state?.phase !== 'done') return;

  overlay.style.display = 'flex';
  overlay.className = 'done';
  circle.style.width = '250vw';
  circle.style.height = '250vw';
  circle.style.background = `radial-gradient(circle,${selectedChar.accent}55 0%,${selectedChar.color}22 35%,transparent 60%)`;
  content.innerHTML = `
    <div style="font-size:clamp(60px,12vw,100px);margin-bottom:15px;filter:drop-shadow(0 0 60px ${selectedChar.glow});animation:float 3s ease-in-out infinite">${selectedChar.emoji}</div>
    <p style="font-size:11px;letter-spacing:8px;color:#889;font-family:'Share Tech Mono',monospace;margin:0 0 8px">YOUR HERO</p>
    <h2 style="font-size:clamp(32px,7vw,58px);font-weight:900;letter-spacing:6px;margin:0 0 6px;text-shadow:0 0 60px ${selectedChar.glow};color:#fff">${selectedChar.name}</h2>
    <p style="font-size:14px;letter-spacing:6px;color:${selectedChar.accent};font-family:'Share Tech Mono',monospace;margin:0 0 8px">${selectedChar.title}</p>
    <p style="font-size:13px;color:#aaa;font-family:'Share Tech Mono',monospace;margin:0 0 20px;letter-spacing:2px">고유 특성 · ${selectedChar.traitName}</p>
    <div id="typedArea" style="font-size:clamp(12px,1.5vw,16px);color:#ddd;line-height:2.1;font-family:'Crimson Pro',serif;letter-spacing:.3px;min-height:7em;margin-bottom:30px;white-space:pre-line"></div>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:15px">${selectedChar.tags.map((tag) => `<span style="padding:4px 16px;border:1px solid ${selectedChar.accent}44;border-radius:24px;font-size:12px;color:${selectedChar.accent};font-family:'Share Tech Mono',monospace;background:${selectedChar.accent}0e">${tag}</span>`).join('')}</div>
    <p style="font-size:13px;color:#ccc;font-family:'Share Tech Mono',monospace;margin:0 0 30px">시작 유물: ${selectedChar.startRelic.icon} ${selectedChar.startRelic.name}</p>
    <div style="display:flex;gap:20px;justify-content:center;margin-top:15px;">
      <button id="btnResel" style="padding:12px 32px;border:1px solid rgba(255,255,255,0.2);border-radius:4px;background:transparent;color:#99a;font-size:12px;letter-spacing:4px;font-family:'Cinzel',serif;cursor:pointer;transition:all .2s">다시 선택</button>
      <button id="btnRealStart" style="padding:12px 48px;border:1px solid ${selectedChar.accent}55;border-radius:4px;background:linear-gradient(135deg,${selectedChar.color}55,${selectedChar.color}22);color:#fff;font-size:14px;letter-spacing:5px;font-family:'Cinzel',serif;cursor:pointer;box-shadow:0 0 30px ${selectedChar.accent}33;transition:all .2s">여정 시작</button>
    </div>`;

  stopTyping?.();
  let index = 0;
  const storyText = selectedChar.story;
  state.typingTimer = timers.setInterval?.(() => {
    const typedArea = resolveById?.('typedArea');
    if (!typedArea) {
      stopTyping?.();
      return;
    }
    index += 1;
    typedArea.innerHTML = storyText.slice(0, index).replace(/\n/g, '<br>') + `<span style="animation:blink 1s step-end infinite;color:${selectedChar.accent}">▌</span>`;
    if (index >= storyText.length) stopTyping?.();
  }, 55);

  const reselectButton = resolveById?.('btnResel');
  if (reselectButton) {
    reselectButton.addEventListener('mouseenter', () => {
      reselectButton.style.color = '#ccc';
      reselectButton.style.borderColor = '#555';
    });
    reselectButton.addEventListener('mouseleave', () => {
      reselectButton.style.color = '#333';
      reselectButton.style.borderColor = '#1a1a28';
    });
    reselectButton.addEventListener('click', () => {
      state.phase = 'select';
      stopTyping?.();
      rerender?.();
    });
  }

  const startButton = resolveById?.('btnRealStart');
  if (startButton) {
    startButton.addEventListener('mouseenter', () => {
      startButton.style.boxShadow = `0 0 40px ${selectedChar.accent}66`;
      startButton.style.background = `linear-gradient(135deg,${selectedChar.color}77,${selectedChar.color}44)`;
    });
    startButton.addEventListener('mouseleave', () => {
      startButton.style.boxShadow = `0 0 20px ${selectedChar.accent}33`;
      startButton.style.background = `linear-gradient(135deg,${selectedChar.color}55,${selectedChar.color}22)`;
    });
    startButton.addEventListener('click', onStart);
  }
}
