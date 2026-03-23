import { beforeEach, describe, expect, it, vi } from 'vitest';

const bindingHoisted = vi.hoisted(() => ({
  buildGameBindingRegistrarGroups: vi.fn(),
  groups: {
    gameplay: [vi.fn(), vi.fn(), vi.fn()],
    shell: [vi.fn(), vi.fn()],
  },
}));

const subscriberRegistrarHoisted = vi.hoisted(() => ({
  buildEventSubscriberRegistrarGroups: vi.fn(),
  groups: {
    gameplay: [vi.fn(), vi.fn(), vi.fn()],
    runtime: [vi.fn()],
  },
}));

const subscriberActionHoisted = vi.hoisted(() => ({
  buildRuntimeSubscriberActionGroups: vi.fn(),
  groups: {
    gameplay: { renderCombatCards: vi.fn(), updateCombatLog: vi.fn() },
    shell: { updateUI: vi.fn(), updateStatusDisplay: vi.fn() },
  },
}));

vi.mock('../game/core/composition/build_game_binding_registrar_groups.js', () => ({
  buildGameBindingRegistrarGroups: bindingHoisted.buildGameBindingRegistrarGroups,
}));

vi.mock('../game/core/build_event_subscriber_registrar_groups.js', () => ({
  buildEventSubscriberRegistrarGroups: subscriberRegistrarHoisted.buildEventSubscriberRegistrarGroups,
}));

vi.mock('../game/core/bootstrap/build_runtime_subscriber_action_groups.js', () => ({
  buildRuntimeSubscriberActionGroups: subscriberActionHoisted.buildRuntimeSubscriberActionGroups,
}));

import { buildGameBindingRegistrars } from '../game/core/composition/build_game_binding_registrars.js';
import { buildEventSubscriberRegistrars } from '../game/core/build_event_subscriber_registrars.js';
import { buildRuntimeSubscriberActions } from '../game/core/bootstrap/build_runtime_subscriber_actions.js';

describe('bootstrap registrar assembly', () => {
  beforeEach(() => {
    bindingHoisted.buildGameBindingRegistrarGroups.mockReset();
    bindingHoisted.groups.gameplay.forEach((registrar) => registrar.mockReset());
    bindingHoisted.groups.shell.forEach((registrar) => registrar.mockReset());
    bindingHoisted.buildGameBindingRegistrarGroups.mockReturnValue(bindingHoisted.groups);

    subscriberRegistrarHoisted.buildEventSubscriberRegistrarGroups.mockReset();
    subscriberRegistrarHoisted.groups.gameplay.forEach((registrar) => registrar.mockReset());
    subscriberRegistrarHoisted.groups.runtime.forEach((registrar) => registrar.mockReset());
    subscriberRegistrarHoisted.buildEventSubscriberRegistrarGroups.mockReturnValue(subscriberRegistrarHoisted.groups);

    subscriberActionHoisted.buildRuntimeSubscriberActionGroups.mockReset();
    subscriberActionHoisted.groups.gameplay.renderCombatCards.mockReset();
    subscriberActionHoisted.groups.gameplay.updateCombatLog.mockReset();
    subscriberActionHoisted.groups.shell.updateUI.mockReset();
    subscriberActionHoisted.groups.shell.updateStatusDisplay.mockReset();
    subscriberActionHoisted.buildRuntimeSubscriberActionGroups.mockReturnValue(subscriberActionHoisted.groups);
  });

  it('flattens registrar groups in gameplay-to-shell order', () => {
    expect(buildGameBindingRegistrars()).toEqual([
      ...bindingHoisted.groups.gameplay,
      ...bindingHoisted.groups.shell,
    ]);
    expect(bindingHoisted.buildGameBindingRegistrarGroups).toHaveBeenCalledTimes(1);
  });

  it('flattens subscriber registrar groups in gameplay-to-runtime order', () => {
    expect(buildEventSubscriberRegistrars()).toEqual([
      ...subscriberRegistrarHoisted.groups.gameplay,
      ...subscriberRegistrarHoisted.groups.runtime,
    ]);
    expect(subscriberRegistrarHoisted.buildEventSubscriberRegistrarGroups).toHaveBeenCalledTimes(1);
  });

  it('flattens runtime subscriber action groups in gameplay-to-shell order', () => {
    expect(buildRuntimeSubscriberActions({})).toEqual({
      ...subscriberActionHoisted.groups.gameplay,
      ...subscriberActionHoisted.groups.shell,
    });
    expect(subscriberActionHoisted.buildRuntimeSubscriberActionGroups).toHaveBeenCalledTimes(1);
  });
});
