function safeRead(getter, fallback) {
  try {
    const value = getter?.();
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function setStyles(element, cssText) {
  if (!element?.style) return;
  element.style.cssText = cssText;
}

function createActionButton(doc, label) {
  const button = doc.createElement('button');
  button.type = 'button';
  button.textContent = label;
  setStyles(
    button,
    [
      'border:1px solid rgba(125,231,255,0.24)',
      'background:rgba(11,18,31,0.92)',
      'color:#d8fbff',
      'border-radius:999px',
      'padding:6px 10px',
      'font:600 11px/1.1 "IBM Plex Sans", sans-serif',
      'letter-spacing:0.04em',
      'cursor:pointer',
    ].join(';'),
  );
  return button;
}

function buildSnapshotPreview(snapshot = {}) {
  return JSON.stringify({
    screen: snapshot.screen || null,
    panels: snapshot.panels || [],
    player: snapshot.player
      ? {
        class: snapshot.player.class || null,
        hp: snapshot.player.hp ?? null,
        handCount: snapshot.player.handCount ?? null,
      }
      : null,
    combat: snapshot.combat
      ? {
        active: !!snapshot.combat.active,
        turn: snapshot.combat.turn ?? null,
        energy: snapshot.combat.resources?.energy ?? null,
        maxEnergy: snapshot.combat.resources?.maxEnergy ?? null,
      }
      : null,
    map: snapshot.map?.surface || null,
  }, null, 2);
}

function buildSummaryText(snapshot = {}, metrics = {}) {
  return [
    `screen ${snapshot.screen || 'unknown'}`,
    `panels ${(snapshot.panels || []).length}`,
    `events ${Number(metrics?.totals?.events || 0)}`,
    `errors ${Number(metrics?.totals?.errors || 0)}`,
  ].join(' | ');
}

function buildMetricsText(metrics = {}) {
  const topEvent = Array.isArray(metrics?.topEvents) ? metrics.topEvents[0] : null;
  const topError = Array.isArray(metrics?.topErrors) ? metrics.topErrors[0] : null;
  const eventRate = Number(metrics?.recent?.eventsPerMinute || 0);
  if (!topEvent) {
    return [
      `events ${Number(metrics?.totals?.events || 0)}`,
      `errors ${Number(metrics?.totals?.errors || 0)}`,
      `epm ${eventRate}`,
    ].join(' | ');
  }
  const parts = [
    `events ${Number(metrics?.totals?.events || 0)}`,
    `errors ${Number(metrics?.totals?.errors || 0)}`,
    `epm ${eventRate}`,
  ];
  if (topError) {
    parts.push(`err ${topError.code} x${topError.count}`);
  }
  parts.push(
    `top ${topEvent.event} x${topEvent.count}`,
  );
  return parts.join(' | ');
}

function createPanelRoot(doc) {
  const root = doc.createElement('aside');
  root.id = 'runtimeDebugPanel';
  root.setAttribute('aria-hidden', 'true');
  root.dataset.state = 'closed';
  setStyles(
    root,
    [
      'position:fixed',
      'top:14px',
      'left:14px',
      'z-index:9200',
      'width:min(360px,calc(100vw - 28px))',
      'display:none',
      'pointer-events:auto',
      'padding:12px',
      'border:1px solid rgba(125,231,255,0.2)',
      'border-radius:16px',
      'background:rgba(6,10,18,0.94)',
      'box-shadow:0 18px 44px rgba(0,0,0,0.38)',
      'backdrop-filter:blur(14px)',
      'color:#d8fbff',
      'font:500 12px/1.45 "IBM Plex Sans", sans-serif',
    ].join(';'),
  );
  return root;
}

function resolveHost(doc) {
  return doc?.getElementById?.('runtimeSceneRoot') || doc?.body || null;
}

export function mountRuntimeDebugPanel({
  doc,
  hooks,
  readSnapshot = () => ({}),
  getMetrics = () => ({}),
} = {}) {
  if (!doc?.createElement) return null;

  const existing = doc.getElementById?.('runtimeDebugPanel');
  if (existing?.__runtimeDebugPanelController) {
    existing.__runtimeDebugPanelController.refresh();
    return existing.__runtimeDebugPanelController;
  }

  const host = resolveHost(doc);
  if (!host?.appendChild) return null;

  const root = createPanelRoot(doc);
  const title = doc.createElement('div');
  title.textContent = 'Runtime Debug';
  setStyles(title, 'font:700 12px/1.1 "IBM Plex Sans", sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#7de7ff;');

  const summary = doc.createElement('div');
  setStyles(summary, 'margin-top:8px;color:#f3f7ff;font-weight:600;');

  const metrics = doc.createElement('div');
  setStyles(metrics, 'margin-top:4px;color:rgba(216,251,255,0.74);font-size:11px;');

  const actions = doc.createElement('div');
  setStyles(actions, 'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;');
  const refreshButton = createActionButton(doc, 'Refresh');
  const advance250Button = createActionButton(doc, '+250ms');
  const advance1000Button = createActionButton(doc, '+1000ms');
  const closeButton = createActionButton(doc, 'Close');
  actions.append(refreshButton, advance250Button, advance1000Button, closeButton);

  const snapshotPre = doc.createElement('pre');
  setStyles(
    snapshotPre,
    [
      'margin:10px 0 0',
      'padding:10px',
      'border-radius:12px',
      'background:rgba(10,16,28,0.96)',
      'color:#d8fbff',
      'max-height:220px',
      'overflow:auto',
      'font:500 11px/1.45 "IBM Plex Mono", monospace',
      'white-space:pre-wrap',
    ].join(';'),
  );

  root.append(title, summary, metrics, actions, snapshotPre);
  host.appendChild(root);

  const controller = {
    root,
    summary,
    metrics,
    snapshotPre,
    open() {
      root.style.display = 'block';
      root.dataset.state = 'open';
      root.setAttribute('aria-hidden', 'false');
      controller.refresh();
    },
    close() {
      root.style.display = 'none';
      root.dataset.state = 'closed';
      root.setAttribute('aria-hidden', 'true');
    },
    toggle() {
      if (root.dataset.state === 'open') controller.close();
      else controller.open();
    },
    refresh() {
      const snapshot = safeRead(readSnapshot, {});
      const runtimeMetrics = safeRead(getMetrics, {});
      summary.textContent = buildSummaryText(snapshot, runtimeMetrics);
      metrics.textContent = buildMetricsText(runtimeMetrics);
      snapshotPre.textContent = buildSnapshotPreview(snapshot);
      return { snapshot, metrics: runtimeMetrics };
    },
    async advance(ms) {
      await hooks?.advanceTime?.(ms);
      return controller.refresh();
    },
  };

  refreshButton.addEventListener('click', () => controller.refresh());
  advance250Button.addEventListener('click', () => {
    controller.advance(250);
  });
  advance1000Button.addEventListener('click', () => {
    controller.advance(1000);
  });
  closeButton.addEventListener('click', () => controller.close());

  doc.addEventListener?.('keydown', (event) => {
    if (event?.key === 'F6') {
      event?.preventDefault?.();
      controller.toggle();
      return;
    }
    if (event?.key === 'Escape' && root.dataset.state === 'open') {
      controller.close();
    }
  });

  root.__runtimeDebugPanelController = controller;
  controller.close();
  controller.refresh();
  return controller;
}
