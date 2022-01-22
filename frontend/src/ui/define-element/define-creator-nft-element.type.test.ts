import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {html} from 'element-vir';

const validElement = defineCreatorNftElement({
    renderCallback: () => html``,
    tagName: 'tcnft-valid-element',
});

// tag names must start with tcnft-
const invalidElement = defineCreatorNftElement({
    renderCallback: () => html``,
    // @ts-expect-error
    tagName: 'invalid-element',
});
