import { bindTooltipTrigger } from '../../../ui/ports/public_shared_support_capabilities.js';

export function renderClassTraitPanel(model, deps = {}) {
  if (!model) return '';

  const doc = deps.doc || document;
  const win = deps.win || doc?.defaultView || null;
  const tooltipUI = deps.tooltipUI || deps.TooltipUI || null;

  const root = doc.createElement('div');
  root.style.cursor = 'help';

  if (model.title && model.desc) {
    const tooltipLabel = [model.title, model.desc].filter(Boolean).join('. ');
    bindTooltipTrigger(root, {
      label: tooltipLabel,
      show(event) {
        tooltipUI?.showGeneralTooltip?.(event, model.title, model.desc, { doc, win });
      },
      hide() {
        tooltipUI?.hideGeneralTooltip?.({ doc, win });
      },
    });
  }

  const label = doc.createElement('div');
  label.style.cssText = "font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;";
  label.textContent = model.label || '특성';

  const value = doc.createElement('div');
  value.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:12px;color:${model.valueColor || 'var(--white)'};line-height:1.4;`;
  value.textContent = model.value || '';

  root.append(label, value);

  if (model.subValue) {
    const subValue = doc.createElement('div');
    subValue.style.cssText = "font-size:9px;color:var(--text-dim);margin-top:2px;";
    subValue.textContent = model.subValue;
    root.append(subValue);
  }

  return root;
}
