import {createNewAuth} from '@frontend/src/auth/create-new-auth';
import {removeCurrentAuth} from '@frontend/src/auth/remove-current-auth';
import {getUserNftIds} from '@frontend/src/canisters/nft-canister';
import {
    getDisplayUsername,
    isNftUserLoaded,
    MaybeNotLoadedUserId,
    NftUser,
    NftUserWithNftList,
    UnloadedUserId,
} from '@frontend/src/data/nft-user';
import {Theme, ThemeAuto} from '@frontend/src/data/theme';
import {writeLocalStorageValue} from '@frontend/src/local-storage/local-storage';
import {LocalStorageKey} from '@frontend/src/local-storage/local-storage-keys';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {onOsThemeChange} from '@frontend/src/ui/directives/on-os-theme-change';
import {AppHeader} from '@frontend/src/ui/elements/design-system/app-header.element';
import {AuthLoader} from '@frontend/src/ui/elements/loading/auth-loader.element';
import {LoadingIndicator} from '@frontend/src/ui/elements/loading/loading-indicator.element';
import {RootLoader} from '@frontend/src/ui/elements/loading/root-loader.element';
import {ModalWrapper} from '@frontend/src/ui/elements/modals/modal-wrapper.element';
import {AboutPage} from '@frontend/src/ui/elements/pages/about.page.element';
import {HomeBrowsePage} from '@frontend/src/ui/elements/pages/home-browse/home-browse.page.element';
import {TcnftAppNav} from '@frontend/src/ui/elements/tcnft-app-nav.element';
import {StartMintingEvent} from '@frontend/src/ui/global-events/start-minting';
import {StartSignInEvent} from '@frontend/src/ui/global-events/start-sign-in';
import {ThemeChangeEvent} from '@frontend/src/ui/global-events/theme-change';
import {TriggerSignOutEvent} from '@frontend/src/ui/global-events/trigger-sign-out';
import {
    ReplaceCurrentRouteEvent,
    TriggerTcnftAppRouteChangeEvent,
} from '@frontend/src/ui/global-events/trigger-tcnft-app-route-change';
import {UpdateNftCountEvent} from '@frontend/src/ui/global-events/update-nft-count';
import {
    defaultLoggedInHaveNftsRoute,
    defaultLoggedInNoNftsRoute,
    defaultNotLoggedInRoute,
    emptyRoute,
} from '@frontend/src/ui/routes/app-router';
import {
    TcnftAppFullRoute,
    TcnftAppSearchParamKeys,
    TcnftAppTopLevelRoute,
} from '@frontend/src/ui/routes/app-routes';
import {clearAllModalsFromRoute} from '@frontend/src/ui/routes/modal-logic';
import {rootElementDefaultStyles} from '@frontend/src/ui/styles/root-element-styles';
import {determineTheme, getLastUsedTheme, setThemeOnBody} from '@frontend/src/ui/styles/theme';
import {appLoadingZ} from '@frontend/src/ui/styles/z-index';
import {assign, css, html, listen, onDomCreated} from 'element-vir';
import {areRoutesEqual} from 'spa-router-vir';
import {headerZ} from '../styles/z-index';

