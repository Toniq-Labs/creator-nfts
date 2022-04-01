import {isPromise} from '@frontend/src/augments/promise';
import {
    getIndividualPostContent,
    UserBrowseData,
} from '@frontend/src/canisters/nft/creator-content/canister-actions-for-user';
import {NftUser} from '@frontend/src/data/nft-user';
import {
    readLocalStorageValue,
    writeLocalStorageValue,
} from '@frontend/src/local-storage/local-storage';
import {createPostIdLocalStorageKey} from '@frontend/src/local-storage/local-storage-keys';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {CategoryButton} from '@frontend/src/ui/elements/design-system/category-button.element';
import {CoreButton} from '@frontend/src/ui/elements/design-system/core-button.element';
import {PostCard} from '@frontend/src/ui/elements/design-system/post-card.element';
import {RouteLink} from '@frontend/src/ui/elements/design-system/route-link.element';
import {LoadingIndicator} from '@frontend/src/ui/elements/loading/loading-indicator.element';
import {ViewPost} from '@frontend/src/ui/elements/pages/view-post.element';
import {ReplaceCurrentRouteEvent} from '@frontend/src/ui/global-events/trigger-tcnft-app-route-change.event';
import {UpdateBrowseDataEvent} from '@frontend/src/ui/global-events/update-browse-data.event';
import {emptyRoute, tcnftAppRouter} from '@frontend/src/ui/routes/app-router';
import {TcnftAppFullRoute, TcnftAppTopLevelRoute} from '@frontend/src/ui/routes/app-routes';
import {themeForegroundPrimaryAccentColorVar} from '@frontend/src/ui/styles/theme-vars';
import {isTruthy} from 'augment-vir/dist';
import {assign, css, html, listen} from 'element-vir';
import {TemplateResult} from 'lit';
import {shouldMouseEventTriggerRoutes} from 'spa-router-vir';
import {TriggerTcnftAppRouteChangeEvent} from '../../../global-events/trigger-tcnft-app-route-change.event';

async function loadPostContent(currentUser: NftUser, postId: string): Promise<string> {
    if (!currentUser) {
        throw new Error(`Cannot load post content without a logged in user.`);
    }
    const localStoragePostKey = createPostIdLocalStorageKey(postId);
    const cachedContent = readLocalStorageValue(localStoragePostKey);
    const loadFromCanisterPromise = getIndividualPostContent(postId, currentUser.nftActor).then(
        (postContent) => {
            // save the post content to local storage even if it's cached so it can get updated in the background
            writeLocalStorageValue(localStoragePostKey, postContent);
            return postContent;
        },
    );

    if (cachedContent != undefined) {
        return cachedContent;
    }
    const loadedContent = await loadFromCanisterPromise;
    if (loadedContent != undefined) {
        return loadedContent;
    } else {
        throw new Error(`Failed to load post content for post "${postId}".`);
    }
}

