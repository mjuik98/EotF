import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildModuleRegistryGroupRegistrars: vi.fn(),
  registrars: {
    foundation: {
      core: vi.fn(),
      title: vi.fn(),
      codex: vi.fn(),
      event: vi.fn(),
      reward: vi.fn(),
    },
    gameplay: {
      combat: vi.fn(),
      run: vi.fn(),
    },
    shell: {
      screen: vi.fn(),
    },
  },
}));

vi.mock('../game/core/bindings/build_module_registry_group_registrars.js', () => ({
  buildModuleRegistryGroupRegistrars: hoisted.buildModuleRegistryGroupRegistrars,
}));

import { buildModuleRegistryGroups } from '../game/core/bindings/build_module_registry_groups.js';

describe('buildModuleRegistryGroups', () => {
  beforeEach(() => {
    hoisted.buildModuleRegistryGroupRegistrars.mockReset();
    hoisted.registrars.foundation.core.mockReset();
    hoisted.registrars.foundation.title.mockReset();
    hoisted.registrars.foundation.codex.mockReset();
    hoisted.registrars.foundation.event.mockReset();
    hoisted.registrars.foundation.reward.mockReset();
    hoisted.registrars.gameplay.combat.mockReset();
    hoisted.registrars.gameplay.run.mockReset();
    hoisted.registrars.shell.screen.mockReset();
    hoisted.buildModuleRegistryGroupRegistrars.mockReturnValue(hoisted.registrars);
  });

  it('resolves grouped module registrars into the legacy registry shape', () => {
    hoisted.registrars.foundation.core.mockReturnValue({ source: 'core' });
    hoisted.registrars.foundation.title.mockReturnValue({ source: 'title' });
    hoisted.registrars.foundation.codex.mockReturnValue({ source: 'codex' });
    hoisted.registrars.foundation.event.mockReturnValue({ source: 'event' });
    hoisted.registrars.foundation.reward.mockReturnValue({ source: 'reward' });
    hoisted.registrars.gameplay.combat.mockReturnValue({ source: 'combat' });
    hoisted.registrars.gameplay.run.mockReturnValue({ source: 'run' });
    hoisted.registrars.shell.screen.mockReturnValue({ source: 'screen' });

    expect(buildModuleRegistryGroups()).toEqual({
      core: { source: 'core' },
      title: { source: 'title' },
      codex: { source: 'codex' },
      event: { source: 'event' },
      reward: { source: 'reward' },
      combat: { source: 'combat' },
      run: { source: 'run' },
      screen: { source: 'screen' },
    });

    expect(hoisted.buildModuleRegistryGroupRegistrars).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.foundation.core).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.foundation.title).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.foundation.codex).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.foundation.event).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.foundation.reward).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.gameplay.combat).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.gameplay.run).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.shell.screen).toHaveBeenCalledTimes(1);
  });
});
