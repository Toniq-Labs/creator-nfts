import {
    Creator,
    CreatorCategory,
    CreatorPost,
} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {NftUser} from '@frontend/src/data/nft-user';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {CoreNumberInput} from '@frontend/src/ui/elements/design-system/core-number-input.element';
import {
    CoreSelect,
    SelectOption,
} from '@frontend/src/ui/elements/design-system/core-select.element';
import {CoreTextInput} from '@frontend/src/ui/elements/design-system/core-text-input.element';
import {PostCard} from '@frontend/src/ui/elements/design-system/post-card.element';
import {SharedDashboardEntry} from '@frontend/src/ui/elements/pages/creator-dashboard/entry-elements/shared-dashboard-entry.element';
import {ViewPost} from '@frontend/src/ui/elements/pages/view-post.element';
import {ScrollToTopEvent} from '@frontend/src/ui/global-events/scroll-to-top.event';
import {themeForegroundLightAccentColorVar} from '@frontend/src/ui/styles/theme-vars';
import {assign, css, defineElementEvent, html, listen} from 'element-vir';
import {TemplateResult} from 'lit';
import {CategoryButton} from '../../../design-system/category-button.element';
import {CoreButton} from '../../../design-system/core-button.element';
import {standardEntryPropsDefaults, wrapInDashboardEntry} from './entry-helper';

