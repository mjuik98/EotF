import { bindTooltipTrigger } from '../../../../shared/ui/tooltip/public.js';

export function bindClassTraitTooltip(traitEl, cls, { showTooltip, hideTooltip } = {}) {
  if (!traitEl) return;
  traitEl.style.cursor = 'help';
  bindTooltipTrigger(traitEl, {
    label: `${cls.traitTitle || cls.traitName}. ${cls.traitDesc || ''}`,
    show(event) {
      event.stopPropagation?.();
      showTooltip?.(event, cls.traitTitle, cls.traitDesc);
    },
    hide() {
      hideTooltip?.();
    },
  });
}

export function bindClassRelicDetailTrigger(relicEl, {
  activeEntry,
  item,
  itemId,
  detailSurface,
  renderDetail,
} = {}) {
  if (!relicEl || !item) return null;

  const showRelicDetail = (event) => {
    event?.stopPropagation?.();
    detailSurface.show({
      activeEntry,
      detail: renderDetail(itemId, item),
      itemId,
    });
  };

  relicEl.style.cursor = 'pointer';
  relicEl.setAttribute('tabindex', '0');
  relicEl.setAttribute('role', 'button');
  relicEl.setAttribute('aria-controls', 'classSelectRelicDetail');
  relicEl.setAttribute('aria-pressed', 'false');
  relicEl.setAttribute('aria-label', `${item.name}. ${item.desc || ''}`);
  bindTooltipTrigger(relicEl, {
    label: `${item.name}. ${item.desc || ''}`,
    show: showRelicDetail,
    hide() {
      detailSurface.clear();
    },
  });
  relicEl.addEventListener('click', showRelicDetail);
  return {
    activeEntry,
    item,
    itemId,
  };
}
