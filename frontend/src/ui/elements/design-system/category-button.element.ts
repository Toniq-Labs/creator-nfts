import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {CoreButton} from '@frontend/src/ui/elements/design-system/core-button.element';
import {themeForegroundDimColorVar} from '@frontend/src/ui/styles/theme-vars';
import {assign, css, html} from 'element-vir';

export const CategoryButton = defineCreatorNftElement({
    tagName: 'tcnft-category-button',
    props: {
        categoryName: '',
        /** Set to false to disable click events and tabbing. */
        clickable: true,
        selected: true,
    },
    styles: css`
        ${CoreButton} {
            --tcnft-core-button-padding: 0.12em 0.7em;
            border-radius: 1em;
            border: 2px solid ${themeForegroundDimColorVar};
            font-weight: normal;
        }
    `,
    renderCallback: ({props}) => {
        return html`
            <${CoreButton}
            class="${props.selected ? 'selected' : 'tcnft-core-button-text-button'}"
                ${assign(CoreButton.props.label, props.categoryName)}
                ${assign(CoreButton.props.clickable, props.clickable)}
            ></${CoreButton}>
        `;
    },
});
