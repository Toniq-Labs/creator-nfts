import {Theme, ThemeAuto} from '@frontend/src/data/theme';
import {readLocalStorageValue} from '@frontend/src/local-storage/local-storage';
import {StaticLocalStorageKey} from '@frontend/src/local-storage/local-storage-keys';
import {
    themeBodyOverScrollColorName,
    themeDarkForegroundColorName,
    themeForegroundPrimaryAccentColorName,
    themeLightForegroundColorName,
} from '@frontend/src/ui/styles/theme-vars';
import {getObjectTypedKeys, isEnumValue} from 'augment-vir';
import {css} from 'element-vir';
import {CSSResult, unsafeCSS} from 'lit';

export const themeEffectsEnabledClassName = 'tcnft-root-effects-enabled';

/** In an array so we can guarantee ordering */
export const allThemes = [
    Theme.light,
    Theme.dark,
] as const;

export const themeLabelMapping: Record<Theme | ThemeAuto, string> = {
    [Theme.light]: 'Light',
    [Theme.dark]: 'Dark',
    [ThemeAuto]: 'Auto',
};

function getThemeIndex(theme: Theme): number {
    return allThemes.indexOf(theme);
}

export function getNextTheme(theme: Theme): Theme {
    const currentIndex = getThemeIndex(theme);
    const nextTheme = allThemes[currentIndex + 1];
    return nextTheme ?? allThemes[0];
}

type ThemeClass = Record<keyof typeof Theme, CSSResult>;
export const ThemeClass = getObjectTypedKeys(Theme).reduce((accum, currentKey) => {
    accum[currentKey] = css`.${unsafeCSS(Theme[currentKey])}`;
    return accum;
}, {} as ThemeClass);

/** There are some extra places to propagate theme changes to outside of our web component tree */
export function setThemeOnBody(themeElement: Element) {
    setTimeout(() => {
        requestAnimationFrame(() => {
            const computedThemeStyles = window.getComputedStyle(themeElement);

            const primaryAccentColorValue = computedThemeStyles.getPropertyValue(
                themeForegroundPrimaryAccentColorName,
            );

            window.document.body.style.setProperty(
                themeBodyOverScrollColorName,
                primaryAccentColorValue,
            );
        });
    }, 100);
}

export function determineTheme(inputTheme: Theme | ThemeAuto | undefined): Theme {
    const newTheme = inputTheme === ThemeAuto ? getAutoThemePreference() : inputTheme;
    if (newTheme && isEnumValue(newTheme, Theme)) {
        return newTheme;
    } else {
        return Theme.light;
    }
}

/**
 * This is used when the theme is set to ThemeAuto. It reads browser settings (which are usually set
 * by the operating system) to determine if the user prefers light or dark mode.
 */
function getAutoThemePreference(): Theme {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return Theme.dark;
    } else {
        return Theme.light;
    }
}

export function getLastUsedTheme(): Theme | ThemeAuto | undefined {
    return readLocalStorageValue(StaticLocalStorageKey.lastManuallyChosenTheme);
}

export const foregroundColorNameByTheme: Record<Theme, string> = {
    [Theme.dark]: themeDarkForegroundColorName,
    [Theme.light]: themeLightForegroundColorName,
};
