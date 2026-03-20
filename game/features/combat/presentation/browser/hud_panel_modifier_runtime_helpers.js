export function updateRunModifierPanel({ gs, deps, doc }) {
  const modEl = doc.getElementById('hudRunModifiers');
  if (!modEl) return;

  modEl.textContent = '';
  const runRules = deps.runRules;
  const asc = runRules?.getAscension?.(gs) || 0;
  const endless = runRules?.isEndless?.(gs);

  const topCont = doc.createElement('div');
  topCont.style.cssText = 'display:flex; gap:6px; flex-direction:column;';
  if (asc > 0) {
    const ascDiv = doc.createElement('div');
    ascDiv.style.cssText = "font-family:'Cinzel',serif; font-size:10px; color:var(--danger); letter-spacing:0.1em; background:rgba(255,51,102,0.1); border:1px solid rgba(255,51,102,0.2); border-radius:4px; padding:4px 8px; display:inline-block;";
    ascDiv.textContent = `Ascension ${asc}`;
    topCont.appendChild(ascDiv);
  }
  if (endless) {
    const endDiv = doc.createElement('div');
    endDiv.style.cssText = "font-family:'Cinzel',serif; font-size:10px; color:var(--cyan); letter-spacing:0.1em; background:rgba(0,255,204,0.1); border:1px solid rgba(0,255,204,0.2); border-radius:4px; padding:4px 8px; display:inline-block;";
    endDiv.textContent = 'Endless Mode';
    topCont.appendChild(endDiv);
  }
  modEl.appendChild(topCont);

  const curseId = gs.runConfig?.curse || 'none';
  const disabledInscriptions = new Set(gs.runConfig?.disabledInscriptions || []);
  const activeInscriptions = Object.entries(gs.meta?.inscriptions || {})
    .filter(([, value]) => Number(value) > 0)
    .filter(([id]) => !disabledInscriptions.has(id));

  if (activeInscriptions.length === 0 && curseId === 'none') return;

  const midCont = doc.createElement('div');
  midCont.style.cssText = 'margin-top:4px; display:flex; flex-direction:column; gap:4px;';
  if (activeInscriptions.length > 0) {
    const previewIds = activeInscriptions.slice(0, 3).map(([id]) => id);
    const previewNames = previewIds
      .map((id) => deps.data?.inscriptions?.[id]?.name)
      .filter(Boolean);
    const remaining = activeInscriptions.length - previewNames.length;
    const inscDiv = doc.createElement('div');
    inscDiv.style.cssText = 'font-size:11px; color:var(--echo-bright); background:rgba(123,47,255,0.08); border-radius:4px; padding:3px 8px; border:1px solid rgba(123,47,255,0.15); cursor:help;';
    inscDiv.title = previewNames.join(', ');
    inscDiv.textContent = remaining > 0
      ? `Inscriptions ${activeInscriptions.length}: ${previewNames.join(', ')} +${remaining}`
      : `Inscriptions ${activeInscriptions.length}${previewNames.length ? `: ${previewNames.join(', ')}` : ''}`;
    midCont.appendChild(inscDiv);
  }

  if (curseId !== 'none') {
    const curseInfo = runRules?.curses?.[curseId];
    if (curseInfo) {
      const curseDiv = doc.createElement('div');
      curseDiv.style.cssText = 'font-size:11px; color:var(--danger); background:rgba(255,51,102,0.08); border-radius:4px; padding:3px 8px; border:1px solid rgba(255,51,102,0.15); cursor:help;';
      curseDiv.title = curseInfo.desc;
      curseDiv.textContent = `${curseInfo.name}`;
      midCont.appendChild(curseDiv);
    }
  }

  modEl.appendChild(midCont);
}
