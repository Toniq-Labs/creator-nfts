import {cssThemeClassesAndVars} from '@frontend/src/ui/styles/theme-classes';
import {applyThemeColors} from '@frontend/src/ui/styles/theme-vars';
import {css} from 'lit';

export const rootElementDefaultStyles = css`
    :host(.tcnft-root-effects-enabled) {
        /* effects can take longer so that users notice them more */
        --tcnft-theme-effect-transition-time: 500ms;
    }

    :host {
        min-height: 100%;
        width: 100%;
        /*
            This position: fixed is unfortunate but required to prevent Safari from adding secret
            scrollbar margins that can't be detected or mitigated in any other way while still allowing
            scrolling.
            Adapted from https://stackoverflow.com/a/29319920
        */
        position: fixed;
        inset: 0;
    }

    /* These styles are not contained in the root-elements.css file because they reference small
    reusable styles via JS objects */
    main {
        width: 100%;
        height: 100%;
        inset: 0;
        overflow-x: hidden;
        overflow-y: auto;
        position: fixed;
        font-family: var(--tcnft-theme-default-font-family);
        font-size: 16px;
        box-sizing: border-box;
        ${applyThemeColors}
    }

    ${cssThemeClassesAndVars}
`;
