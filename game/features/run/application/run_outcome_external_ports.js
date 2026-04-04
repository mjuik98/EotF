import { createRunOutcomeIntegrationPorts } from '../ports/create_run_outcome_integration_ports.js';

export function resolveRunOutcomeExternalPorts(deps = {}) {
  const overridePorts = deps.externalPorts || {};
  const integrationPorts = deps.runOutcomeIntegrationPorts || createRunOutcomeIntegrationPorts();

  return {
    awardRunXp: overridePorts.awardRunXp || integrationPorts.awardRunXp,
    evaluateAchievements: overridePorts.evaluateAchievements || integrationPorts.evaluateAchievements,
    persistMeta: overridePorts.persistMeta || integrationPorts.persistMeta,
  };
}
