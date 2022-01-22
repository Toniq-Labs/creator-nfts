import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {themeEffectsEnabledClassName} from '@frontend/src/ui/styles/theme';
import {css, html, onDomCreated} from 'element-vir';

export const RootLoader = defineCreatorNftElement({
    tagName: 'tcnft-root-loader',
    props: {
        root: undefined as undefined | HTMLElement,
        domLoaded: false,
        /** Also watch external loading conditions, like loading the user auth data. */
        externalLoaded: false,
    },
    styles: css`
        :host {
            /* This is just a helper element, it doesn't need to display anything. */
            display: none;
        }
    `,
    renderCallback: ({props}) => {
        if (
            props.domLoaded &&
            props.root &&
            !props.root.classList.contains(themeEffectsEnabledClassName) &&
            props.externalLoaded
        ) {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    /**
                     * This class is applied after a time to ensure that the page has loaded in
                     * already. This prevents the effect transition styles from making the page load
                     * look sluggish.
                     */
                    props.root!.classList.add(themeEffectsEnabledClassName);
                });
            }, 100);
        } else if (props.domLoaded && !props.root) {
            throw new Error(`Dom is loaded but RootLoader was not given a root element.`);
        }
        return html`
            <div
                ${onDomCreated(() => {
                    props.domLoaded = true;
                })}
            ></div>
            <span class="load-monospace">a</span>
            <span class="load-lexend">a</span>
            <span class="load-check-mark">✓</span>
        `;
    },
});
