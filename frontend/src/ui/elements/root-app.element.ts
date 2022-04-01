import {isPromise} from '@frontend/src/augments/promise';
import {removeCurrentAuth} from '@frontend/src/auth/remove-current-auth';
import {
    getAllPostDataForUser,
    UserBrowseData,
} from '@frontend/src/canisters/nft/creator-content/canister-actions-for-user';
import {ContentCreatorDashboardData} from '@frontend/src/canisters/nft/creator-content/creator-content-types';
import {backupUserBrowseData} from '@frontend/src/data/backup-browse-data';
import {
    isNftUserLoaded,
    MaybeNotLoadedUserId,
    NftUser,
    UnloadedUserId,
} from '@frontend/src/data/nft-user';
import {Theme, ThemeAuto} from '@frontend/src/data/theme';
import {writeLocalStorageValue} from '@frontend/src/local-storage/local-storage';
import {StaticLocalStorageKey} from '@frontend/src/local-storage/local-storage-keys';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {onOsThemeChange} from '@frontend/src/ui/directives/on-os-theme-change.directive';
import {AppHeader} from '@frontend/src/ui/elements/design-system/app-header.element';
import {AuthLoader} from '@frontend/src/ui/elements/loading/auth-loader.element';
import {LoadingIndicator} from '@frontend/src/ui/elements/loading/loading-indicator.element';
import {RootLoader} from '@frontend/src/ui/elements/loading/root-loader.element';
import {ModalWrapper} from '@frontend/src/ui/elements/modals/modal-wrapper.element';
import {AboutPage} from '@frontend/src/ui/elements/pages/about.page.element';
import {CreatorDashboardPage} from '@frontend/src/ui/elements/pages/creator-dashboard/creator-dashboard.page.element';
import {HomeBrowsePage} from '@frontend/src/ui/elements/pages/home-browse/home-browse.page.element';
import {TcnftAppNav} from '@frontend/src/ui/elements/tcnft-app-nav.element';
import {ScrollToTopEvent} from '@frontend/src/ui/global-events/scroll-to-top.event';
import {StartSignInEvent} from '@frontend/src/ui/global-events/start-sign-in.event';
import {ThemeChangeEvent} from '@frontend/src/ui/global-events/theme-change.event';
import {TriggerSignOutEvent} from '@frontend/src/ui/global-events/trigger-sign-out.event';
import {
    ReplaceCurrentRouteEvent,
    TriggerTcnftAppRouteChangeEvent,
} from '@frontend/src/ui/global-events/trigger-tcnft-app-route-change.event';
import {UpdateBrowseDataEvent} from '@frontend/src/ui/global-events/update-browse-data.event';
import {UpdateCreatorContentEvent} from '@frontend/src/ui/global-events/update-creator-content.event';
import {UpdateNftCountEvent} from '@frontend/src/ui/global-events/update-nft-count.event';
import {
    defaultLoggedInNoNftsRoute,
    defaultNotLoggedInRoute,
    emptyRoute,
} from '@frontend/src/ui/routes/app-router';
import {TcnftAppFullRoute, TcnftAppTopLevelRoute} from '@frontend/src/ui/routes/app-routes';
import {clearAllModalsFromRoute} from '@frontend/src/ui/routes/modal-logic';
import {rootElementDefaultStyles} from '@frontend/src/ui/styles/root-element-styles';
import {determineTheme, getLastUsedTheme, setThemeOnBody} from '@frontend/src/ui/styles/theme';
import {appLoadingZIndex, headerZIndex} from '@frontend/src/ui/styles/z-index';
import {assign, css, html, listen, onDomCreated} from 'element-vir';
import {areRoutesEqual} from 'spa-router-vir';

