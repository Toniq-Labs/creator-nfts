import {getContent} from '@frontend/src/canisters/creator-content-canister';
import {ContentId, CreatorContent} from '@frontend/src/data/creator-content';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {LoadingIndicator} from '@frontend/src/ui/elements/loading/loading-indicator.element';
import {assign, css, html} from 'element-vir';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

export const ViewContent = defineCreatorNftElement({
    tagName: 'tcnft-view-content',
    props: {
        contentId: undefined as undefined | ContentId,
        loadedContent: undefined as undefined | CreatorContent,
        loadingContentPromise: undefined as undefined | Promise<CreatorContent | undefined>,
    },
    styles: css`
        :host {
            position: relative;
            display: block;
        }

        ${LoadingIndicator} {
            align-items: flex-start;
            padding-top: 100px;
        }

        @media (max-height: 460px) {
            ${LoadingIndicator} {
                padding-top: 0;
            }
        }
    `,
    renderCallback: ({props}) => {
        if (props.contentId && !props.loadedContent && !props.loadingContentPromise) {
            props.loadingContentPromise = getContent(props.contentId);

            props.loadingContentPromise.then((content) => {
                props.loadingContentPromise = undefined;
                props.loadedContent = content;
            });
        }

        if (!props.loadingContentPromise && !props.loadedContent) {
            return html`
                Content could not be loaded.
            `;
        }

        return html`
            <${LoadingIndicator}
                ${assign(LoadingIndicator.props.isLoading, !!props.loadingContentPromise)}
            ></${LoadingIndicator}>
            <h1>${props.contentId?.label}</h1>
            ${props.loadedContent ? unsafeHTML(props.loadedContent.content) : ''}
        `;
    },
});
