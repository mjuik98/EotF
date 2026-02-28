import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();

function toModuleUrl(relPath) {
  return pathToFileURL(path.join(ROOT, relPath)).href;
}

function isNamespaced(eventName) {
  return /^[a-z]+:[a-z0-9-]+$/.test(eventName);
}

async function main() {
  const stateActionsMod = await import(toModuleUrl('game/core/state_actions.js'));
  const contractsMod = await import(toModuleUrl('game/core/event_contracts.js'));

  const actionValues = Object.values(stateActionsMod.Actions || {});
  const coreEventValues = Object.values(contractsMod.CoreEvents || {});
  const contracts = contractsMod.EventContracts || {};
  const contractKeys = Object.keys(contracts);

  const missingContracts = actionValues.filter((name) => !contracts[name]);
  const missingCoreContracts = coreEventValues.filter((name) => !contracts[name]);
  const extraContracts = contractKeys.filter(
    (name) => !actionValues.includes(name) && !coreEventValues.includes(name),
  );
  const invalidActionNames = actionValues.filter((name) => !isNamespaced(name));
  const invalidContractShape = contractKeys.filter((name) => {
    const required = contracts?.[name]?.required;
    return !Array.isArray(required) || required.length === 0;
  });

  if (
    missingContracts.length ||
    missingCoreContracts.length ||
    extraContracts.length ||
    invalidActionNames.length ||
    invalidContractShape.length
  ) {
    console.error('Event contract check failed:');
    if (missingContracts.length) {
      console.error(`- Missing contracts: ${missingContracts.join(', ')}`);
    }
    if (missingCoreContracts.length) {
      console.error(`- Missing core contracts: ${missingCoreContracts.join(', ')}`);
    }
    if (extraContracts.length) {
      console.error(`- Extra contracts: ${extraContracts.join(', ')}`);
    }
    if (invalidActionNames.length) {
      console.error(`- Invalid action names: ${invalidActionNames.join(', ')}`);
    }
    if (invalidContractShape.length) {
      console.error(`- Invalid contract shape: ${invalidContractShape.join(', ')}`);
    }
    process.exit(1);
  }

  console.log(
    `Event contract check passed (${actionValues.length} actions, ${coreEventValues.length} core events covered).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
