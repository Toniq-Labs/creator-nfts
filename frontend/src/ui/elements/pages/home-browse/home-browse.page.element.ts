import {trimKeyLength} from '@frontend/src/augments/object';
import {
    getCategoryContents,
    getCurrentUserContentCategories,
} from '@frontend/src/canisters/creator-content-canister';
import {CategoryId, CreatorContentMetadata} from '@frontend/src/data/creator-content';
import {NftUserWithNftList} from '@frontend/src/data/nft-user';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {CoreButton} from '@frontend/src/ui/elements/design-system/core-button.element';
import {RouteLink} from '@frontend/src/ui/elements/design-system/route-link.element';
import {LoadingIndicator} from '@frontend/src/ui/elements/loading/loading-indicator.element';
import {ContentCard} from '@frontend/src/ui/elements/pages/home-browse/content-card.element';
import {ViewContent} from '@frontend/src/ui/elements/pages/home-browse/view-content.element';
import {ReplaceCurrentRouteEvent} from '@frontend/src/ui/global-events/trigger-tcnft-app-route-change';
import {emptyRoute, tcnftAppRouter} from '@frontend/src/ui/routes/app-router';
import {TcnftAppFullRoute, TcnftAppTopLevelRoute} from '@frontend/src/ui/routes/app-routes';
import {
    themeForegroundDimColorVar,
    themeForegroundPrimaryAccentColorVar,
} from '@frontend/src/ui/styles/theme-vars';
import {assign, css, html} from 'element-vir';
import {TemplateResult} from 'lit';
import {shouldMouseEventTriggerRoutes} from 'spa-router-vir';
import {TriggerTcnftAppRouteChangeEvent} from '../../../global-events/trigger-tcnft-app-route-change';

const maxContentPerPage = 100 as const;

