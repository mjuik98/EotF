import { describe, expect, it, vi } from 'vitest';

import { buildCharacterSelectMountPayload } from '../game/features/title/platform/browser/build_character_select_mount_payload.js';

describe('buildCharacterSelectMountPayload', () => {
  it('builds a title feature-owned mount payload for the character select screen', () => {
    const saveDeps = { token: 'save-deps' };
    const modules = {
      GS: { id: 'gs' },
      AudioEngine: { id: 'audio' },
      SaveSystem: { saveMeta: vi.fn() },
    };
    const deps = {
      getSaveSystemDeps: vi.fn(() => saveDeps),
    };
    const fns = {
      startGame: vi.fn(),
      backToTitle: vi.fn(),
    };
    const doc = { id: 'doc' };

    const payload = buildCharacterSelectMountPayload({ modules, deps, fns, doc });

    expect(payload).toEqual(expect.objectContaining({
      doc,
      gs: modules.GS,
      audioEngine: modules.AudioEngine,
      onConfirm: expect.any(Function),
      onBack: expect.any(Function),
      onStart: expect.any(Function),
    }));

    payload.onProgressConsumed();
    expect(deps.getSaveSystemDeps).toHaveBeenCalledTimes(1);
    expect(modules.SaveSystem.saveMeta).toHaveBeenCalledWith(saveDeps);
  });
});
