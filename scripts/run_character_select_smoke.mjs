import { runForwardedSmokeWrapper } from './smoke_wrapper_support.mjs';

process.exit(runForwardedSmokeWrapper({
  scriptFile: 'character_select_smoke_check.mjs',
  outDirSegments: ['character-select-level-xp-smoke'],
}));
