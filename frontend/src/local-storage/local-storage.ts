import {LocalStorageKey} from '@frontend/src/local-storage/local-storage-keys';
import {
    localStorageValidators,
    ValidatedLocalStorageType,
} from '@frontend/src/local-storage/local-storage-validators';
import {isEnumValue} from 'augment-vir/dist';
import {StaticLocalStorageKey} from './local-storage-keys';

export type LocalStorageValue<KeyGeneric extends LocalStorageKey> =
    KeyGeneric extends StaticLocalStorageKey ? ValidatedLocalStorageType<KeyGeneric> : string;

export function writeLocalStorageValue<KeyGeneric extends LocalStorageKey>(
    key: KeyGeneric,
    value: LocalStorageValue<KeyGeneric> | undefined,
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

export function readLocalStorageValue<KeyGeneric extends LocalStorageKey>(
    key: KeyGeneric,
): LocalStorageValue<KeyGeneric> | undefined {
    try {
        const item = window.localStorage.getItem(key);
        if (item == null) {
            return undefined;
        }
        const validatedItem = isEnumValue(key, StaticLocalStorageKey)
            ? localStorageValidators[key](item)
            : item;
        return validatedItem;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}
