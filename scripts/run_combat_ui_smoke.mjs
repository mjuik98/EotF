import { runHostedSmokeWrapper } from './smoke_wrapper_support.mjs';

const result = await runHostedSmokeWrapper({
  scriptFile: 'smoke_combat_ui.mjs',
  outDirSegments: ['refactor-smoke-combat-ui'],
  scriptArgs: ({ appUrl, outDir }) => ['--url', appUrl, '--out-dir', outDir],
  label: 'combat smoke',
});

process.exit(result);
