const EVENT_MODAL_SHELL_MARKUP = `
<div class="event-box">
  <div class="event-eyebrow" id="eventEyebrow">LAYER 1 · 우발적 이벤트</div>
  <div class="event-title" id="eventTitle">이벤트</div>
  <div id="eventGoldBar" class="event-gold-bar">
    <span class="event-hp-val">❤️ <span id="eventHpDisplay">0/0</span></span>
    <span class="event-gold-val">💰 <span id="eventGoldDisplay">0</span>골드</span>
    <span class="event-deck-val">🃏 덱 <span id="eventDeckDisplay">0</span>장</span>
  </div>
  <div class="event-image-container-special" id="eventImageContainer" style="display:none;">
    <img id="eventImage" src="" alt="Event Image" class="event-image-el">
  </div>
  <div class="event-desc" id="eventDesc"></div>
  <div class="event-choices" id="eventChoices"></div>
</div>
`.trim();

function resolveDoc(doc = null) {
  if (doc) return doc;
  return typeof document !== 'undefined' ? document : null;
}

export function buildEventModalShellMarkup() {
  return EVENT_MODAL_SHELL_MARKUP;
}

export function ensureEventModalShell(doc = null) {
  const resolvedDoc = resolveDoc(doc);
  const container = resolvedDoc?.getElementById?.('eventModal') || null;

  if (!container) return null;
  if (resolvedDoc.getElementById?.('eventChoices')) return container;

  container.innerHTML = buildEventModalShellMarkup();
  return container;
}