export const HomeBrowsePage = defineCreatorNftElement({
    tagName: 'tcnft-home-browse-page',
    props: {
        userBrowseData: undefined as undefined | UserBrowseData,

        currentFullRoute: undefined as TcnftAppFullRoute | undefined,
        router: tcnftAppRouter,
        currentUser: undefined as NftUser | undefined,
        selectedPostContent: {postId: undefined, postContent: undefined} as {
            postId: string | undefined;
            postContent: string | Promise<string> | undefined;
        },
        phrases: {
            back: '< Back',
            noPosts: 'This category has no posts yet!',
        },
    },
    styles: css`
        :host {
            display: flex;
            align-items: stretch;
            position: relative;
        }

        nav {
            flex-shrink: 0;
            max-width: 50%;
            box-sizing: border-box;
            margin: 16px 0;
            padding: 16px;
            position: relative;

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

        .right-section {
            flex-grow: 1;
            display: flex;
            position: relative;
            justify-content: center;
            align-items: flex-start;
            padding: 32px;
        }

        .right-section.viewing-post {
            padding-top: 16px;
        }

        .content-list {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            max-width: min(1000px, 100%);
            align-items: stretch;
        }

        ${ViewPost} {
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

        .view-post-wrapper {
            display: flex;
            flex-direction: column;
            gap: 8px;
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
        if (!props.userBrowseData && props.currentUser) {
            genericDispatch(new UpdateBrowseDataEvent());
        }

        let selectedCreatorCategory =
            props.userBrowseData && props.currentFullRoute?.paths[1]
                ? props.userBrowseData.categories[props.currentFullRoute?.paths[1]]
                : undefined;

        const selectedInitialPostData =
            props.userBrowseData && props.currentFullRoute?.paths[2]
                ? props.userBrowseData.posts[props.currentFullRoute?.paths[2]]
                : undefined;

        const selectedPostCreator = selectedInitialPostData
            ? props.userBrowseData?.creators[selectedInitialPostData.creatorId]
            : undefined;

        if (
            selectedInitialPostData &&
            props.selectedPostContent.postId != selectedInitialPostData.id &&
            props.currentUser
        ) {
            const loadContentPromise = loadPostContent(
                props.currentUser,
                selectedInitialPostData.id,
            ).then((loadedContent) => {
                props.selectedPostContent = {
                    postId: props.selectedPostContent.postId,
                    postContent: loadedContent,
                };
                return loadedContent;
            });
            props.selectedPostContent = {
                postId: selectedInitialPostData.id,
                postContent: loadContentPromise,
            };
        }

        if (
            props.userBrowseData &&
            props.currentFullRoute?.paths[0] === TcnftAppTopLevelRoute.Home &&
            !selectedCreatorCategory
        ) {
            const firstCategory = Object.values(props.userBrowseData.categories)[0];
            if (firstCategory) {
                props.currentFullRoute = props.currentFullRoute && {
                    ...props.currentFullRoute,
                    paths: [
                        TcnftAppTopLevelRoute.Home,
                        firstCategory.id,
                    ],
                };
                selectedCreatorCategory = firstCategory;
                genericDispatch(
                    new ReplaceCurrentRouteEvent({
                        ...props.currentFullRoute,
                    }),
                );
            }
        }

        const creatorCategories = props.userBrowseData
            ? Object.values(props.userBrowseData.categories)
                  .sort((a, b) => a.order - b.order)
                  .filter(
                      (category) =>
                          category.nftRequirement <= (props.currentUser?.nftIdList.length ?? 0),
                  )
            : undefined;

        const selectedCategoryPosts = selectedCreatorCategory?.postIds
            .map((postId) => {
                if (props.userBrowseData) {
                    const creatorPost = props.userBrowseData.posts[postId];
                    if (creatorPost) {
                        return creatorPost;
                    } else {
                        console.error(
                            `Could not find post with id "${postId}" from category with id "${
                                selectedCreatorCategory!.id
                            }"`,
                        );
                        return undefined;
                    }
                } else {
                    throw new Error(
                        `If selectedCreatorCategory is defined, userBroseData should be defined and loaded as well.`,
                    );
                }
            })
            .filter(isTruthy)
            .sort((a, b) => b.timestamp - a.timestamp);

        const navTemplate: TemplateResult = html`
            <nav>
                <ul>
                    ${(creatorCategories || []).map((creatorCategory) => {
                        const route: TcnftAppFullRoute = {
                            ...(props.currentFullRoute ?? emptyRoute),
                            paths: [
                                TcnftAppTopLevelRoute.Home,
                                creatorCategory.id,
                            ],
                        };

                        return html`
                                <li>
                                    <${RouteLink}
                                        ${assign(RouteLink.props.routeLink, route)}
                                    >                                        
                                        <${CategoryButton}
                                            ${assign(
                                                CategoryButton.props.selected,
                                                creatorCategory.id === selectedCreatorCategory?.id,
                                            )}
                                            ${assign(
                                                CategoryButton.props.categoryName,
                                                creatorCategory.categoryLabel,
                                            )}
                                            ${listen('click', (clickEvent: MouseEvent) => {
                                                if (shouldMouseEventTriggerRoutes(clickEvent)) {
                                                    clickEvent.preventDefault();
                                                    genericDispatch(
                                                        new TriggerTcnftAppRouteChangeEvent(route),
                                                    );
                                                }
                                            })}
                                        >
                                        </${CategoryButton}>
                                    </${RouteLink}>
                                </li>
                            `;
                    })}
                </ul>
            </nav>
        `;

        const postsTemplate: TemplateResult = selectedCategoryPosts?.length
            ? html`
                  <ul class="content-list">
                      ${selectedCategoryPosts?.map((creatorPost) => {
                          if (!props.userBrowseData) {
                              return '';
                          }

                          const isUnlocked =
                              (props.currentUser?.nftIdList.length || 0) >=
                              creatorPost.nftRequirement;
                          const route: Partial<TcnftAppFullRoute> = {
                              paths: [
                                  TcnftAppTopLevelRoute.Home,
                                  creatorPost.categoryId,
                                  creatorPost.id,
                              ],
                          };
                          const link = props.router.createRoutesUrl({
                              ...props.router.getCurrentRawRoutes(),
                              ...route,
                          });

                          const creator = props.userBrowseData.creators[creatorPost.creatorId];

                          if (!creator) {
                              console.error(
                                  `Could not find creator with id "${creatorPost.creatorId}" from post "${creatorPost.id}"`,
                              );
                          }

                          const contentCardTemplate: TemplateResult = html`
                      <${PostCard}
                          ${assign(PostCard.props.unlockProgress, {
                              required: creatorPost.nftRequirement,
                              current: props.currentUser?.nftIdList.length || 0,
                          })}
                          ${assign(PostCard.props.creator, creator)}
                          ${assign(PostCard.props.creatorPost, creatorPost)}
                          @click=${(clickEvent: MouseEvent) => {
                              if (isUnlocked && shouldMouseEventTriggerRoutes(clickEvent)) {
                                  clickEvent.preventDefault();
                                  genericDispatch(new TriggerTcnftAppRouteChangeEvent(route));
                              }
                          }}
                      ></${PostCard}>`;

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
            : html`
                  <p>${props.phrases.noPosts}</p>
              `;

        const viewPostTemplate: TemplateResult | string =
            selectedInitialPostData && selectedCreatorCategory
                ? html`
                    <div class="view-post-wrapper">
                        <${LoadingIndicator}
                            ${assign(
                                LoadingIndicator.props.isLoading,
                                isPromise(props.selectedPostContent.postContent) ||
                                    !props.selectedPostContent.postContent,
                            )}
                        ></${LoadingIndicator}>
                        <${RouteLink}
                                ${assign(RouteLink.props.routeLink, {
                                    paths: [
                                        TcnftAppTopLevelRoute.Home,
                                        selectedCreatorCategory.id,
                                    ],
                                })}
                            class="back-to-category">
                            ${props.phrases.back}
                        </${RouteLink}>
                        <${ViewPost}
                            ${assign(ViewPost.props.postId, selectedInitialPostData.id)}
                            ${assign(ViewPost.props.postCreator, selectedPostCreator)}
                            ${assign(
                                ViewPost.props.postTimestamp,
                                selectedInitialPostData.timestamp,
                            )}
                            ${assign(ViewPost.props.postTitle, selectedInitialPostData.postLabel)}
                            ${assign(
                                ViewPost.props.postContent,
                                isPromise(props.selectedPostContent.postContent)
                                    ? undefined
                                    : props.selectedPostContent.postContent,
                            )}
                        ></${ViewPost}>
                    </div>
                `
                : '';

        return html`
            <${LoadingIndicator}
                ${assign(LoadingIndicator.props.isLoading, !creatorCategories)}
            ></${LoadingIndicator}>
            ${navTemplate}
            <section class="right-section ${
                selectedInitialPostData && selectedCreatorCategory ? 'viewing-post' : ''
            }">
                ${
                    selectedInitialPostData && selectedCreatorCategory
                        ? viewPostTemplate
                        : postsTemplate
                }
            </section>
        `;
    },
});
