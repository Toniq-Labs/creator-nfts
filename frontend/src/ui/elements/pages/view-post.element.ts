import {Creator} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {UserAvatar} from '@frontend/src/ui/elements/design-system/user-avatar.element';
import {LoadingIndicator} from '@frontend/src/ui/elements/loading/loading-indicator.element';
import DomPurify from 'dompurify';
import {assign, css, html} from 'element-vir';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {marked} from 'marked';

export const ViewPost = defineCreatorNftElement({
    tagName: 'tcnft-view-post',
    props: {
        postId: undefined as undefined | string,
        postTitle: undefined as undefined | string,
        postContent: undefined as undefined | string,
        postTimestamp: undefined as undefined | number,
        postCreator: undefined as undefined | Creator,
        sanitizedHTML: {postId: undefined, html: undefined} as {
            postId: undefined | string;
            html: undefined | string;
        },
    },
    styles: css`
        :host {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        ${LoadingIndicator} {
            align-items: flex-start;
            padding-top: 100px;
        }

        header {
            display: flex;
            gap: 16px;
        }

        header .title {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        header h1 {
            margin: 0;
        }

        .article-wrapper {
            max-width: min(800px, 100%);
        }

        article {
            font-size: 1.5em;
        }

        @media (max-height: 460px) {
            ${LoadingIndicator} {
                padding-top: 0;
            }
        }
    `,
    renderCallback: ({props}) => {
        if (props.postContent && props.postTitle && props.postId) {
            if (props.postId !== props.sanitizedHTML.postId) {
                const rawHtml = marked.parse(props.postContent);
                const sanitizedHtml = DomPurify.sanitize(rawHtml);

                props.sanitizedHTML = {
                    postId: props.postId,
                    html: sanitizedHtml,
                };
            }

            const formattedDate: string = props.postTimestamp
                ? new Date(props.postTimestamp).toISOString().split('T')[0]!
                : '';

            const creatorString = `${props.postCreator?.name}${
                formattedDate ? `: ${formattedDate}` : ''
            }`;

            const titleTemplate = html`
                    <header>
                        ${
                            props.postCreator
                                ? html`
                                    <${UserAvatar}
                                        ${assign(
                                            UserAvatar.props.avatarUrl,
                                            props.postCreator?.avatarUrl,
                                        )}
                                        ${assign(
                                            UserAvatar.props.username,
                                            props.postCreator?.name,
                                        )}
                                    ></${UserAvatar}>
                                    `
                                : ''
                        }
                        <div class="title">
                            <h1>${props.postTitle}</h1>
                            ${creatorString}
                        </span>
                    </header>
                `;

            return html`
                <div class="article-wrapper">
                    ${titleTemplate}
                    <article>${unsafeHTML(props.sanitizedHTML.html)}</article>
                </div>
            `;
        }

        return html``;
    },
});
