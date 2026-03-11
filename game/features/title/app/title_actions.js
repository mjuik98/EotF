import {
  hideTitleSubscreens,
  showCharacterSelectScreen,
  showMainTitleScreen,
} from '../ui/title_screen_dom.js';
import { playUiClick } from '../../../domain/audio/audio_event_helpers.js';

function clampVolumePercent(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
}

function setVolume({
  applyFn,
  doc,
  saveVolumes,
  selectors,
  value,
}) {
  const normalizedValue = clampVolumePercent(value);
  const [valueSelectors, sliderSelectors] = selectors;

  applyFn?.(normalizedValue / 100);
  doc?.querySelectorAll?.(valueSelectors)?.forEach((el) => {
    if (el) el.textContent = `${normalizedValue}%`;
  });
  doc?.querySelectorAll?.(sliderSelectors)?.forEach((el) => {
    if (!el) return;
    el.value = normalizedValue;
    el.style.setProperty('--fill-percent', `${normalizedValue}%`);
  });
  saveVolumes?.();
}

function playPreRunRipple({ doc, startPreRunRipple, win }, onComplete) {
  const finish = () => {
    if (typeof onComplete === 'function') onComplete();
  };

  if (!doc?.body) {
    finish();
    return;
  }

  const overlay = doc.createElement('div');
  overlay.id = 'titleRunPreludeOverlay';
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'background:radial-gradient(circle at center, rgba(94, 50, 170, 0.24) 0%, rgba(3, 3, 10, 0.95) 62%, rgba(0, 0, 0, 1) 100%)',
    'z-index:2100',
    'pointer-events:none',
    'opacity:1',
  ].join(';');
  doc.body.appendChild(overlay);

  let completed = false;
  const done = () => {
    if (completed) return;
    completed = true;
    finish();
  };

  try {
    startPreRunRipple(overlay, {
      doc,
      win,
      onComplete: done,
    });
  } catch (error) {
    console.error('[TitleActions] pre-run ripple failed:', error);
    overlay.remove();
    done();
  }
}

