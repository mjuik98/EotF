import { describe, expect, it, vi } from 'vitest';
import {
  closeLevelUpPopupRuntime,
  destroyLevelUpPopupRuntime,
  initLevelUpPopupRuntime,
  showLevelUpPopupRuntime,
} from '../game/ui/title/level_up_popup_runtime.js';

function createLevelUpDoc() {
  const wrap = {
    id: '',
    innerHTML: '',
    remove: vi.fn(),
    querySelector: vi.fn(),
  };
  const els = {
    classLvupBlur: { style: {}, addEventListener: vi.fn() },
    classLvupParticleCanvas: {
      style: {},
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        save: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        restore: vi.fn(),
        globalAlpha: 1,
        fillStyle: '',
      })),
    },
    classLvupToast: { style: {}, addEventListener: vi.fn() },
    classLvupEyebrow: { style: {}, textContent: '' },
    classLvupNum: { style: {}, textContent: '' },
    classLvupBonus: { style: {}, textContent: '' },
  };
  wrap.querySelector.mockImplementation((selector) => els[selector.replace('#', '')] || null);

  return {
    wrap,
    els,
    doc: {
      body: { appendChild: vi.fn() },
      createElement: vi.fn(() => wrap),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  };
}

describe('level_up_popup_runtime', () => {
  it('shows the popup and starts the particle canvas animation', () => {
    const { doc, wrap, els } = createLevelUpDoc();
    const instance = {
      onClose: null,
      _doc: doc,
      _win: { innerWidth: 1280, innerHeight: 720, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      _rafImpl: vi.fn(() => null),
      _cancelRafImpl: vi.fn(),
      _raf: null,
      _particles: [],
    };

    initLevelUpPopupRuntime(instance);
    showLevelUpPopupRuntime(instance, {
      classTitle: 'Paladin',
      newLevel: 4,
      bonusText: 'Unlock halo.',
      accent: '#ffd700',
    });

    expect(doc.body.appendChild).toHaveBeenCalledWith(wrap);
    expect(els.classLvupEyebrow.textContent).toBe('Paladin - LEVEL UP');
    expect(els.classLvupNum.textContent).toBe('Lv.4');
    expect(els.classLvupBonus.textContent).toBe('Unlock halo.');
    expect(els.classLvupBlur.style.display).toBe('block');
    expect(els.classLvupToast.style.display).toBe('flex');
    expect(els.classLvupParticleCanvas.style.display).toBe('block');
    expect(els.classLvupParticleCanvas.width).toBe(1280);
    expect(els.classLvupParticleCanvas.height).toBe(720);
  });

  it('closes and destroys the popup runtime', () => {
    const { doc, wrap, els } = createLevelUpDoc();
    const instance = {
      onClose: vi.fn(),
      _doc: doc,
      _win: { innerWidth: 1280, innerHeight: 720, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      _rafImpl: vi.fn(() => null),
      _cancelRafImpl: vi.fn(),
      _raf: 3,
      _particles: [{ life: 1 }],
    };

    initLevelUpPopupRuntime(instance);
    closeLevelUpPopupRuntime(instance);
    destroyLevelUpPopupRuntime(instance);

    expect(els.classLvupBlur.style.display).toBe('none');
    expect(els.classLvupToast.style.display).toBe('none');
    expect(els.classLvupParticleCanvas.style.display).toBe('none');
    expect(instance._cancelRafImpl).toHaveBeenCalledWith(3);
    expect(instance.onClose).toHaveBeenCalledTimes(2);
    expect(doc.removeEventListener).toHaveBeenCalledWith('keydown', instance._onKeyDown);
    expect(instance._win.removeEventListener).toHaveBeenCalledWith('resize', instance._onResize);
    expect(wrap.remove).toHaveBeenCalledTimes(1);
  });
});
