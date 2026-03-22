const CHARACTER_SELECT_SHELL_MARKUP = `
<div id="app">
  <div id="bgGradient" class="bg-gradient"></div>
  <div class="bg-noise"></div>

  <div id="header" class="intro">
    <div id="headerTitle" class="title-sub choose-echo-title">CHOOSE YOUR ECHO</div>
  </div>

  <div id="mainRow" class="intro">
    <div id="charStage">
      <button id="btnLeft" class="arrow-btn" type="button" aria-label="이전 캐릭터">‹</button>

      <div id="charCardWrap">
        <div id="charCard" role="region" aria-label="선택된 캐릭터">
          <canvas id="particleCanvas" width="420" height="640"></canvas>
          <div id="cardFoil"></div>
          <div id="cardTitle"
            style="font-size:10px;letter-spacing:2px;color:#aaa;font-family:'Share Tech Mono',monospace;margin-bottom:6px;">
          </div>
          <div id="cardEmoji" style="font-size:clamp(44px,8vw,72px);line-height:1;margin-bottom:8px;"></div>
          <div id="cardLevelBadge"><div class="csm-card-level"></div></div>
          <div id="cardName"
            style="font-size:clamp(14px,2vw,20px);letter-spacing:2px;font-family:'Cinzel',serif;margin-bottom:6px;text-align:center;">
          </div>
          <div id="cardDiff"
            style="font-size:12px;color:#999;font-family:'Share Tech Mono',monospace;margin-bottom:8px;"></div>
          <div id="cardTraitBadge"
            style="padding:4px 12px;border-radius:12px;font-size:10px;font-family:'Share Tech Mono',monospace;margin-bottom:8px;">
          </div>
          <div id="cardTags"
            style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;padding:0 10px;margin-bottom:10px;">
          </div>
          <div id="cardBottomGrad"
            style="position:absolute;left:0;right:0;bottom:0;height:40%;pointer-events:none;"></div>
          <div id="cardShimmer"
            style="position:absolute;inset:0;pointer-events:none;animation:shimmer 3.2s linear infinite;"></div>
        </div>
        <div id="charStageMeta">
          <div id="cardSummary"></div>
          <div id="dotsRow" class="intro"></div>
          <div id="buttonsRow" class="intro"></div>
        </div>
      </div>

      <button id="btnRight" class="arrow-btn" type="button" aria-label="다음 캐릭터">›</button>
    </div>

    <div id="charInspector">
      <div id="infoPanel" style="padding:6px 0;"></div>
    </div>
  </div>
</div>

<div id="skillModal" aria-hidden="true">
  <div id="modalBox" class="modal-box"></div>
</div>

<div id="phaseOverlay" aria-hidden="true">
  <div id="phaseCircle"></div>
  <div id="phaseContent"></div>
</div>

<div id="backToTitleBtn" class="back-to-title-btn" title="타이틀로 돌아가기">↩</div>
`.trim();

function resolveDoc(doc = null) {
  if (doc) return doc;
  return typeof document !== 'undefined' ? document : null;
}

export function buildCharacterSelectShellMarkup() {
  return CHARACTER_SELECT_SHELL_MARKUP;
}

export function ensureCharacterSelectShell(doc = null) {
  const resolvedDoc = resolveDoc(doc);
  const container = resolvedDoc?.getElementById?.('charSelectSubScreen') || null;

  if (!container) return null;
  if (resolvedDoc.getElementById?.('headerTitle')) return container;

  container.innerHTML = buildCharacterSelectShellMarkup();
  return container;
}
