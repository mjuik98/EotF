import { describe, expect, it, vi } from 'vitest';

import { buildCharacterSelectMountPayload } from '../game/features/title/platform/browser/build_character_select_mount_payload.js';

describe('buildCharacterSelectMountPayload', () => {
  it('builds a title feature-owned mount payload for the character select screen', () => {
    const saveDeps = { token: 'save-deps' };
    const gs = { id: 'gs' };
    const audioEngine = { id: 'audio' };
    const saveSystem = { saveMeta: vi.fn() };
    const deps = {
      getGameBootDeps: vi.fn(() => ({ data: { cards: 'cards-data' } })),
      getSaveSystemDeps: vi.fn(() => saveDeps),
    };
    const fns = {
      startGame: vi.fn(),
      backToTitle: vi.fn(),
    };
    const doc = { id: 'doc' };

    const payload = buildCharacterSelectMountPayload({ gs, audioEngine, saveSystem, deps, fns, doc });

    expect(payload).toEqual(expect.objectContaining({
      doc,
      gs,
      audioEngine,
      data: { cards: 'cards-data' },
      onConfirm: expect.any(Function),
      onBack: expect.any(Function),
      onStart: expect.any(Function),
    }));

    payload.onProgressConsumed();
    expect(deps.getGameBootDeps).toHaveBeenCalledTimes(1);
    expect(deps.getSaveSystemDeps).toHaveBeenCalledTimes(1);
    expect(saveSystem.saveMeta).toHaveBeenCalledWith(saveDeps);
  });
});
