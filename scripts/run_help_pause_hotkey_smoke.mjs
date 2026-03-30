import { runHostedSmokeWrapper } from './smoke_wrapper_support.mjs';

const result = await runHostedSmokeWrapper({
  scriptFile: 'help_pause_hotkey_smoke_check.mjs',
  outDirSegments: ['help-pause-hotkey-smoke'],
  label: 'help/pause smoke',
});

process.exit(result);
