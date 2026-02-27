/**
 * event_reward_bindings.js — Event + Reward + Run 래퍼 함수
 *
 * 책임: 이벤트, 보상, 런 복귀 관련 래퍼
 */
import * as Deps from '../deps_factory.js';

export function createEventRewardBindings(M, fns) {
    // ═══ Event System ═══
    fns.triggerRandomEvent = () => M.EventUI?.triggerRandomEvent?.(Deps.getEventDeps());
    fns._updateEventGoldBar = () => M.EventUI?.updateEventGoldBar?.(Deps.getEventDeps());
    fns.showEvent = (event) => M.EventUI?.showEvent?.(event, Deps.getEventDeps());
    fns.resolveEvent = (choiceIdx) => M.EventUI?.resolveEvent?.(choiceIdx, Deps.getEventDeps());
    fns.showShop = () => M.EventUI?.showShop?.(Deps.getEventDeps());
    fns.showRestSite = () => M.EventUI?.showRestSite?.(Deps.getEventDeps());
    fns.showCardDiscard = (gs, isBurn = false) => M.EventUI?.showCardDiscard?.(gs, isBurn, Deps.getEventDeps());
    fns.showItemShop = (gs) => M.EventUI?.showItemShop?.(gs, Deps.getEventDeps());

    // ═══ Reward ═══
    fns.showRewardScreen = (isBoss) => M.RewardUI?.showRewardScreen?.(isBoss, Deps.getRewardDeps());
    fns.takeRewardCard = (cardId) => M.RewardUI?.takeRewardCard?.(cardId, Deps.getRewardDeps());
    fns.takeRewardItem = (itemKey) => M.RewardUI?.takeRewardItem?.(itemKey, Deps.getRewardDeps());
    fns.takeRewardUpgrade = () => M.RewardUI?.takeRewardUpgrade?.(Deps.getRewardDeps());
    fns.takeRewardRemove = () => M.RewardUI?.takeRewardRemove?.(Deps.getRewardDeps());
    fns.showSkipConfirm = () => M.RewardUI?.showSkipConfirm?.(Deps.getRewardDeps());
    fns.hideSkipConfirm = () => M.RewardUI?.hideSkipConfirm?.(Deps.getRewardDeps());
    fns.skipReward = () => M.RewardUI?.skipReward?.(Deps.getRewardDeps());

    // ═══ Run Return ═══
    fns.returnToGame = (fromReward) => M.RunReturnUI?.returnToGame?.(fromReward, Deps.getRunReturnDeps());
}
