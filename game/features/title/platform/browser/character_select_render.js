export function renderCharacterDots(dotsRow, chars, selectedIndex, onJumpTo) {
  if (!dotsRow) return;

  const current = chars[selectedIndex];
  dotsRow.style.width = '100%';
  dotsRow.style.display = 'flex';
  dotsRow.style.justifyContent = 'center';
  dotsRow.style.gap = '7px';
  dotsRow.style.marginTop = '12px';
  dotsRow.innerHTML = chars.map((_, i) => `
    <button class="dot" data-i="${i}"
      style="width:${i === selectedIndex ? '24px' : '8px'};background:${i === selectedIndex ? current.accent : '#151520'};
      box-shadow:${i === selectedIndex ? `0 0 12px ${current.accent}66` : 'none'};cursor:${i === selectedIndex ? 'default' : 'pointer'}"></button>`
  ).join('');

  dotsRow.querySelectorAll('.dot').forEach((btn) => {
    const i = parseInt(btn.dataset.i, 10);
    const applyHoverState = () => {
      if (i !== selectedIndex) btn.style.background = '#3a3a55';
    };
    const clearHoverState = () => {
      if (i !== selectedIndex) btn.style.background = '#151520';
    };
    btn.addEventListener('mouseenter', applyHoverState);
    btn.addEventListener('mouseleave', clearHoverState);
    btn.addEventListener('focus', applyHoverState);
    btn.addEventListener('blur', clearHoverState);
    btn.addEventListener('click', () => onJumpTo(i));
  });
}

export function renderCharacterButtons(buttonsRow, selectedChar, onHover, onConfirm) {
  if (!buttonsRow) return;

  buttonsRow.style.setProperty('--char-accent', selectedChar.accent);
  buttonsRow.style.setProperty('--char-color', selectedChar.color);
  buttonsRow.innerHTML = `
    <div class="char-confirm-wrap">
      <button id="btnCfm" class="char-confirm-btn" type="button">잔향 선택 · ${selectedChar.name}</button>
    </div>`;

  const confirmButton = buttonsRow.querySelector('#btnCfm') || buttonsRow.children?.[0]?.querySelector?.('#btnCfm');
  if (!confirmButton) return;
  confirmButton.addEventListener('mouseenter', onHover);
  confirmButton.addEventListener('focus', onHover);
  confirmButton.addEventListener('click', onConfirm);
}

export function updateCharacterArrows(resolveById, accent) {
  ['btnLeft', 'btnRight'].forEach((id) => {
    const button = resolveById(id);
    if (!button) return;
    button.style.border = `1px solid ${accent}44`;
    button.style.background = `${accent}08`;
    button.style.boxShadow = `0 0 16px ${accent}22`;
    button.style.color = accent;
  });
}
