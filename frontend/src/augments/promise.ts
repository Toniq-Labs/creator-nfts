export function delayPromise(time: number): Promise<void> {
    if (time === Infinity || time < 0) {
        // never resolves
        return new Promise(() => {});
    }
    return new Promise<void>((resolve) => setTimeout(resolve, time));
}
