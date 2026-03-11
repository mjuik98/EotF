export function buildBindingStateHelpers({ modules }) {
  return {
    _gameStarted: () => modules._gameStarted,
    markGameStarted: () => {
      modules._gameStarted = true;
    },
  };
}
