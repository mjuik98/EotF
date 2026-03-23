import { describe, expect, it, vi } from 'vitest';

const {
  selectClassButtonSpy,
  selectClassByIdSpy,
  clearClassSelectionSpy,
  renderClassSelectButtonsSpy,
  showClassSelectTooltipSpy,
  hideClassSelectTooltipSpy,
} = vi.hoisted(() => ({
  selectClassButtonSpy: vi.fn(),
  selectClassByIdSpy: vi.fn(),
  clearClassSelectionSpy: vi.fn(),
  renderClassSelectButtonsSpy: vi.fn(),
  showClassSelectTooltipSpy: vi.fn(),
  hideClassSelectTooltipSpy: vi.fn(),
}));

vi.mock('../game/features/title/platform/browser/class_select_selection_ui.js', () => ({
  normalizeClassId: vi.fn((value) => value),
  applyClassSelectionState: vi.fn(),
  selectClassButton: selectClassButtonSpy,
  selectClassById: selectClassByIdSpy,
  clearClassSelection: clearClassSelectionSpy,
}));

vi.mock('../game/features/title/platform/browser/class_select_buttons_ui.js', () => ({
  renderClassSelectButtons: renderClassSelectButtonsSpy,
}));

vi.mock('../game/features/title/platform/browser/class_select_tooltip_ui.js', () => ({
  showClassSelectTooltip: showClassSelectTooltipSpy,
  hideClassSelectTooltip: hideClassSelectTooltipSpy,
}));

vi.mock('../game/features/title/presentation/browser/game_boot_ui_runtime.js', () => ({
  bootGameRuntime: vi.fn(),
  bootWhenReadyRuntime: vi.fn(),
}));

vi.mock('../game/features/title/presentation/browser/game_canvas_setup_ui_runtime.js', () => ({
  getGameCanvasRefs: vi.fn(() => ({ gameCanvas: { id: 'gameCanvas' } })),
  initGameCanvasRuntime: vi.fn(() => ({ gameCanvas: { id: 'gameCanvas' } })),
  resizeGameCanvasRuntime: vi.fn(),
}));

vi.mock('../game/features/title/presentation/browser/intro_cinematic_runtime.js', () => ({
  playIntroCinematicRuntime: vi.fn(),
}));

vi.mock('../game/features/title/presentation/browser/level_up_popup_runtime.js', () => ({
  initLevelUpPopupRuntime: vi.fn(),
  showLevelUpPopupRuntime: vi.fn(),
  closeLevelUpPopupRuntime: vi.fn(),
  destroyLevelUpPopupRuntime: vi.fn(),
}));

vi.mock('../game/features/title/presentation/browser/run_end_screen_runtime.js', () => ({
  initRunEndScreenRuntime: vi.fn(),
  showRunEndScreenRuntime: vi.fn(),
  closeRunEndScreenRuntime: vi.fn(),
  destroyRunEndScreenRuntime: vi.fn(),
}));

const {
  initSpy,
  resizeSpy,
  animateSpy,
  stopSpy,
  createTitleCanvasRuntimeSpy,
} = vi.hoisted(() => ({
  initSpy: vi.fn(),
  resizeSpy: vi.fn(),
  animateSpy: vi.fn(),
  stopSpy: vi.fn(),
  createTitleCanvasRuntimeSpy: vi.fn(() => ({
    init: initSpy,
    resize: resizeSpy,
    animate: animateSpy,
    stop: stopSpy,
  })),
}));

vi.mock('../game/features/title/presentation/browser/title_canvas_runtime.js', () => ({
  createTitleCanvasRuntime: createTitleCanvasRuntimeSpy,
}));

vi.mock('../game/features/run/presentation/browser/run_mode_ui_runtime.js', () => ({
  refreshRunModeUI: vi.fn(),
  selectPresetSlotRuntime: vi.fn(),
  savePresetRuntime: vi.fn(),
  closePresetDialogRuntime: vi.fn(),
  confirmPresetSaveRuntime: vi.fn(),
  loadPresetRuntime: vi.fn(),
  deletePresetRuntime: vi.fn(),
  openRunSettingsModal: vi.fn(),
  closeRunSettingsModal: vi.fn(),
}));

