import { describe, expect, it, vi } from 'vitest';

import {
  buildDeathFragmentChoices,
  renderDeathFragmentChoices,
} from '../game/features/combat/presentation/browser/death_fragment_choice_presenter.js';

describe('death_fragment_choice_presenter', () => {
  it('builds a deterministic shuffled fragment choice list', () => {
    const random = vi.fn()
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.8);

    const choices = buildDeathFragmentChoices(random);

    expect(choices.map((choice) => choice.effect)).toEqual([
      'fortune',
      'resilience',
      'echo_boost',
    ]);
  });

  it('renders fragment choices and wires selection callbacks', () => {
    const created = [];
    const fragmentChoices = {
      textContent: 'stale',
      appendChild: vi.fn((node) => created.push(node)),
    };
    const doc = {
      getElementById: vi.fn(() => fragmentChoices),
      createElement: vi.fn(() => ({
        className: '',
        textContent: '',
        onclick: null,
        append: vi.fn(),
      })),
    };
    const onSelect = vi.fn();
    const choices = buildDeathFragmentChoices(() => 0);

    const rendered = renderDeathFragmentChoices({ choices, doc, onSelect });

    expect(rendered).toHaveLength(3);
    expect(fragmentChoices.textContent).toBe('');
    expect(fragmentChoices.appendChild).toHaveBeenCalledTimes(3);
    created[0].onclick();
    expect(onSelect).toHaveBeenCalledWith(rendered[0].effect);
  });
});
