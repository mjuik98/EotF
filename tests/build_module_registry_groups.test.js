import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildModuleRegistryGroupRegistrars: vi.fn(),
  registrars: {
    foundation: {
      core: vi.fn(),
      title: vi.fn(),
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
    hoisted.registrars.gameplay.combat.mockReset();
    hoisted.registrars.gameplay.run.mockReset();
    hoisted.registrars.shell.screen.mockReset();
    hoisted.buildModuleRegistryGroupRegistrars.mockReturnValue(hoisted.registrars);
  });

  it('resolves grouped module registrars into the legacy registry shape', () => {
    hoisted.registrars.foundation.core.mockReturnValue({ source: 'core' });
    hoisted.registrars.foundation.title.mockReturnValue({ source: 'title' });
    hoisted.registrars.gameplay.combat.mockReturnValue({ source: 'combat' });
    hoisted.registrars.gameplay.run.mockReturnValue({ source: 'run' });
    hoisted.registrars.shell.screen.mockReturnValue({ source: 'screen' });

    expect(buildModuleRegistryGroups()).toEqual({
      core: { source: 'core' },
      title: { source: 'title' },
      combat: { source: 'combat' },
      run: { source: 'run' },
      screen: { source: 'screen' },
    });

    expect(hoisted.buildModuleRegistryGroupRegistrars).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.foundation.core).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.foundation.title).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.gameplay.combat).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.gameplay.run).toHaveBeenCalledTimes(1);
    expect(hoisted.registrars.shell.screen).toHaveBeenCalledTimes(1);
  });
});
