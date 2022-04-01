import {Theme} from '@frontend/src/data/theme';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {ToniqLabsLogo} from '@frontend/src/ui/elements/design-system/creator-nfts-logo.element';
import {RouteLink} from '@frontend/src/ui/elements/design-system/route-link.element';
import {LoadingIndicator} from '@frontend/src/ui/elements/loading/loading-indicator.element';
import {StartSignInEvent} from '@frontend/src/ui/global-events/start-sign-in.event';
import {emptyRoute} from '@frontend/src/ui/routes/app-router';
import {TcnftAppFullRoute, TcnftAppTopLevelRoute} from '@frontend/src/ui/routes/app-routes';
import {foregroundColorNameByTheme} from '@frontend/src/ui/styles/theme';
import {getObjectTypedKeys} from 'augment-vir';
import {assign, css, html, onDomCreated} from 'element-vir';
import {monospaceFontVar, themeErrorColorVar} from '../../styles/theme-vars';
import {CoreButton} from '../design-system/core-button.element';

const twitterThemeMap: Record<Theme, string> = {
    [Theme.dark]: 'dark',
    [Theme.light]: 'light',
};
const twitterThemes = Object.values(twitterThemeMap);

export const AboutPage = defineCreatorNftElement({
    tagName: 'tcnft-about-page',
    props: {
        currentTheme: Theme.dark as Theme,
        currentRoute: undefined as TcnftAppFullRoute | undefined,
        twitterThemeToTcnftTextColor: undefined as Record<string, string> | undefined,
        phrases: {
            contentHelp:
                "Once you've minted at least 1 NFT, your default home page here will be the creator posts, which you can skip to right now using the button below:",
            loading: 'Connecting to Stoic Wallet...',
            authLoadingError: 'Failed to connect to Stoic Wallet. Try signing in again.',
            mintHelp: 'Click on the green "Mint" button in the top-right to mint an NFT!',
            signIn: 'Sign In',
            skipToContent: 'Skip to Creator Posts',
            waitingForStoic: 'Waiting for Stoic Wallet authorization...',
            stoicRejected: 'Stoic Wallet authorization was rejected.',
        },
        isSignedIn: false,
        waitingForStoic: false,
        isLoadingLogin: true,
        userLoadFailure: '',
    },
    styles: css`
        :host {
            display: flex;
            justify-content: center;
        }

        article {
            flex-grow: 1;
            flex-shrink: 1;
            max-width: min(100%, 1000px);
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            gap: 64px;
        }
        
        article > * {
            max-width: 100%;
        }

        ${ToniqLabsLogo} {
            max-width: 100px;
        }

        iframe {
            border: none;
            height: 100%;
            width: 100%;
        }

        ${CoreButton}.sign-in-button {
            font-size: 2em;
        }
        
        .logged-in-content {
            width: 600px;
            max-width: 100%;
            text-align: center;
            margin-top: 3em;
            padding: 0 1em;
            box-sizing: border-box;
        }
        
        ${RouteLink} {
            outline: none;
            flex-shrink: 0;
        }
        
        ${RouteLink} ${CoreButton} {
            text-decoration: underline;
        }

        .tweet-wrapper {
            max-width: 100%;
            position: relative;
            width: 550px;
            height: 550px;
        }

        .tweet-wrapper iframe {
            position: absolute;
            top: 0;
            left: 0;
        }

        .hidden {
            display: none;
        }

        blockquote {
            color: blue;
        }

        .sign-in-explanation {
            font-size: 0.8em;
            margin: 0;
            padding: 0;
            text-align: center;
            font-family ${monospaceFontVar};
        }
        
        ${LoadingIndicator} {
            position: relative;
        }
        
        .error {
            color: ${themeErrorColorVar};
            font-weight: bold;
        }
        
        .stoic-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    `,
    renderCallback: ({props, genericDispatch}) => {
        const currentTwitterTheme = twitterThemeMap[props.currentTheme];

        function setThemeColors(element: Element) {
            /**
             * We need to grab the text colors for each theme so we can explicitly set the color on
             * the iframe placeholder so users can read the text even if Twitter is being slow.
             */
            if (!props.twitterThemeToTcnftTextColor) {
                const missingThemeErrorMessage = "Theme color CSS var isn't set yet.";
                const calculatedStyles = window.getComputedStyle(element);
                try {
                    const textColorByTheme = getObjectTypedKeys(twitterThemeMap).reduce(
                        (accum, themeKey) => {
                            const themeColor = calculatedStyles.getPropertyValue(
                                foregroundColorNameByTheme[themeKey],
                            );
                            if (!themeColor) {
                                throw new Error(missingThemeErrorMessage);
                            }
                            accum[twitterThemeMap[themeKey]] = themeColor;
                            return accum;
                        },
                        {} as Record<string, string>,
                    );
                    props.twitterThemeToTcnftTextColor = textColorByTheme;
                } catch (error) {
                    if (error instanceof Error && error.message === missingThemeErrorMessage) {
                        // try again
                        setTimeout(() => {
                            setThemeColors(element);
                        }, 100);
                    } else {
                        throw error;
                    }
                }
            }
        }

        const stoicRejected = props.userLoadFailure.toLowerCase().includes('rejected');
        const isLoading = props.isLoadingLogin && !props.userLoadFailure;

        return html`
            <article
                ${onDomCreated((element) => {
                    setThemeColors(element);
                })}
            >
                ${props.isSignedIn
                    ? html`
                        <section class="logged-in-content">
                            <p>
                                ${props.phrases.mintHelp}
                                <br>
                                <br>
                                ${props.phrases.contentHelp}
                            </p>
                            <${RouteLink}
                                ${assign(RouteLink.props.routeLink, {
                                    ...(props.currentRoute ?? emptyRoute),
                                    paths: [TcnftAppTopLevelRoute.Home],
                                })}
                            >
                                <${CoreButton}
                                    class="tcnft-core-button-text-button"
                                    ${assign(CoreButton.props.label, props.phrases.skipToContent)}
                                ></${CoreButton}>
                            </${RouteLink}>
                        </section>
                    `
                    : html`
                        <${ToniqLabsLogo}></${ToniqLabsLogo}>
                        <div class="stoic-wrapper">
                            ${
                                isLoading || props.waitingForStoic
                                    ? html`
                                        <${LoadingIndicator}
                                            ${assign(LoadingIndicator.props.isLoading, true)}
                                            ${assign(
                                                LoadingIndicator.props.label,
                                                props.waitingForStoic
                                                    ? props.phrases.waitingForStoic
                                                    : props.phrases.loading,
                                            )}
                                        ></${LoadingIndicator}>
                                    `
                                    : html`
                                        <p class="error ${props.userLoadFailure ? '' : 'hidden'}">
                                            ${
                                                stoicRejected
                                                    ? props.phrases.stoicRejected
                                                    : props.phrases.authLoadingError
                                            }
                                        </p>
                                        <${CoreButton}
                                            class="
                                                tcnft-core-button-accept-theme
                                                tcnft-core-button-shine
                                                sign-in-button
                                            "
                                            ${assign(CoreButton.props.label, props.phrases.signIn)}
                                            @click=${() => {
                                                genericDispatch(new StartSignInEvent());
                                            }}
                                        ></${CoreButton}>
                                        <p class="sign-in-explanation">
                                            Using Stoic Wallet
                                        </p>
                                    `
                            }
                        </div>
                    `}
                <div class="tweet-wrapper ${isLoading ? 'hidden' : ''}">
                    ${twitterThemes.map(
                        (twitterTheme) => html`
                            <iframe
                                class=${currentTwitterTheme === twitterTheme ? '' : 'hidden'}
                                width="550"
                                height="500"
                                data-tweet-url="https://twitter.com/BobBodily/status/1434375036018720771"
                                srcdoc="
                                    <blockquote
                                        style='color: ${props.twitterThemeToTcnftTextColor?.[
                                    twitterTheme
                                ]};'
                                        data-dnt='true'
                                        data-theme='${twitterTheme}'
                                        style='border: none'
                                        class='twitter-tweet'
                                    >
                                        <p
                                            lang='en'
                                            dir='ltr'
                                        >
                                            NFTs on the Internet Computer are going to be huge.
                                            Core benefits for IC NFTs over other chains:
                                            <br>
                                            1. All assets on chain
                                            <br>
                                            2. No gas fees to mint/transact
                                            <br>
                                            3. Cheap storage costs ($5/GB/year)
                                            <br>
                                            <br>
                                            This lets us do all sorts of crazy things with NFTs.
                                            Here comes a mega-thread 💥
                                            <br>
                                            <br>
                                            👇👇👇
                                        </p>
                                        &amp;mdash; Bob Bodily, PhD 👋 (@BobBodily)
                                        <a
                                            href='https://twitter.com/BobBodily/status/1434375036018720771?ref_src=twsrc%5Etfw'
                                        >
                                            September 5, 2021
                                        </a>
                                    </blockquote>
                                    <script
                                        async
                                        src='https://platform.twitter.com/widgets.js'
                                        charset='utf-8'
                                    ></script>
                                "
                            ></iframe>
                        `,
                    )}
                </div>
            </article>
        `;
    },
});
