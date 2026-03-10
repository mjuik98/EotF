export function renderCombatHudClassSpecial(doc, gs, classMechanics, elementCtor = doc?.defaultView?.HTMLElement || globalThis.HTMLElement) {
  if (!gs || !gs.player || !classMechanics) return;

  const hoverSpecialEl = doc.getElementById('hoverHudSpecial');
  if (!hoverSpecialEl) return;

  const mechanic = classMechanics[gs.player.class];
  hoverSpecialEl.textContent = '';

  if (mechanic) {
    const specialUI = mechanic.getSpecialUI(gs);
    if (elementCtor && specialUI instanceof elementCtor) {
      hoverSpecialEl.appendChild(specialUI);
      return;
    }
    if (typeof specialUI === 'string') {
      hoverSpecialEl.textContent = specialUI;
      return;
    }
  }

  const none = doc.createElement('span');
  none.style.cssText = 'font-size:10px;color:var(--text-dim);font-style:italic;';
  none.textContent = '??곸벉';
  hoverSpecialEl.appendChild(none);
}
