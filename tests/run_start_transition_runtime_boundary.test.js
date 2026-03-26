import { describe, expect, it } from 'vitest';

import { pathExists, readText } from './helpers/guardrail_fs.js';

describe('run start transition runtime boundary', () => {
  it('keeps the browser transition runtime canonically owned by run presentation', () => {
    expect(pathExists('game/features/run/presentation/browser/run_start_transition_runtime.js')).toBe(true);

    const compatSource = readText('game/features/run/application/run_start_transition_runtime.js');
    const canonicalSource = readText('game/features/run/presentation/browser/run_start_transition_runtime.js');

    expect(compatSource).toContain("../presentation/browser/run_start_transition_runtime.js");
    expect(canonicalSource).toContain("../../../../platform/browser/effects/echo_ripple_transition.js");
  });

  it('routes run-start application code through the presentation-owned transition runtime', () => {
    const createRuntimeSource = readText('game/features/run/application/create_run_start_runtime.js');
    const gameplayRuntimeSource = readText('game/features/run/application/run_start_gameplay_runtime.js');

    expect(createRuntimeSource).toContain("../presentation/browser/run_start_transition_runtime.js");
    expect(gameplayRuntimeSource).toContain("../presentation/browser/run_start_transition_runtime.js");
    expect(createRuntimeSource).not.toContain("./run_start_transition_runtime.js");
    expect(gameplayRuntimeSource).not.toContain("./run_start_transition_runtime.js");
  });
});
