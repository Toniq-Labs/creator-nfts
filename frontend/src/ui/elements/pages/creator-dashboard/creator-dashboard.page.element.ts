import {moveIndex, sortWithNullables} from '@frontend/src/augments/array';
import {copyWithJson, isJsonEqual, mapKeys, ValueOf} from '@frontend/src/augments/object';
import {isPromise} from '@frontend/src/augments/promise';
import {
    getCreatorDashboardData,
    saveCreatorDashboardData,
} from '@frontend/src/canisters/nft/creator-content/canister-actions-for-creator';
import {
    ContentCreatorDashboardData,
    Creator,
    CreatorCategory,
    CreatorPost,
} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {isValidDashboardData} from '@frontend/src/canisters/nft/creator-content/creator-content-validation';
import {NftUser} from '@frontend/src/data/nft-user';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {LoadingIndicator} from '@frontend/src/ui/elements/loading/loading-indicator.element';
import {CategoryEntry} from '@frontend/src/ui/elements/pages/creator-dashboard/entry-elements/category-entry.element';
import {PostEntry} from '@frontend/src/ui/elements/pages/creator-dashboard/entry-elements/post-entry.element';
import {ScrollToTopEvent} from '@frontend/src/ui/global-events/scroll-to-top.event';
import {TriggerTcnftAppRouteChangeEvent} from '@frontend/src/ui/global-events/trigger-tcnft-app-route-change.event';
import {UpdateBrowseDataEvent} from '@frontend/src/ui/global-events/update-browse-data.event';
import {UpdateCreatorContentEvent} from '@frontend/src/ui/global-events/update-creator-content.event';
import {
    TcnftAppFullRoute,
    TcnftAppSearchParamKeys,
    TcnftAppTopLevelRoute,
} from '@frontend/src/ui/routes/app-routes';
import {
    themeBackgroundColorVar,
    themeEffectTransitionTimeVar,
    themeErrorColorVar,
    themeForegroundPrimaryAccentColorVar,
    themeInteractionTransitionTimeVar,
} from '@frontend/src/ui/styles/theme-vars';
import {footerZIndex, headerZIndex} from '@frontend/src/ui/styles/z-index';
import {enableNavigation, preventNavigation} from '@frontend/src/ui/window-navigation';
import {getObjectTypedValues, isTruthy, randomString} from 'augment-vir';
import {assign, css, html, listen} from 'element-vir';
import {CoreButton} from '../../design-system/core-button.element';
import {CoreSelect, SelectOption} from '../../design-system/core-select.element';
import {CreatorEntry} from './entry-elements/creator-entry.element';
import {SharedDashboardEntry} from './entry-elements/shared-dashboard-entry.element';

function changePostIdLocation({
    categories,
    newCategoryId,
    oldCategoryId,
    postId,
}: {
    categories: ContentCreatorDashboardData['categories'];
    newCategoryId: string | undefined;
    oldCategoryId: string | undefined;
    postId: string;
}): ContentCreatorDashboardData['categories'] {
    let newCategories = categories;
    if (oldCategoryId) {
        const oldCategory = categories[oldCategoryId];
        if (oldCategory) {
            newCategories[oldCategoryId] = {
                ...oldCategory,
                postIds: oldCategory.postIds.filter((internalPostId) => internalPostId !== postId),
            };
        }
    }
    if (newCategoryId) {
        const newCategory = categories[newCategoryId];
        if (!newCategory) {
            throw new Error(`Could not find new category from id ${newCategoryId}`);
        }
        if (!newCategory.postIds.includes(postId)) {
            newCategories[newCategoryId] = {
                ...newCategory,
                postIds: newCategory.postIds.concat(postId),
            };
        }
    }

    return newCategories;
}

function updateCategoryOrders(categories: CreatorCategory[]): void {
    categories
        .sort((a, b) => a.order - b.order)
        .forEach((category, index) => {
            category.order = index;
        });
}

const creatorDashboardNavigationKey = 'creator-dashboard';