export const HomeBrowsePage = defineCreatorNftElement({
    tagName: 'tcnft-home-browse-page',
    props: {
        categoryArray: undefined as undefined | CategoryId[],
        categoryMap: undefined as undefined | Record<string, CategoryId>,
        /** Store the loading promise so we don't trigger loading twice */
        loadingCategoriesPromise: undefined as undefined | Promise<CategoryId[] | undefined>,

        categoryContents: undefined as
            | undefined
            | {categoryId: CategoryId; contentsMetadata: Record<string, CreatorContentMetadata>},
        /** Store the loading promise so we don't trigger loading twice */
        loadingCategoryContentsPromise: undefined as
            | undefined
            | Promise<Record<string, CreatorContentMetadata> | undefined>,

        currentFullRoute: undefined as TcnftAppFullRoute | undefined,
        router: tcnftAppRouter,
        currentUser: undefined as NftUserWithNftList | undefined,
    },
    styles: css`
        :host {
            display: flex;
            align-items: stretch;
            position: relative;
        }

        nav {
            width: 200px;
            flex-shrink: 0;
            max-width: 50%;
            box-sizing: border-box;
            margin: 16px 0;
            padding: 16px 0;
            position: relative;
            padding-right: 16px;

            border: 0 solid ${themeForegroundPrimaryAccentColorVar};
            border-right-width: 1px;
            overflow-x: hidden;
            overflow-y: auto;
        }

        ul {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
        }

        a {
            text-decoration: none;
        }

        li {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .category-button {
            --tcnft-core-button-padding: 0.12em 0.7em;
            border-radius: 1em;
            border: 2px solid ${themeForegroundDimColorVar};
            font-weight: normal;
        }

        .right-section {
            flex-grow: 1;
            display: flex;
            position: relative;
            justify-content: center;
            align-items: flex-start;
            padding: 32px;
        }

        .content-list {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            max-width: min(1000px, 100%);
            align-items: stretch;
        }

        ${ViewContent} {
            max-width: min(1000px, 100%);
            flex-grow: 1;
            height: 100%;
        }

        .content-card > * {
            flex-grow: 1;
        }

        .content-card > a {
            display: flex;
        }

        .content-card > a > * {
            flex-grow: 1;
        }

        .content-card {
            display: flex;
        }

        ${CoreButton}.selected {
            /* 
                give the selected button a tad more padding because it doesn't have a border
            */
            --tcnft-core-button-padding: calc(0.12em + 2px) calc(0.7em + 2px);
            border: none;
        }

        @media (max-width: 800px) {
            :host {
                flex-direction: column;
            }
            nav {
                margin: 0;
                border-width: 0;
                border-bottom-width: 1px;
                width: unset;
                max-width: unset;
                padding: 16px 0;
                margin: 0 16px;
                overflow-x: auto;
                overflow-y: hidden;
            }

            nav > ul {
                flex-direction: row;
            }
        }

        ${LoadingIndicator} {
            align-items: flex-start;
            padding-top: 100px;
            z-index: 10;
        }

        @media (max-height: 460px) {
            ${LoadingIndicator} {
                padding-top: 0;
            }
        }
    `,
    renderCallback: ({props, genericDispatch}) => {
        if (!props.categoryArray && !props.loadingCategoriesPromise) {
            props.loadingCategoriesPromise = getCurrentUserContentCategories();
            props.loadingCategoriesPromise.then((categories) => {
                props.categoryArray = categories;
                if (categories) {
                    props.categoryMap = categories.reduce((accum, currentCategory) => {
                        accum[currentCategory.id] = currentCategory;
                        return accum;
                    }, {} as Record<string, CategoryId>);
                }
                props.loadingCategoriesPromise = undefined;
            });
        }

        let selectedCategoryId = props.categoryMap?.[props.currentFullRoute?.paths[1] || ''];

        if (props.categoryArray && !props.loadingCategoriesPromise && !selectedCategoryId) {
            const firstCategory = props.categoryArray[0];
            if (firstCategory) {
                props.currentFullRoute = props.currentFullRoute && {
                    ...props.currentFullRoute,
                    paths: [TcnftAppTopLevelRoute.Home, firstCategory.id],
                };
                selectedCategoryId = firstCategory;
                genericDispatch(
                    new ReplaceCurrentRouteEvent({
                        ...props.currentFullRoute,
                    }),
                );
            }
        }

        if (
            !props.loadingCategoryContentsPromise &&
            selectedCategoryId &&
            (!props.categoryContents ||
                props.categoryContents.categoryId.id !== selectedCategoryId.id)
        ) {
            props.loadingCategoryContentsPromise = getCategoryContents(selectedCategoryId);
            props.loadingCategoryContentsPromise.then((contentIds) => {
                if (contentIds && Object.keys(contentIds).length > maxContentPerPage) {
                    console.dir(props.currentFullRoute);
                    console.error(
                        `Max content count (${maxContentPerPage}) exceeded on browse page.`,
                    );
                    contentIds = trimKeyLength(maxContentPerPage, contentIds);
                }

                if (selectedCategoryId) {
                    props.categoryContents = contentIds && {
                        categoryId: selectedCategoryId,
                        contentsMetadata: contentIds,
                    };

                    props.loadingCategoryContentsPromise = undefined;
                }
            });
        }

        const selectedContentMetadata =
            props.categoryContents?.contentsMetadata[props.currentFullRoute?.paths[2] || ''];

        return html`
            <nav style=${Object.keys(props.categoryArray || []).length > 1 ? '' : 'display: none'}>
                <ul>
                    <${LoadingIndicator}
                        ${assign(LoadingIndicator.props.isLoading, !props.categoryArray)}
                    ></${LoadingIndicator}>
                    ${(props.categoryArray || []).map((categoryId) => {
                        const route: TcnftAppFullRoute = {
                            ...(props.currentFullRoute ?? emptyRoute),
                            paths: [TcnftAppTopLevelRoute.Home, categoryId.id],
                        };

                        return html`
                            <li>
                                <${RouteLink}
                                    ${assign(RouteLink.props.routeLink, route)}
                                >
                                    <${CoreButton}
                                        class="category-button ${
                                            categoryId.id === selectedCategoryId?.id
                                                ? 'selected'
                                                : 'tcnft-core-button-text-button'
                                        }"
                                        ${assign(CoreButton.props.label, categoryId.label)}
                                        @click=${(clickEvent: MouseEvent) => {
                                            if (shouldMouseEventTriggerRoutes(clickEvent)) {
                                                clickEvent.preventDefault();
                                                genericDispatch(
                                                    new TriggerTcnftAppRouteChangeEvent(route),
                                                );
                                            }
                                        }}
                                    ></${CoreButton}>
                                </${RouteLink}>
                            </li>
                        `;
                    })}
                </ul>
            </nav>
            <section class="right-section">
                <${LoadingIndicator}
                    ${assign(
                        LoadingIndicator.props.isLoading,
                        !props.categoryContents || !!props.loadingCategoryContentsPromise,
                    )}
                ></${LoadingIndicator}>
                ${
                    selectedContentMetadata
                        ? html`
                            <${ViewContent}
                                ${assign(
                                    ViewContent.props.contentId,
                                    selectedContentMetadata.contentId,
                                )}
                            ></${ViewContent}>
                        `
                        : html`
                              <ul class="content-list">
                                  ${Object.values(
                                      props.categoryContents?.contentsMetadata || {},
                                  ).map((contentMetadata) => {
                                      const isUnlocked =
                                          (props.currentUser?.nftIdList.length || 0) >=
                                          contentMetadata.unlockRequirement.required;
                                      const route: Partial<TcnftAppFullRoute> = {
                                          paths: [
                                              TcnftAppTopLevelRoute.Home,
                                              contentMetadata.contentId.parentId.id,
                                              contentMetadata.contentId.id,
                                          ],
                                      };
                                      const link = props.router.createRoutesUrl({
                                          ...props.router.getCurrentRawRoutes(),
                                          ...route,
                                      });
                                      const contentCardTemplate: TemplateResult = html`
                                        <${ContentCard}
                                            ${assign(ContentCard.props.unlockProgress, {
                                                ...contentMetadata.unlockRequirement,
                                                current: props.currentUser?.nftIdList.length || 0,
                                            })}
                                            ${assign(
                                                ContentCard.props.creatorId,
                                                contentMetadata.creator,
                                            )}
                                            ${assign(
                                                ContentCard.props.contentId,
                                                contentMetadata.contentId,
                                            )}
                                            @click=${(clickEvent: MouseEvent) => {
                                                if (
                                                    isUnlocked &&
                                                    shouldMouseEventTriggerRoutes(clickEvent)
                                                ) {
                                                    clickEvent.preventDefault();
                                                    genericDispatch(
                                                        new TriggerTcnftAppRouteChangeEvent(route),
                                                    );
                                                }
                                            }}
                                        ></${ContentCard}>`;

                                      return html`
                                          <li class="content-card">
                                              ${isUnlocked
                                                  ? html`
                                                        <a href=${link}>${contentCardTemplate}</a>
                                                    `
                                                  : html`
                                                        ${contentCardTemplate}
                                                    `}
                                          </li>
                                      `;
                                  })}
                              </ul>
                          `
                }
            </section>
        `;
    },
});