export const RootApp = defineCreatorNftElement({
    tagName: 'tcnft-root-app',
    props: {
        /**
         * The currently selected theme. This includes ThemeAuto which must then be mapped into
         * currentMappedTheme.
         */
        currentSelectedTheme: getLastUsedTheme() || (Theme.light as Theme | ThemeAuto),
        /**
         * This is separate from currentSelectedTheme because when the selected theme is set to
         * ThemeAuto, we need to be able to update something when the OS theme preference changes.
         * This is what it will updated.
         */
        currentMappedTheme: determineTheme(getLastUsedTheme()) as Theme,
        mainElement: undefined as Element | undefined,
        maybeLoadedUserId: UnloadedUserId as MaybeNotLoadedUserId<NftUser> | undefined,
        currentRouting: undefined as
            | {route: TcnftAppFullRoute | undefined; replace?: boolean}
            | undefined,
        showingOverlay: false,
        userLoadingError: '',
        startSignInNow: false,
        currentCreatorContentData: undefined as ContentCreatorDashboardData | undefined,
        browseData: undefined as UserBrowseData | Promise<UserBrowseData> | undefined,
    },
    styles: css`
        ${rootElementDefaultStyles}

        :host {
            display: block;
            box-sizing: border-box;
            z-index: 1;
        }

        main {
            display: flex;
            flex-direction: column;
        }

        main.no-scroll {
            overflow: hidden;
        }

        .header-wrapper {
            position: sticky;
            top: 0;
            z-index: ${headerZIndex};
        }

        ${LoadingIndicator} {
            position: fixed;
            height: 100vh;
            width: 100vw;
            z-index: ${appLoadingZIndex};
        }

        ${AppHeader} {
            transform: translateY(-100%);
            transition-property: transform, background-color, color, border-color;
        }

        ${AppHeader}.signed-in-and-loaded {
            transform: translateY(0);
        }

        .page {
            flex-grow: 1;
        }

        .page.hidden-page {
            display: none;
        }

        @media (max-width: 400px) {
            .header-wrapper {
                position: relative;
            }
        }
    `,
    renderCallback: ({host, props}) => {
        const isUserIdLoaded: boolean = props.maybeLoadedUserId !== UnloadedUserId;
        const isUserIdDefinedAndLoaded: boolean =
            isUserIdLoaded && props.maybeLoadedUserId != undefined;

        const currentRouteWithFallback = props.currentRouting?.route ?? emptyRoute;
        const defaultRoute: TcnftAppFullRoute = {
            ...currentRouteWithFallback,
            ...(isUserIdDefinedAndLoaded ? defaultLoggedInNoNftsRoute : defaultNotLoggedInRoute),
        };

        const loadedUser: NftUser | undefined = isNftUserLoaded(props.maybeLoadedUserId)
            ? props.maybeLoadedUserId
            : undefined;

        return html`
            <${AuthLoader}
                ${listen(AuthLoader.events.userIdLoaded, async (loadedUserIdEvent) => {
                    props.startSignInNow = false;
                    props.maybeLoadedUserId = loadedUserIdEvent.detail;
                })}
                ${listen(AuthLoader.events.userIdLoadingError, async (event) => {
                    props.startSignInNow = false;
                    props.userLoadingError = event.detail;
                })}
                ${assign(AuthLoader.props.signInNow, props.startSignInNow)}
            ></${AuthLoader}>
            <${RootLoader}
                ${assign(RootLoader.props.root, host)}
            ></${RootLoader}>
            <${TcnftAppNav}
                ${assign(TcnftAppNav.props.currentFullRoute, props.currentRouting)}
                ${assign(TcnftAppNav.props.currentUser, props.maybeLoadedUserId)}
                ${listen(TcnftAppNav.events.routeChanged, (event) => {
                    if (
                        !props.currentRouting?.route ||
                        !areRoutesEqual(props.currentRouting.route, event.detail)
                    ) {
                        props.currentRouting = {route: event.detail};
                    }
                })}
            ></${TcnftAppNav}>
            <main
                class="${props.currentMappedTheme} ${props.showingOverlay ? 'no-scroll' : ''}"
                ${onDomCreated((element) => {
                    props.mainElement = element;
                    setThemeOnBody(props.mainElement);
                })}
                ${onOsThemeChange((theme) => {
                    if (props.currentSelectedTheme === ThemeAuto) {
                        props.currentMappedTheme = theme;
                    }
                })}
                ${listen(ScrollToTopEvent, () => {
                    if (props.mainElement) {
                        props.mainElement.scrollTop = 0;
                    }
                })}
                ${listen(ThemeChangeEvent, (themeChangeEvent) => {
                    writeLocalStorageValue(
                        StaticLocalStorageKey.lastManuallyChosenTheme,
                        themeChangeEvent.detail,
                    );
                    props.currentSelectedTheme = themeChangeEvent.detail;
                    props.currentMappedTheme = determineTheme(props.currentSelectedTheme);
                    if (props.mainElement) {
                        setThemeOnBody(props.mainElement);
                    }
                })}
                ${listen(UpdateBrowseDataEvent, () => {
                    if (loadedUser) {
                        const loadPromise = getAllPostDataForUser(loadedUser?.nftActor);
                        props.browseData = loadPromise;
                        loadPromise.then((browseData) => {
                            // only if this promise is still the one we're waiting on
                            if (props.browseData === loadPromise) {
                                props.browseData = browseData;
                            }
                        });
                    } else {
                        props.browseData = undefined;
                    }
                })}
                ${listen(UpdateCreatorContentEvent, (updateCreatorContentEvent) => {
                    const newData = updateCreatorContentEvent.detail;
                    props.currentCreatorContentData = newData;
                })}
                ${listen(UpdateNftCountEvent, async (event) => {
                    if (loadedUser) {
                        if (props.maybeLoadedUserId && isNftUserLoaded(props.maybeLoadedUserId)) {
                            const newNftId = event.detail;
                            props.maybeLoadedUserId = {
                                ...loadedUser,
                                nftIdList: loadedUser.nftIdList.concat(newNftId),
                            };
                        }
                    }
                })}
                ${listen(StartSignInEvent, async () => {
                    props.startSignInNow = true;
                })}
                ${listen(TriggerSignOutEvent, () => {
                    removeCurrentAuth();
                    props.maybeLoadedUserId = undefined;
                    props.browseData = undefined;
                    props.currentCreatorContentData = undefined;
                })}
                ${listen(TriggerTcnftAppRouteChangeEvent, (event) => {
                    props.currentRouting = {
                        route: {
                            ...(props.currentRouting?.route || defaultRoute),
                            ...event.detail,
                        },
                    };
                })}
                ${listen(ReplaceCurrentRouteEvent, (event) => {
                    props.currentRouting = {
                        route: {
                            ...(props.currentRouting?.route || defaultRoute),
                            ...event.detail,
                        },
                        replace: true,
                    };
                })}
            >
                ${
                    isUserIdDefinedAndLoaded
                        ? html`
                            <${ModalWrapper}
                                ${assign(
                                    ModalWrapper.props.currentRoute,
                                    props.currentRouting?.route,
                                )}
                                ${assign(ModalWrapper.props.currentUser, loadedUser)}
                                ${assign(
                                    ModalWrapper.props.currentCreatorContentData,
                                    props.currentCreatorContentData,
                                )}
                                ${listen(ModalWrapper.events.modalShown, (event) => {
                                    if (event.detail) {
                                        props.showingOverlay = true;
                                    } else {
                                        props.showingOverlay = false;
                                        props.currentRouting = {
                                            route: clearAllModalsFromRoute(
                                                props.currentRouting?.route,
                                            ),
                                        };
                                    }
                                })}
                            ></${ModalWrapper}>`
                        : ''
                }
                <div class="header-wrapper">
                    <${AppHeader}
                        class=${isUserIdDefinedAndLoaded ? 'signed-in-and-loaded' : ''}
                        ${assign(AppHeader.props.currentUser, loadedUser)}
                        ${assign(AppHeader.props.currentRoute, props.currentRouting?.route)}
                        ${assign(AppHeader.props.nftCount, loadedUser?.nftIdList.length ?? 0)}
                        ${assign(AppHeader.props.showSignIn, false)}
                        ${assign(
                            // current theme is used in the theme choice menu
                            AppHeader.props.currentTheme,
                            props.currentSelectedTheme,
                        )}
                    ></${AppHeader}>
                </div>
                
                <${AboutPage}
                    class="page ${
                        props.currentRouting?.route?.paths[0] === TcnftAppTopLevelRoute.About ||
                        !isUserIdDefinedAndLoaded
                            ? ''
                            : 'hidden-page'
                    }"
                    ${assign(AboutPage.props.currentTheme, props.currentMappedTheme)}
                    ${assign(AboutPage.props.isSignedIn, loadedUser != undefined)}
                    ${assign(AboutPage.props.currentRoute, props.currentRouting?.route)}
                    ${assign(AboutPage.props.isLoadingLogin, !isUserIdLoaded)}
                    ${assign(AboutPage.props.waitingForStoic, props.startSignInNow)}
                    ${assign(AboutPage.props.userLoadFailure, props.userLoadingError)}
                ></${AboutPage}>
                
                <${HomeBrowsePage}
                    class="page ${
                        props.currentRouting?.route?.paths[0] === TcnftAppTopLevelRoute.Home &&
                        isUserIdDefinedAndLoaded
                            ? ''
                            : 'hidden-page'
                    }"
                    ${assign(HomeBrowsePage.props.currentFullRoute, props.currentRouting?.route)}
                    ${assign(
                        HomeBrowsePage.props.userBrowseData,
                        props.browseData && !isPromise(props.browseData)
                            ? props.browseData
                            : // TODO remove backup browse data here. Change it to undefined.
                              backupUserBrowseData,
                    )}
                    ${assign(HomeBrowsePage.props.currentUser, loadedUser)}
                ></${HomeBrowsePage}>
                
                ${
                    loadedUser?.isContentCreator
                        ? html`
                            <${CreatorDashboardPage}
                                class="page ${
                                    props.currentRouting?.route?.paths[0] ===
                                        TcnftAppTopLevelRoute.Creator && isUserIdDefinedAndLoaded
                                        ? ''
                                        : 'hidden-page'
                                }"
                                ${assign(CreatorDashboardPage.props.currentUser, loadedUser)}
                                ${assign(
                                    CreatorDashboardPage.props.currentCreatorContentData,
                                    props.currentCreatorContentData,
                                )}
                                ${assign(
                                    CreatorDashboardPage.props.currentRoute,
                                    props.currentRouting?.route,
                                )}
                            ></${CreatorDashboardPage}>
                        `
                        : ''
                }
            </main>
        `;
    },
});
