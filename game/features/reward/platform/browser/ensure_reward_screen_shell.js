const REWARD_SCREEN_SHELL_MARKUP = `
<div id="rewardEyebrow" class="reward-title reward-eyebrow-special">✦ 보상 선택 ✦</div>
<div id="rewardTitle" class="reward-title-special" style="display:none;">
</div>
<div class="reward-cards reward-cards-container" id="rewardCards"></div>
<div class="reward-actions-footer">
  <div id="skipConfirmArea" class="skip-confirm-container">
    <button id="rewardSkipInitBtn" class="skip-btn">건너뛰기 (보상 없이 계속)</button>
    <div id="skipConfirmRow" class="skip-confirm-row-el" style="display:none;">
      <span class="skip-confirm-text">정말 보상을 포기하시겠습니까?</span>
      <button id="rewardSkipConfirmBtn" class="skip-btn skip-btn-danger">예, 건너뜀</button>
      <button id="rewardSkipCancelBtn" class="skip-btn skip-btn-cancel">아니오</button>
    </div>
  </div>
</div>
`.trim();

function resolveDoc(doc = null) {
  if (doc) return doc;
  return typeof document !== 'undefined' ? document : null;
}

export function buildRewardScreenShellMarkup() {
  return REWARD_SCREEN_SHELL_MARKUP;
}

export function ensureRewardScreenShell(doc = null) {
  const resolvedDoc = resolveDoc(doc);
  const container = resolvedDoc?.getElementById?.('rewardScreen') || null;

  if (!container) return null;
  if (resolvedDoc.getElementById?.('rewardCards')) return container;

  container.innerHTML = buildRewardScreenShellMarkup();
  return container;
}
