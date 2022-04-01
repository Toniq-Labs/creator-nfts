import {isEnumValue} from 'augment-vir';
import {Theme, ThemeAuto} from '../data/theme';
import {StaticLocalStorageKey} from './local-storage-keys';

type LocalStorageValidator<T = unknown> = (item: unknown) => T | undefined;

export type ValidatedLocalStorageType<CurrentKey extends StaticLocalStorageKey> = ReturnType<
    typeof localStorageValidators[CurrentKey]
>;

export const localStorageValidators = (<
    T extends Readonly<Record<StaticLocalStorageKey, LocalStorageValidator>>,
>(
    input: T,
): typeof input => input)({
    [StaticLocalStorageKey.lastManuallyChosenTheme]: (item): Theme | ThemeAuto => {
        if (isEnumValue(item, Theme) || item === ThemeAuto) {
            return item;
        } else {
            console.error(new Error(`Invalid theme value saved: ${item}`));
            return ThemeAuto;
        }
    },
    [StaticLocalStorageKey.stoicIdentity]: (item: any) => item,
});
