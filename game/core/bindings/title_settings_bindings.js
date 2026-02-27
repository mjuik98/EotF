/**
 * title_settings_bindings.js — Title/Navigation + Help/Pause + Sound + Utility 래퍼 함수
 *
 * 책임: 타이틀 화면, 도움말/일시정지, 사운드 설정, 유틸리티 래퍼
 */
import * as Deps from '../deps_factory.js';

export function createTitleSettingsBindings(M, fns) {
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
    fns.selectClass = (btn) => {
        M.AudioEngine?.playClick?.();
        M.ClassSelectUI?.selectClass?.(btn, Deps.getClassSelectDeps());
    };
    fns.startGame = () => {
        M.AudioEngine?.playClick?.();
        M.RunSetupUI?.startGame?.(Deps.getRunSetupDeps());
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
    fns.advanceToNextRegion = () => M.RegionTransitionUI?.advanceToNextRegion?.(Deps.getRegionTransitionDeps());

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
    fns.setMasterVolume = (v) => {
        let val = parseInt(v); if (isNaN(val)) val = 0;
        val = Math.max(0, Math.min(100, val));
        M.AudioEngine?.setVolume?.(val / 100);
        document.querySelectorAll('#volMasterVal').forEach(el => { if (el) el.textContent = val + '%'; });
        document.querySelectorAll('#volMasterSlider, #volMaster').forEach(el => { if (el) el.style.setProperty('--fill-percent', val + '%'); });
        M.GameInit?.saveVolumes?.(M.AudioEngine);
    };
    fns.setSfxVolume = (v) => {
        let val = parseInt(v); if (isNaN(val)) val = 0;
        val = Math.max(0, Math.min(100, val));
        M.AudioEngine?.setSfxVolume?.(val / 100);
        document.querySelectorAll('#volSfxVal').forEach(el => { if (el) el.textContent = val + '%'; });
        document.querySelectorAll('#volSfxSlider, #volSfx').forEach(el => { if (el) el.style.setProperty('--fill-percent', val + '%'); });
        M.GameInit?.saveVolumes?.(M.AudioEngine);
    };
    fns.setAmbientVolume = (v) => {
        let val = parseInt(v); if (isNaN(val)) val = 0;
        val = Math.max(0, Math.min(100, val));
        M.AudioEngine?.setAmbientVolume?.(val / 100);
        document.querySelectorAll('#volAmbientVal').forEach(el => { if (el) el.textContent = val + '%'; });
        document.querySelectorAll('#volAmbientSlider, #volAmbient').forEach(el => { if (el) el.style.setProperty('--fill-percent', val + '%'); });
        M.GameInit?.saveVolumes?.(M.AudioEngine);
    };
}
