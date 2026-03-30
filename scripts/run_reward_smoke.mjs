import { runHostedSmokeWrapper } from './smoke_wrapper_support.mjs';

const result = await runHostedSmokeWrapper({
  scriptFile: 'smoke_deep_combat_reward.mjs',
  outDirSegments: ['refactor-smoke-reward-flow'],
  scriptArgs: ({ appUrl, outDir }) => ['--url', appUrl, '--out-dir', outDir],
  label: 'reward smoke',
});

process.exit(result);
