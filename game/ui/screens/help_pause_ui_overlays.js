import { getKeybindingCode, keyCodeToLabel } from './help_pause_ui_helpers.js';

function appendTextNode(doc, parent, tagName, textContent, styleText) {
  const el = doc.createElement(tagName);
  if (styleText) el.style.cssText = styleText;
  el.textContent = textContent;
  parent.appendChild(el);
  return el;
}

export function createMobileWarning(doc, onContinue) {
  const warn = doc.createElement('div');
  warn.id = 'mobileWarn';
  warn.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:9999;backdrop-filter:blur(8px);padding:24px;text-align:center;';

  appendTextNode(doc, warn, 'div', '⚠️', 'font-size:48px');
  appendTextNode(doc, warn, 'div', 'PC 환경 권장', "font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);");

  const body = doc.createElement('div');
  body.style.cssText = "font-family:'Crimson Pro',serif;font-size:15px;color:var(--text);max-width:320px;line-height:1.7;";
  body.innerHTML = '이 게임은 키보드와 마우스 조작 환경에 최적화되어 있습니다.<br>세로 모드 또는 모바일에서는 일부 UI가 불편할 수 있습니다.';
  warn.appendChild(body);

  const btn = doc.createElement('button');
  btn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,var(--echo),var(--echo-bright));border:none;border-radius:8px;padding:12px 28px;cursor:pointer;margin-top:8px;";
  btn.textContent = '그래도 계속하기';
  btn.onclick = onContinue;
  warn.appendChild(btn);

  return warn;
}

export function createHelpMenu(doc, deps, onClose) {
  const menu = doc.createElement('div');
  menu.id = 'helpMenu';
  menu.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;z-index:12000;animation:fadeIn 0.3s ease both;backdrop-filter:blur(8px);';

  appendTextNode(doc, menu, 'div', '컨트롤 안내', "font-family:'Cinzel Decorative',serif;font-size:28px;font-weight:900;color:var(--white);margin-bottom:12px;");

  const grid = doc.createElement('div');
  grid.style.cssText = 'background:rgba(16,16,46,0.85);border:1px solid var(--border);border-radius:16px;padding:24px 40px;display:grid;grid-template-columns:1fr 1.2fr;gap:12px 40px;max-width:600px;width:90%;';

  const keyRows = [
    [keyCodeToLabel(getKeybindingCode('pause', 'Escape')), '일시정지 (창 닫기)'],
    [keyCodeToLabel(getKeybindingCode('deckView', 'KeyD')), '덱 보기'],
    [keyCodeToLabel(getKeybindingCode('help', 'Slash')), '도움말 열기'],
    [keyCodeToLabel(getKeybindingCode('echoSkill', 'KeyE')), '잔향 스킬 발동 (전투 중)'],
    [keyCodeToLabel(getKeybindingCode('drawCard', 'KeyQ')), '카드 드로우 (전투 중)'],
    [keyCodeToLabel(getKeybindingCode('endTurn', 'Enter')), '턴 종료 (전투 중)'],
    ['1 - 0', '손패 카드 빠른 사용'],
    [keyCodeToLabel(getKeybindingCode('nextTarget', 'Tab')), '다음 적 대상 전환'],
  ];

  keyRows.forEach(([keyLabel, description]) => {
    const keyBox = doc.createElement('div');
    keyBox.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:11px;font-weight:bold;color:var(--white);background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:4px;padding:2px 8px;text-align:center;min-width:40px;height:fit-content;box-shadow:0 2px 0 rgba(0,0,0,0.3);";
    keyBox.textContent = keyLabel;

    const valBox = doc.createElement('div');
    valBox.style.cssText = 'font-size:15px;color:var(--text);display:flex;align-items:center;';
    valBox.textContent = description;
    grid.append(keyBox, valBox);
  });

  menu.appendChild(grid);
  appendTextNode(doc, menu, 'div', '잔향 등급: 30 = 1단계 | 60 = 2단계 | 100 = 3단계', "margin-top:12px;font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--text-dim);");

  const btn = doc.createElement('button');
  btn.className = 'action-btn action-btn-secondary';
  btn.style.marginTop = '16px';
  btn.innerHTML = '닫기<span class="kbd-hint">ESC</span>';
  btn.onclick = onClose;
  menu.appendChild(btn);

  return menu;
}

