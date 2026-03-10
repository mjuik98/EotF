import { describe, expect, it } from 'vitest';

import {
  applyClosedCombatInfoState,
  resetCombatInfoState,
  toggleCombatInfoState,
} from '../game/ui/combat/combat_info_runtime_ui.js';

function createDoc() {
  const elements = new Map();
  return {
    getElementById(id) {
      return elements.get(id) || null;
    },
    _register(id, element) {
      elements.set(id, element);
    },
  };
}

function createElement() {
  return { style: {}, textContent: '' };
}

describe('combat_info_runtime_ui', () => {
  it('applies the closed combat-info state', () => {
    const doc = createDoc();
    const panel = createElement();
    const tab = createElement();
    doc._register('combatInfoPanel', panel);
    doc._register('combatInfoTab', tab);

    applyClosedCombatInfoState(doc);

    expect(panel.style.left).toBe('-260px');
    expect(tab.style.left).toBe('0');
    expect(tab.textContent).toBe('📋 정보');
  });

  it('toggles open and closed while invoking the open callback', () => {
    const doc = createDoc();
    const panel = createElement();
    const tab = createElement();
    let openCount = 0;
    doc._register('combatInfoPanel', panel);
    doc._register('combatInfoTab', tab);

    resetCombatInfoState({ doc });
    expect(toggleCombatInfoState({ doc }, { onOpen: () => { openCount += 1; } })).toBe(true);
    expect(panel.style.left).toBe('0px');
    expect(tab.style.left).toBe('256px');
    expect(tab.textContent).toBe('✕ 닫기');
    expect(openCount).toBe(1);

    expect(toggleCombatInfoState({ doc })).toBe(false);
    expect(panel.style.left).toBe('-260px');
    expect(tab.textContent).toBe('📋 정보');
  });
});
