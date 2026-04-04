import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  buildEndingFragmentChoiceViewModel,
  presentEndingFragmentChoices,
} from '../game/features/ui/public.js';

function createMockElement(tagName = 'div') {
  return {
    tagName: String(tagName).toUpperCase(),
    id: '',
    type: '',
    className: '',
    innerHTML: '',
    textContent: '',
    children: [],
    parentNode: null,
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    append(...children) {
      children.forEach((child) => this.appendChild(child));
    },
    insertBefore(child, anchor) {
      child.parentNode = this;
      const index = this.children.indexOf(anchor);
      if (index < 0) {
        this.children.push(child);
        return child;
      }
      this.children.splice(index, 0, child);
      return child;
    },
    addEventListener(type, handler) {
      this[`on_${type}`] = handler;
    },
    removeEventListener(type) {
      delete this[`on_${type}`];
    },
  };
}

function createDoc() {
  return {
    createElement(tagName) {
      return createMockElement(tagName);
    },
  };
}

describe('ending_fragment_choice_presenter', () => {
  it('builds a fragment choice view model for non-victory outcomes with shards', () => {
    const viewModel = buildEndingFragmentChoiceViewModel({
      choices: [{ effect: 'fortune', icon: 'X', name: 'Fortune', desc: 'Gold up' }],
      gs: { meta: { echoFragments: 2 } },
      outcome: 'defeat',
    });

    expect(viewModel).toEqual({
      title: '메아리 조각 2개 - 각인을 선택하라',
      choices: [{ effect: 'fortune', icon: 'X', name: 'Fortune', desc: 'Gold up' }],
    });
  });

  it('renders fragment choice buttons and wires click handlers through onChoose', () => {
    const doc = createDoc();
    const parent = createMockElement('div');
    const anchor = createMockElement('div');
    anchor.id = 's7';
    parent.appendChild(anchor);
    const session = { cleanups: [] };
    const onChoose = vi.fn();

    const result = presentEndingFragmentChoices({
      anchor,
      doc,
      onChoose,
      session,
      viewModel: {
        title: '메아리 조각 1개 - 각인을 선택하라',
        choices: [{ effect: 'echo_boost', icon: '⚡', name: '잔향 강화', desc: '다음 런 시작 시 잔향 +30' }],
      },
    });

    expect(result.wrap.id).toBe('s6b');
    expect(result.buttons).toHaveLength(1);
    expect(parent.children[0]).toBe(result.wrap);
    result.buttons[0].on_click();
    expect(onChoose).toHaveBeenCalledWith('echo_boost', expect.objectContaining({
      button: result.buttons[0],
      buttons: result.buttons,
      grid: result.grid,
      wrap: result.wrap,
    }));
    expect(result.buttons[0].innerHTML).toContain('frag-desc');
    expect(session.cleanups).toHaveLength(1);
  });

  it('highlights fragment choice descriptions with the shared keyword and trigger markup', () => {
    const doc = createDoc();
    const parent = createMockElement('div');
    const anchor = createMockElement('div');
    parent.appendChild(anchor);

    const result = presentEndingFragmentChoices({
      anchor,
      doc,
      onChoose: () => {},
      session: { cleanups: [] },
      viewModel: {
        title: '메아리 조각 1개 - 각인을 선택하라',
        choices: [{ effect: 'echo_boost', icon: '⚡', name: '잔향 강화', desc: '전투 시작: 피해 14. 기절 1턴 부여 [소진]' }],
      },
    });

    expect(result.buttons[0].innerHTML).toContain('kw-trigger');
    expect(result.buttons[0].innerHTML).toContain('kw-special');
    expect(result.buttons[0].innerHTML).toContain('kw-dmg');
    expect(result.buttons[0].innerHTML).toContain('kw-debuff');
    expect(result.buttons[0].innerHTML).toContain('kw-exhaust kw-block');
  });

  it('keeps fragment choice keyword colors aligned with readable comparison surfaces', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'css/ending_screen.css'), 'utf8');

    expect(source).toContain('.frag-desc .kw-dmg');
    expect(source).toContain('.frag-desc .kw-shield');
    expect(source).toContain('.frag-desc .kw-echo');
    expect(source).toContain('.frag-desc .kw-buff.kw-block');
  });

  it('keeps fragment choice keyboard focus styling aligned with hover affordances', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'css/ending_screen.css'), 'utf8');

    expect(source).toContain('.frag-card:focus-visible');
  });
});
