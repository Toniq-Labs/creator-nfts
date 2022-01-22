import {isEnumValue} from 'augment-vir';
import {Theme, ThemeAuto} from '../data/theme';
import {LocalStorageKey} from './local-storage-keys';

type LocalStorageValidator<T = unknown> = (item: unknown) => T | undefined;

export type ValidatedLocalStorageType<CurrentKey extends LocalStorageKey> = ReturnType<
    typeof localStorageValidators[CurrentKey]
>;

export const localStorageValidators = (<
    T extends Readonly<Record<LocalStorageKey, LocalStorageValidator>>,
>(
    input: T,
): typeof input => input)({
    [LocalStorageKey.lastManuallyChosenTheme]: (item): Theme | ThemeAuto => {
        if (isEnumValue(item, Theme) || item === ThemeAuto) {
            return item;
        } else {
            throw new Error(`Invalid theme value saved: ${item}`);
        }
    },
});
