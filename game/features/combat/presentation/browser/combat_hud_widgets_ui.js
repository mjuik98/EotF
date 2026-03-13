export function applyChainWidgetState(countEl, dotsEl, chain) {
  if (!countEl || !dotsEl) return;
  countEl.textContent = chain;
  countEl.classList.toggle('burst', chain >= 5);
  dotsEl.querySelectorAll('.chain-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index < chain && chain < 5);
    dot.classList.toggle('burst-dot', chain >= 5);
  });
}

export function updateCombatChainWidgets(doc, chain, combatActive) {
  applyChainWidgetState(
    doc.getElementById('chainCount'),
    doc.getElementById('chainDots'),
    chain,
  );

  const combatWidget = doc.getElementById('combatChainInline');
  if (combatWidget) combatWidget.style.display = combatActive ? 'flex' : 'none';

  applyChainWidgetState(
    doc.getElementById('combatChainCount'),
    doc.getElementById('combatChainDots'),
    chain,
  );
}

export function resolveNoiseWidgetState(gs, resolveRegionId = null) {
  if (!gs) return { visible: false };

  const combatActive = !!gs.combat?.active;
  let combatRegionId = Number.isFinite(Number(gs._activeRegionId))
    ? Number(gs._activeRegionId)
    : null;

  if (combatRegionId == null && typeof resolveRegionId === 'function') {
    const resolved = Number(resolveRegionId(gs.currentRegion, gs));
    if (Number.isFinite(resolved)) {
      combatRegionId = Math.max(0, Math.floor(resolved));
    }
  }

  const inSilenceCity = combatActive && combatRegionId === 1;
  const inTimeWasteland = combatActive && combatRegionId === 5;
  if (!inSilenceCity && !inTimeWasteland) {
    return { visible: false };
  }

  const max = 10;
  const gauge = inSilenceCity ? (gs.player.silenceGauge || 0) : (gs.player.timeRiftGauge || 0);
  const pct = (gauge / max) * 100;
  const isWarn = gauge >= 7;
  const warnColor = inSilenceCity ? '240,180,41' : '180,100,255';
  const defaultColor = inSilenceCity ? '255,51,102' : '130,51,255';

  return {
    visible: true,
    title: inSilenceCity ? '?뙌 ?뚯쓬 寃뚯씠吏' : '???쒓컙??洹좎뿴',
    gauge,
    max,
    pct,
    isWarn,
    fillColor: inSilenceCity ? 'var(--danger)' : '#b066ff',
    valueText: `${gauge} / ${max}`,
    warnText: inSilenceCity ? '???뚯닔袁??꾨컯' : '??媛뺤젣 ??醫낅즺 ?꾨컯',
    warnDisplay: isWarn ? 'block' : 'none',
    borderColor: isWarn ? `rgba(${warnColor},0.5)` : `rgba(${defaultColor},0.3)`,
    boxShadow: isWarn ? `0 0 20px rgba(${warnColor},0.15)` : `0 0 20px rgba(${defaultColor},0.1)`,
    dots: Array.from({ length: max }, (_, index) => ({
      active: index < gauge,
      warn: index < gauge && index >= 6,
    })),
  };
}

export function applyNoiseWidgetState(doc, state) {
  const widget = doc.getElementById('noiseWidget');
  if (!widget) return;

  widget.style.display = state.visible ? 'flex' : 'none';
  if (!state.visible) return;

  const titleEl = widget.querySelector('.nw-title');
  if (titleEl) titleEl.textContent = state.title;

  const dots = doc.getElementById('nwDots');
  if (dots) {
    dots.textContent = '';
    state.dots.forEach(({ active, warn }) => {
      const dot = doc.createElement('div');
      dot.className = `nw-dot${active ? ' active' : ''}${warn ? ' warn' : ''}`;
      dots.appendChild(dot);
    });
  }

  const fill = doc.getElementById('nwBarFill');
  if (fill) {
    fill.style.width = `${state.pct}%`;
    fill.style.background = state.fillColor;
  }

  const val = doc.getElementById('nwVal');
  if (val) val.textContent = state.valueText;

  const warnEl = doc.getElementById('nwWarn');
  if (warnEl) {
    warnEl.textContent = state.warnText;
    warnEl.style.display = state.warnDisplay;
  }

  widget.style.borderColor = state.borderColor;
  widget.style.boxShadow = state.boxShadow;
}

export function updateNoiseWidgetUI(doc, gs, resolveRegionId = null) {
  applyNoiseWidgetState(doc, resolveNoiseWidgetState(gs, resolveRegionId));
}