export function createAbandonConfirm(doc, onCancel, onConfirm) {
  const confirmEl = doc.createElement('div');
  confirmEl.id = 'abandonConfirm';
  confirmEl.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.96);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:12100;animation:fadeIn 0.2s ease;backdrop-filter:blur(12px);';

  appendTextNode(doc, confirmEl, 'div', '경고', "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--danger);opacity:0.8;");
  appendTextNode(doc, confirmEl, 'div', '런을 포기하시겠습니까?', "font-family:'Cinzel Decorative',serif;font-size:28px;font-weight:900;color:var(--white);");

  const body = doc.createElement('div');
  body.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:15px;color:var(--text-dim);text-align:center;max-width:320px;line-height:1.7;";
  body.innerHTML = '현재 런의 모든 진행이 초기화됩니다.<br>세계의 기억과 조각은 보존됩니다.';
  confirmEl.appendChild(body);

  const btns = doc.createElement('div');
  btns.style.display = 'flex';
  btns.style.gap = '12px';

  const backBtn = doc.createElement('button');
  backBtn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--echo);background:rgba(123,47,255,0.1);border:1px solid var(--border);border-radius:6px;padding:12px 24px;cursor:pointer;";
  backBtn.textContent = '계속하기';
  backBtn.onclick = onCancel;

  const quitBtn = doc.createElement('button');
  quitBtn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,#ff3366,#cc2244);border:none;border-radius:6px;padding:12px 24px;cursor:pointer;box-shadow:0 4px 16px rgba(255,51,102,0.4);";
  quitBtn.textContent = '포기한다';
  quitBtn.onclick = onConfirm;

  btns.append(backBtn, quitBtn);
  confirmEl.appendChild(btns);
  return confirmEl;
}

export function createReturnTitleConfirm(doc, onCancel, onConfirm) {
  const confirmEl = doc.createElement('div');
  confirmEl.id = 'returnTitleConfirm';
  confirmEl.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.96);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:12100;animation:fadeIn 0.2s ease;backdrop-filter:blur(12px);';

  appendTextNode(doc, confirmEl, 'div', '확인', "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--text-dim);opacity:0.85;");
  appendTextNode(doc, confirmEl, 'div', '처음 화면으로 돌아가시겠습니까?', "font-family:'Cinzel Decorative',serif;font-size:28px;font-weight:900;color:var(--white);");

  const body = doc.createElement('div');
  body.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:15px;color:var(--text-dim);text-align:center;max-width:340px;line-height:1.7;";
  body.innerHTML = '현재 진행 상황이 저장되고 타이틀로 돌아갑니다.<br>다음에 이어하기로 재개할 수 있습니다.';
  confirmEl.appendChild(body);

  const btns = doc.createElement('div');
  btns.style.display = 'flex';
  btns.style.gap = '12px';

  const backBtn = doc.createElement('button');
  backBtn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--echo);background:rgba(123,47,255,0.1);border:1px solid var(--border);border-radius:6px;padding:12px 24px;cursor:pointer;";
  backBtn.textContent = '취소';
  backBtn.onclick = onCancel;

  const okBtn = doc.createElement('button');
  okBtn.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,#5a6cff,#3a4bff);border:none;border-radius:6px;padding:12px 24px;cursor:pointer;box-shadow:0 4px 16px rgba(90,108,255,0.35);";
  okBtn.textContent = '처음으로';
  okBtn.onclick = onConfirm;

  btns.append(backBtn, okBtn);
  confirmEl.appendChild(btns);
  return confirmEl;
}

function createSliderRow(doc, deps, label, id, handler) {
  const row = doc.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:15px;';

  appendTextNode(doc, row, 'span', label, "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.15em;color:var(--text-dim);width:45px;");

  const input = doc.createElement('input');
  input.type = 'range';
  input.id = id;
  input.min = '0';
  input.max = '100';
  input.oninput = (e) => handler(e.target.value);

  const val = doc.createElement('span');
  val.id = `${id}Val`;
  val.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:13px;color:var(--white);width:40px;text-align:right;";

  const currentVol = (deps.audioEngine || globalThis.AudioEngine)?.getVolumes?.() || {};
  let initialV = 0;
  if (id === 'volMasterSlider') initialV = Math.round((currentVol.master ?? 0.35) * 100);
  else if (id === 'volSfxSlider') initialV = Math.round((currentVol.sfx ?? 0.7) * 100);
  else if (id === 'volAmbientSlider') initialV = Math.round((currentVol.ambient ?? 0.4) * 100);

  input.value = initialV;
  if (typeof input.style?.setProperty === 'function') {
    input.style.setProperty('--fill-percent', `${initialV}%`);
  }
  val.textContent = `${initialV}%`;

  row.append(input, val);
  return row;
}

