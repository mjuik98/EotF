const DEFAULT_TITLE_DISCLOSURE_STATE = Object.freeze({
  archiveExpanded: false,
  saveManagementExpanded: false,
});

let titleDisclosureState = {
  ...DEFAULT_TITLE_DISCLOSURE_STATE,
};

function syncDisclosure(button, panel, expanded, copy) {
  if (button) {
    button.textContent = expanded ? copy.collapse : copy.expand;
    if (button.dataset) button.dataset.expanded = expanded ? 'true' : 'false';
    button.setAttribute?.('aria-expanded', expanded ? 'true' : 'false');
  }

  if (panel) {
    panel.hidden = !expanded;
    if (panel.dataset) panel.dataset.expanded = expanded ? 'true' : 'false';
  }
}

function bindDisclosureToggle(doc, button, panel, stateKey, copy) {
  if (!button || !panel) return;

  if (button.__titleDisclosureHandler && typeof button.removeEventListener === 'function') {
    button.removeEventListener('click', button.__titleDisclosureHandler);
  }

  const handler = () => {
    titleDisclosureState = {
      ...titleDisclosureState,
      [stateKey]: !titleDisclosureState[stateKey],
    };
    syncTitleDisclosurePanels(doc);
  };

  button.__titleDisclosureHandler = handler;
  button.addEventListener?.('click', handler);
}

export function resetTitleDisclosurePanelStateForTests() {
  titleDisclosureState = {
    ...DEFAULT_TITLE_DISCLOSURE_STATE,
  };
}

export function syncTitleDisclosurePanels(doc) {
  const archiveBtn = doc?.getElementById?.('titleArchiveToggleBtn') || null;
  const archivePanel = doc?.getElementById?.('titleRunArchive') || null;
  syncDisclosure(archiveBtn, archivePanel, titleDisclosureState.archiveExpanded, {
    expand: '기록 펼치기',
    collapse: '기록 접기',
  });

  const saveBtn = doc?.getElementById?.('titleSaveManageToggleBtn') || null;
  const savePanel = doc?.getElementById?.('titleSaveActionPanel') || null;
  syncDisclosure(saveBtn, savePanel, titleDisclosureState.saveManagementExpanded, {
    expand: '관리 열기',
    collapse: '관리 접기',
  });
}

export function bindTitleDisclosurePanels(doc) {
  const archiveBtn = doc?.getElementById?.('titleArchiveToggleBtn') || null;
  const archivePanel = doc?.getElementById?.('titleRunArchive') || null;
  bindDisclosureToggle(doc, archiveBtn, archivePanel, 'archiveExpanded', {
    expand: '기록 펼치기',
    collapse: '기록 접기',
  });

  const saveBtn = doc?.getElementById?.('titleSaveManageToggleBtn') || null;
  const savePanel = doc?.getElementById?.('titleSaveActionPanel') || null;
  bindDisclosureToggle(doc, saveBtn, savePanel, 'saveManagementExpanded', {
    expand: '관리 열기',
    collapse: '관리 접기',
  });
  syncTitleDisclosurePanels(doc);
}
