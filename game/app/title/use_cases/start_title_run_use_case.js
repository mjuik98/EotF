export function startTitleRunUseCase({
  getSelectedClass,
  hideTitleSubscreens,
  markPreRunRipplePlayed,
  playIntroCinematic,
  playPrelude,
  startRunSetup,
} = {}) {
  hideTitleSubscreens?.();

  const startRunFlow = () => {
    markPreRunRipplePlayed?.();
    playIntroCinematic?.(
      {
        getSelectedClass,
      },
      () => {
        startRunSetup?.();
      },
    );
  };

  playPrelude?.(startRunFlow);
}
