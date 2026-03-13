import { describe, expect, it, vi } from 'vitest';

const { showSpy, hideSpy } = vi.hoisted(() => ({
  showSpy: vi.fn(),
  hideSpy: vi.fn(),
}));

vi.mock('../game/features/combat/presentation/browser/status_tooltip_builder.js', () => ({
  StatusTooltipUI: {
    show: showSpy,
    hide: hideSpy,
  },
}));

import {
  hideEnemyStatusTooltipOverlay,
  normalizeEnemyStatusTooltipArgs,
  resolveEnemyStatusTooltipPayload,
  showEnemyStatusTooltipOverlay,
} from '../game/ui/combat/combat_enemy_status_tooltip_ui.js';

describe('combat_enemy_status_tooltip_ui', () => {
  it('normalizes value/deps inputs for window-compatible status tooltip calls', () => {
    expect(normalizeEnemyStatusTooltipArgs(3, { doc: 'doc' })).toEqual({
      statusValue: 3,
      resolvedDeps: { doc: 'doc' },
    });

    expect(normalizeEnemyStatusTooltipArgs({ poisonDuration: 2 }, { doc: 'ignored' })).toEqual({
      statusValue: null,
      resolvedDeps: { poisonDuration: 2 },
    });
  });

  it('resolves enemy status tooltip payload semantics from shared metadata', () => {
    expect(resolveEnemyStatusTooltipPayload('poisoned')).toEqual({
      infoKR: expect.objectContaining({
        icon: expect.any(String),
        name: expect.any(String),
        buff: false,
        desc: expect.any(String),
      }),
      source: {
        type: 'enemy',
        label: 'Enemy',
        name: 'Enemy status',
        color: '#ff6688',
      },
    });

    expect(resolveEnemyStatusTooltipPayload('immune')).toEqual({
      infoKR: expect.objectContaining({
        buff: true,
      }),
      source: expect.objectContaining({
        color: '#88ccff',
      }),
    });

    expect(resolveEnemyStatusTooltipPayload('missing_status_key')).toBeNull();
  });

  it('forwards resolved payload and deps into StatusTooltipUI.show/hide', () => {
    const event = { currentTarget: { id: 'badge' } };
    const doc = { id: 'doc' };
    const win = { id: 'win' };

    showEnemyStatusTooltipOverlay(event, 'poisoned', 4, {
      doc,
      win,
      poisonDuration: 2,
    });

    expect(showSpy).toHaveBeenCalledWith(
      event,
      'poisoned',
      expect.objectContaining({
        buff: false,
      }),
      4,
      expect.objectContaining({
        rawValue: 4,
        source: expect.objectContaining({
          type: 'enemy',
          color: '#ff6688',
        }),
        doc,
        win,
        poisonDuration: 2,
      }),
    );

    hideEnemyStatusTooltipOverlay({ doc });
    expect(hideSpy).toHaveBeenCalledWith({ doc });
  });
});