type ContentCreatorDataProperty = undefined | Promise<ContentCreatorDashboardData | undefined>;

function extractContentProperty<DataKey extends keyof ContentCreatorDashboardData>(
    data: ContentCreatorDashboardData | undefined,
    property: DataKey,
): (ValueOf<ContentCreatorDashboardData[DataKey]> | undefined)[] {
    let returnArray: (ContentCreatorDashboardData[DataKey][any] | undefined)[];
    if (data) {
        returnArray = getObjectTypedValues(data[property]);
    } else {
        returnArray = [];
    }

    // the trailing undefined is for the "create new" card
    return returnArray;
}

type CurrentlyEditing = Partial<Omit<Record<keyof ContentCreatorDashboardData, string[]>, 'posts'>>;

function changeCurrentlyEditing(
    key: keyof CurrentlyEditing,
    id: string,
    operation: 'add' | 'remove',
    props: NonNullable<typeof CreatorDashboardPage['initInput']['props']>,
): void {
    const newEditing = {...props.currentlyEditing};
    if (!newEditing[key]) {
        newEditing[key] = [];
    }

    if (operation === 'add') {
        newEditing[key]!.push(id);
    } else {
        newEditing[key] = newEditing[key]!.filter((oldId) => oldId !== id);
    }

    props.currentlyEditing = newEditing;
}

function isEditing(
    key: keyof CurrentlyEditing,
    id: string | undefined,
    currentlyEditing: CurrentlyEditing,
): boolean {
    if (!id) {
        return false;
    }
    return !!currentlyEditing[key]?.includes(id);
}

