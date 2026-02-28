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
  const contracts = contractsMod.EventContracts || {};
  const contractKeys = Object.keys(contracts);

  const missingContracts = actionValues.filter((name) => !contracts[name]);
  const extraContracts = contractKeys.filter((name) => !actionValues.includes(name));
  const invalidActionNames = actionValues.filter((name) => !isNamespaced(name));

  if (missingContracts.length || extraContracts.length || invalidActionNames.length) {
    console.error('Event contract check failed:');
    if (missingContracts.length) {
      console.error(`- Missing contracts: ${missingContracts.join(', ')}`);
    }
    if (extraContracts.length) {
      console.error(`- Extra contracts: ${extraContracts.join(', ')}`);
    }
    if (invalidActionNames.length) {
      console.error(`- Invalid action names: ${invalidActionNames.join(', ')}`);
    }
    process.exit(1);
  }

  console.log(`Event contract check passed (${actionValues.length} actions covered).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

