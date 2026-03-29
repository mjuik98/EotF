const RUN_SETTINGS_SHELL_MARKUP = `
<div class="modal-content run-settings-panel gm-modal-panel gm-modal-accent-echo">
  <div class="modal-header gm-modal-header gm-modal-header-row">
    <div class="gm-modal-header-main">
      <div class="modal-title gm-modal-title">런 규칙</div>
    </div>
    <button id="closeRunSettingsBtn" class="gm-close-btn gm-close-btn-icon" aria-label="닫기">✕</button>
  </div>

  <div id="runSettingsBody" class="run-settings-body gm-modal-body">
    <div id="runModePanel" class="run-mode-panel run-settings-modal-panel"></div>

    <div id="inscriptionLayout" class="run-inscription-layout" style="display:none;" data-open="false">
      <div class="run-inscription-layout-header">
        <span class="run-inscription-layout-title">각인 상세 설정</span>
        <button id="toggleAllInscriptionsBtn" class="run-mode-pill" type="button">각인 없이 시작</button>
      </div>
      <div id="inscriptionToggles" class="inscription-toggles-container"></div>
      <div id="inscriptionSynergies" class="active-synergies-row"></div>
    </div>
  </div>
</div>
`.trim();

function resolveDoc(doc = null) {
  if (doc) return doc;
  return typeof document !== 'undefined' ? document : null;
}

export function buildRunSettingsShellMarkup() {
  return RUN_SETTINGS_SHELL_MARKUP;
}

export function ensureRunSettingsShell(doc = null) {
  const resolvedDoc = resolveDoc(doc);
  const container = resolvedDoc?.getElementById?.('runSettingsModal') || null;

  if (!container) return null;
  if (resolvedDoc.getElementById?.('runModePanel')) return container;

  container.innerHTML = buildRunSettingsShellMarkup();
  return container;
}
