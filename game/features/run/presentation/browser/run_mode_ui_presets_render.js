import {
  escapeAttr,
  getActiveInscriptionCount,
  getEarnedInscriptionCount,
  getPresetSlots,
} from './run_mode_ui_helpers.js';

export function renderPresets(ui, doc, cfg, meta, runRules) {
  const zone = doc.getElementById('rmPresetZone');
  if (!zone) return;

  const slots = getPresetSlots(meta);
  const selectedSlot = Math.max(0, Math.min(3, Number(ui._selectedPresetSlot) || 0));
  const selectedPreset = slots[selectedSlot]?.preset || null;
  const saveLabel = selectedPreset ? '현재 설정으로 덮어쓰기' : '+ 현재 설정 저장';
  zone.innerHTML = `
    <div class="rm-presets-wrap">
      <div class="rm-preset-bar">
        <div class="rm-preset-bar-label">프리셋</div>
        <div class="rm-preset-slot-group" role="tablist" aria-label="프리셋 슬롯">
          ${slots.map(({ index, preset }) => `
            <button
              type="button"
              class="rm-preset-slot-btn${index === selectedSlot ? ' active' : ''}${preset ? '' : ' empty'}"
              data-action="select-preset-slot"
              data-slot="${index}"
              role="tab"
              aria-selected="${index === selectedSlot ? 'true' : 'false'}"
              aria-label="${preset ? `프리셋 ${index + 1} 불러오기: ${preset.name || `프리셋 ${index + 1}`}` : `비어 있는 프리셋 슬롯 ${index + 1}`}"
            >${index + 1}</button>
          `).join('')}
        </div>
        <button type="button" class="rm-preset-save-btn" data-action="save-preset" data-slot="${selectedSlot}">
          ${saveLabel}
        </button>
      </div>
      <div class="rm-preset-inline-meta">${selectedPreset ? `
          <span class="rm-preset-inline-slot">슬롯 ${selectedSlot + 1}</span>
          <span class="rm-preset-inline-name">${selectedPreset.name || `프리셋 ${selectedSlot + 1}`}</span>
          <span class="rm-preset-inline-desc">
            A${selectedPreset.config?.ascension || 0}
            / ${selectedPreset.config?.endless ? '무한' : '일반'}
            / ${runRules?.curses?.[selectedPreset.config?.curse]?.name || '저주 없음'}
            / 각인 ${Array.isArray(selectedPreset.config?.disabledInscriptions)
              ? Math.max(0, getEarnedInscriptionCount(meta) - selectedPreset.config.disabledInscriptions.length)
              : getActiveInscriptionCount(meta, selectedPreset.config || {})}
          </span>
          <div class="rm-preset-actions">
            <button type="button" class="rm-preset-btn primary" data-action="load-preset" data-slot="${selectedSlot}">
              불러오기
            </button>
            <button type="button" class="rm-preset-btn" data-action="save-preset" data-slot="${selectedSlot}">
              현재 설정으로 덮어쓰기
            </button>
            <button type="button" class="rm-preset-btn subtle" data-action="delete-preset" data-slot="${selectedSlot}">
              삭제
            </button>
          </div>
        ` : `
          <span class="rm-preset-inline-slot empty">슬롯 ${selectedSlot + 1}</span>
          <span class="rm-preset-inline-name empty">빈 슬롯</span>
          <span class="rm-preset-inline-desc empty">이 슬롯을 선택한 뒤 현재 설정을 저장할 수 있습니다.</span>
        `}
      </div>
    </div>
  `;
}

export function renderPresetDialog(ui, doc, deps = {}) {
  const existing = doc.getElementById('rmPresetDialog');
  existing?.remove();

  const state = ui._presetDialog;
  if (!state?.open) return;

  const overlay = doc.createElement('div');
  overlay.id = 'rmPresetDialog';
  overlay.className = 'rm-preset-dialog-backdrop';
  const overwriteCopy = state.overwrite
    ? `<div class="rm-preset-dialog-desc">슬롯 ${state.slot + 1}의 ${escapeAttr(state.existingName || state.name || `프리셋 ${state.slot + 1}`)}을 현재 승천, 모드, 저주, 각인 설정으로 갱신합니다.</div>
      <div class="rm-preset-dialog-desc">기존 프리셋을 덮어씁니다. 이름을 바꾸면 같은 슬롯에서 새 이름으로 저장됩니다.</div>`
    : `<div class="rm-preset-dialog-desc">슬롯 ${state.slot + 1}에 현재 승천, 모드, 저주, 각인 설정을 저장합니다.</div>`;
  overlay.innerHTML = `
    <div class="rm-preset-dialog" role="dialog" aria-modal="true" aria-labelledby="rmPresetDialogTitle">
      <div class="rm-preset-dialog-kicker">프리셋 저장</div>
      <div id="rmPresetDialogTitle" class="rm-preset-dialog-title">${state.overwrite ? '기존 프리셋을 갱신합니다' : '이 구성을 저장합니다'}</div>
      ${overwriteCopy}
      <input id="rmPresetNameInput" class="rm-preset-input" type="text" maxlength="32" value="${escapeAttr(state.name || '')}" placeholder="프리셋 이름" />
      <div class="rm-preset-dialog-actions">
        <button type="button" class="rm-preset-btn subtle" data-action="cancel-preset-save">취소</button>
        <button type="button" class="rm-preset-btn primary" data-action="confirm-preset-save">저장</button>
      </div>
    </div>
  `;

  overlay.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (actionTarget) {
      if (actionTarget.dataset.action === 'cancel-preset-save') {
        ui.closePresetDialog(deps);
        return;
      }
      if (actionTarget.dataset.action === 'confirm-preset-save') {
        ui.confirmPresetSave(deps);
        return;
      }
    }
    if (event.target === overlay) ui.closePresetDialog(deps);
  });

  doc.body.appendChild(overlay);
  const input = doc.getElementById('rmPresetNameInput');
  input?.focus();
  input?.select();
}

export function syncModalMood(doc, cfg) {
  const cursed = !!(cfg?.curse && cfg.curse !== 'none');
  doc.body?.classList?.toggle('run-rules-curse-active', cursed);
  doc.getElementById('runSettingsModal')?.classList?.toggle('cursed', cursed);
  doc.querySelector('#runSettingsModal .run-settings-panel')?.classList?.toggle('cursed', cursed);
}
