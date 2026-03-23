function createNullGeneralTooltipApi() {
  return {
    hideGeneralTooltip() {},
    showGeneralTooltip() {},
  };
}

function createNullCardTooltipApi() {
  return {
    hideTooltip() {},
    showTooltip() {},
  };
}

function bindTabInteractions(panel, hover) {
  const tabButtons = panel.querySelectorAll('.char-info-tab');
  const tabPanes = panel.querySelectorAll('.char-info-pane');
  const activateTab = (tabName) => {
    tabButtons.forEach((btn) => {
      const active = btn.dataset.tab === tabName;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    tabPanes.forEach((pane) => pane.classList.toggle('is-active', pane.dataset.pane === tabName));
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('is-active')) hover?.();
      activateTab(btn.dataset.tab);
    });
  });
}

function bindEchoBadge(panel, selectedChar, hover, echo, openModal) {
  const echoBadge = panel.querySelector('#echoBadge');
  if (!echoBadge) return;

  echoBadge.addEventListener('mouseenter', () => {
    hover?.();
    echoBadge.style.borderColor = `${selectedChar.accent}aa`;
    echoBadge.style.background = `linear-gradient(135deg,${selectedChar.accent}1e,${selectedChar.color}1a)`;
    echoBadge.style.boxShadow = `0 0 16px ${selectedChar.accent}33`;
  });
  echoBadge.addEventListener('mouseleave', () => {
    echoBadge.style.borderColor = `${selectedChar.accent}44`;
    echoBadge.style.background = `linear-gradient(135deg,${selectedChar.accent}0e,${selectedChar.color}08)`;
    echoBadge.style.boxShadow = 'none';
  });
  echoBadge.addEventListener('click', () => {
    echo?.();
    openModal?.(selectedChar.echoSkill, selectedChar.accent);
  });
}

function bindRelicTooltips(panel, generalTooltip, doc, win, hover) {
  const relicBadges = typeof panel.querySelectorAll === 'function'
    ? Array.from(panel.querySelectorAll('.relic-inner') || [])
    : [];
  const fallbackRelicBadge = relicBadges.length === 0 ? panel.querySelector('.relic-inner') : null;

  (fallbackRelicBadge ? [fallbackRelicBadge] : relicBadges).forEach((relicBadge) => {
    if (!relicBadge) return;
    relicBadge.addEventListener('mouseenter', (event) => {
      hover?.();
      generalTooltip.showGeneralTooltip(
        event,
        relicBadge.dataset.relicTitle || '',
        relicBadge.dataset.relicDesc || '',
        { doc, win },
      );
    });
    relicBadge.addEventListener('mouseleave', () => generalTooltip.hideGeneralTooltip({ doc, win }));
  });
}

function bindDeckCardTooltips(panel, cardTooltip, cards, hover) {
  const mockGs = { getBuff: () => null, player: { echoChain: 0 } };
  panel.querySelectorAll('.deck-card').forEach((element) => {
    element.addEventListener('mouseenter', (event) => {
      hover?.();
      cardTooltip.showTooltip(event, element.dataset.cid, { data: { cards }, gs: mockGs });
    });
    element.addEventListener('mouseleave', () => cardTooltip.hideTooltip());
  });
}

function bindLoadoutControls({
  panel,
  selectedChar,
  loadoutState,
  onSaveLoadoutPreset,
  onClearLoadoutPreset,
}) {
  let level11Mode = loadoutState.initialLevel11Mode;
  let selectedLevel11UpgradeIndex = loadoutState.initialLevel11UpgradeIndex;
  let selectedLevel11SwapIndex = loadoutState.initialLevel11SwapIndex;
  let selectedLevel11AddCardId = '';

  const level11ModeUpgrade = panel.querySelector('#level11ModeUpgrade');
  const level11ModeSwap = panel.querySelector('#level11ModeSwap');
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
      element.style.borderColor = selected
        ? `${selectedChar.accent}99`
        : (selectable ? `${selectedChar.accent}44` : `${selectedChar.accent}1a`);
      element.style.background = selected
        ? `${selectedChar.accent}12`
        : (selectable ? `${selectedChar.accent}08` : `${selectedChar.accent}05`);
      element.style.boxShadow = selected
        ? `0 0 0 1px ${selectedChar.accent}66 inset, 0 6px 14px rgba(0, 0, 0, 0.16)`
        : 'none';
      element.setAttribute('aria-pressed', selected ? 'true' : 'false');
      const stateBadge = typeof element.querySelector === 'function' ? element.querySelector('.level11-card-state') : null;
      if (stateBadge) {
        stateBadge.textContent = selected ? (level11Mode === 'swap' ? '교체 대상' : '강화 예정') : '';
        stateBadge.style.display = selected ? 'inline-flex' : 'none';
      }
    });
  };

  const applyLevel11ModeVisuals = () => {
    if (level11ModeUpgrade) {
      level11ModeUpgrade.style.borderColor = level11Mode === 'upgrade' ? `${selectedChar.accent}66` : 'rgba(255,255,255,0.14)';
      level11ModeUpgrade.style.background = level11Mode === 'upgrade' ? `${selectedChar.accent}14` : 'rgba(255,255,255,0.04)';
      level11ModeUpgrade.style.color = level11Mode === 'upgrade' ? selectedChar.accent : '#d5ddf2';
    }
    if (level11ModeSwap) {
      level11ModeSwap.style.borderColor = level11Mode === 'swap' ? `${selectedChar.accent}66` : 'rgba(255,255,255,0.14)';
      level11ModeSwap.style.background = level11Mode === 'swap' ? `${selectedChar.accent}14` : 'rgba(255,255,255,0.04)';
      level11ModeSwap.style.color = level11Mode === 'swap' ? selectedChar.accent : '#d5ddf2';
    }
    if (level11SelectionNote) {
      level11SelectionNote.textContent = level11Mode === 'swap'
        ? '교체할 카드를 선택한 뒤 추가 카드를 골라 저장하세요.'
        : '강화할 카드를 선택한 뒤 저장하세요.';
    }
    level11AddCardButtons.forEach((button) => {
      const active = button.dataset.level11AddCardId === selectedLevel11AddCardId;
      button.style.borderColor = active ? `${selectedChar.accent}66` : 'rgba(255,255,255,0.14)';
      button.style.background = active ? `${selectedChar.accent}14` : 'rgba(255,255,255,0.04)';
      button.style.color = active ? selectedChar.accent : '#d5ddf2';
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

export function bindCharacterInfoPanelInteractions({
  panel,
  selectedChar,
  cards,
  generalTooltipUI,
  cardTooltipUI,
  doc,
  win,
  hover,
  echo,
  openModal,
  loadoutState,
  onSaveLoadoutPreset,
  onClearLoadoutPreset,
} = {}) {
  const generalTooltip = generalTooltipUI || createNullGeneralTooltipApi();
  const cardTooltip = cardTooltipUI || createNullCardTooltipApi();
  generalTooltip.hideGeneralTooltip({ doc, win });

  bindTabInteractions(panel, hover);
  bindEchoBadge(panel, selectedChar, hover, echo, openModal);
  bindRelicTooltips(panel, generalTooltip, doc, win, hover);
  bindDeckCardTooltips(panel, cardTooltip, cards, hover);
  bindLoadoutControls({
    panel,
    selectedChar,
    loadoutState,
    onSaveLoadoutPreset,
    onClearLoadoutPreset,
  });
}
