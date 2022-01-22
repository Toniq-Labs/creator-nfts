import {
    localStorageValidators,
    ValidatedLocalStorageType,
} from '@frontend/src/local-storage/local-storage-validators';
import {LocalStorageKey} from './local-storage-keys';

export function writeLocalStorageValue(
    key: LocalStorageKey,
    value: ValidatedLocalStorageType<typeof key> | undefined,
) {
    try {
        // double equals so we also catch null
        if (value == undefined) {
            window.localStorage.removeItem(key);
        } else {
            window.localStorage.setItem(key, value);
        }
    } catch (error) {
        // don't let failed localStorage writes block the rest of the app
        console.error(error);
    }
}

export function readLocalStorageValue<CurrentKeyGeneric extends LocalStorageKey>(
    key: CurrentKeyGeneric,
): ValidatedLocalStorageType<CurrentKeyGeneric> | undefined {
    const item = window.localStorage.getItem(key);
    if (item == null) {
        return undefined;
    }
    try {
        const validatedItem = localStorageValidators[key](
            item,
        ) as ValidatedLocalStorageType<CurrentKeyGeneric>;
        return validatedItem;
    } catch (validationError) {
        console.error(validationError);
        return undefined;
    }
}
