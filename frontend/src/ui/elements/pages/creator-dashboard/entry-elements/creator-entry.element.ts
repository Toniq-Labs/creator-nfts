import {Creator} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {assignWithDebounce} from '@frontend/src/ui/directives/assign-with-debounce.directive';
import {CoreTextInput} from '@frontend/src/ui/elements/design-system/core-text-input.element';
import {UserAvatar} from '@frontend/src/ui/elements/design-system/user-avatar.element';
import {themeForegroundLightAccentColorVar} from '@frontend/src/ui/styles/theme-vars';
import {assign, css, defineElementEvent, html, listen} from 'element-vir';
import {TemplateResult} from 'lit';
import {standardEntryPropsDefaults, wrapInDashboardEntry} from './entry-helper';

export const CreatorEntry = defineCreatorNftElement({
    tagName: 'tcnft-creator-entry',
    props: {
        ...standardEntryPropsDefaults,
        creator: undefined as undefined | Creator,
        phrases: {
            avatarUrl: 'Avatar URL',
            name: 'Name',
            creatorType: 'Creator',
            namePlaceholder: "Enter the creator's name",
            avatarPlaceholder: 'Optional: Enter an avatar URL',
            mustHaveName: 'Creator name is required.',
            id: 'Id',
        },
    },
    events: {
        creatorChange: defineElementEvent<Creator>(),
    },
    styles: css`
        :host {
            display: block;
        }

        .preview {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .preview .name {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .preview span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .title {
            font-weight: bold;
        }

        div.editing {
            border-bottom: 1px solid ${themeForegroundLightAccentColorVar};
            padding-bottom: 16px;
            margin-bottom: 16px;
        }
    `,
    renderCallback: ({props, dispatch, events}) => {
        const nameInputCaption = props.creator?.name ? '' : props.phrases.mustHaveName;
        const validData = !!props.creator?.name;

        const editingSlot: TemplateResult = html`
            <div class="editing">
                <${CoreTextInput}
                    class="${props.creator?.name ? '' : 'tcnft-core-text-input-warning'}"
                    ${listen(CoreTextInput.events.valueChange, (event) => {
                        if (props.creator) {
                            props.creator = {
                                ...props.creator,
                                name: event.detail,
                            };
                            dispatch(new events.creatorChange(props.creator));
                        }
                    })}
                    ${assign(CoreTextInput.props.value, props.creator?.name)}
                    ${assign(CoreTextInput.props.label, props.phrases.name)}
                    ${assign(CoreTextInput.props.caption, nameInputCaption)}
                    ${assign(CoreTextInput.props.placeholder, props.phrases.namePlaceholder)}
                ></${CoreTextInput}>
                <${CoreTextInput}
                    ${assign(CoreTextInput.props.value, props.creator?.avatarUrl)}
                    ${assign(CoreTextInput.props.label, props.phrases.avatarUrl)}
                    ${listen(CoreTextInput.events.valueChange, (event) => {
                        if (props.creator) {
                            props.creator = {
                                ...props.creator,
                                avatarUrl: event.detail,
                            };
                            dispatch(new events.creatorChange(props.creator));
                        }
                    })}}
                    ${assign(CoreTextInput.props.placeholder, props.phrases.avatarPlaceholder)}
                ></${CoreTextInput}>
            </div>
        `;
        const previewSlot: TemplateResult = html`
            <div class="preview">
                <span>
                    <span class="title">${props.phrases.id}:</span> ${props.creator?.id}
                </span>
                <div class="name">
                    <${UserAvatar}
                        ${assignWithDebounce(UserAvatar.props.avatarUrl, props.creator?.avatarUrl)}
                        ${assign(UserAvatar.props.username, props.creator?.name)}
                    ></${UserAvatar}>
                    <span>
                        ${props.creator?.name}
                    </span>
                </div>
            </div>
        `;

        return wrapInDashboardEntry({
            creationType: props.phrases.creatorType,
            validData,
            entryExists: !!props.creator,
            editingSlot,
            previewSlot,
            props,
        });
    },
});
