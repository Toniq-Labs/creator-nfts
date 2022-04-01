import {getDisplayUsername, NftUser} from '@frontend/src/data/nft-user';
import {Theme, ThemeAuto} from '@frontend/src/data/theme';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {ToniqLabsLogo} from '@frontend/src/ui/elements/design-system/creator-nfts-logo.element';
import {MenuItem} from '@frontend/src/ui/elements/design-system/menu-item.element';
import {RouteLink} from '@frontend/src/ui/elements/design-system/route-link.element';
import {UserAvatar} from '@frontend/src/ui/elements/design-system/user-avatar.element';
import {ThemeChangeEvent} from '@frontend/src/ui/global-events/theme-change.event';
import {TriggerSignOutEvent} from '@frontend/src/ui/global-events/trigger-sign-out.event';
import {emptyRoute} from '@frontend/src/ui/routes/app-router';
import {
    TcnftAppFullRoute,
    TcnftAppSearchParamKeys,
    TcnftAppTopLevelRoute,
} from '@frontend/src/ui/routes/app-routes';
import {allThemes, themeLabelMapping} from '@frontend/src/ui/styles/theme';
import {
    themeBackgroundColorVar,
    themeColorTransitions,
    themeForegroundPrimaryAccentColorVar,
} from '@frontend/src/ui/styles/theme-vars';
import {assign, css, html} from 'element-vir';
import {CoreButton} from './core-button.element';