export const CreatorDashboardPage = defineCreatorNftElement({
    tagName: 'tcnft-creator-dashboard',
    props: {
        currentRoute: undefined as TcnftAppFullRoute | undefined,
        currentUser: undefined as undefined | NftUser,
        loadingContentData: undefined as ContentCreatorDataProperty | {doneLoading: true},
        originalData: undefined as undefined | ContentCreatorDashboardData,
        savingData: undefined as undefined | Promise<boolean>,
        saveFailure: false,
        currentlyEditing: {} as CurrentlyEditing,
        currentCreatorContentData: undefined as ContentCreatorDashboardData | undefined,
        categoryIdPostFilter: '',
        editingPostId: '',
        phrases: {
            loading: 'Loading creator content...',
            none: 'None',
            creators: 'Creators',
            categories: 'Categories',
            selectACategory: 'Select a category',
            content: 'Posts',
            save: 'Save to Canister',
            revert: 'Revert Changes',
            failedToSave: 'Failed to save, try again.',
            filterPosts: 'Filter by Category',
            cannotCreatePostYet:
                'At least one creator and one category must be created before making a post.',
            editJson: 'Edit JSON',
        },
    },
    styles: css`
        :host {
            position: relative;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            padding-top: 16px;
        }

        main {
            display: flex;
            align-items: stretch;
            flex-grow: 1;
            position: relative;
        }

        section {
            flex-basis: 0;
            flex-grow: 1;
            display: flex;
            flex-shrink: 0;
            flex-direction: column;
            align-items: stretch;
            padding: 0 16px;
            gap: 16px;
            max-width: 33.334%;
            box-sizing: border-box;
            background-color: ${themeBackgroundColorVar};
            transition: ${themeInteractionTransitionTimeVar};
        }

        section > * {
            flex-shrink: 0;
        }

        .error-message {
            color: ${themeErrorColorVar};
        }

        section h1 {
            text-align: center;
        }

        ${LoadingIndicator} {
            z-index: ${footerZIndex + 1};
        }

        footer {
            flex-shrink: 0;
            display: flex;
            justify-content: space-between;
            background-color: ${themeBackgroundColorVar};
            border-top: 1px solid ${themeForegroundPrimaryAccentColorVar};
            margin: 16px;
            margin-bottom: 0;
            padding-top: 8px;
            padding-bottom: 16px;
            position: sticky;
            bottom: 0;
            z-index: ${footerZIndex};
            gap: 8px;
        }

        footer > *:last-child {
            flex-grow: 1;
            display: flex;
            justify-content: flex-end;
        }

        footer ${LoadingIndicator} {
            position: relative;
            height: unset;
            width: unset;
        }

        footer div {
            align-items: center;
        }

        section > * {
            background-color: ${themeBackgroundColorVar};
        }

        .posts-section {
            position: relative;
            right: 0;
            width: 33.333334%;
            min-height: 100%;
        }

        .posts-section:not(.full-screen) {
            animation: fromAbsoluteToRelative ${themeEffectTransitionTimeVar} forwards;
        }

        .full-screen {
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            max-width: 100%;
            /* min-height here allows the content to grow if more text is entered */
            min-height: 100%;
            box-sizing: border-box;
            z-index: ${headerZIndex - 1};
            border: none;
        }

        ${PostEntry}.full-screen {
            margin: 16px;
            width: calc(100% - 32px);
            /* min-height here allows the content to grow if more text is entered */
            min-height: calc(100% - 32px);
        }

        .cannot-create-post-yet {
            color: ${themeErrorColorVar};
            text-align: center;
        }

        .hidden {
            display: none;
        }

        .edit-json-button {
            align-self: flex-start;
        }

        ${CoreSelect} {
            flex-grow: 1;
            margin-right: 8px;
        }

        section h1 {
            margin: 0;
            margin-top: 16px;
            margin-bottom: 17px;
        }

        section.posts-section h1 {
            margin-bottom: unset;
        }

        @keyframes fromAbsoluteToRelative {
            from {
                position: absolute;
            }
            to {
                position: relative;
            }
        }

        @media (max-width: 800px) {
            main {
                flex-direction: column;
            }

            section h1 {
                margin-bottom: unset;
            }

            section,
            section.posts-section:not(.full-screen) {
                max-width: 100%;
                width: unset;
                height: unset;
                position: relative;
                top: unset;
                right: unset;
                min-height: unset;
            }
        }
    `,
    renderCallback: ({props, genericDispatch}) => {
        if (!props.currentUser || !props.currentUser.isContentCreator) {
            return html``;
        }

        function updateCreatorContent(creatorData: ContentCreatorDashboardData): void {
            updateCategoryOrders(getObjectTypedValues(creatorData.categories));
            genericDispatch(new UpdateCreatorContentEvent(creatorData));
        }

        if (props.loadingContentData == undefined) {
            props.loadingContentData = getCreatorDashboardData(props.currentUser.nftActor);
            props.loadingContentData.then((fullData) => {
                props.loadingContentData = {doneLoading: true};
                genericDispatch(new UpdateCreatorContentEvent(fullData));
                props.originalData = copyWithJson(fullData);
            });
        }

        const editsHaveBeenMade =
            props.currentCreatorContentData && props.originalData
                ? !isJsonEqual(props.currentCreatorContentData, props.originalData)
                : false;

        if (editsHaveBeenMade || props.savingData || props.saveFailure) {
            console.info('preventNavigation');
            preventNavigation(creatorDashboardNavigationKey);
        } else {
            console.info('enableNavigation');
            enableNavigation(creatorDashboardNavigationKey);
        }

        const isLoading = isPromise(props.loadingContentData);

        const isValidData: boolean = !!(
            !isPromise(props.loadingContentData) &&
            props.currentCreatorContentData &&
            isValidDashboardData(props.currentCreatorContentData)
        );

        const categories: (CreatorCategory | undefined)[] = [
            undefined,
            ...extractContentProperty(props.currentCreatorContentData, 'categories').sort(
                sortWithNullables((a, b) => a.order - b.order),
            ),
        ];

        const allPosts: (CreatorPost | undefined)[] = [
            undefined,
            ...extractContentProperty(props.currentCreatorContentData, 'posts').sort(
                sortWithNullables((a, b) => b.timestamp - a.timestamp),
            ),
        ];

        const filteredPosts = props.categoryIdPostFilter
            ? [
                  undefined,
                  ...allPosts.filter((post) => post?.categoryId === props.categoryIdPostFilter),
              ]
            : allPosts;

        const creators: (Creator | undefined)[] = [
            undefined,
            ...extractContentProperty(props.currentCreatorContentData, 'creators'),
        ];

        props.editingPostId = props.currentCreatorContentData
            ? props.currentRoute?.paths[1] ?? ''
            : '';

        function exitPostEditing() {
            genericDispatch(
                new TriggerTcnftAppRouteChangeEvent({
                    paths: [TcnftAppTopLevelRoute.Creator],
                }),
            );
            props.editingPostId = '';
        }

        if (
            !!props.editingPostId &&
            props.currentCreatorContentData &&
            !props.currentCreatorContentData.posts[props.editingPostId] &&
            props.currentRoute?.paths[0] === TcnftAppTopLevelRoute.Creator
        ) {
            exitPostEditing();
        }

        const canBeSaved =
            editsHaveBeenMade &&
            props.currentUser &&
            !props.savingData &&
            !props.editingPostId &&
            isValidData &&
            !!props.currentCreatorContentData &&
            !isPromise(props.loadingContentData);

        // greater than 1 to account for the "create new" undefined entry in each array.
        const canCreatePost = creators.length > 1 && categories.length > 1;

        return html`
            <${LoadingIndicator}
                ${assign(LoadingIndicator.props.isLoading, isLoading)}
                ${assign(LoadingIndicator.props.label, props.phrases.loading)}
            ></${LoadingIndicator}>
            <main>
                <section
                    class="${props.editingPostId ? 'hidden' : ''}"
                    ${listen(SharedDashboardEntry.events.createNew, () => {
                        if (props.currentCreatorContentData) {
                            const newId = randomString(8);
                            const newCreator: Creator = {
                                avatarUrl: '',
                                id: newId,
                                name: '',
                            };
                            if (newId in props.currentCreatorContentData.creators) {
                                throw new Error(`Id clash for creators: ${newId}`);
                            }
                            updateCreatorContent({
                                ...props.currentCreatorContentData,
                                creators: {
                                    [newId]: newCreator,
                                    ...props.currentCreatorContentData.creators,
                                },
                            });
                            changeCurrentlyEditing('creators', newId, 'add', props);
                        }
                    })}
                >
                    <h1>
                        ${props.phrases.creators}
                    </h1>
                    ${creators.map((creator) => {
                        const originalCreator =
                            creator && props.originalData
                                ? props.originalData.creators[creator.id]
                                : undefined;
                        const modified: boolean =
                            creator && props.originalData
                                ? !originalCreator || !isJsonEqual(originalCreator, creator)
                                : // don't count the "create new" card as modified
                                  false;

                        return html`
                            <${CreatorEntry}
                                ${assign(CreatorEntry.props.modified, modified)}
                                ${assign(CreatorEntry.props.creator, creator)}
                                ${assign(CreatorEntry.props.canRevert, !!originalCreator)}
                                ${assign(
                                    CategoryEntry.props.editing,
                                    isEditing('creators', creator?.id, props.currentlyEditing),
                                )}
                                ${listen(SharedDashboardEntry.events.edit, () => {
                                    if (creator) {
                                        changeCurrentlyEditing(
                                            'creators',
                                            creator.id,
                                            'add',
                                            props,
                                        );
                                    }
                                })}
                                ${listen(SharedDashboardEntry.events.done, () => {
                                    if (creator) {
                                        changeCurrentlyEditing(
                                            'creators',
                                            creator.id,
                                            'remove',
                                            props,
                                        );
                                    }
                                })}
                                ${listen(SharedDashboardEntry.events.revert, () => {
                                    if (
                                        props.currentCreatorContentData &&
                                        creator &&
                                        originalCreator
                                    ) {
                                        updateCreatorContent({
                                            ...props.currentCreatorContentData,
                                            creators: {
                                                ...props.currentCreatorContentData.creators,
                                                [creator.id]: originalCreator,
                                            },
                                        });
                                    }
                                })}
                                
                                ${listen(SharedDashboardEntry.events.delete, () => {
                                    if (props.currentCreatorContentData && creator) {
                                        const newCreators = {
                                            ...props.currentCreatorContentData.creators,
                                        };
                                        delete newCreators[creator.id];

                                        updateCreatorContent({
                                            ...props.currentCreatorContentData,
                                            creators: newCreators,
                                        });
                                    }
                                })}
                                ${listen(CreatorEntry.events.creatorChange, (event) => {
                                    const changedCreator = event.detail;
                                    if (props.currentCreatorContentData) {
                                        const newCreators = {
                                            ...props.currentCreatorContentData.creators,
                                            [changedCreator.id]: changedCreator,
                                        };

                                        updateCreatorContent({
                                            ...props.currentCreatorContentData,
                                            creators: newCreators,
                                        });
                                    }
                                })}
                            ></${CreatorEntry}>
                        `;
                    })}
                </section>
                <section
                    class="${props.editingPostId ? 'hidden' : ''}"
                    ${listen(SharedDashboardEntry.events.createNew, () => {
                        if (props.currentCreatorContentData) {
                            const newId = randomString(8);
                            const newCategory: CreatorCategory = {
                                categoryLabel: '',
                                id: newId,
                                nftRequirement: 0,
                                /**
                                 * This will get smoothed out to 0 after updateCreatorContent runs,
                                 * which will also update all the other category order properties so
                                 * they're all in order still. -1 here simply ensures this new
                                 * category will always be first.
                                 */
                                order: -1,
                                postIds: [],
                            };
                            if (newId in props.currentCreatorContentData.creators) {
                                throw new Error(`Id clash for creators: ${newId}`);
                            }
                            updateCreatorContent({
                                ...props.currentCreatorContentData,
                                categories: {
                                    ...props.currentCreatorContentData.categories,
                                    [newId]: newCategory,
                                },
                            });
                            changeCurrentlyEditing('categories', newId, 'add', props);
                        }
                    })}
                    ${listen(CategoryEntry.events.changeOrder, (event) => {
                        if (props.currentCreatorContentData) {
                            const {category, increase} = event.detail;
                            let innerCategories = [...categories];

                            const oldCategoryIndex = innerCategories.findIndex(
                                (innerCategory) => innerCategory?.id === category.id,
                            );

                            if (oldCategoryIndex === -1) {
                                console.error({categories, category});
                                throw new Error(
                                    `Could not find index of category by id "${category.id}"`,
                                );
                            }

                            const newCategoryIndex = increase
                                ? oldCategoryIndex + 1
                                : oldCategoryIndex - 1;

                            moveIndex(innerCategories, oldCategoryIndex, newCategoryIndex);

                            const newCategories: ContentCreatorDashboardData['categories'] =
                                mapKeys(
                                    props.currentCreatorContentData.categories,
                                    (key, newCategory): CreatorCategory => {
                                        const newOrder = innerCategories.findIndex(
                                            (innerCategory) => innerCategory?.id === newCategory.id,
                                        );

                                        if (newOrder === -1) {
                                            console.error({categories, category: newCategory});
                                            throw new Error(
                                                `Could not find index of category by id "${newCategory.id}"`,
                                            );
                                        }
                                        return {
                                            ...newCategory,
                                            order: newOrder,
                                        };
                                    },
                                );

                            updateCreatorContent({
                                ...props.currentCreatorContentData,
                                categories: newCategories,
                            });
                        }
                    })}
                >
                    <h1>
                        ${props.phrases.categories}
                    </h1>
                    ${categories.map((category) => {
                        const originalCategory =
                            category && props.originalData
                                ? props.originalData.categories[category.id]
                                : undefined;
                        const modified: boolean =
                            category && props.originalData
                                ? !originalCategory || !isJsonEqual(originalCategory, category)
                                : // don't count the "create new" card as modified
                                  false;

                        return html`
                            <${CategoryEntry}
                                ${assign(
                                    CategoryEntry.props.editing,
                                    isEditing('categories', category?.id, props.currentlyEditing),
                                )}
                                ${assign(CategoryEntry.props.modified, modified)}
                                ${assign(CategoryEntry.props.category, category)}
                                ${assign(CategoryEntry.props.canRevert, !!originalCategory)}
                                ${listen(SharedDashboardEntry.events.revert, () => {
                                    if (
                                        props.currentCreatorContentData &&
                                        category &&
                                        originalCategory
                                    ) {
                                        updateCreatorContent({
                                            ...props.currentCreatorContentData,
                                            categories: {
                                                ...props.currentCreatorContentData.categories,
                                                [category.id]: originalCategory,
                                            },
                                        });
                                    }
                                })}
                                ${listen(SharedDashboardEntry.events.edit, () => {
                                    if (category) {
                                        changeCurrentlyEditing(
                                            'categories',
                                            category.id,
                                            'add',
                                            props,
                                        );
                                    }
                                })}
                                ${listen(SharedDashboardEntry.events.done, () => {
                                    if (category) {
                                        changeCurrentlyEditing(
                                            'categories',
                                            category.id,
                                            'remove',
                                            props,
                                        );
                                    }
                                })}
                                ${listen(SharedDashboardEntry.events.delete, () => {
                                    if (props.currentCreatorContentData && category) {
                                        const newCategories = {
                                            ...props.currentCreatorContentData.categories,
                                        };
                                        delete newCategories[category.id];

                                        updateCreatorContent({
                                            ...props.currentCreatorContentData,
                                            categories: newCategories,
                                        });
                                    }
                                })}
                                ${listen(CategoryEntry.events.categoryChange, (event) => {
                                    const changedCategory = event.detail;
                                    if (props.currentCreatorContentData) {
                                        const newCategories = {
                                            ...props.currentCreatorContentData.categories,
                                            [changedCategory.id]: changedCategory,
                                        };

                                        updateCreatorContent({
                                            ...props.currentCreatorContentData,
                                            categories: newCategories,
                                        });
                                    }
                                })}
                            ></${CategoryEntry}>
                        `;
                    })}
                </section>
                <section
                    class="posts-section ${props.editingPostId ? 'full-screen' : ''}"
                    ${listen(SharedDashboardEntry.events.createNew, () => {
                        if (props.currentCreatorContentData && canCreatePost) {
                            const newId = randomString(8);
                            const newContentPost: CreatorPost = {
                                categoryId: '',
                                content: '',
                                creatorId: '',
                                id: newId,
                                nftRequirement: 0,
                                postLabel: '',
                                timestamp: Date.now(),
                            };
                            if (newId in props.currentCreatorContentData.posts) {
                                throw new Error(`Id clash for post: ${newId}`);
                            }

                            updateCreatorContent({
                                ...props.currentCreatorContentData,
                                posts: {
                                    ...props.currentCreatorContentData.posts,
                                    [newId]: newContentPost,
                                },
                            });
                            genericDispatch(new ScrollToTopEvent());
                            genericDispatch(
                                new TriggerTcnftAppRouteChangeEvent({
                                    paths: [
                                        TcnftAppTopLevelRoute.Creator,
                                        newContentPost.id,
                                    ],
                                }),
                            );
                        }
                    })}
                >
                    <h1>
                        ${props.phrases.content}
                    </h1>
                    ${
                        canCreatePost
                            ? filteredPosts.map((creatorPost) => {
                                  const originalPost =
                                      creatorPost && props.originalData
                                          ? props.originalData.posts[creatorPost.id]
                                          : undefined;
                                  const modified: boolean =
                                      creatorPost && props.originalData
                                          ? !originalPost || !isJsonEqual(originalPost, creatorPost)
                                          : // don't count the "create new" card as modified
                                            false;

                                  const filterSelect = creatorPost
                                      ? ''
                                      : html`
                                        <${CoreSelect}
                                            ${listen(CoreSelect.events.valueChange, (event) => {
                                                const value = event.detail;
                                                props.categoryIdPostFilter = value;
                                            })}
                                            ${assign(
                                                CoreSelect.props.value,
                                                props.categoryIdPostFilter,
                                            )}
                                            ${assign(
                                                CoreSelect.props.label,
                                                props.phrases.filterPosts,
                                            )}
                                            ${assign(
                                                CoreSelect.props.placeholder,
                                                props.phrases.selectACategory,
                                            )}
                                            ${assign(
                                                CoreSelect.props.options,
                                                [
                                                    {
                                                        label: props.phrases.none,
                                                        value: '',
                                                    },
                                                ].concat(
                                                    categories
                                                        .filter(isTruthy)
                                                        .map((category): SelectOption => {
                                                            return {
                                                                label: category.categoryLabel,
                                                                value: category.id,
                                                            };
                                                        }),
                                                ),
                                            )}
                                            
                                        >
                                        </${CoreSelect}>
                                    `;

                                  return html`
                                    <${PostEntry}
                                        class="${
                                            creatorPost?.id === props.editingPostId
                                                ? 'tcnft-post-entry-full-screen full-screen'
                                                : ''
                                        }"
                                        ${assign(PostEntry.props.modified, modified)}
                                        ${assign(
                                            PostEntry.props.editing,
                                            props.editingPostId === creatorPost?.id,
                                        )}
                                        ${assign(PostEntry.props.currentUser, props.currentUser)}
                                        ${assign(PostEntry.props.creatorPost, creatorPost)}
                                        ${assign(PostEntry.props.canRevert, !!originalPost)}
                                        ${assign(
                                            PostEntry.props.categories,
                                            categories.filter(isTruthy),
                                        )}
                                        ${assign(
                                            PostEntry.props.creators,
                                            creators.filter(isTruthy),
                                        )}
                                        ${listen(SharedDashboardEntry.events.revert, () => {
                                            if (
                                                props.currentCreatorContentData &&
                                                creatorPost &&
                                                originalPost
                                            ) {
                                                const newCategories = changePostIdLocation({
                                                    categories:
                                                        props.currentCreatorContentData.categories,
                                                    newCategoryId: originalPost.categoryId,
                                                    oldCategoryId: creatorPost.categoryId,
                                                    postId: creatorPost.id,
                                                });
                                                updateCreatorContent({
                                                    ...props.currentCreatorContentData,
                                                    posts: {
                                                        ...props.currentCreatorContentData.posts,
                                                        [creatorPost.id]: originalPost,
                                                    },
                                                    categories: newCategories,
                                                });
                                            }
                                        })}
                                        ${listen(SharedDashboardEntry.events.edit, () => {
                                            if (creatorPost) {
                                                genericDispatch(
                                                    new TriggerTcnftAppRouteChangeEvent({
                                                        paths: [
                                                            TcnftAppTopLevelRoute.Creator,
                                                            creatorPost.id,
                                                        ],
                                                    }),
                                                );
                                            }
                                        })}
                                        ${listen(SharedDashboardEntry.events.done, () => {
                                            if (creatorPost) {
                                                exitPostEditing();

                                                genericDispatch(new ScrollToTopEvent());
                                            }
                                        })}
                                        ${listen(SharedDashboardEntry.events.delete, () => {
                                            if (props.currentCreatorContentData && creatorPost) {
                                                const newPosts = {
                                                    ...props.currentCreatorContentData.posts,
                                                };
                                                delete newPosts[creatorPost.id];

                                                const newCategories = changePostIdLocation({
                                                    categories:
                                                        props.currentCreatorContentData.categories,
                                                    newCategoryId: undefined,
                                                    oldCategoryId: creatorPost.categoryId,
                                                    postId: creatorPost.id,
                                                });

                                                updateCreatorContent({
                                                    ...props.currentCreatorContentData,
                                                    posts: newPosts,
                                                    categories: newCategories,
                                                });
                                            }
                                        })}
                                        ${listen(PostEntry.events.creatorPostChange, (event) => {
                                            const changedCreatorPost = event.detail;
                                            if (props.currentCreatorContentData) {
                                                const newPosts = {
                                                    ...props.currentCreatorContentData.posts,
                                                    [changedCreatorPost.id]: changedCreatorPost,
                                                };

                                                const newCategories = changePostIdLocation({
                                                    categories:
                                                        props.currentCreatorContentData.categories,
                                                    newCategoryId: changedCreatorPost.categoryId,
                                                    oldCategoryId: creatorPost?.categoryId,
                                                    postId: changedCreatorPost.id,
                                                });

                                                updateCreatorContent({
                                                    ...props.currentCreatorContentData,
                                                    posts: newPosts,
                                                    categories: newCategories,
                                                });
                                            }
                                        })}
                                    >${filterSelect}</${PostEntry}>
                                `;
                              })
                            : html`
                                  <div class="cannot-create-post-yet">
                                      ${props.phrases.cannotCreatePostYet}
                                  </div>
                              `
                    }
                </section>
            </main>
            <footer
                class="${props.editingPostId ? 'hidden' : ''}"
            >
                <div>
                    <${CoreButton}
                        class="tcnft-core-button-text-button edit-json-button"
                        ${assign(CoreButton.props.label, props.phrases.editJson)}
                        ${listen('click', () => {
                            genericDispatch(
                                new TriggerTcnftAppRouteChangeEvent({
                                    search: {[TcnftAppSearchParamKeys.EditJson]: '1'},
                                }),
                            );
                        })}
                    >
                    </${CoreButton}>
                </div>
                <div>
                    ${
                        props.saveFailure
                            ? html`
                                  <span class="error-message">${props.phrases.failedToSave}</span>
                              `
                            : ''
                    }
                    <${LoadingIndicator}
                        ${assign(LoadingIndicator.props.isLoading, !!props.savingData)}
                        ${assign(LoadingIndicator.props.size, 32)}
                    ></${LoadingIndicator}>
                    <${CoreButton}
                        class="tcnft-core-button-text-button"
                        ${assign(CoreButton.props.label, props.phrases.revert)}
                        ${assign(CoreButton.props.clickable, canBeSaved)}
                        ${listen('click', () => {
                            if (
                                canBeSaved &&
                                props.currentUser &&
                                !!props.currentCreatorContentData &&
                                props.originalData
                            ) {
                                updateCreatorContent(copyWithJson(props.originalData));
                                props.currentlyEditing = {};
                            }
                        })}
                    >
                    </${CoreButton}>
                    <${CoreButton}
                        class="tcnft-core-button-accept-theme ${
                            canBeSaved ? 'tcnft-core-button-jiggle' : ''
                        }"
                        ${assign(CoreButton.props.label, props.phrases.save)}
                        ${assign(CoreButton.props.clickable, canBeSaved)}
                        ${listen('click', () => {
                            if (
                                canBeSaved &&
                                props.currentUser &&
                                !!props.currentCreatorContentData
                            ) {
                                const dataToSave = props.currentCreatorContentData;
                                props.savingData = saveCreatorDashboardData(
                                    props.currentUser.nftActor,
                                    dataToSave,
                                );

                                props.savingData
                                    .then((result) => {
                                        if (result) {
                                            props.originalData = copyWithJson(dataToSave);
                                            props.currentlyEditing = {};
                                            genericDispatch(new UpdateBrowseDataEvent());
                                        }
                                    })
                                    .catch((error) => {
                                        props.saveFailure = true;
                                        console.error(error);
                                    })
                                    .finally(() => {
                                        props.savingData = undefined;
                                    });
                            }
                        })}
                    >
                    </${CoreButton}>
                </div>
            </footer>
        `;
    },
});
