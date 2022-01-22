import {Theme, ThemeAuto} from '@frontend/src/data/theme';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {ToniqLabsLogo} from '@frontend/src/ui/elements/design-system/creator-nfts-logo.element';
import {MenuItem} from '@frontend/src/ui/elements/design-system/menu-item.element';
import {RouteLink} from '@frontend/src/ui/elements/design-system/route-link.element';
import {UserAvatar} from '@frontend/src/ui/elements/design-system/user-avatar.element';
import {StartMintingEvent} from '@frontend/src/ui/global-events/start-minting';
import {StartSignInEvent} from '@frontend/src/ui/global-events/start-sign-in';
import {ThemeChangeEvent} from '@frontend/src/ui/global-events/theme-change';
import {TriggerSignOutEvent} from '@frontend/src/ui/global-events/trigger-sign-out';
import {TriggerTcnftAppRouteChangeEvent} from '@frontend/src/ui/global-events/trigger-tcnft-app-route-change';
import {emptyRoute} from '@frontend/src/ui/routes/app-router';
import {
    TcnftAppFullRoute,
    TcnftAppSearchParamKeys,
    TcnftAppTopLevelRoute,
} from '@frontend/src/ui/routes/app-routes';
import {allThemes} from '@frontend/src/ui/styles/theme';
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
        username: '',
        /** Used to show a check mark next to the current theme in the theme picker menu. */
        currentTheme: undefined as undefined | Theme | ThemeAuto,
        currentRoute: undefined as undefined | TcnftAppFullRoute,
        mintButtonAttention: false,
        phrases: {
            changeTheme: 'Change Theme',
            browseNfts: 'Browse NFTs',
            mint: 'Mint',
            signOut: 'Sign Out',
            signIn: 'Sign In',
            about: 'About',
            content: 'Content',
            themeLabel: {
                [Theme.light]: 'Light',
                [Theme.dark]: 'Dark',
                [ThemeAuto]: 'Auto',
            } as Record<Theme | ThemeAuto, string>,
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
            gap: 16px;
        }

        .tcnft-menu-item-sub-item + :not(.tcnft-menu-item-sub-item) {
            border-top-width: 2px;
        }

        @media (max-width: 250px) {
            header {
                flex-direction: column;
                padding: 16px;
            }
            :host {
                height: unset;
            }
        }
    `,
    renderCallback: ({props, genericDispatch}) => {
        return html`
            <header>
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
                <section style=${props.username ? '' : 'display: none;'}>
                    <${CoreButton}
                        class="tcnft-core-button-accept-theme ${
                            props.mintButtonAttention ? 'tcnft-core-button-jiggle' : ''
                        }"
                        ${assign(CoreButton.props.label, props.phrases.mint)}
                        @click=${() => {
                            genericDispatch(new StartMintingEvent());
                        }}
                    ></${CoreButton}>
                    <${UserAvatar}
                        ${assign(UserAvatar.props.username, props.username)}
                        ${assign(UserAvatar.props.menuEnabled, true)}
                    >
                        <${MenuItem}
                            ${assign(MenuItem.props.label, props.phrases.browseNfts)}
                            @click=${() => {
                                genericDispatch(
                                    new TriggerTcnftAppRouteChangeEvent({
                                        search: {[TcnftAppSearchParamKeys.BrowseNftPage]: '1'},
                                    }),
                                );
                            }}
                        ></${MenuItem}>
                        ${
                            props.currentRoute?.paths[0] === TcnftAppTopLevelRoute.About
                                ? html`
                                    <${MenuItem}
                                        ${assign(MenuItem.props.label, props.phrases.content)}
                                        @click=${() => {
                                            genericDispatch(
                                                new TriggerTcnftAppRouteChangeEvent({
                                                    paths: [TcnftAppTopLevelRoute.Home],
                                                }),
                                            );
                                        }}
                                    ></${MenuItem}>
                                `
                                : html`
                                    <${MenuItem}
                                        ${assign(MenuItem.props.label, props.phrases.about)}
                                        @click=${() => {
                                            genericDispatch(
                                                new TriggerTcnftAppRouteChangeEvent({
                                                    paths: [TcnftAppTopLevelRoute.About],
                                                }),
                                            );
                                        }}
                                    ></${MenuItem}>
                                `
                        }
                        <${MenuItem}
                            class="tcnft-menu-item-header"
                            ${assign(MenuItem.props.label, props.phrases.changeTheme)}
                            ${assign(MenuItem.props.keepMenuOpen, true)}
                        ></${MenuItem}>
                        ${[ThemeAuto, ...allThemes].map((themeKey) => {
                            const themeLabel = props.phrases.themeLabel[themeKey];
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
                        <${MenuItem}
                            ${assign(MenuItem.props.label, props.phrases.signOut)}
                            @click=${() => {
                                genericDispatch(new TriggerSignOutEvent());
                            }}
                        ></${MenuItem}>
                    </${UserAvatar}>
                </section>
                <section style=${props.username ? 'display: none;' : ''}>
                    <${CoreButton}
                        class="tcnft-core-button-accept-theme"
                        ${assign(CoreButton.props.label, props.phrases.signIn)}
                        @click=${(event: MouseEvent) => {
                            event.stopPropagation();
                            genericDispatch(new StartSignInEvent());
                        }}
                    ></${CoreButton}>
                </section>
            </header>
        `;
    },
});