export const AppHeader = defineCreatorNftElement({
    tagName: 'tcnft-app-header',
    props: {
        currentUser: undefined as undefined | NftUser,
        /** Used to show a check mark next to the current theme in the theme picker menu. */
        currentTheme: undefined as undefined | Theme | ThemeAuto,
        currentRoute: undefined as undefined | TcnftAppFullRoute,
        /**
         * Show the sign in button when no username is given. Currently this is only used in the
         * design system test page.
         */
        showSignIn: true,
        nftCount: 0,
        phrases: {
            changeTheme: 'Change Theme',
            creatorDashboard: 'Creator Dashboard',
            browseNfts: 'Browse your NFTs',
            mint: 'Mint',
            nftCount: (count: number) => (count > 1 ? `${count} NFTs` : `${count} NFT`),
            nftCountExplanation: (count: number) =>
                `You've minted a total of ${count > 1 ? `${count} NFTs` : `${count} NFT`}!`,
            signOut: 'Sign Out',
            signIn: 'Sign In',
            about: 'About',
            content: 'Creator Posts',
        },
    },
    styles: css`
        :host {
            display: block;
            background-color: ${themeBackgroundColorVar};
            border-bottom: 2px solid ${themeForegroundPrimaryAccentColorVar};
            /* Default height since this element will likely look the same in nearly all contexts */
            height: 64px;
            /* improve performance on sticky positioned elements with will-change: transform */
            will-change: transform;
            box-sizing: border-box;
            ${themeColorTransitions}
        }

        header {
            display: flex;
            height: 100%;
            width: 100%;
            align-items: center;
            padding: 0 16px;
            gap: 16px;
            box-sizing: border-box;
            justify-content: space-between;
        }

        ${ToniqLabsLogo} {
            height: 40px;
            max-width: 100%;
        }

        header section {
            display: flex;
            align-items: center;
            flex-grow: 1;
            flex-basis: 50%;
            gap: 16px;
        }

        header section:last-of-type {
            justify-content: flex-end;
        }

        header section.middle {
            flex-grow: unset;
            flex-basis: auto;
            white-space: nowrap;
        }

        ${RouteLink} {
            flex-shrink: 0;
        }

        .tcnft-menu-item-sub-item + :not(.tcnft-menu-item-sub-item) tcnft-menu-item,
        .tcnft-menu-item-sub-item + :not(.tcnft-menu-item-sub-item) {
            border-top-width: 2px;
        }

        @media (max-width: 680px) {
            section.middle {
                display: none;
            }
        }

        @media (max-width: 480px) {
            .nft-count {
                display: none;
            }
        }

        @media (max-width: 380px) {
            .logo {
                display: none;
            }
        }
    `,
    renderCallback: ({props, genericDispatch}) => {
        const shouldShowTitle = props.currentRoute?.paths[0] === TcnftAppTopLevelRoute.Creator;

        return html`
            <header>
                <section class="logo">
                    <${RouteLink}
                        class="logo-link"
                        ${assign(RouteLink.props.routeLink, {
                            ...emptyRoute,
                            paths: [TcnftAppTopLevelRoute.Home],
                        })}
                        ${assign(RouteLink.props.isAnchorFocusable, true)}
                    >
                        <${ToniqLabsLogo}
                            ${assign(ToniqLabsLogo.props.smallLogo, true)}
                        ></${ToniqLabsLogo}>
                    </${RouteLink}>
                </section>
                ${
                    shouldShowTitle
                        ? html`
                              <section class="middle">${props.phrases.creatorDashboard}</section>
                          `
                        : ''
                }
                <section style=${props.currentUser ? '' : 'display: none;'}>
                    <${RouteLink}
                        class="nft-count"
                        ?hidden=${!props.nftCount}
                        ${assign(RouteLink.props.routeLink, {
                            search: {[TcnftAppSearchParamKeys.BrowseNftPage]: '1'},
                        })}
                    >
                        <${CoreButton}
                            class="tcnft-core-button-text-button nft-count-button"
                            title=${props.phrases.nftCountExplanation(props.nftCount)}
                            ${assign(
                                CoreButton.props.label,
                                props.phrases.nftCount(props.nftCount),
                            )}
                        ></${CoreButton}>
                    </${RouteLink}>
                    <${RouteLink}
                        class="logo-link"
                        ${assign(RouteLink.props.routeLink, {
                            search: {[TcnftAppSearchParamKeys.Mint]: '1'},
                        })}
                    >
                        <${CoreButton}
                            class="tcnft-core-button-accept-theme ${
                                props.nftCount <= 0 ? 'tcnft-core-button-jiggle' : ''
                            }"
                            ${assign(CoreButton.props.label, props.phrases.mint)}
                        ></${CoreButton}>
                    </${RouteLink}>
                    <${UserAvatar}
                        ${assign(UserAvatar.props.username, getDisplayUsername(props.currentUser))}
                        ${assign(UserAvatar.props.menuEnabled, true)}
                    >
                        <${RouteLink}
                            class="tcnft-route-link-no-underline"
                            ${assign(RouteLink.props.routeLink, {
                                search: {[TcnftAppSearchParamKeys.BrowseNftPage]: '1'},
                            })}
                        >
                            <${MenuItem}
                                ${assign(MenuItem.props.label, props.phrases.browseNfts)}
                            ></${MenuItem}>
                        </${RouteLink}>
                        
                        <${RouteLink}
                            class="tcnft-route-link-no-underline"
                            ${assign(RouteLink.props.routeLink, {
                                paths: [TcnftAppTopLevelRoute.Home],
                            })}
                        >
                            <${MenuItem}
                                ${assign(MenuItem.props.label, props.phrases.content)}
                            ></${MenuItem}>
                        </${RouteLink}>
                        ${
                            props.currentUser?.isContentCreator
                                ? html`
                                    <${RouteLink}
                                        class="tcnft-route-link-no-underline"
                                        ${assign(RouteLink.props.routeLink, {
                                            paths: [TcnftAppTopLevelRoute.Creator],
                                        })}
                                    >
                                        <${MenuItem}
                                            ${assign(
                                                MenuItem.props.label,
                                                props.phrases.creatorDashboard,
                                            )}
                                        ></${MenuItem}>
                                    </${RouteLink}>
                                `
                                : ''
                        }
                        <${MenuItem}
                            class="tcnft-menu-item-header"
                            ${assign(MenuItem.props.label, props.phrases.changeTheme)}
                            ${assign(MenuItem.props.keepMenuOpen, true)}
                        ></${MenuItem}>
                        ${[
                            ThemeAuto,
                            ...allThemes,
                        ].map((themeKey) => {
                            const themeLabel = themeLabelMapping[themeKey];
                            return html`
                                <${MenuItem}
                                    class="tcnft-menu-item-sub-item"
                                    ${assign(MenuItem.props.label, themeLabel)}
                                    ${assign(
                                        MenuItem.props.checked,
                                        props.currentTheme === themeKey,
                                    )}
                                    @click=${(event: MouseEvent) => {
                                        event.stopPropagation();
                                        genericDispatch(new ThemeChangeEvent(themeKey));
                                    }}
                                ></${MenuItem}>`;
                        })}
                        <${RouteLink}
                            class="tcnft-route-link-no-underline"
                            ${assign(RouteLink.props.routeLink, {
                                paths: [TcnftAppTopLevelRoute.About],
                            })}
                        >
                            <${MenuItem}
                                ${assign(MenuItem.props.label, props.phrases.about)}
                            ></${MenuItem}>
                        </${RouteLink}>
                        <${MenuItem}
                            ${assign(MenuItem.props.label, props.phrases.signOut)}
                            @click=${() => {
                                genericDispatch(new TriggerSignOutEvent());
                            }}
                        ></${MenuItem}>
                    </${UserAvatar}>
                </section>
            </header>
        `;
    },
});
