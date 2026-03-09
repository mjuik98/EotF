/**
 * ui_bindings.js — UI System + Deck/Codex + Tooltip + Screen 래퍼 함수
 *
 * 책임: HUD 갱신, 덱/코덱스 모달, 툴팁, 화면 전환 래퍼
 */
import * as Deps from '../deps_factory.js';

export function createUIBindings(M, fns) {
    // ═══ UI System ═══
    fns.updateUI = () => M.HudUpdateUI?.updateUI?.(Deps.getHudUpdateDeps());
    fns._doUpdateUI = () => M.HudUpdateUI?.doUpdateUI?.(Deps.getHudUpdateDeps());
    fns._updateEndBtnWarn = () => M.HudUpdateUI?.updateEndBtnWarn?.(Deps.getHudUpdateDeps());

    fns.updateStatusDisplay = () => {
        const doc = document;
        const containerIds = ['statusEffects', 'ncFloatingHpStatusBadges']
            .filter((id, idx, arr) => arr.indexOf(id) === idx)
            .filter((id) => doc.getElementById(id));

        if (!containerIds.length) {
            containerIds.push('statusEffects');
        }

        containerIds.forEach((statusContainerId) => {
            M.StatusEffectsUI?.updateStatusDisplay?.({
                gs: M.GS,
                doc,
                statusContainerId,
                tooltipUI: M.TooltipUI,
                refreshCombatInfoPanel: () => fns._refreshCombatInfoPanel?.(),
            });
        });
    };

    fns._resetCombatInfoPanel = () => M.CombatInfoUI?.reset?.(Deps.getCombatInfoDeps());
    fns.toggleCombatInfo = () => M.CombatInfoUI?.toggle?.(Deps.getCombatInfoDeps());
    fns._refreshCombatInfoPanel = () => M.CombatInfoUI?.refresh?.(Deps.getCombatInfoDeps());

    fns.updateChainUI = (chain) => M.CombatHudUI?.updateChainUI?.(chain, Deps.getCombatHudDeps());
    fns.updateNoiseWidget = () => M.CombatHudUI?.updateNoiseWidget?.(Deps.getCombatHudDeps());
    fns.updateClassSpecialUI = () => M.CombatHudUI?.updateClassSpecialUI?.(Deps.getCombatHudDeps());

    fns.setBar = (id, pct) => M.DomValueUI?.setBar?.(id, pct, { doc: document });
    fns.setText = (id, val) => M.DomValueUI?.setText?.(id, val, { doc: document });

    // ═══ Deck Modal / Codex ═══
    fns.showDeckView = () => M.DeckModalUI?.showDeckView?.(Deps.getDeckModalDeps());
    fns._renderDeckModal = () => M.DeckModalUI?.renderDeckModal?.(Deps.getDeckModalDeps());
    fns.setDeckFilter = (type) => M.DeckModalUI?.setDeckFilter?.(type, Deps.getDeckModalDeps());
    fns.closeDeckView = () => M.DeckModalUI?.closeDeckView?.(Deps.getDeckModalDeps());

    fns.openCodex = () => {
        M.AudioEngine?.playClick?.();
        M.CodexUI?.openCodex?.(Deps.getCodexDeps());
    };
    fns.setCodexTab = (tab) => M.CodexUI?.setCodexTab?.(tab, Deps.getCodexDeps());
    fns.renderCodexContent = () => M.CodexUI?.renderCodexContent?.(Deps.getCodexDeps());
    fns.closeCodex = () => M.CodexUI?.closeCodex?.(Deps.getCodexDeps());

    // ═══ Tooltips ═══
    fns.showTooltip = (event, cardId) => M.TooltipUI?.showTooltip?.(event, cardId, Deps.getTooltipDeps());
    fns.hideTooltip = () => M.TooltipUI?.hideTooltip?.(Deps.getTooltipDeps());
    fns.attachCardTooltips = () => M.TooltipUI?.attachCardTooltips?.(Deps.getTooltipDeps());
    fns.showItemTooltip = (event, itemId) => M.TooltipUI?.showItemTooltip?.(event, itemId, Deps.getTooltipDeps());
    fns.hideItemTooltip = () => M.TooltipUI?.hideItemTooltip?.(Deps.getTooltipDeps());
    fns.showGeneralTooltip = (event, title, content) => M.TooltipUI?.showGeneralTooltip?.(event, title, content, Deps.getTooltipDeps());
    fns.hideGeneralTooltip = () => M.TooltipUI?.hideGeneralTooltip?.(Deps.getTooltipDeps());

    // ═══ Screen FSM ═══
    fns.switchScreen = (screen) => M.ScreenUI?.switchScreen?.(screen, Deps.getScreenDeps());
}
