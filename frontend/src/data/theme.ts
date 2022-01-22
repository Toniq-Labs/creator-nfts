export const ThemeAuto = 'tcnft-theme-browser-auto' as const;
export type ThemeAuto = typeof ThemeAuto;
export const Theme = {
    light: 'tcnft-theme-light',
    dark: 'tcnft-theme-dark',
} as const;
export type Theme = typeof Theme[keyof typeof Theme];
