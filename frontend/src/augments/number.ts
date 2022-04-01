/**
 * Converts falsy values (undefined, null) and NaN values to zero. Otherwise, this is basically just
 * a wrapper for Number(input).
 */
export function safeStringToNumber(input: string | undefined | null): number {
    if (!input) {
        return 0;
    }

    const converted = Number(input);

    if (isNaN(converted)) {
        return 0;
    } else {
        return converted;
    }
}

export function e8sToIcp(e8sPrice: bigint): number {
    const conversion = 100000000; // 10^8
    const icp = Number(e8sPrice) / conversion; // could overflow...

    return icp;
}

export function clamp({
    value,
    min,
    max,
}: {
    value: number | undefined;
    min: number;
    max: number;
}): number | undefined {
    if (value == undefined) {
        return undefined;
    }

    return Math.max(Math.min(value, max), min);
}