vi.mock('../game/features/run/application/create_run_setup_runtime.js', () => ({
  startGameRuntime: vi.fn(),
}));

vi.mock('../game/features/run/application/create_run_start_runtime.js', () => ({
  enterRunRuntime: vi.fn(),
}));

vi.mock('../game/features/run/presentation/browser/run_return_ui_runtime.js', () => ({
  returnToGameRuntime: vi.fn(),
}));

vi.mock('../game/features/ui/presentation/browser/screen_ui_helpers.js', () => ({
  getDoc: vi.fn(() => ({ id: 'doc' })),
}));

vi.mock('../game/features/ui/presentation/browser/screen_ui_runtime.js', () => ({
  switchScreenRuntime: vi.fn(),
}));

vi.mock('../game/features/ui/presentation/browser/story_ui_runtime.js', () => ({
  unlockNextFragmentRuntime: vi.fn(),
  showRunFragmentRuntime: vi.fn(),
  checkHiddenEndingRuntime: vi.fn(),
  showEndingRuntime: vi.fn(),
}));

vi.mock('../game/features/ui/presentation/browser/ending_screen_ui_runtime.js', () => ({
  cleanupEndingSession: vi.fn(),
  showOutcomeScreenRuntime: vi.fn(() => ({ timers: [], cleanups: [] })),
}));

vi.mock('../game/features/ui/presentation/browser/meta_progression_ui_runtime.js', () => ({
  selectMetaFragmentRuntime: vi.fn(),
  restartFromEndingRuntime: vi.fn(),
}));

vi.mock('../game/features/codex/presentation/browser/codex_ui_runtime.js', () => ({
  bindCodexGlobalKeys: vi.fn(),
  openCodexRuntime: vi.fn(),
  closeCodexRuntime: vi.fn(),
  setCodexTabRuntime: vi.fn(),
  renderCodexContentRuntime: vi.fn(),
}));

import { ClassSelectUI } from '../game/ui/title/class_select_ui.js';
import { CharacterSelectUI } from '../game/ui/title/character_select_ui.js';

function createRunModeDoc() {
  const nodes = new Map();
  return {
    head: {
      children: [],
      appendChild(node) {
        this.children.push(node);
        if (node?.id) nodes.set(node.id, node);
      },
    },
    createElement(tag) {
      return {
        tagName: tag,
        rel: '',
        href: '',
        id: '',
      };
    },
    getElementById(id) {
      return nodes.get(id) || null;
    },
    querySelector() {
      return null;
    },
  };
}

