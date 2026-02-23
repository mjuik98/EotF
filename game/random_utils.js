'use strict';

(function initRandomUtils(globalObj) {
  const RandomUtils = {
    shuffleArray(arr) {
      if (!Array.isArray(arr)) return arr;
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  };

  globalObj.RandomUtils = RandomUtils;
})(window);
