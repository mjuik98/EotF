import { describe, expect, it, vi } from 'vitest';
import { confirmAbandonRun } from '../game/ui/screens/help_pause_ui_abandon_runtime.js';
import { EndingScreenUI } from '../game/features/ui/public.js';

function createElement() {
  return {
    id: '',
    children: [],
    classList: {
      remove: vi.fn(),
    },
    remove() {},
  };
}

function createDoc() {
  const elements = {};
  return {
    getElementById: (id) => elements[id] || null,
    register(id, node) {
      node.id = id;
      elements[id] = node;
      return node;
    },
  };
}

describe('help_pause_ui_abandon_runtime', () => {
  it('falls back to combatOverlay class removal when resetCombatUI is unavailable', () => {
    const doc = createDoc();
    doc.register('abandonConfirm', createElement());
    const combatOverlay = doc.register('combatOverlay', createElement());

    const deps = {
      doc,
      gs: {
        combat: { active: true },
      },
      finalizeRunOutcome: vi.fn(),
      clearActiveRunSave: vi.fn(),
    };
    const showOutcomeSpy = vi.spyOn(EndingScreenUI, 'showOutcome').mockReturnValue(false);
    const onClosePauseMenu = vi.fn();

    const result = confirmAbandonRun(deps, onClosePauseMenu);

    expect(result).toBe(false);
    expect(onClosePauseMenu).toHaveBeenCalledWith(doc);
    expect(deps.gs.combat.active).toBe(false);
    expect(combatOverlay.classList.remove).toHaveBeenCalledWith('active');
    expect(deps.finalizeRunOutcome).toHaveBeenCalledWith('defeat', { echoFragments: 2, abandoned: true }, { gs: deps.gs });
    expect(deps.clearActiveRunSave).toHaveBeenCalledTimes(1);
    expect(showOutcomeSpy).toHaveBeenCalledWith('abandon', deps);
  });
});