describe('ui facade regressions', () => {
  it('keeps class select facade delegation intact', () => {
    const btn = { dataset: { class: 'swordsman' } };
    const container = {};
    const deps = { doc: {} };

    ClassSelectUI.selectClass(btn, deps);
    ClassSelectUI.selectClassById('mage', deps);
    ClassSelectUI.clearSelection(deps);
    ClassSelectUI.renderButtons(container, deps);
    ClassSelectUI._showTooltip({ target: {} }, 'title', 'desc');
    ClassSelectUI._hideTooltip();

    expect(selectClassButtonSpy).toHaveBeenCalledWith(btn, expect.objectContaining(deps));
    expect(selectClassByIdSpy).toHaveBeenCalledWith('mage', expect.objectContaining(deps));
    expect(clearClassSelectionSpy).toHaveBeenCalledWith(expect.objectContaining(deps));
    expect(renderClassSelectButtonsSpy).toHaveBeenCalledWith(container, expect.objectContaining(deps));
    expect(showClassSelectTooltipSpy).toHaveBeenCalledWith(expect.anything(), 'title', 'desc', {});
    expect(hideClassSelectTooltipSpy).toHaveBeenCalledWith({});
  });

  it('keeps character select facade runtime delegation intact', () => {
    const previousRuntime = CharacterSelectUI._runtime;
    const onEnter = vi.fn();
    const showPendingSummaries = vi.fn();

    CharacterSelectUI._runtime = { onEnter, showPendingSummaries };
    CharacterSelectUI.onEnter();
    CharacterSelectUI.showPendingSummaries();

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(showPendingSummaries).toHaveBeenCalledTimes(1);

    CharacterSelectUI._runtime = null;
    expect(() => CharacterSelectUI.onEnter()).not.toThrow();
    expect(() => CharacterSelectUI.showPendingSummaries()).not.toThrow();
    CharacterSelectUI._runtime = previousRuntime;
  });

  it('keeps title presentation facades delegated to feature-owned runtimes', async () => {
    const { GameBootUI } = await import('../game/ui/title/game_boot_ui.js');
    const gameBootRuntime = await import('../game/features/title/presentation/browser/game_boot_ui_runtime.js');
    const { GameCanvasSetupUI } = await import('../game/ui/title/game_canvas_setup_ui.js');
    const gameCanvasRuntime = await import('../game/features/title/presentation/browser/game_canvas_setup_ui_runtime.js');
    const { IntroCinematicUI } = await import('../game/ui/title/intro_cinematic_ui.js');
    const introRuntime = await import('../game/features/title/presentation/browser/intro_cinematic_runtime.js');
    const { LevelUpPopupUI } = await import('../game/ui/title/level_up_popup_ui.js');
    const levelUpRuntime = await import('../game/features/title/presentation/browser/level_up_popup_runtime.js');
    const { RunEndScreenUI } = await import('../game/ui/title/run_end_screen_ui.js');
    const runEndRuntime = await import('../game/features/title/presentation/browser/run_end_screen_runtime.js');
    const { TitleCanvasUI } = await import('../game/ui/title/title_canvas_ui.js');

    const deps = { marker: true };
    GameBootUI.bootGame(deps);
    GameBootUI.bootWhenReady(deps);
    expect(gameBootRuntime.bootGameRuntime).toHaveBeenCalledWith(GameBootUI, deps);
    expect(gameBootRuntime.bootWhenReadyRuntime).toHaveBeenCalledWith(GameBootUI, deps);

    const refs = GameCanvasSetupUI.getRefs();
    const initResult = GameCanvasSetupUI.init(deps);
    GameCanvasSetupUI.resize(deps);
    expect(refs).toEqual({ gameCanvas: { id: 'gameCanvas' } });
    expect(initResult).toEqual({ gameCanvas: { id: 'gameCanvas' } });
    expect(gameCanvasRuntime.initGameCanvasRuntime).toHaveBeenCalledWith(expect.any(Object), GameCanvasSetupUI, deps);
    expect(gameCanvasRuntime.resizeGameCanvasRuntime).toHaveBeenCalledWith(expect.any(Object), deps);

    const onComplete = vi.fn();
    IntroCinematicUI.play(deps, onComplete);
    expect(introRuntime.playIntroCinematicRuntime).toHaveBeenCalledWith(deps, onComplete);

    const levelUi = new LevelUpPopupUI({
      doc: { createElement: vi.fn(), body: { appendChild: vi.fn() }, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      win: { addEventListener: vi.fn(), removeEventListener: vi.fn() },
      raf: vi.fn(),
      cancelRaf: vi.fn(),
    });
    levelUi.show({ newLevel: 2 });
    levelUi.close();
    levelUi.destroy();
    expect(levelUpRuntime.initLevelUpPopupRuntime).toHaveBeenCalledWith(levelUi);
    expect(levelUpRuntime.showLevelUpPopupRuntime).toHaveBeenCalledWith(levelUi, { newLevel: 2 });
    expect(levelUpRuntime.closeLevelUpPopupRuntime).toHaveBeenCalledWith(levelUi);
    expect(levelUpRuntime.destroyLevelUpPopupRuntime).toHaveBeenCalledWith(levelUi);

    const runEndUi = new RunEndScreenUI({
      doc: { createElement: vi.fn(), body: { appendChild: vi.fn() }, addEventListener: vi.fn() },
      raf: vi.fn(),
      setTimeout: vi.fn(),
    });
    runEndUi.show({ outcome: 'victory' }, { title: 'Mage' });
    runEndUi.close();
    runEndUi.destroy();
    expect(runEndRuntime.initRunEndScreenRuntime).toHaveBeenCalledWith(runEndUi);
    expect(runEndRuntime.showRunEndScreenRuntime).toHaveBeenCalledWith(runEndUi, { outcome: 'victory' }, { title: 'Mage' });
    expect(runEndRuntime.closeRunEndScreenRuntime).toHaveBeenCalledWith(runEndUi);
    expect(runEndRuntime.destroyRunEndScreenRuntime).toHaveBeenCalledWith(runEndUi);

    const canvas = { id: 'titleCanvas' };
    const doc = { getElementById: vi.fn(() => canvas) };
    TitleCanvasUI.init({ doc });
    TitleCanvasUI.resize();
    TitleCanvasUI.animate();
    TitleCanvasUI.stop();
    expect(createTitleCanvasRuntimeSpy).toHaveBeenCalledWith({ doc });
    expect(initSpy).toHaveBeenCalledWith(canvas);
    expect(resizeSpy).toHaveBeenCalledTimes(1);
    expect(animateSpy).toHaveBeenCalledTimes(1);
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps run facades delegated to feature-owned runtimes', async () => {
    const { RunModeUI } = await import('../game/ui/run/run_mode_ui.js');
    const runModeRuntime = await import('../game/features/run/presentation/browser/run_mode_ui_runtime.js');
    const { RunSetupUI } = await import('../game/ui/run/run_setup_ui.js');
    const runSetupRuntime = await import('../game/features/run/application/create_run_setup_runtime.js');
    const { RunStartUI } = await import('../game/ui/run/run_start_ui.js');
    const runStartRuntime = await import('../game/features/run/application/create_run_start_runtime.js');
    const { RunReturnUI } = await import('../game/ui/run/run_return_ui.js');
    const runReturnRuntime = await import('../game/features/run/presentation/browser/run_return_ui_runtime.js');
    const doc = createRunModeDoc();
    const deps = { marker: true, doc };

    RunModeUI.refresh(deps);
    RunModeUI.selectPresetSlot(2, deps);
    RunModeUI.savePreset(1, deps);
    RunModeUI.closePresetDialog(deps);
    RunModeUI.confirmPresetSave(deps);
    RunModeUI.loadPreset(3, deps);
    RunModeUI.deletePreset(0, deps);
    RunModeUI.openSettings(deps);
    RunModeUI.closeSettings(deps);

    expect(doc.head.children).toHaveLength(1);
    expect(runModeRuntime.refreshRunModeUI).toHaveBeenCalledWith(RunModeUI, deps);
    expect(runModeRuntime.selectPresetSlotRuntime).toHaveBeenCalledWith(RunModeUI, 2, deps);
    expect(runModeRuntime.savePresetRuntime).toHaveBeenCalledWith(RunModeUI, 1, deps);
    expect(runModeRuntime.closePresetDialogRuntime).toHaveBeenCalledWith(RunModeUI, deps);
    expect(runModeRuntime.confirmPresetSaveRuntime).toHaveBeenCalledWith(RunModeUI, deps);
    expect(runModeRuntime.loadPresetRuntime).toHaveBeenCalledWith(RunModeUI, 3, deps);
    expect(runModeRuntime.deletePresetRuntime).toHaveBeenCalledWith(RunModeUI, 0, deps);
    expect(runModeRuntime.openRunSettingsModal).toHaveBeenCalledWith(RunModeUI, deps);
    expect(runModeRuntime.closeRunSettingsModal).toHaveBeenCalledWith(RunModeUI, deps);

    RunSetupUI.startGame({ marker: 'setup' });
    expect(runSetupRuntime.startGameRuntime).toHaveBeenCalledWith({ marker: 'setup' });

    RunStartUI.enterRun({ marker: 'start' });
    expect(runStartRuntime.enterRunRuntime).toHaveBeenCalledWith({ marker: 'start' });

    RunReturnUI.returnToGame(true, { marker: 'return' });
    RunReturnUI.returnFromReward({ marker: 'reward' });
    expect(runReturnRuntime.returnToGameRuntime).toHaveBeenNthCalledWith(1, true, { marker: 'return' });
    expect(runReturnRuntime.returnToGameRuntime).toHaveBeenNthCalledWith(2, true, { marker: 'reward' });
  });

  it('keeps screen/story/ending/meta facades delegated to feature-owned runtimes', async () => {
    const { EndingScreenUI, MetaProgressionUI, ScreenUI, StoryUI } = await import('../game/features/ui/public.js');
    const screenRuntime = await import('../game/features/ui/presentation/browser/screen_ui_runtime.js');
    const storyRuntime = await import('../game/features/ui/presentation/browser/story_ui_runtime.js');
    const endingRuntime = await import('../game/features/ui/presentation/browser/ending_screen_ui_runtime.js');
    const metaRuntime = await import('../game/features/ui/presentation/browser/meta_progression_ui_runtime.js');

    ScreenUI.switchScreen('title', { marker: true });
    expect(screenRuntime.switchScreenRuntime).toHaveBeenCalledWith('title', {
      marker: true,
      doc: { id: 'doc' },
    });

    StoryUI.unlockNextFragment({ marker: 'story' });
    StoryUI.showRunFragment({ marker: 'story' });
    StoryUI.checkHiddenEnding({ marker: 'story' });
    StoryUI.showEnding(true, { marker: 'story' });
    expect(storyRuntime.unlockNextFragmentRuntime).toHaveBeenCalledWith({ marker: 'story' });
    expect(storyRuntime.showRunFragmentRuntime).toHaveBeenCalledWith(StoryUI, { marker: 'story' });
    expect(storyRuntime.checkHiddenEndingRuntime).toHaveBeenCalledWith({ marker: 'story' });
    expect(storyRuntime.showEndingRuntime).toHaveBeenCalledWith(true, { marker: 'story' });

    expect(EndingScreenUI.show(false, { marker: 'ending' })).toBe(true);
    expect(endingRuntime.showOutcomeScreenRuntime).toHaveBeenCalledWith('victory', { marker: 'ending' }, {
      cleanup: EndingScreenUI.cleanup,
    });
    EndingScreenUI.cleanup({ marker: 'ending' });
    expect(endingRuntime.cleanupEndingSession).toHaveBeenCalled();

    MetaProgressionUI.selectEndingFragment('echo_boost', { marker: 'meta' });
    MetaProgressionUI.selectFragment('echo_boost', { marker: 'meta' });
    MetaProgressionUI.restartEndingFlow({ marker: 'meta' });
    MetaProgressionUI.restartFromEnding({ marker: 'meta' });
    expect(metaRuntime.selectMetaFragmentRuntime).toHaveBeenCalledTimes(2);
    expect(metaRuntime.restartFromEndingRuntime).toHaveBeenCalledTimes(2);
  });

  it('keeps codex public surface delegated to feature-owned runtimes', async () => {
    const originalDocument = globalThis.document;
    const doc = createRunModeDoc();
    globalThis.document = doc;

    const { CodexUI } = await import('../game/features/codex/public.js');
    const runtime = await import('../game/features/codex/presentation/browser/codex_ui_runtime.js');
    const deps = { marker: true, doc };

    CodexUI.openCodex(deps);
    CodexUI.closeCodex(deps);
    CodexUI.setCodexTab('items', deps);
    CodexUI.renderCodexContent(deps);

    expect(doc.head.children).toHaveLength(1);
    expect(doc.head.children[0].rel).toBe('stylesheet');
    expect(doc.head.children[0].href).toContain('codex_v3.css');
    expect(doc.head.children[0].href).not.toBe('/css/codex_v3.css');
    expect(runtime.openCodexRuntime).toHaveBeenCalled();
    expect(runtime.closeCodexRuntime).toHaveBeenCalled();
    expect(runtime.setCodexTabRuntime).toHaveBeenCalledWith(expect.any(Object), CodexUI, 'items', deps);
    expect(runtime.renderCodexContentRuntime).toHaveBeenCalledWith(expect.any(Object), CodexUI, deps);

    globalThis.document = originalDocument;
  });
});