export const PostEntry = defineCreatorNftElement({
    tagName: 'tcnft-post-entry',
    props: {
        ...standardEntryPropsDefaults,
        creatorPost: undefined as undefined | CreatorPost,
        creators: [] as Creator[],
        categories: [] as CreatorCategory[],
        currentUser: undefined as NftUser | undefined,
        previewingText: false,
        phrases: {
            title: 'Post Title',
            titlePlaceholder: 'Enter post title',
            titleRequired: 'Title is required.',
            content: 'Post Content',
            contentPlaceholder: 'Enter some text! Markdown is supported.',
            contentRequired: 'Some post content is required.',
            mintRequirement: 'NFT Requirement',
            mintRequirementExplanation: 'Number of minted NFTs required to access this post.',
            creator: 'Creator',
            selectACreator: 'Select a creator',
            category: 'Category',
            selectACategory: 'Select a category',
            id: 'Id',
            preview: 'Preview',
            edit: 'Edit',
            postType: 'Post',
            creatorRequired: 'Creator required',
            categoryRequired: 'Category required',
        },
    },
    events: {
        creatorPostChange: defineElementEvent<CreatorPost>(),
    },
    styles: css`
        :host {
            display: block;
            overflow: hidden;
            justify-content: center;
        }

        :host(.tcnft-post-entry-full-screen) {
            display: flex;
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

        ${PostCard} {
            pointer-events: none;
        }

        .post-text-preview {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        ${SharedDashboardEntry}.editing {
            height: 100%;
            width: 100%;
            max-width: 1200px;
            box-sizing: border-box;
            border: none;
        }

        div.editing {
            flex-grow: 1;
            border-bottom: 1px solid ${themeForegroundLightAccentColorVar};
            padding-bottom: 4px;
            margin-bottom: 24px;
            display: flex;
            flex-direction: column;
        }

        .post-content-input {
            flex-grow: 1;
        }

        .preview-button {
            align-self: flex-end;
            margin-bottom: 16px;
        }

        div.preview {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
    `,
    initCallback: ({props, genericDispatch}) => {
        document.body.addEventListener('keydown', (event) => {
            if (props.editing && event.key.toLowerCase() === 'escape') {
                if (props.canRevert) {
                    genericDispatch(new SharedDashboardEntry.events.done());
                } else {
                    genericDispatch(new SharedDashboardEntry.events.delete());
                }
            }
        });
    },
    renderCallback: ({props, dispatch, events, genericDispatch}) => {
        const titleCaption = props.creatorPost?.postLabel ? '' : props.phrases.titleRequired;
        const contentCaption = props.creatorPost?.content ? '' : props.phrases.contentRequired;
        const creatorCaption = props.creatorPost?.creatorId ? '' : props.phrases.creatorRequired;
        const categoryCaption = props.creatorPost?.categoryId ? '' : props.phrases.categoryRequired;

        const validData: boolean = !!(
            props.creatorPost &&
            props.creatorPost.categoryId &&
            props.creatorPost.content &&
            props.creatorPost.postLabel &&
            props.creatorPost.creatorId
        );

        const currentCreator = props.creatorPost?.creatorId
            ? props.creators.find((creator) => creator.id === props.creatorPost?.creatorId)
            : undefined;
        const currentCategory = props.creatorPost?.categoryId
            ? props.categories.find((category) => category.id === props.creatorPost?.categoryId)
            : undefined;

        const editingSlot: TemplateResult = html`
            <div class="editing">
                <!-- creator -->
                <${CoreSelect}
                    ${assign(
                        CoreSelect.props.options,
                        props.creators.map((creator): SelectOption => {
                            return {
                                value: creator.id,
                                label: `${creator.name} (${creator.id})`,
                            };
                        }),
                    )}
                    ${assign(CoreSelect.props.placeholder, props.phrases.selectACreator)}
                    ${assign(CoreSelect.props.caption, creatorCaption)}
                    ${assign(CoreSelect.props.inputRequired, true)}
                    ${assign(CoreSelect.props.label, props.phrases.creator)}
                    ${assign(CoreSelect.props.value, props.creatorPost?.creatorId)}
                    ${listen(CoreSelect.events.valueChange, (event) => {
                        const newCreatorId = event.detail;
                        if (!newCreatorId || !props.creatorPost) {
                            return;
                        }

                        const newContentPost = {
                            ...props.creatorPost,
                            creatorId: newCreatorId,
                        };

                        props.creatorPost = newContentPost;

                        dispatch(new events.creatorPostChange(newContentPost));
                    })}
                ></${CoreSelect}>
                <!-- category -->
                <${CoreSelect}
                    ${assign(
                        CoreSelect.props.options,
                        props.categories.map((category): SelectOption => {
                            return {
                                value: category.id,
                                label: `${category.categoryLabel} (${category.id})`,
                            };
                        }),
                    )}
                    ${assign(CoreSelect.props.placeholder, props.phrases.selectACategory)}
                    ${assign(CoreSelect.props.caption, categoryCaption)}
                    ${assign(CoreSelect.props.inputRequired, true)}
                    ${assign(CoreSelect.props.label, props.phrases.category)}
                    ${assign(CoreSelect.props.value, props.creatorPost?.categoryId)}
                    ${listen(CoreSelect.events.valueChange, (event) => {
                        const newCategoryId = event.detail;
                        if (!newCategoryId || !props.creatorPost) {
                            return;
                        }

                        const newContentPost = {
                            ...props.creatorPost,
                            categoryId: newCategoryId,
                        };

                        props.creatorPost = newContentPost;

                        dispatch(new events.creatorPostChange(newContentPost));
                    })}
                ></${CoreSelect}>
                <!-- title -->
                <${CoreTextInput}
                    class="${props.creatorPost?.postLabel ? '' : 'tcnft-core-text-input-warning'}"
                    ${listen(CoreTextInput.events.valueChange, (event) => {
                        if (props.creatorPost) {
                            props.creatorPost = {
                                ...props.creatorPost,
                                postLabel: event.detail,
                            };
                            dispatch(new events.creatorPostChange(props.creatorPost));
                        }
                    })}
                    ${assign(CoreTextInput.props.value, props.creatorPost?.postLabel)}
                    ${assign(CoreTextInput.props.label, props.phrases.title)}
                    ${assign(CoreTextInput.props.caption, titleCaption)}
                    ${assign(CoreTextInput.props.placeholder, props.phrases.titlePlaceholder)}
                ></${CoreTextInput}>
                <!-- nft count -->
                <${CoreNumberInput}
                    ${assign(
                        CoreNumberInput.props.value,
                        props.creatorPost ? Number(props.creatorPost.nftRequirement) : 0,
                    )}
                    ${assign(CoreNumberInput.props.label, props.phrases.mintRequirement)}
                    ${assign(CoreNumberInput.props.minValue, 0)}
                    ${assign(
                        CoreNumberInput.props.caption,
                        props.phrases.mintRequirementExplanation,
                    )}
                    ${listen(CoreNumberInput.events.valueChange, (event) => {
                        if (props.creatorPost) {
                            props.creatorPost = {
                                ...props.creatorPost,
                                nftRequirement: event.detail ?? 0,
                            };
                            dispatch(new events.creatorPostChange(props.creatorPost));
                        }
                    })}
                ></${CoreNumberInput}>
                <!-- content -->
                ${
                    props.previewingText
                        ? html`
                            <${ViewPost}
                                ${assign(ViewPost.props.postCreator, currentCreator)}
                                ${assign(ViewPost.props.postId, props.creatorPost?.id)}
                                ${assign(
                                    ViewPost.props.postTimestamp,
                                    props.creatorPost?.timestamp,
                                )}
                                ${assign(ViewPost.props.postTitle, props.creatorPost?.postLabel)}
                                ${assign(ViewPost.props.postContent, props.creatorPost?.content)}
                            >
                            </${ViewPost}>
                        `
                        : html`
                            <${CoreTextInput}
                                class="post-content-input ${
                                    props.creatorPost?.content
                                        ? ''
                                        : 'tcnft-core-text-input-warning'
                                }"
                                ${listen(CoreTextInput.events.valueChange, (event) => {
                                    if (props.creatorPost) {
                                        props.creatorPost = {
                                            ...props.creatorPost,
                                            content: event.detail,
                                        };
                                        dispatch(new events.creatorPostChange(props.creatorPost));
                                    }
                                })}
                                ${assign(CoreTextInput.props.value, props.creatorPost?.content)}
                                ${assign(CoreTextInput.props.allowMultilineEnter, true)}
                                ${assign(CoreTextInput.props.fullHeight, true)}
                                ${assign(CoreTextInput.props.multiline, true)}
                                ${assign(CoreTextInput.props.label, props.phrases.content)}
                                ${assign(CoreTextInput.props.caption, contentCaption)}
                                ${assign(
                                    CoreTextInput.props.placeholder,
                                    props.phrases.contentPlaceholder,
                                )}
                            ></${CoreTextInput}>
                        `
                }
                <${CoreButton}
                    class="preview-button"
                    ${assign(
                        CoreButton.props.label,
                        props.previewingText ? props.phrases.edit : props.phrases.preview,
                    )}
                    ${listen('click', () => {
                        props.previewingText = !props.previewingText;
                        genericDispatch(new ScrollToTopEvent());
                    })}
                >
                </${CoreButton}>
            </div>
        `;
        const previewSlot: TemplateResult = html`
            <div class="preview">
                <${CategoryButton}
                    ${assign(CategoryButton.props.categoryName, currentCategory?.categoryLabel)}
                    ${assign(CategoryButton.props.selected, false)}
                >
                </${CategoryButton}>
                <${PostCard}
                    ${assign(PostCard.props.unlockProgress, {
                        required: props.creatorPost?.nftRequirement || 0,
                        current: props.currentUser?.nftIdList.length || 0,
                    })}
                    ${assign(PostCard.props.creator, currentCreator)}
                    ${assign(PostCard.props.creatorPost, props.creatorPost)}
                ></${PostCard}>
                ${
                    props.editing
                        ? ''
                        : html`
                              <div class="post-text-preview">
                                  ${props.creatorPost?.content
                                      ? props.creatorPost.content.slice(0, 300) +
                                        (props.creatorPost.content.length > 300 ? '...' : '')
                                      : html`
                                            &nbsp;
                                        `}
                              </div>
                          `
                }
            </div>
        `;

        return wrapInDashboardEntry({
            creationType: props.phrases.postType,
            validData,
            entryExists: !!props.creatorPost,
            editingSlot,
            previewSlot,
            props,
        });
    },
});