async function addNftIdListToNftUser(nftUser: NftUser): Promise<NftUserWithNftList> {
    return {
        ...nftUser,
        nftIdList: await getUserNftIds(nftUser.nftActor, nftUser.principal),
    };
}

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
        maybeLoadedUserId: UnloadedUserId as MaybeNotLoadedUserId<NftUserWithNftList> | undefined,
        currentRouting: undefined as
            | {route: TcnftAppFullRoute | undefined; replace?: boolean}
            | undefined,
        showingOverlay: false,
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
            z-index: ${headerZ};
        }

        ${LoadingIndicator} {
            position: fixed;
            height: 100vh;
            width: 100vw;
            z-index: ${appLoadingZ};
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

        const loadedUser: NftUserWithNftList | undefined = isNftUserLoaded(props.maybeLoadedUserId)
            ? props.maybeLoadedUserId
            : undefined;

        return html`
            <${AuthLoader}
                ${listen(AuthLoader.events.userIdLoaded, async (loadedUserId) => {
                    if (loadedUserId.detail) {
                        props.maybeLoadedUserId = await addNftIdListToNftUser(loadedUserId.detail);
                    } else {
                        props.maybeLoadedUserId = undefined;
                    }
                })}>
            </${AuthLoader}>
            <${RootLoader}
                ${assign(RootLoader.props.root, host)}
                ${assign(RootLoader.props.externalLoaded, isUserIdLoaded)}
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
                ${listen(ThemeChangeEvent, (themeChangeEvent) => {
                    writeLocalStorageValue(
                        LocalStorageKey.lastManuallyChosenTheme,
                        themeChangeEvent.detail,
                    );
                    props.currentSelectedTheme = themeChangeEvent.detail;
                    props.currentMappedTheme = determineTheme(props.currentSelectedTheme);
                    if (props.mainElement) {
                        setThemeOnBody(props.mainElement);
                    }
                })}
                ${listen(UpdateNftCountEvent, async () => {
                    if (loadedUser) {
                        if (props.maybeLoadedUserId && isNftUserLoaded(props.maybeLoadedUserId)) {
                            props.maybeLoadedUserId = await addNftIdListToNftUser(loadedUser);
                        }
                    }
                })}
                ${listen(StartMintingEvent, () => {
                    props.currentRouting = {
                        route: {
                            ...(props.currentRouting?.route || defaultRoute),
                            // anything can be the value here as long as its truthy, so 1 works fine
                            search: {[TcnftAppSearchParamKeys.Mint]: '1'},
                        },
                    };
                })}
                ${listen(StartSignInEvent, async () => {
                    try {
                        const newAuth = await createNewAuth();
                        props.maybeLoadedUserId = await addNftIdListToNftUser(newAuth);
                        const newRoute = props.maybeLoadedUserId.nftIdList.length
                            ? defaultLoggedInHaveNftsRoute
                            : defaultLoggedInNoNftsRoute;
                        props.currentRouting = {
                            route: {
                                ...currentRouteWithFallback,
                                ...newRoute,
                            },
                            replace: true,
                        };
                    } catch (error) {
                        console.error('failed to login to stoic wallet');
                        console.error(error);
                    }
                })}
                ${listen(TriggerSignOutEvent, () => {
                    removeCurrentAuth();
                    props.maybeLoadedUserId = undefined;
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
                            ${assign(ModalWrapper.props.currentRoute, props.currentRouting?.route)}
                            ${assign(ModalWrapper.props.currentUser, loadedUser)}
                            ${listen(ModalWrapper.events.modalShown, (event) => {
                                if (event.detail) {
                                    props.showingOverlay = true;
                                } else {
                                    props.showingOverlay = false;
                                    props.currentRouting = {
                                        route: clearAllModalsFromRoute(props.currentRouting?.route),
                                    };
                                }
                            })}
                        ></${ModalWrapper}>`
                    : ''
            }
                <${LoadingIndicator}
                    ${assign(LoadingIndicator.props.isLoading, !isUserIdLoaded)}
                    ${assign(LoadingIndicator.props.withLabel, true)}
                ></${LoadingIndicator}>
                <div class="header-wrapper">
                    <${AppHeader}
                        class=${isUserIdDefinedAndLoaded ? 'signed-in-and-loaded' : ''}
                        ${assign(AppHeader.props.username, getDisplayUsername(loadedUser))}
                        ${assign(AppHeader.props.currentRoute, props.currentRouting?.route)}
                        ${assign(
                            AppHeader.props.mintButtonAttention,
                            /**
                             * When the user hasn't minted anything yet, bring extra attention to
                             * the mint button
                             */
                            loadedUser && !loadedUser.nftIdList.length,
                        )}
                        ${assign(
                            // current theme is used in the theme choice menu
                            AppHeader.props.currentTheme,
                            props.currentSelectedTheme,
                        )}
                    ></${AppHeader}>
                </div>${
                    props.currentRouting?.route?.paths[0] === TcnftAppTopLevelRoute.Home
                        ? html`
                            <${HomeBrowsePage}
                                class="page"
                                ${assign(
                                    HomeBrowsePage.props.currentFullRoute,
                                    props.currentRouting.route,
                                )}
                                ${assign(HomeBrowsePage.props.currentUser, loadedUser)}
                            ></${HomeBrowsePage}>`
                        : props.currentRouting?.route?.paths[0] === TcnftAppTopLevelRoute.About
                        ? /**
                           * Only load the about page when it's explicitly requested (don't load it in the background) to
                           * prevent unnecessary pings to twitter on every single page load.
                           */
                          html`
                            <${AboutPage}
                                class="page"
                                ${assign(AboutPage.props.currentTheme, props.currentMappedTheme)}
                                ${assign(AboutPage.props.isSignedIn, loadedUser != undefined)}
                                ${assign(AboutPage.props.currentRoute, props.currentRouting.route)}
                            ></${AboutPage}>`
                        : ''
                }
            </main>
        `;
    },
});
