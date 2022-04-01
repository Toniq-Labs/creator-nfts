import {getObjectTypedKeys} from 'augment-vir';

export function trimKeyLength<InputTypeGeneric extends object>(
    count: number,
    inputObject: InputTypeGeneric,
): InputTypeGeneric {
    return getObjectTypedKeys(inputObject)
        .slice(count)
        .reduce((accum: InputTypeGeneric, currentKey: keyof InputTypeGeneric): InputTypeGeneric => {
            accum[currentKey] = inputObject[currentKey];
            return accum;
        }, {} as InputTypeGeneric);
}

export function filterKeys<
    OutputTypeGeneric extends Partial<InputTypeGeneric>,
    InputTypeGeneric extends object,
>(
    inputObject: InputTypeGeneric,
    filterCallback: (
        key: keyof InputTypeGeneric,
        value: InputTypeGeneric[keyof InputTypeGeneric],
    ) => boolean,
): OutputTypeGeneric {
    const filtered: OutputTypeGeneric = getObjectTypedKeys(inputObject).reduce(
        (accum: OutputTypeGeneric, currentKey: keyof InputTypeGeneric) => {
            if (filterCallback(currentKey, inputObject[currentKey])) {
                (accum as unknown as InputTypeGeneric)[currentKey] = inputObject[currentKey];
            }
            return accum;
        },
        {} as OutputTypeGeneric,
    );
    return filtered;
}

export function mapKeys<
    OutputTypeGeneric extends Record<keyof InputTypeGeneric, unknown>,
    InputTypeGeneric extends object,
>(
    inputObject: InputTypeGeneric,
    mapCallback: (
        key: keyof InputTypeGeneric,
        value: InputTypeGeneric[keyof InputTypeGeneric],
    ) => OutputTypeGeneric[keyof OutputTypeGeneric],
): OutputTypeGeneric {
    const filtered: OutputTypeGeneric = getObjectTypedKeys(inputObject).reduce(
        (accum: OutputTypeGeneric, currentKey: keyof InputTypeGeneric) => {
            accum[currentKey as keyof OutputTypeGeneric] = mapCallback(
                currentKey,
                inputObject[currentKey],
            );
            return accum;
        },
        {} as OutputTypeGeneric,
    );
    return filtered;
}

function getSortedEntries(input: object): [string, unknown][] {
    return Object.entries(input).sort((tupleA, tupleB) => tupleA[0].localeCompare(tupleB[0]));
}

export function isJsonEqual(a: object, b: object): boolean {
    try {
        const sortedAEntries = getSortedEntries(a);
        const sortedBEntries = getSortedEntries(b);
        return JSON.stringify(sortedAEntries) === JSON.stringify(sortedBEntries);
    } catch (error) {
        console.error(`Failed to compare objects using JSON.stringify`);
        throw error;
    }
}

export function copyWithJson<T>(input: T): T {
    try {
        return JSON.parse(JSON.stringify(input));
    } catch (error) {
        console.error(`Failed to JSON copy for`, input);
        throw error;
    }
}

export type ValueOf<T extends object> = T[keyof T];
