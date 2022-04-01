export function delayPromise(time: number): Promise<void> {
    if (time === Infinity || time < 0) {
        // never resolves
        return new Promise(() => {});
    }
    return new Promise<void>((resolve) => setTimeout(resolve, time));
}

export function withTimeout<PromiseType>(
    duration: number,
    promise: Promise<PromiseType>,
): Promise<PromiseType> {
    return new Promise<PromiseType>(async (resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
            reject('Promise timeout exceeded.');
        }, duration);
        try {
            await promise;
            resolve(promise);
        } catch (error) {
            reject(error);
        } finally {
            window.clearTimeout(timeoutId);
        }
    });
}

export function isPromise(input: any): input is Promise<unknown> {
    return input instanceof Promise;
}
