export function buildSettingsModalShellFrame({ tabsMarkup, panelsMarkup } = {}) {
  return `
<div class="settings-modal-inner gm-modal-panel gm-modal-accent-echo">
  <div class="settings-glow-bar"></div>

  <div class="settings-header gm-modal-header">
    <div class="gm-modal-header-main">
      <div class="settings-eyebrow gm-modal-eyebrow">SETTINGS</div>
      <div class="settings-title gm-modal-title">설정</div>
    </div>
  </div>

  <div class="settings-modal-body gm-modal-body">
    ${tabsMarkup}
    ${panelsMarkup}
  </div>

  <div class="settings-footer gm-modal-footer">
    <button class="settings-reset-btn">기본값 초기화</button>
    <button class="settings-close-btn gm-close-btn gm-close-btn-footer">
      닫기<span class="kbd-hint">ESC</span>
    </button>
  </div>
</div>
`.trim();
}
