/**
 * title_settings_bindings.js — Title/Navigation + Help/Pause + Sound + Utility 래퍼 함수
 *
 * 책임: 타이틀 화면, 도움말/일시정지, 사운드 설정, 유틸리티 래퍼
 */
import * as Deps from '../deps_factory.js';
import { IntroCinematicUI } from '../../ui/title/intro_cinematic_ui.js';

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

    fns.startGame = () => {
        M.AudioEngine?.playClick?.();
        // Keep title subscreens hidden until game screen activation to avoid
        // one-frame flashes of the previous title UI during transition.
        const main = document.getElementById('mainTitleSubScreen');
        const char = document.getElementById('charSelectSubScreen');
        if (char) char.style.display = 'none';
        if (main) main.style.display = 'none';

        // 인트로 연출 → 완료 후 실제 게임 시작
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
        '#volMasterVal, #volMasterSliderVal',
        '#volMasterSlider, #volMaster',
    );
    fns.setSfxVolume = (v) => setVolume(
        v,
        (normalized) => M.AudioEngine?.setSfxVolume?.(normalized),
        '#volSfxVal, #volSfxSliderVal',
        '#volSfxSlider, #volSfx',
    );
    fns.setAmbientVolume = (v) => setVolume(
        v,
        (normalized) => M.AudioEngine?.setAmbientVolume?.(normalized),
        '#volAmbientVal, #volAmbientSliderVal',
        '#volAmbientSlider, #volAmbient',
    );
}
