export function getDoc(deps) {
  return deps?.doc || deps?.win?.document || null;
}

export function getWin(deps) {
  return deps?.win || deps?.doc?.defaultView || null;
}

export function setText(doc, id, value) {
  const el = doc.getElementById(id);
  if (el) el.textContent = value;
}

export function clearSavePreview(doc) {
  setText(doc, 'sttClass', '-');
  setText(doc, 'sttFloor', '-');
  setText(doc, 'sttAscension', '-');
  setText(doc, 'sttHp', '- / -');
  setText(doc, 'sttGold', '0');
  setText(doc, 'titleContinueMeta', '');

  const pillsEl = doc.getElementById('sttDeckPills');
  if (pillsEl) pillsEl.innerHTML = '';

  const relicsEl = doc.getElementById('sttRelics');
  if (relicsEl) relicsEl.innerHTML = '';
}

export function populateSaveTooltip(doc, saveSystem, gs) {
  try {
    const saveLoaded = saveSystem?.loadRun?.({ gs });
    if (!saveLoaded || !gs?.player) return;

    const player = gs.player;
    const classNames = {
      swordsman: '검사',
      mage: '마법사',
      rogue: '도적',
      paladin: '성기사',
    };

    const className = classNames[player.class] || player.class || '-';
    setText(doc, 'sttClass', className);
    setText(doc, 'sttFloor', `${gs.currentFloor || 1}층 · ${gs.currentRegion || 0}구역`);
    setText(doc, 'sttAscension', `A${gs.meta?.runConfig?.ascension ?? 0}`);
    setText(doc, 'sttHp', `${player.hp ?? '-'} / ${player.maxHp ?? '-'}`);
    setText(doc, 'sttGold', `${player.gold ?? 0}`);
    setText(doc, 'titleContinueMeta', `${gs.currentFloor || 1}층 · ${className} · A${gs.meta?.runConfig?.ascension ?? 0}`);

    const pillsEl = doc.getElementById('sttDeckPills');
    if (pillsEl) {
      const deckSize = Array.isArray(player.deck) ? player.deck.length : 0;
      pillsEl.innerHTML = [
        `<span class="title-stt-pill title-stt-pill--attack">덱 ${deckSize}장</span>`,
        `<span class="title-stt-pill title-stt-pill--skill">손패 ${player.hand?.length || 0}장</span>`,
      ].join('');
    }

    const relicsEl = doc.getElementById('sttRelics');
    if (relicsEl) {
      const items = Array.isArray(player.items) ? player.items.slice(0, 6) : [];
      relicsEl.innerHTML = items.map((item) => {
        const title = item?.name || item?.id || '';
        const icon = item?.icon || '★';
        return `<span class="title-stt-relic" title="${title}">${icon}</span>`;
      }).join('');
    }
  } catch (error) {
    console.warn('[GameBootUI] Save tooltip populate failed:', error);
  }
}

export function refreshTitleSaveState(doc, saveSystem, gs) {
  const hasSave = saveSystem?.hasSave?.() ?? false;
  const continueWrap = doc.getElementById('titleContinueWrap');
  const menuDivider = doc.getElementById('titleMenuDivider');
  const continueBtn = doc.getElementById('mainContinueBtn');

  if (continueWrap) continueWrap.style.display = hasSave ? 'block' : 'none';
  if (menuDivider) menuDivider.style.display = hasSave ? 'block' : 'none';
  if (continueBtn) continueBtn.disabled = !hasSave;

  if (hasSave) {
    populateSaveTooltip(doc, saveSystem, gs);
  } else {
    clearSavePreview(doc);
  }

  return hasSave;
}
