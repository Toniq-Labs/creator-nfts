import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {
    overlayActiveOpacityVar,
    overlayHoverOpacityVar,
    themeAcceptColorVar,
    themeColorTransitions,
    themeForegroundColorVar,
    themeForegroundPrimaryAccentColorVar,
    themeInteractionTransitionTimeVar,
} from '@frontend/src/ui/styles/theme-vars';
import {css, html} from 'element-vir';

export const CoreButton = defineCreatorNftElement({
    tagName: 'tcnft-core-button',
    props: {
        /**
         * The string to include inside the button.
         *
         * This is a property rather than just a HTML slot element because we can't control style or
         * user-select (to prevent double-click selection) in a consistent manner with an HTML slot
         * element; it would have to be applied to EVERY consumer's slot usage. A property here
         * allows us to apply it once, in one spot.
         */
        label: 'button-label',
        /** Set to false to disable click events and tabbing. */
        clickable: true,
    },
    styles: css`
        :host {
            color: ${themeForegroundPrimaryAccentColorVar};
            display: inline-block;
            user-select: none;
            -webkit-user-select: none;
            border-radius: 4px;
            position: relative;
            cursor: pointer;
            box-sizing: border-box;
            font-weight: bold;
            text-decoration: inherit;
            ${themeColorTransitions};
            transition-duration: ${themeInteractionTransitionTimeVar};
            max-width: 100%;
            flex-shrink: 0;
        }

        :host(.tcnft-core-button-accept-theme) {
            color: ${themeAcceptColorVar};
        }

        button {
            width: 100%;
            height: 100%;

            padding: var(--tcnft-core-button-padding, 0.5em 1em);
            margin: 0;

            display: inline-flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;

            user-select: none;
            -webkit-user-select: none;

            border-radius: inherit;
            border: none;

            color: inherit;
            outline: none;
            background-color: currentColor;

            font: inherit;
            text-decoration: inherit;
            z-index: 10;
        }

        button:focus + .focus-border {
            z-index: 10;
            border: 3px solid blue;
        }

        .focus-border {
            z-index: -1;
            position: absolute;
            top: -2px;
            left: -2px;
            border-radius: inherit;
            width: calc(100% - 2px);
            height: calc(100% - 2px);
            background: none;
        }

        span {
            color: white;
            text-decoration: inherit;
        }

        .overlay {
            user-select: none;
            -webkit-user-select: none;

            position: absolute;
            /* one more than the button z-index so it shows up above the button */
            z-index: 11;
            inset: 0;
            opacity: 0;
            width: 100%;
            height: 100%;
            transition: ${themeInteractionTransitionTimeVar};
            border-radius: inherit;
        }

        :host(:hover) .overlay {
            background-color: white;
            opacity: 0.15;
        }

        :host(:active) .overlay {
            background-color: black;
            opacity: 0.1;
        }

        :host(.tcnft-core-button-text-button) {
            color: ${themeForegroundColorVar};
        }
        :host(.tcnft-core-button-text-button-primary-accent) {
            color: ${themeForegroundPrimaryAccentColorVar};
        }

        :host(.tcnft-core-button-text-button) span {
            color: inherit;
        }

        :host(.tcnft-core-button-jiggle) {
            animation: jiggle 2.5s 2s infinite linear;
        }

        :host(.tcnft-core-button-jiggle:hover) {
            animation: none;
        }

        :host(.tcnft-core-button-text-button) button {
            background-color: transparent;
        }

        :host(.tcnft-core-button-text-button:hover) .overlay,
        :host(.tcnft-core-button-text-button:active) .overlay {
            background-color: currentColor;
        }

        :host(.tcnft-core-button-text-button:hover) .overlay {
            opacity: ${overlayHoverOpacityVar};
        }

        :host(.tcnft-core-button-text-button:active) .overlay {
            opacity: ${overlayActiveOpacityVar};
        }

        :host(:active) button:after,
        :host(:hover) button:after {
            display: none;
        }

        :host(.tcnft-core-button-shine) button:after {
            opacity: 0;
            animation: shine 7s ease-in-out infinite 2s;
            animation-fill-mode: forwards;
            content: '';
            position: absolute;
            top: -30%;
            left: -210%;
            width: 100px;
            height: 200%;
            /*   border: 1px solid red; */
            /*   transform: rotate(30deg); */

            background: linear-gradient(
                120deg,
                rgba(255, 255, 255, 0) 30%,
                rgba(255, 255, 255, 0.13) 40%,
                rgba(255, 255, 255, 0.5) 50%,
                rgba(255, 255, 255, 0.9) 52%,
                rgba(255, 255, 255, 0) 60%
            );
        }

        @media (max-width: 300px) {
            :host(.tcnft-core-button-shine) button:after {
                animation: none;
            }
        }

        @keyframes jiggle {
            7% {
                transform: rotate(0deg);
            }
            10% {
                transform: rotate(10deg);
            }
            16% {
                transform: rotate(-11deg);
            }
            21% {
                transform: rotate(2deg);
            }
            24% {
                transform: rotate(0deg);
            }
        }

        @keyframes shine {
            1% {
                opacity: 0.9;
            }
            13% {
                top: -10%;
                left: 100%;
                transition-property: left, top, opacity;
                transition-duration: 0.7s, 0.7s, 0.15s;
                transition-timing-function: ease;
            }
            95% {
                opacity: 0;
                top: -10%;
                left: 100%;
                transition-property: left, top, opacity;
            }
        }

        :host(.tcnft-core-button-not-clickable) {
            opacity: ${overlayActiveOpacityVar};
            pointer-events: none;
        }
    `,
    renderCallback: ({props, host}) => {
        if (props.clickable) {
            host.classList.remove('tcnft-core-button-not-clickable');
        } else {
            host.classList.add('tcnft-core-button-not-clickable');
        }
        return html`
            <div class="overlay"></div>
            <button
                title=${props.label}
                tabindex=${props.clickable ? '0' : '-1'}
            >
                <span>
                    ${
                        props.label ||
                        html`
                            &nbsp;
                        `
                    }
                <span>
            </button>
            <div class="focus-border"></div>
        `;
    },
});
