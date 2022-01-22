import {readFileSync} from 'fs';
import {join} from 'path';

const dfxDir = join(__dirname, '..', 'dfx-link');
const canisterIdsFileName = 'canister_ids.json';

type CanisterIdDefinition = {
    local?: string;
    ic?: string;
};
type CanisterIds = Record<string, CanisterIdDefinition> & {__CANDID_UI: CanisterIdDefinition};

// Generate canister ids, required by the generated canister code in .dfx/local/canisters/*
export function getCanisterDefinitions(isDev: boolean) {
    console.info(`Using ${isDev ? 'dev' : 'prod'} config.`);
    const canisterIdsPath = isDev
        ? join(dfxDir, 'local', canisterIdsFileName)
        : join(__dirname, '..', '..', canisterIdsFileName);

    let fileContents: string;
    try {
        fileContents = readFileSync(canisterIdsPath).toString();
    } catch (error) {
        // more description error so we can easily track this down if it goes wrong
        throw new Error(`Failed to read canister ids from "${canisterIdsPath}": ${String(error)}`);
    }

    let canisterIds: CanisterIds;
    try {
        canisterIds = JSON.parse(fileContents);
    } catch (error) {
        throw new Error(
            `Failed to parse JSON from canister ids file "${canisterIdsPath}": ${String(error)}`,
        );
    }

    return Object.entries(canisterIds).reduce((accum, [key, idDefinition]) => {
        const processKeyName = `process.env.${key.toUpperCase()}_CANISTER_ID`;
        const idProperty: keyof CanisterIdDefinition = isDev ? 'local' : 'ic';
        const canisterId = idDefinition[idProperty];

        if (!canisterId) {
            throw new Error(
                `Tried to access "${idProperty}" canister id because isDev=${isDev} but "${idProperty}" was undefined in ${JSON.stringify(
                    idDefinition,
                )}`,
            );
        }

        console.info(processKeyName, canisterId);
        return {
            ...accum,
            // JSON.stringify used here to wrap the string in quotes in order to appease vite
            [processKeyName]: JSON.stringify(canisterId),
        };
    }, {});
}
