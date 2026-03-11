export function buildUiRuntimeSubscriberActions(fns) {
  return {
    updateEchoSkillBtn: fns.updateEchoSkillBtn,
    updateNoiseWidget: fns.updateNoiseWidget,
    updateStatusDisplay: fns.updateStatusDisplay,
    updateUI: fns.updateUI,
  };
}
