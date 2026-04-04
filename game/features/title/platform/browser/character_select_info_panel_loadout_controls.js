export function bindCharacterInfoLoadoutControls({
  panel,
  selectedChar: _selectedChar,
  loadoutState,
  onSaveLoadoutPreset,
  onClearLoadoutPreset,
  onSelectLoadoutPresetSlot,
}) {
  let level11Mode = loadoutState.initialLevel11Mode;
  let selectedLevel11UpgradeIndex = loadoutState.initialLevel11UpgradeIndex;
  let selectedLevel11SwapIndex = loadoutState.initialLevel11SwapIndex;
  let selectedLevel11AddCardId = '';

  const level11ModeUpgrade = panel.querySelector('#level11ModeUpgrade');
  const level11ModeSwap = panel.querySelector('#level11ModeSwap');
  const slotButtons = Array.from(panel.querySelectorAll('.char-loadout-slot-btn') || []);
  const level11SelectionNote = panel.querySelector('#level11SelectionNote');
  const level11EditableCards = Array.from(panel.querySelectorAll('.level11-edit-card') || []);
  const level11AddCardButtons = Array.from(panel.querySelectorAll('.level11-add-card-btn') || []);
  const saveLevel11Upgrade = panel.querySelector('#saveLevel11Upgrade');
  const saveLevel11Swap = panel.querySelector('#saveLevel11Swap');

  const applyLevel11CardSelectionVisuals = () => {
    level11EditableCards.forEach((element) => {
      const cardIndex = Number(element.dataset.level11Index);
      const selectable = element.dataset.level11Selectable === 'true';
      const selected = level11Mode === 'swap'
        ? cardIndex === selectedLevel11SwapIndex
        : cardIndex === selectedLevel11UpgradeIndex;
      element.classList?.toggle('is-selectable', selectable);
      element.classList?.toggle('is-inactive', !selectable);
      element.classList?.toggle('is-selected', selected);
      element.setAttribute('aria-pressed', selected ? 'true' : 'false');
      const stateBadge = typeof element.querySelector === 'function' ? element.querySelector('.level11-card-state') : null;
      if (stateBadge) {
        stateBadge.textContent = selected ? (level11Mode === 'swap' ? '교체 대상' : '강화 예정') : '';
        stateBadge.classList?.toggle('is-visible', selected);
      }
    });
  };

  slotButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const slotId = String(button.dataset.loadoutSlot || '');
      if (!slotId) return;
      onSelectLoadoutPresetSlot?.(slotId);
    });
  });

  const applyLevel11ModeVisuals = () => {
    if (level11ModeUpgrade) {
      level11ModeUpgrade.classList?.toggle('is-active', level11Mode === 'upgrade');
      level11ModeUpgrade.setAttribute('aria-pressed', level11Mode === 'upgrade' ? 'true' : 'false');
    }
    if (level11ModeSwap) {
      level11ModeSwap.classList?.toggle('is-active', level11Mode === 'swap');
      level11ModeSwap.setAttribute('aria-pressed', level11Mode === 'swap' ? 'true' : 'false');
    }
    if (level11SelectionNote) {
      level11SelectionNote.textContent = level11Mode === 'swap'
        ? '교체할 카드를 선택한 뒤 추가 카드를 골라 저장하세요.'
        : '강화할 카드를 선택한 뒤 저장하세요.';
    }
    level11AddCardButtons.forEach((button) => {
      const active = button.dataset.level11AddCardId === selectedLevel11AddCardId;
      button.classList?.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (saveLevel11Upgrade) saveLevel11Upgrade.disabled = !Number.isInteger(selectedLevel11UpgradeIndex);
    if (saveLevel11Swap) saveLevel11Swap.disabled = !(Number.isInteger(selectedLevel11SwapIndex) && selectedLevel11AddCardId);
    applyLevel11CardSelectionVisuals();
  };

  if (level11ModeUpgrade) {
    level11ModeUpgrade.addEventListener('click', () => {
      level11Mode = 'upgrade';
      applyLevel11ModeVisuals();
    });
  }

  if (level11ModeSwap) {
    level11ModeSwap.addEventListener('click', () => {
      level11Mode = 'swap';
      applyLevel11ModeVisuals();
    });
  }

  level11EditableCards.forEach((element) => {
    element.addEventListener('click', () => {
      if (element.dataset.level11Selectable !== 'true') return;
      const selectedIndex = Number(element.dataset.level11Index);
      if (!Number.isInteger(selectedIndex)) return;
      if (level11Mode === 'swap') selectedLevel11SwapIndex = selectedIndex;
      else selectedLevel11UpgradeIndex = selectedIndex;
      applyLevel11ModeVisuals();
    });
  });

  level11AddCardButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedLevel11AddCardId = String(button.dataset.level11AddCardId || '');
      applyLevel11ModeVisuals();
    });
  });

  applyLevel11ModeVisuals();

  if (saveLevel11Upgrade) {
    saveLevel11Upgrade.addEventListener('click', () => {
      if (Number.isInteger(selectedLevel11UpgradeIndex)) {
        onSaveLoadoutPreset?.({
          slot: 'level11',
          type: 'upgrade',
          targetIndex: selectedLevel11UpgradeIndex,
        });
      }
    });
  }

  if (saveLevel11Swap) {
    saveLevel11Swap.addEventListener('click', () => {
      if (Number.isInteger(selectedLevel11SwapIndex) && selectedLevel11AddCardId) {
        onSaveLoadoutPreset?.({
          slot: 'level11',
          type: 'swap',
          removeIndex: selectedLevel11SwapIndex,
          addCardId: selectedLevel11AddCardId,
        });
      }
    });
  }

  const clearLevel11Preset = panel.querySelector('#clearLevel11Preset');
  if (clearLevel11Preset) {
    clearLevel11Preset.addEventListener('click', () => onClearLoadoutPreset?.('level11'));
  }

  const saveLevel12Preset = panel.querySelector('#saveLevel12Preset');
  if (saveLevel12Preset) {
    saveLevel12Preset.addEventListener('click', () => {
      const bonusRelicId = String(panel.querySelector('#level12BonusRelic')?.value || '');
      if (bonusRelicId) {
        onSaveLoadoutPreset?.({
          slot: 'level12',
          bonusRelicId,
        });
      }
    });
  }

  const clearLevel12Preset = panel.querySelector('#clearLevel12Preset');
  if (clearLevel12Preset) {
    clearLevel12Preset.addEventListener('click', () => onClearLoadoutPreset?.('level12'));
  }
}
