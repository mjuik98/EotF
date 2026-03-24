export const ITEM_DETAIL_PANEL_VARIANTS = Object.freeze({
  combat: Object.freeze({
    panelStyle: 'width:min(320px,calc(100vw-36px));margin-top:10px;padding:12px;border:1px solid rgba(123,47,255,.24);border-radius:14px;background:linear-gradient(180deg,rgba(8,8,24,.96),rgba(6,6,18,.92));box-shadow:0 18px 40px rgba(0,0,0,.28);backdrop-filter:blur(18px)',
    gap: '8px',
    titleSize: '14px',
    boxPadding: '8px 10px',
    rowRadius: '10px',
    textSize: '11px',
    sectionSize: '10px',
    enterTransform: 'translateY(4px)',
  }),
  compact: Object.freeze({
    panelStyle: 'width:100%;margin-top:10px;padding:10px;border:1px solid rgba(123,47,255,.16);border-radius:12px;background:linear-gradient(180deg,rgba(9,9,24,.92),rgba(6,6,18,.86));box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 12px 28px rgba(0,0,0,.18)',
    gap: '6px',
    titleSize: '12px',
    boxPadding: '7px 9px',
    rowRadius: '9px',
    textSize: '10px',
    sectionSize: '9px',
    enterTransform: 'translateY(3px)',
  }),
  inline: Object.freeze({
    panelStyle: 'width:100%;margin-top:12px;padding:9px 10px;border:1px solid rgba(123,47,255,.16);border-radius:12px;background:linear-gradient(180deg,rgba(10,10,24,.9),rgba(7,7,18,.84));box-shadow:0 10px 24px rgba(0,0,0,.18)',
    gap: '6px',
    titleSize: '12px',
    boxPadding: '7px 9px',
    rowRadius: '9px',
    textSize: '10px',
    sectionSize: '9px',
    enterTransform: 'translateY(3px)',
  }),
});

export function resolveItemDetailPanelVariant(options = {}) {
  const variantName = options?.variant && ITEM_DETAIL_PANEL_VARIANTS[options.variant]
    ? options.variant
    : 'combat';
  return {
    name: variantName,
    ...ITEM_DETAIL_PANEL_VARIANTS[variantName],
  };
}