export function createPauseMenu(doc, gs, deps, callbacks) {
  const menu = doc.createElement('div');
  menu.id = 'pauseMenu';
  menu.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;z-index:12000;animation:fadeIn 0.3s ease both;backdrop-filter:blur(8px);';

  appendTextNode(doc, menu, 'div', '일시정지', "font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.5em;color:var(--text-dim);");
  appendTextNode(doc, menu, 'div', '일시정지', "font-family:'Cinzel Decorative',serif;font-size:48px;font-weight:900;color:var(--white);text-shadow:0 0 20px rgba(255,255,255,0.2);");

  const mainBtns = doc.createElement('div');
  mainBtns.style.cssText = 'display:flex;flex-direction:column;gap:12px;width:280px;';

  const resBtn = doc.createElement('button');
  resBtn.style.cssText = "font-family:'Cinzel',serif;font-size:16px;letter-spacing:0.2em;color:var(--echo);background:rgba(123,47,255,0.12);border:1px solid var(--border);border-radius:8px;padding:16px;cursor:pointer;";
  resBtn.textContent = '계속하기';
  resBtn.onclick = callbacks.onResume;

  const midRow = doc.createElement('div');
  midRow.style.display = 'flex';
  midRow.style.gap = '8px';

  const deckBtn = doc.createElement('button');
  deckBtn.style.cssText = "flex:1;font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.15em;color:var(--white);background:rgba(255,255,255,0.08);border:1px solid var(--border);border-radius:8px;padding:14px;cursor:pointer;";
  deckBtn.textContent = '덱 보기';
  deckBtn.onclick = callbacks.onOpenDeck;

  const codexBtn = doc.createElement('button');
  codexBtn.style.cssText = "flex:1;font-family:'Cinzel',serif;font-size:13px;letter-spacing:0.15em;color:var(--white);background:rgba(255,255,255,0.08);border:1px solid var(--border);border-radius:8px;padding:14px;cursor:pointer;";
  codexBtn.textContent = '도감';
  codexBtn.onclick = callbacks.onOpenCodex;
  midRow.append(deckBtn, codexBtn);

  const settingsBtn = doc.createElement('button');
  settingsBtn.style.cssText = "font-family:'Cinzel',serif;font-size:15px;letter-spacing:0.2em;color:var(--white);background:rgba(255,255,255,0.08);border:1px solid var(--border);border-radius:8px;padding:16px;cursor:pointer;width:100%;";
  settingsBtn.textContent = '환경 설정';
  settingsBtn.onclick = callbacks.onOpenSettings;

  const helpBtn = doc.createElement('button');
  helpBtn.style.cssText = "font-family:'Cinzel',serif;font-size:15px;letter-spacing:0.2em;color:var(--cyan);background:rgba(0,255,204,0.08);border:1px solid rgba(0,255,204,0.3);border-radius:8px;padding:16px;cursor:pointer;";
  helpBtn.textContent = '컨트롤 안내 (?)';
  helpBtn.onclick = callbacks.onOpenHelp;

  const abandonBtn = doc.createElement('button');
  abandonBtn.style.cssText = "font-family:'Cinzel',serif;font-size:15px;letter-spacing:0.2em;color:var(--danger);background:rgba(255,51,102,0.1);border:1px solid rgba(255,51,102,0.3);border-radius:8px;padding:16px;cursor:pointer;";
  abandonBtn.textContent = '런 포기하기';
  abandonBtn.onclick = callbacks.onAbandon;

  const startBtn = doc.createElement('button');
  startBtn.style.cssText = "font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:14px;cursor:pointer;";
  startBtn.textContent = '처음으로';
  startBtn.onclick = callbacks.onReturnToTitle;

  const quitBtn = doc.createElement('button');
  quitBtn.style.cssText = "font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.2em;color:var(--danger);background:rgba(255,51,102,0.05);border:1px solid rgba(255,51,102,0.2);border-radius:8px;padding:14px;cursor:pointer;margin-top:4px;";
  quitBtn.textContent = '게임 종료';
  quitBtn.onclick = callbacks.onQuitGame;

  mainBtns.append(resBtn, midRow, settingsBtn, helpBtn, abandonBtn, startBtn, quitBtn);
  menu.appendChild(mainBtns);

  const volPanel = doc.createElement('div');
  volPanel.style.cssText = 'display:flex;flex-direction:column;gap:16px;margin-top:12px;background:rgba(255,255,255,0.03);padding:20px;border-radius:12px;width:280px;';
  volPanel.append(
    createSliderRow(doc, deps, 'MASTER', 'volMasterSlider', callbacks.onSetMasterVolume),
    createSliderRow(doc, deps, 'SFX', 'volSfxSlider', callbacks.onSetSfxVolume),
    createSliderRow(doc, deps, 'BGM', 'volAmbientSlider', callbacks.onSetAmbientVolume),
  );
  menu.appendChild(volPanel);

  appendTextNode(
    doc,
    menu,
    'div',
    `총 ${gs.meta.runCount}회차 | 지역 ${gs.currentRegion + 1} | ${gs.currentFloor}층 | 스토리 조각 ${gs.meta.storyPieces.length}/10`,
    "font-family:'Share Tech Mono',monospace;font-size:13px;color:var(--text-dim);text-align:center;",
  );

  return menu;
}
