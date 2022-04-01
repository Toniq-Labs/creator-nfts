import {InitialCreatorPostData} from '@frontend/src/canisters/nft/creator-content/canister-actions-for-user';
import {
    Creator,
    CreatorPost,
} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {
    ProgressTracker,
    UnlockProgress,
} from '@frontend/src/ui/elements/design-system/progress-tracker.element';
import {UserAvatar} from '@frontend/src/ui/elements/design-system/user-avatar.element';
import {
    applyThemeColors,
    overlayActiveOpacityVar,
    overlayHoverOpacityVar,
    themeForegroundColorVar,
    themeForegroundDimColorVar,
    themeForegroundLightAccentColorVar,
    themeInteractionTransitionTimeVar,
} from '@frontend/src/ui/styles/theme-vars';
import {assign, css, html} from 'element-vir';

export const PostCard = defineCreatorNftElement({
    tagName: 'tcnft-post-card',
    props: {
        creatorPost: undefined as InitialCreatorPostData | CreatorPost | undefined,
        creator: undefined as Creator | undefined,
        unlockProgress: undefined as UnlockProgress | undefined,
    },
    styles: css`
        :host {
            display: inline-flex;
            align-items: flex-start;
            gap: 16px;

            padding: 8px 16px;

            border: 1px solid ${themeForegroundLightAccentColorVar};
            border-radius: 8px;
            position: relative;
            cursor: pointer;
            ${applyThemeColors}
        }

        :host(:hover) .overlay {
            opacity: ${overlayHoverOpacityVar};
        }

        :host(:active) .overlay {
            opacity: ${overlayActiveOpacityVar};
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

        :host(.tcnft-content-card-locked) {
            cursor: not-allowed;
            user-select: none;
            -webkit-user-select: none;
            border-color: ${themeForegroundDimColorVar};
        }

        :host(.tcnft-content-card-locked) ${UserAvatar}, :host(.tcnft-content-card-locked) h1,
        :host(.tcnft-content-card-locked) h4 {
            opacity: ${overlayActiveOpacityVar};
        }

        :host(.tcnft-content-card-locked) .overlay {
            display: none;
        }

        .content {
            z-index: 1;
            display: flex;
            flex-grow: 1;
            flex-direction: column;
            overflow: hidden;
            align-item: stretch;
        }

        ${UserAvatar} {
            position: relative;
            z-index: 1;
        }

        ${UserAvatar}.missing-creator-id {
            visibility: hidden;
        }

        h1,
        h4 {
            padding: 0;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        h1 {
            font-size: 1.5em;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
        }

        h4 {
            margin-bottom: 4px;
        }

        .date {
            font-weight: normal;
        }

        ${ProgressTracker} {
            max-width: 600px;
        }
    `,
    renderCallback: ({props, host}) => {
        const contentUnlocked =
            props.unlockProgress !== undefined &&
            props.unlockProgress?.current >= props.unlockProgress?.required;

        if (contentUnlocked) {
            host.classList.remove('tcnft-content-card-locked');
        } else {
            host.classList.add('tcnft-content-card-locked');
        }

        const formattedDate: string = props.creatorPost?.timestamp
            ? new Date(props.creatorPost.timestamp).toISOString().split('T')[0]!
            : '';

        return html`
            <${UserAvatar}
                class=${props.creator ? '' : 'missing-creator-id'}
                ${assign(UserAvatar.props.menuEnabled, false)}
                ${assign(UserAvatar.props.username, props.creator?.name)}
                ${assign(UserAvatar.props.avatarUrl, props.creator?.avatarUrl)}
            ></${UserAvatar}>
            <div class="content">
                <h1>
                    ${props.creatorPost?.postLabel}
                </h1>
                <h4>
                    ${props.creator?.name || ''}: <span class="date">${formattedDate}</span>
                </h4>
                <${ProgressTracker}
                    ${assign(ProgressTracker.props.unlockProgress, props.unlockProgress)}
                ></${ProgressTracker}>
            </div>
            <div class="overlay"></div>
        `;
    },
});
