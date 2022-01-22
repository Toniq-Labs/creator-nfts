import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {
    applyThemeColors,
    overlayActiveOpacityVar,
    overlayHoverOpacityVar,
    symbolFontVar,
    themeForegroundColorVar,
    themeForegroundPrimaryAccentColorVar,
    themeInteractionTransitionTimeVar,
} from '@frontend/src/ui/styles/theme-vars';
import {css, html} from 'element-vir';

export const MenuItem = defineCreatorNftElement({
    tagName: 'tcnft-menu-item',
    props: {
        label: '',
        checked: false,
        keepMenuOpen: false,
        hostClickListener: undefined as undefined | (() => void),
    },
    styles: css`
        :host {
            border: 1px solid ${themeForegroundPrimaryAccentColorVar};
            position: relative;
            display: block;
            ${applyThemeColors}
        }

        :host(.tcnft-menu-item-sub-item) {
            border-top-width: 0;
            border-bottom-width: 0;
        }

        :host(.tcnft-menu-item-sub-item) li {
            padding-left: 28px;
        }

        :host(.tcnft-menu-item-header) li {
            font-weight: bold;
            cursor: auto;
        }
        :host(.tcnft-menu-item-header) li:hover > .overlay {
            opacity: 0;
        }
        :host(.tcnft-menu-item-header) li:active > .overlay {
            opacity: 0;
        }

        .overlay {
            user-select: none;
            -webkit-user-select: none;

            position: absolute;
            inset: 0;
            opacity: 0;
            width: 100%;
            height: 100%;
            transition: ${themeInteractionTransitionTimeVar};
            background-color: ${themeForegroundColorVar};
            border-radius: inherit;
        }

        /**
         * Somehow not having the direct descendant combinator here (">") results in the
         * hover/active effect not going away when there are multiple instances of this element near
         * each other. Browser bug?
         */
        li:hover > .overlay {
            opacity: ${overlayHoverOpacityVar};
        }
        li:active > .overlay {
            opacity: ${overlayActiveOpacityVar};
        }

        li {
            position: relative;
            display: flex;
            list-style: none;
            padding: 8px;
            padding-left: 6px;
            padding-right: 28px;
            align-items: center;
            white-space: nowrap;
            cursor: pointer;
        }

        .check-mark {
            display: inline-block;
            font-family: ${symbolFontVar};
            padding-top: 2px;
            font-size: 20px;
            line-height: 19px;
            margin-right: 4px;
        }

        .check-mark.hidden {
            visibility: hidden;
        }
    `,
    renderCallback: ({props}) => {
        return html`
            <li
                @click=${(event: MouseEvent) => {
                    if (props.keepMenuOpen) {
                        event.stopPropagation();
                    }
                }}
            >
                <div class="overlay"></div>
                <span class="check-mark ${props.checked ? '' : 'hidden'}">✓</span>
                <span>${props.label}</span>
            </li>
        `;
    },
});
