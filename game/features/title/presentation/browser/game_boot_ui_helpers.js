import { getDoc as getRuntimeDoc, getWin as getRuntimeWin } from '../../../ui/ports/public_dom_support_capabilities.js';

export function getDoc(deps) {
  return getRuntimeDoc(deps);
}

export function getWin(deps) {
  return getRuntimeWin(deps);
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

function resolvePreviewSaveState(preview) {
  return preview?.saveState === 'queued' ? 'queued' : 'saved';
}

function resolveRunPreview(saveSystem, gs) {
  const preview = saveSystem?.readRunPreview?.();
  if (preview?.player) return preview;

  const saveLoaded = saveSystem?.loadRun?.({ gs });
  if (!saveLoaded || !gs?.player) return null;
  return gs;
}

function resolvePreviewAscension(preview, gs) {
  const savedAscension = preview?.meta?.runConfig?.ascension;
  if (savedAscension !== undefined && savedAscension !== null) {
    return savedAscension;
  }
  return gs?.meta?.runConfig?.ascension ?? 0;
}

export function populateSaveTooltip(doc, saveSystem, gs) {
  try {
    const preview = resolveRunPreview(saveSystem, gs);
    if (!preview?.player) return false;

    const player = preview.player;
    const saveState = resolvePreviewSaveState(preview);
    const classNames = {
      swordsman: '검사',
      mage: '마법사',
      rogue: '도적',
      paladin: '성기사',
    };

    const className = classNames[player.class] || player.class || '-';
    const ascension = resolvePreviewAscension(preview, gs);
    const queuedSuffix = saveState === 'queued' ? ' · 복구 대기' : '';
    setText(doc, 'sttClass', className);
    setText(doc, 'sttFloor', `${preview.currentFloor || 1}층 · ${preview.currentRegion || 0}구역`);
    setText(doc, 'sttAscension', `A${ascension}`);
    setText(doc, 'sttHp', `${player.hp ?? '-'} / ${player.maxHp ?? '-'}`);
    setText(doc, 'sttGold', `${player.gold ?? 0}`);
    setText(doc, 'titleContinueMeta', `${preview.currentFloor || 1}층 · ${className} · A${ascension}${queuedSuffix}`);

    const pillsEl = doc.getElementById('sttDeckPills');
    if (pillsEl) {
      const deckSize = Array.isArray(player.deck) ? player.deck.length : 0;
      const pills = [
        `<span class="title-stt-pill title-stt-pill--attack">덱 ${deckSize}장</span>`,
        `<span class="title-stt-pill title-stt-pill--skill">손패 ${player.hand?.length || 0}장</span>`,
      ];
      if (saveState === 'queued') {
        pills.unshift('<span class="title-stt-pill title-stt-pill--queued">복구 대기</span>');
      }
      pillsEl.innerHTML = pills.join('');
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

    return true;
  } catch (error) {
    console.warn('[GameBootUI] Save tooltip populate failed:', error);
    return false;
  }
}

export function refreshTitleSaveState(doc, saveSystem, gs) {
  saveSystem?.flushOutbox?.();
  let hasSave = saveSystem?.hasSave?.() ?? false;
  const continueWrap = doc.getElementById('titleContinueWrap');
  const menuDivider = doc.getElementById('titleMenuDivider');
  const continueBtn = doc.getElementById('mainContinueBtn');

  if (hasSave) {
    hasSave = populateSaveTooltip(doc, saveSystem, gs);
  }

  if (continueWrap) continueWrap.style.display = hasSave ? 'block' : 'none';
  if (menuDivider) menuDivider.style.display = hasSave ? 'block' : 'none';
  if (continueBtn) continueBtn.disabled = !hasSave;

  if (!hasSave) {
    clearSavePreview(doc);
  }

  return hasSave;
}
