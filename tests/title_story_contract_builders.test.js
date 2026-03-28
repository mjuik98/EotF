import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { buildTitleStoryContractBuilders } from '../game/features/title/ports/contracts/build_title_story_contracts.js';

describe('title_story_contract_builders', () => {
  it('avoids importing the overlay-oriented help pause title actions module', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/title/ports/contracts/build_title_story_contracts.js'),
      'utf8',
    );

    expect(source).not.toContain('../../application/help_pause_title_actions.js');
  });

  it('builds story deps around title-owned ending actions', () => {
    const restart = vi.fn();
    const selectFragment = vi.fn();
    const openCodex = vi.fn();

    const builders = buildTitleStoryContractBuilders({
      buildBaseDeps: vi.fn(() => ({ token: 'base' })),
      getRefs: () => ({
        AudioEngine: { id: 'audio' },
        ParticleSystem: { id: 'particles' },
        showWorldMemoryNotice: vi.fn(),
        restartFromEnding: restart,
        selectFragment,
        openCodex,
      }),
    });

    const storyDeps = builders.story();
    storyDeps.restartEndingFlow();
    storyDeps.selectEndingFragment('fortune');
    storyDeps.openEndingCodex();

    expect(storyDeps.audioEngine).toEqual({ id: 'audio' });
    expect(storyDeps.particleSystem).toEqual({ id: 'particles' });
    expect(storyDeps.endingActions).toEqual({
      restart: restart,
      selectFragment,
      openCodex,
    });
    expect(restart).toHaveBeenCalledTimes(1);
    expect(selectFragment).toHaveBeenCalledWith('fortune');
    expect(openCodex).toHaveBeenCalledTimes(1);
  });
});
