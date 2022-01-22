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
