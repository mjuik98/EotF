import fs from 'node:fs';
import path from 'node:path';

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
        innerHTML: '',
        onclick: null,
        children: [],
        append(...nodes) {
          this.children.push(...nodes);
        },
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

  it('highlights fragment descriptions and keeps their keyword palette styled', () => {
    const created = [];
    const fragmentChoices = {
      textContent: '',
      appendChild: vi.fn((node) => created.push(node)),
    };
    const doc = {
      getElementById: vi.fn(() => fragmentChoices),
      createElement: vi.fn(() => ({
        className: '',
        textContent: '',
        innerHTML: '',
        onclick: null,
        children: [],
        append(...nodes) {
          this.children.push(...nodes);
        },
      })),
    };

    renderDeathFragmentChoices({
      choices: [{ icon: '⚡', name: '잔향 강화', desc: '피해 14. 잔향 20 충전 [소진]', effect: 'echo_boost' }],
      doc,
      onSelect: vi.fn(),
    });

    const desc = created[0].children[2];
    expect(desc.innerHTML).toContain('kw-dmg');
    expect(desc.innerHTML).toContain('kw-echo');
    expect(desc.innerHTML).toContain('kw-exhaust kw-block');

    const css = fs.readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');
    expect(css).toContain('.fragment-desc .kw-dmg');
    expect(css).toContain('.fragment-desc .kw-echo');
    expect(css).toContain('.fragment-desc .kw-buff.kw-block');
  });
});
