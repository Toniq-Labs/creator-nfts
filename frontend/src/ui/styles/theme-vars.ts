import {css} from 'element-vir';
import {unsafeCSS} from 'lit';

export const themeBodyOverScrollColorName = '--tcnft-theme-body-over-scroll-background-color';

export const themeEffectTransitionTimeVar = css`var(--tcnft-theme-effect-transition-time)`;
export const themeInteractionTransitionTimeVar = css`var(--tcnft-theme-interaction-transition-time)`;

// try to transition the css vars
export const themeColorTransitions = css`
    transition-duration: ${themeEffectTransitionTimeVar};
    transition-property: color, background-color, border-color, box-shadow, opacity;
`;

export const themeForegroundColorName = '--tcnft-theme-foreground-color';
export const themeForegroundColorVar = css`var(${unsafeCSS(themeForegroundColorName)})`;

export const themeDarkForegroundColorName = '--tcnft-theme-dark-foreground-color';
export const themeLightForegroundColorName = '--tcnft-theme-light-foreground-color';

export const themeAcceptColorVar = css`var(--tcnft-theme-accept-color)`;
export const themeErrorColorVar = css`var(--tcnft-theme-error-color)`;
export const themeForegroundPrimaryAccentColorName =
    '--tcnft-theme-foreground-primary-accent-color';
export const themeForegroundPrimaryAccentColorVar = css`var(${
    // safe because the variable is defined literally on the line above this one
    unsafeCSS(themeForegroundPrimaryAccentColorName)
})`;
export const themeForegroundLightAccentColorVar = css`var(--tcnft-theme-foreground-light-accent-color)`;
export const themeForegroundDimColorVar = css`var(--tcnft-theme-foreground-dim-color)`;

export const themeAcceptColorHighlightColorVar = css`var(--tcnft-theme-accept-color-highlight)`;

export const themeBackgroundColorVar = css`var(--tcnft-theme-background-color)`;
export const themeMenuShadowColorVar = css`var(--tcnft-theme-menu-shadow-color)`;

export const applyThemeColors = css`
    background-color: ${themeBackgroundColorVar};
    color: ${themeForegroundColorVar};
    ${themeColorTransitions}
`;

export const overlayHoverOpacityVar = css`var(--tcnft-theme-overlay-hover-opacity)`;
export const overlayActiveOpacityVar = css`var(--tcnft-theme-overlay-active-opacity)`;
export const overlayCoveringOpacityVar = css`var(--tcnft-theme-overlay-covering-opacity)`;

export const defaultFontVar = css`var(--tcnft-theme-default-font-family, sans-serif)`;
export const monospaceFontVar = css`var(--tcnft-theme-monospace-font-family, monospace)`;
export const symbolFontVar = css`var(--tcnft-theme-symbol-font-family, monospace)`;
