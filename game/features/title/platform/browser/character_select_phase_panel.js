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
