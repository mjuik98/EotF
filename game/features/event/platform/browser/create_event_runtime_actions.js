export function createEventActions(modules, ports) {
  return {
    triggerRandomEvent() {
      modules.EventUI?.triggerRandomEvent?.(ports.getEventDeps());
    },

    _updateEventGoldBar() {
      modules.EventUI?.updateEventGoldBar?.(ports.getEventDeps());
    },

    showEvent(event) {
      modules.EventUI?.showEvent?.(event, ports.getEventDeps());
    },

    resolveEvent(choiceIdx) {
      modules.EventUI?.resolveEvent?.(choiceIdx, ports.getEventDeps());
    },

    showShop() {
      modules.EventUI?.showShop?.(ports.getEventDeps());
    },

    showRestSite() {
      modules.EventUI?.showRestSite?.(ports.getEventDeps());
    },

    showCardDiscard(gs, isBurn = false) {
      modules.EventUI?.showCardDiscard?.(gs, isBurn, ports.getEventDeps());
    },

    showItemShop(gs) {
      modules.EventUI?.showItemShop?.(gs, ports.getEventDeps());
    },
  };
}