export function createTitleActions(ports) {
  const { doc, fns, modules, win } = ports;

  const saveVolumes = () => modules.GameInit?.saveVolumes?.(modules.AudioEngine);
  const playClick = () => playUiClick(modules.AudioEngine);

  return {
    showCharacterSelect() {
      playClick();
      showCharacterSelectScreen(doc);
      modules.CharacterSelectUI?.onEnter?.();
    },

    backToTitle() {
      playClick();
      showMainTitleScreen(doc);
    },

    continueRun() {
      playClick();
      const loaded = modules.SaveSystem?.loadRun?.(ports.getSaveSystemDeps());
      if (!loaded) return false;

      const runStartDeps = ports.getRunStartDeps();
      showMainTitleScreen(doc);

      runStartDeps.markGameStarted?.();
      runStartDeps.switchScreen?.('game');
      runStartDeps.audioEngine?.startAmbient?.(modules.GS.currentRegion || 0);
      runStartDeps.updateUI?.();
      runStartDeps.updateClassSpecialUI?.();

      setTimeout(() => {
        runStartDeps.initGameCanvas?.();
        if (typeof runStartDeps.requestAnimationFrame === 'function' && typeof runStartDeps.gameLoop === 'function') {
          runStartDeps.requestAnimationFrame(runStartDeps.gameLoop);
        }
        fns.renderMinimap?.();
        fns.updateNextNodes?.();
      }, 80);

      return true;
    },

    openRunSettings() {
      playClick();
      modules.RunModeUI?.openSettings?.(ports.getRunModeDeps());
    },

    closeRunSettings() {
      modules.RunModeUI?.closeSettings?.(ports.getRunModeDeps());
    },

    openCodexFromTitle() {
      playClick();
      modules.CodexUI?.openCodex?.({ gs: modules.GS, data: modules.DATA });
    },

    selectClass(target) {
      playClick();
      const classSelectDeps = ports.getClassSelectDeps();
      if (typeof target === 'string' || typeof target === 'number') {
        modules.ClassSelectUI?.selectClassById?.(target, classSelectDeps);
        return;
      }
      modules.ClassSelectUI?.selectClass?.(target, classSelectDeps);
    },

    startGame() {
      playClick();
      hideTitleSubscreens(doc);

      const startRunFlow = () => {
        if (modules.GS) modules.GS._preRunRipplePlayed = true;
        ports.playIntroCinematic(
          {
            gs: modules.GS,
            getSelectedClass: () => modules.ClassSelectUI?.getSelectedClass?.(),
          },
          () => {
            modules.RunSetupUI?.startGame?.(ports.getRunSetupDeps());
          },
        );
      };

      playPreRunRipple({ doc, startPreRunRipple: ports.startPreRunRipple, win }, startRunFlow);
    },

    refreshRunModePanel() {
      modules.RunModeUI?.refresh?.(ports.getRunModeDeps());
      modules.RunModeUI?.refreshInscriptions?.(ports.getRunModeDeps());
    },

    shiftAscension(delta) {
      modules.RunModeUI?.shiftAscension?.(delta, ports.getRunModeDeps());
      modules.RunModeUI?.refreshInscriptions?.(ports.getRunModeDeps());
    },

    toggleEndlessMode() {
      modules.RunModeUI?.toggleEndlessMode?.(ports.getRunModeDeps());
    },

    cycleRunCurse() {
      modules.RunModeUI?.cycleCurse?.(ports.getRunModeDeps());
    },

    selectRunCurse(id) {
      modules.RunModeUI?.selectCurse?.(id, ports.getRunModeDeps());
    },

    selectFragment(effect) {
      modules.MetaProgressionUI?.selectFragment?.(effect, ports.getMetaProgressionDeps());
    },

    advanceToNextRegion(overrideDeps = {}) {
      const baseDeps = ports.getRegionTransitionDeps();
      modules.RegionTransitionUI?.advanceToNextRegion?.({ ...baseDeps, ...overrideDeps });
    },

    toggleHelp() {
      playClick();
      modules.HelpPauseUI?.toggleHelp?.(ports.getHelpPauseDeps());
    },

    abandonRun() {
      modules.HelpPauseUI?.abandonRun?.(ports.getHelpPauseDeps());
    },

    confirmAbandon() {
      modules.HelpPauseUI?.confirmAbandon?.(ports.getHelpPauseDeps());
    },

    togglePause() {
      modules.HelpPauseUI?.togglePause?.(ports.getHelpPauseDeps());
    },

    shuffleArray(arr) {
      return modules.RandomUtils?.shuffleArray?.(arr) || arr;
    },

    restartFromEnding() {
      modules.MetaProgressionUI?.restartFromEnding?.(ports.getMetaProgressionDeps());
    },

    quitGame() {
      const root = typeof globalThis !== 'undefined' ? globalThis : null;
      playClick();
      if (root?.confirm?.('정말로 게임을 종료하시겠습니까?')) {
        win?.close?.();
        setTimeout(() => root?.alert?.('브라우저 정책상 닫기 API가 작동하지 않을 수 있습니다. 창을 직접 닫아주세요.'), 500);
      }
    },

    setMasterVolume(value) {
      setVolume({
        applyFn: (normalized) => modules.AudioEngine?.setVolume?.(normalized),
        doc,
        saveVolumes,
        selectors: [
          '#settings-vol-master-val, #volMasterSliderVal',
          '#settings-vol-master-slider, #volMasterSlider',
        ],
        value,
      });
    },

    setSfxVolume(value) {
      setVolume({
        applyFn: (normalized) => modules.AudioEngine?.setSfxVolume?.(normalized),
        doc,
        saveVolumes,
        selectors: [
          '#settings-vol-sfx-val, #volSfxSliderVal',
          '#settings-vol-sfx-slider, #volSfxSlider',
        ],
        value,
      });
    },

    setAmbientVolume(value) {
      setVolume({
        applyFn: (normalized) => modules.AudioEngine?.setAmbientVolume?.(normalized),
        doc,
        saveVolumes,
        selectors: [
          '#settings-vol-ambient-val, #volAmbientSliderVal',
          '#settings-vol-ambient-slider, #volAmbientSlider',
        ],
        value,
      });
    },

    openSettings() {
      modules.SettingsUI?.openSettings?.(ports.getSettingsDeps());
    },

    closeSettings() {
      modules.SettingsUI?.closeSettings?.(ports.getSettingsDeps());
    },

    setSettingsTab(tab) {
      modules.SettingsUI?.setTab?.(tab, ports.getSettingsDeps());
    },

    resetSettings() {
      modules.SettingsUI?.resetToDefaults?.(ports.getSettingsDeps());
    },

    applySettingVolume(type, value) {
      modules.SettingsUI?.applyVolume?.(type, value, ports.getSettingsDeps());
    },

    applySettingVisual(key, value) {
      modules.SettingsUI?.applyVisual?.(key, value, ports.getSettingsDeps());
    },

    applySettingAccessibility(key, value) {
      modules.SettingsUI?.applyAccessibility?.(key, value, ports.getSettingsDeps());
    },

    startSettingsRebind(action) {
      modules.SettingsUI?.startRebind?.(action, ports.getSettingsDeps());
    },

    toggleSettingMute(type) {
      modules.SettingsUI?.muteToggle?.(type, ports.getSettingsDeps());
    },
  };
}
