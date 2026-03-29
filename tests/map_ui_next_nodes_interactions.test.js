import { describe, expect, it, vi } from 'vitest';

import {
  bindNextNodeCardInteractions,
} from '../game/features/run/presentation/browser/map_ui_next_nodes_interactions.js';
import { buildNextNodeCard } from '../game/features/run/presentation/browser/map_ui_next_nodes_render.js';
import { routeOverlayEscapeToPause } from '../game/shared/runtime/overlay_escape_policy.js';

function createCard() {
  const listeners = {};
  return {
    style: {},
    dataset: {},
    attributes: {},
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
    setAttribute(name, value) {
      this.attributes[name] = String(value);
      this[name] = String(value);
    },
    listeners,
  };
}

describe('map_ui_next_nodes_interactions', () => {
  it('makes next-node cards keyboard-focusable and applies focus parity for hover tint', () => {
    const card = createCard();
    const hoverTint = { style: {} };
    const moveToNode = vi.fn();

    bindNextNodeCardInteractions({
      card,
      deps: { moveToNode },
      doc: {},
      hoverTint,
      meta: { color: '#cc2244' },
      moveToNodeHandlerName: 'moveToNode',
      node: { id: 'n1' },
      win: {},
    });

    expect(card.tabindex).toBe('0');
    expect(card.role).toBe('button');
    expect(typeof card.listeners.focus).toBe('function');
    expect(typeof card.listeners.blur).toBe('function');
    expect(typeof card.listeners.keydown).toBe('function');

    card.listeners.focus();
    expect(hoverTint.style.background).toContain('rgba(204, 34, 68');

    card.listeners.blur();
    expect(hoverTint.style.background).toBe('transparent');

    const keyEvent = { key: 'Enter', preventDefault: vi.fn() };
    card.listeners.keydown(keyEvent);
    expect(keyEvent.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('builds next-node cards with an aria label for keyboard and screen reader users', () => {
    const doc = {
      createElement() {
        return createCard();
      },
    };
    const { card } = buildNextNodeCard(doc, {
      node: { id: '1-0', floor: 1, pos: 0, type: 'elite' },
      meta: { icon: 'E', label: 'Elite', color: '#cc2244', desc: '피해 14. 잔향 20 충전 [소진]' },
    });

    expect(card['aria-label']).toContain('Elite');
    expect(card['aria-label']).toContain('피해 14. 잔향 20 충전 [소진]');
  });

  it('routes Escape to the injected pause handler and swallows the event', () => {
    const togglePause = vi.fn();
    const logger = {
      child: vi.fn(() => ({
        debug: vi.fn(),
        warn: vi.fn(),
      })),
    };
    const event = {
      key: 'Escape',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    };

    const handled = routeOverlayEscapeToPause(event, {
      deps: { togglePause, logger },
      overlayName: 'next-node',
    });

    const escapeLogger = logger.child.mock.results[0].value;
    expect(handled).toBe(true);
    expect(togglePause).toHaveBeenCalledWith(expect.objectContaining({ togglePause }));
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.stopImmediatePropagation).toHaveBeenCalledTimes(1);
    expect(escapeLogger.debug).toHaveBeenCalledTimes(1);
  });

  it('falls back to HelpPauseUI and warns when no local pause handler exists', () => {
    const togglePause = vi.fn();
    const logger = {
      child: vi.fn(() => ({
        debug: vi.fn(),
        warn: vi.fn(),
      })),
    };
    const event = {
      key: 'Escape',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    const handledWithFallback = routeOverlayEscapeToPause(event, {
      deps: {
        logger,
        win: {
          HelpPauseUI: {
            togglePause,
          },
        },
      },
      overlayName: 'next-node',
    });
    const handledWithoutHandler = routeOverlayEscapeToPause(event, {
      deps: { logger },
      overlayName: 'next-node',
    });

    const warningLogger = logger.child.mock.results[1].value;
    expect(handledWithFallback).toBe(true);
    expect(togglePause).toHaveBeenCalledTimes(1);
    expect(handledWithoutHandler).toBe(false);
    expect(warningLogger.warn).toHaveBeenCalledTimes(1);
  });
});
