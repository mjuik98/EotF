const BATTLE_CHRONICLE_SHELL_MARKUP = `
<div class="battle-chronicle-panel gm-modal-panel gm-modal-accent-gold">
  <div class="gm-modal-header">
    <div class="gm-modal-header-main">
      <div class="gm-modal-eyebrow">BATTLE CHRONICLE</div>
      <div id="battleChronicleTitle" class="gm-modal-title">전투 기록</div>
      <div class="subtitle-text battle-chronicle-subtitle gm-modal-subtitle">전체 전투 흐름과 자동 효과를 포함한 기록</div>
    </div>
  </div>
  <div class="battle-chronicle-body gm-modal-body">
    <div class="chronicle-filter-bar" id="chronicleFilterBar">
      <button class="chronicle-filter-btn active" data-filter="all">전체</button>
      <button class="chronicle-filter-btn" data-filter="action">공격</button>
      <button class="chronicle-filter-btn" data-filter="support">회복/방어</button>
      <button class="chronicle-filter-btn" data-filter="status">상태</button>
      <button class="chronicle-filter-btn" data-filter="system">시스템</button>
    </div>
    <div id="battleChronicleList" class="battle-chronicle-list"></div>
  </div>
  <div class="gm-modal-footer">
    <button id="closeBattleChronicleBtn" class="action-btn action-btn-secondary">닫기<span class="kbd-hint">ESC</span></button>
  </div>
</div>
`.trim();

function resolveDoc(doc = null) {
  if (doc) return doc;
  return typeof document !== 'undefined' ? document : null;
}

export function buildBattleChronicleShellMarkup() {
  return BATTLE_CHRONICLE_SHELL_MARKUP;
}

export function ensureBattleChronicleShell(doc = null) {
  const resolvedDoc = resolveDoc(doc);
  const container = resolvedDoc?.getElementById?.('battleChronicleOverlay') || null;

  if (!container) return null;
  if (resolvedDoc.getElementById?.('battleChronicleList')) return container;

  container.innerHTML = buildBattleChronicleShellMarkup();
  return container;
}
