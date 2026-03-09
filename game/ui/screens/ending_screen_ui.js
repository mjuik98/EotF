import {
  ROOT_ID,
  applyEndingRank,
  appendEndingFragmentChoices,
  buildEndingPayload,
  buildEndingScreenDOM,
  decorateEndingPayloadForOutcome,
  docOf,
  ensureEndingScreenStyle,
  findRankIndexByGlyph,
  getEndingRanks,
  populateEndingMeta,
  winOf,
} from './ending_screen_helpers.js';
import { burstEndingWisps, initEndingFx, runEndingScene } from './ending_screen_fx.js';

let _session = null;

function showOutcomeScreen(outcome = 'victory', deps = {}) {
  const doc = docOf(deps);
  const gs = deps?.gs;
  const data = deps?.data;
  if (!doc?.body || !gs?.meta || !gs?.player || !gs?.stats) return false;

  EndingScreenUI.cleanup({ doc, win: deps?.win });
  ensureEndingScreenStyle(doc);

  const payload = decorateEndingPayloadForOutcome(buildEndingPayload(gs, data), outcome);
  const root = buildEndingScreenDOM(doc, payload);
  doc.body.appendChild(root);

  _session = { cleanups: [], timers: [], payload };
  populateEndingMeta(doc, payload, _session, deps);
  appendEndingFragmentChoices(doc, deps, outcome, _session, EndingScreenUI.cleanup);
  applyEndingRank(doc, payload.rank, payload.score);

  const { wisps } = initEndingFx(doc, deps, _session);
  const sigil = doc.getElementById('sigilWrap');
  const ranks = getEndingRanks();
  let rankIndex = findRankIndexByGlyph(payload.rank.glyph);

  const onSigil = () => {
    rankIndex = (rankIndex + 1) % ranks.length;
    applyEndingRank(doc, ranks[rankIndex], payload.score);
    const rect = sigil?.getBoundingClientRect?.();
    if (rect) {
      burstEndingWisps(wisps, rect.left + (rect.width / 2), rect.top + (rect.height / 2), 12);
    }
  };
  sigil?.addEventListener('click', onSigil);
  _session.cleanups.push(() => sigil?.removeEventListener('click', onSigil));

  const restartButton = doc.getElementById('btnR');
  const onRestart = () => {
    const rect = restartButton?.getBoundingClientRect?.();
    const audio = deps.audioEngine || globalThis.GAME?.Audio || globalThis.AudioEngine;
    const restart = deps.restartFromEnding || globalThis.GAME?.API?.restartFromEnding || globalThis.restartFromEnding;

    if (rect) {
      for (let i = 0; i < 5; i += 1) {
        _session.timers.push(
          winOf(deps).setTimeout(() => {
            burstEndingWisps(
              wisps,
              rect.left + (rect.width / 2) + ((Math.random() - 0.5) * rect.width * 0.85),
              rect.top + (rect.height / 2),
              14,
            );
          }, i * 70),
        );
      }
    }

    audio?.playResonanceBurst?.();
    _session.timers.push(winOf(deps).setTimeout(() => {
      EndingScreenUI.cleanup({ doc, win: deps?.win });
      if (typeof restart === 'function') restart();
    }, 420));
  };
  restartButton?.addEventListener('click', onRestart);
  _session.cleanups.push(() => restartButton?.removeEventListener('click', onRestart));

  runEndingScene(doc, deps, payload, wisps, _session, burstEndingWisps);
  return true;
}

export const EndingScreenUI = {
  show(isHidden, deps = {}) {
    if (isHidden) return false;
    return showOutcomeScreen('victory', deps);
  },

  showOutcome(outcome = 'victory', deps = {}) {
    return showOutcomeScreen(outcome, deps);
  },

  cleanup(deps = {}) {
    const doc = docOf(deps);
    if (_session) {
      _session.timers.forEach((timer) => winOf(deps).clearTimeout(timer));
      _session.cleanups.forEach((fn) => {
        try {
          fn?.();
        } catch {}
      });
      _session = null;
    }
    doc?.getElementById?.(ROOT_ID)?.remove?.();
  },
};
