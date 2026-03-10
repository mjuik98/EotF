import { appendTextNode } from './help_pause_ui_overlay_dom.js';

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
