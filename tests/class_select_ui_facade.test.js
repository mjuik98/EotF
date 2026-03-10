import { describe, expect, it, vi } from 'vitest';

const {
  selectClassButtonSpy,
  selectClassByIdSpy,
  clearClassSelectionSpy,
  renderClassSelectButtonsSpy,
  showClassSelectTooltipSpy,
  hideClassSelectTooltipSpy,
} = vi.hoisted(() => ({
  selectClassButtonSpy: vi.fn(),
  selectClassByIdSpy: vi.fn(),
  clearClassSelectionSpy: vi.fn(),
  renderClassSelectButtonsSpy: vi.fn(),
  showClassSelectTooltipSpy: vi.fn(),
  hideClassSelectTooltipSpy: vi.fn(),
}));

vi.mock('../game/ui/title/class_select_selection_ui.js', () => ({
  normalizeClassId: vi.fn((value) => value),
  applyClassSelectionState: vi.fn(),
  selectClassButton: selectClassButtonSpy,
  selectClassById: selectClassByIdSpy,
  clearClassSelection: clearClassSelectionSpy,
}));

vi.mock('../game/ui/title/class_select_buttons_ui.js', () => ({
  renderClassSelectButtons: renderClassSelectButtonsSpy,
}));

vi.mock('../game/ui/title/class_select_tooltip_ui.js', () => ({
  showClassSelectTooltip: showClassSelectTooltipSpy,
  hideClassSelectTooltip: hideClassSelectTooltipSpy,
}));

import { ClassSelectUI } from '../game/ui/title/class_select_ui.js';

describe('class select ui facade', () => {
  it('delegates public selection and rendering methods to extracted helpers', () => {
    const btn = { dataset: { class: 'swordsman' } };
    const container = {};
    const deps = { doc: {} };

    ClassSelectUI.selectClass(btn, deps);
    ClassSelectUI.selectClassById('mage', deps);
    ClassSelectUI.clearSelection(deps);
    ClassSelectUI.renderButtons(container, deps);
    ClassSelectUI._showTooltip({ target: {} }, 'title', 'desc');
    ClassSelectUI._hideTooltip();

    expect(selectClassButtonSpy).toHaveBeenCalledWith(btn, expect.objectContaining(deps));
    expect(selectClassByIdSpy).toHaveBeenCalledWith('mage', expect.objectContaining(deps));
    expect(clearClassSelectionSpy).toHaveBeenCalledWith(expect.objectContaining(deps));
    expect(renderClassSelectButtonsSpy).toHaveBeenCalledWith(container, expect.objectContaining(deps));
    expect(showClassSelectTooltipSpy).toHaveBeenCalledWith(expect.anything(), 'title', 'desc', {});
    expect(hideClassSelectTooltipSpy).toHaveBeenCalledWith({});
  });
});
