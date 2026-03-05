/**
 * title_settings_bindings.js — Title/Navigation + Help/Pause + Sound + Utility 래퍼 함수
 *
 * 책임: 타이틀 화면, 도움말/일시정지, 사운드 설정, 유틸리티 래퍼
 */
import * as Deps from '../deps_factory.js';
import { IntroCinematicUI } from '../../ui/title/intro_cinematic_ui.js';
import { startEchoRippleDissolve } from '../../ui/effects/echo_ripple_transition.js';

export function createTitleSettingsBindings(M, fns) {
    const clampVolumePercent = (value) => {
        const parsed = Number.parseInt(value, 10);
        if (Number.isNaN(parsed)) return 0;
        return Math.max(0, Math.min(100, parsed));
    };

    const setVolume = (value, applyFn, valueSelectors, sliderSelectors) => {
        const val = clampVolumePercent(value);

        applyFn?.(val / 100);
        document.querySelectorAll(valueSelectors).forEach(el => { if (el) el.textContent = `${val}%`; });
        document.querySelectorAll(sliderSelectors).forEach(el => {
            if (!el) return;
            el.value = val;
            el.style.setProperty('--fill-percent', `${val}%`);
        });
        M.GameInit?.saveVolumes?.(M.AudioEngine);
    };

    // ═══ Title / Navigation ═══
    fns.showCharacterSelect = () => {
        M.AudioEngine?.playClick?.();
        const main = document.getElementById('mainTitleSubScreen');
        const char = document.getElementById('charSelectSubScreen');
        if (main && char) { main.style.display = 'none'; char.style.display = 'block'; }
        M.CharacterSelectUI?.onEnter?.();
    };
    fns.backToTitle = () => {
        M.AudioEngine?.playClick?.();
        const main = document.getElementById('mainTitleSubScreen');
        const char = document.getElementById('charSelectSubScreen');
        if (main && char) { main.style.display = 'block'; char.style.display = 'none'; }
    };
    fns.openRunSettings = () => {
        M.AudioEngine?.playClick?.();
        M.RunModeUI?.openSettings?.(Deps.getRunModeDeps());
    };
    fns.closeRunSettings = () => M.RunModeUI?.closeSettings?.(Deps.getRunModeDeps());
    fns.openCodexFromTitle = () => {
        M.AudioEngine?.playClick?.();
        M.CodexUI?.openCodex?.({ gs: M.GS, data: M.DATA });
    };
    fns.selectClass = (target) => {
        M.AudioEngine?.playClick?.();
        const classSelectDeps = Deps.getClassSelectDeps();
        if (typeof target === 'string' || typeof target === 'number') {
            M.ClassSelectUI?.selectClassById?.(target, classSelectDeps);
            return;
        }
        M.ClassSelectUI?.selectClass?.(target, classSelectDeps);
    };

    // 캐릭터 선택 컨테이너에 이벤트 위임 설정 (추가)
    const classContainer = document.getElementById('classSelectContainer');
    if (classContainer) {
        classContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.class-btn');
            if (btn) {
                fns.selectClass(btn);
            }
        });
    }

    const playPreRunRipple = (onComplete) => {
        const finish = () => {
            if (typeof onComplete === 'function') onComplete();
        };

        if (!document?.body) {
            finish();
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'titleRunPreludeOverlay';
        overlay.style.cssText = [
            'position:fixed',
            'inset:0',
            'background:radial-gradient(circle at center, rgba(94, 50, 170, 0.24) 0%, rgba(3, 3, 10, 0.95) 62%, rgba(0, 0, 0, 1) 100%)',
            'z-index:2100',
            'pointer-events:none',
            'opacity:1',
        ].join(';');
        document.body.appendChild(overlay);

        let completed = false;
        const done = () => {
            if (completed) return;
            completed = true;
            finish();
        };

        try {
            startEchoRippleDissolve(overlay, {
                doc: document,
                win: window,
                onComplete: done,
            });
        } catch (error) {
            console.error('[TitleSettingsBindings] pre-run ripple failed:', error);
            overlay.remove();
            done();
        }
    };

    fns.startGame = () => {
        M.AudioEngine?.playClick?.();
        // Keep title subscreens hidden until game screen activation to avoid
        // one-frame flashes of the previous title UI during transition.
        const main = document.getElementById('mainTitleSubScreen');
        const char = document.getElementById('charSelectSubScreen');
        if (char) char.style.display = 'none';
        if (main) main.style.display = 'none';

        // 인트로 연출 → 완료 후 실제 게임 시작
        const startRunFlow = () => {
            if (M.GS) M.GS._preRunRipplePlayed = true;
            IntroCinematicUI.play(
                {
                    gs: M.GS,
                    getSelectedClass: () => M.ClassSelectUI?.getSelectedClass?.(),
                },
                () => {
                    M.RunSetupUI?.startGame?.(Deps.getRunSetupDeps());
                }
            );
        };

        playPreRunRipple(startRunFlow);
    };

    fns.refreshRunModePanel = () => {
        M.RunModeUI?.refresh?.(Deps.getRunModeDeps());
        M.RunModeUI?.refreshInscriptions?.(Deps.getRunModeDeps());
    };
    fns.shiftAscension = (delta) => {
        M.RunModeUI?.shiftAscension?.(delta, Deps.getRunModeDeps());
        M.RunModeUI?.refreshInscriptions?.(Deps.getRunModeDeps());
    };
    fns.toggleEndlessMode = () => M.RunModeUI?.toggleEndlessMode?.(Deps.getRunModeDeps());
    fns.cycleRunBlessing = () => M.RunModeUI?.cycleBlessing?.(Deps.getRunModeDeps());
    fns.cycleRunCurse = () => M.RunModeUI?.cycleCurse?.(Deps.getRunModeDeps());
    fns.selectRunBlessing = (id) => M.RunModeUI?.selectBlessing?.(id, Deps.getRunModeDeps());
    fns.selectRunCurse = (id) => M.RunModeUI?.selectCurse?.(id, Deps.getRunModeDeps());
    fns.selectFragment = (effect) => M.MetaProgressionUI?.selectFragment?.(effect, Deps.getMetaProgressionDeps());
    fns.advanceToNextRegion = (overrideDeps = {}) => {
        const baseDeps = Deps.getRegionTransitionDeps();
        M.RegionTransitionUI?.advanceToNextRegion?.({ ...baseDeps, ...overrideDeps });
    };

    // ═══ Help / Pause ═══
    fns.toggleHelp = () => {
        M.AudioEngine?.playClick?.();
        M.HelpPauseUI?.toggleHelp?.(Deps.getHelpPauseDeps());
    };
    fns.abandonRun = () => M.HelpPauseUI?.abandonRun?.(Deps.getHelpPauseDeps());
    fns.confirmAbandon = () => M.HelpPauseUI?.confirmAbandon?.(Deps.getHelpPauseDeps());
    fns.togglePause = () => M.HelpPauseUI?.togglePause?.(Deps.getHelpPauseDeps());

    // ═══ Utility ═══
    fns.shuffleArray = (arr) => M.RandomUtils?.shuffleArray?.(arr) || arr;
    fns.restartFromEnding = () => M.MetaProgressionUI?.restartFromEnding?.(Deps.getMetaProgressionDeps());

    // ═══ Game Exit ═══
    fns.quitGame = () => {
        M.AudioEngine?.playClick?.();
        if (confirm('정말로 게임을 종료하시겠습니까?')) {
            window.close();
            setTimeout(() => alert('브라우저 정책상 window.close() 가 작동하지 않을 수 있습니다. 창을 직접 닫아주세요.'), 500);
        }
    };

    // ═══ Sound Settings ═══
    fns.setMasterVolume = (v) => setVolume(
        v,
        (normalized) => M.AudioEngine?.setVolume?.(normalized),
        '#settings-vol-master-val, #volMasterSliderVal',
        '#settings-vol-master-slider, #volMasterSlider',
    );
    fns.setSfxVolume = (v) => setVolume(
        v,
        (normalized) => M.AudioEngine?.setSfxVolume?.(normalized),
        '#settings-vol-sfx-val, #volSfxSliderVal',
        '#settings-vol-sfx-slider, #volSfxSlider',
    );
    fns.setAmbientVolume = (v) => setVolume(
        v,
        (normalized) => M.AudioEngine?.setAmbientVolume?.(normalized),
        '#settings-vol-ambient-val, #volAmbientSliderVal',
        '#settings-vol-ambient-slider, #volAmbientSlider',
    );

    // Settings modal bindings
    fns.openSettings = () => M.SettingsUI?.openSettings?.(Deps.getSettingsDeps());
    fns.closeSettings = () => M.SettingsUI?.closeSettings?.(Deps.getSettingsDeps());
    fns.setSettingsTab = (tab) => M.SettingsUI?.setTab?.(tab, Deps.getSettingsDeps());
    fns.resetSettings = () => M.SettingsUI?.resetToDefaults?.(Deps.getSettingsDeps());
    fns.applySettingVolume = (type, val) => M.SettingsUI?.applyVolume?.(type, val, Deps.getSettingsDeps());
    fns.applySettingVisual = (key, val) => M.SettingsUI?.applyVisual?.(key, val, Deps.getSettingsDeps());
    fns.applySettingAccessibility = (key, val) => M.SettingsUI?.applyAccessibility?.(key, val, Deps.getSettingsDeps());
    fns.startSettingsRebind = (action) => M.SettingsUI?.startRebind?.(action, Deps.getSettingsDeps());
    fns.toggleSettingMute = (type) => M.SettingsUI?.muteToggle?.(type, Deps.getSettingsDeps());
}
