export function toUint8Array(input: Readonly<number[] | Uint8Array | string[]>): Uint8Array {
    if (Array.isArray(input)) {
        const numberedArray: number[] = input.map((entry): number => {
            if (typeof entry === 'string') {
                return Number(entry.trim());
            } else {
                return entry;
            }
        });

        if (numberedArray.some((entry) => isNaN(entry))) {
            throw new Error(
                `Invalid input array has or produced some NaN values: ${input.join(',')}`,
            );
        }

        return new Uint8Array(numberedArray);
    } else if (input instanceof Uint8Array) {
        return input;
    } else {
        throw new Error(`Invalid array input: ${input.join(',')}`);
    }
}

/** Caution: this mutates! */
export function moveIndex(array: any[], oldIndex: number, newIndex: number): void {
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
}

export function sortWithNullables<T>(
    fullSort: (a: NonNullable<T>, b: NonNullable<T>) => number,
    undefinedAtStart = false,
): (a: T, b: T) => number {
    return (a, b) => {
        {
            if (a !== undefined && b != undefined) {
                return fullSort(a!, b!);
            } else if (!a && !b) {
                return 0;
            } else if (!a) {
                return undefinedAtStart ? 1 : -1;
            } else {
                // this is the !b situation
                return undefinedAtStart ? -1 : 1;
            }
        }
    };
}
