import { getKeybindingCode, keyCodeToLabel } from './help_pause_ui_helpers.js';
import { appendTextNode } from './help_pause_ui_overlay_dom.js';

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
