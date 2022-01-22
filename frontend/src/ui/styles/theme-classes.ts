import {css} from 'lit';

export const cssThemeClassesAndVars = css`
    /* universal CSS styles */
    .tcnft-theme-dark {
        --tcnft-theme-foreground-color: var(--tcnft-theme-dark-foreground-color);
        --tcnft-theme-foreground-inverse-color: var(--tcnft-theme-light-foreground-color);

        --tcnft-theme-foreground-primary-accent-color: var(
            --tcnft-theme-dark-foreground-primary-accent-color
        );
        --tcnft-theme-foreground-light-accent-color: var(
            --tcnft-theme-dark-foreground-light-accent-color
        );
        --tcnft-theme-foreground-dim-color: var(--tcnft-theme-dark-foreground-dim-color);

        --tcnft-theme-accept-color-highlight: var(--tcnft-theme-dark-accept-color-highlight);

        --tcnft-theme-accept-color: var(--tcnft-theme-dark-accept-color);
        --tcnft-theme-error-color: var(--tcnft-theme-dark-error-color);

        --tcnft-theme-background-color: var(--tcnft-theme-dark-background-color);

        --tcnft-theme-overlay-hover-opacity: var(--tcnft-theme-dark-overlay-hover-opacity);
        --tcnft-theme-overlay-active-opacity: var(--tcnft-theme-dark-overlay-active-opacity);
        --tcnft-theme-overlay-covering-opacity: var(--tcnft-theme-dark-overlay-covering-opacity);

        --tcnft-theme-menu-shadow-color: var(--tcnft-theme-dark-menu-shadow-color);
    }

    .tcnft-theme-light {
        --tcnft-theme-foreground-color: var(--tcnft-theme-light-foreground-color);
        --tcnft-theme-foreground-inverse-color: var(--tcnft-theme-dark-foreground-color);

        --tcnft-theme-foreground-primary-accent-color: var(
            --tcnft-theme-light-foreground-primary-accent-color
        );
        --tcnft-theme-foreground-light-accent-color: var(
            --tcnft-theme-light-foreground-light-accent-color
        );
        --tcnft-theme-foreground-dim-color: var(--tcnft-theme-light-foreground-dim-color);

        --tcnft-theme-accept-color-highlight: var(--tcnft-theme-light-accept-color-highlight);

        --tcnft-theme-accept-color: var(--tcnft-theme-light-accept-color);
        --tcnft-theme-error-color: var(--tcnft-theme-light-error-color);

        --tcnft-theme-background-color: var(--tcnft-theme-light-background-color);

        --tcnft-theme-overlay-hover-opacity: var(--tcnft-theme-light-overlay-hover-opacity);
        --tcnft-theme-overlay-active-opacity: var(--tcnft-theme-light-overlay-active-opacity);
        --tcnft-theme-overlay-covering-opacity: var(--tcnft-theme-light-overlay-covering-opacity);

        --tcnft-theme-menu-shadow-color: var(--tcnft-theme-light-menu-shadow-color);
    }
`;
