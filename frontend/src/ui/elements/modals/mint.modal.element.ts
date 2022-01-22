import {e8sToIcp} from '@frontend/src/augments/number';
import {standardizeUrl} from '@frontend/src/augments/string';
import {enableNavigation, preventNavigation} from '@frontend/src/augments/window';
import {getMintPrice, mintNft} from '@frontend/src/canisters/nft-canister';
import {allFlairKeys, FlairKey, getFlairLabelAndUrl} from '@frontend/src/data/flair-images';
import {NftUser} from '@frontend/src/data/nft-user';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {CoreInput} from '@frontend/src/ui/elements/design-system/core-input.element';
import {LoadingIndicator} from '@frontend/src/ui/elements/loading/loading-indicator.element';
import {CloseModalsEvent} from '@frontend/src/ui/global-events/close-modals';
import {UpdateNftCountEvent} from '@frontend/src/ui/global-events/update-nft-count';
import {TcnftAppFullRoute, TcnftAppSearchParamKeys} from '@frontend/src/ui/routes/app-routes';
import {
    themeEffectTransitionTimeVar,
    themeErrorColorVar,
    themeForegroundLightAccentColorVar,
    themeForegroundPrimaryAccentColorVar,
} from '@frontend/src/ui/styles/theme-vars';
import {isEnumValue} from 'augment-vir/dist/web-index';
import {ApprovedPrice} from 'dfx-link/local/canisters/nft/nft.did';
import {assign, css, html, listen} from 'element-vir';
import {
    monospaceFontVar,
    overlayActiveOpacityVar,
    themeForegroundDimColorVar,
} from '../../styles/theme-vars';
import {CoreButton} from '../design-system/core-button.element';

export const MintModal = defineCreatorNftElement({
    tagName: 'tcnft-mint-modal',
    props: {
        currentRoute: undefined as TcnftAppFullRoute | undefined,
        triedToUseRouteParamsAlready: false,
        inputUrl: undefined as string | undefined,
        standardizedUrl: undefined as string | undefined,
        urlError: false,
        inputDescription: undefined as string | undefined,
        phrases: {
            flair: 'NFT Flair',
            mintUrl: 'Mint URL:',
            nftDescription: 'Content Snippet',
            nftFlair: 'Content Flair',
            nftUrl: 'Content URL',
            noPrice: 'N/A',
            preview: 'Get Price',
            price: 'Price',
            priceNoMatchUrl: 'Preview price no longer matches current URL.',
            purchase: 'Purchase',
            urlError: 'Invalid URL',
            mintingFailed(message: string) {
                return `Minting failed: ${message}`;
            },
            priceWithCurrency(input: number) {
                return `${input} ICP`;
            },
        } as const,
        maxDescriptionLength: 300,
        maxUrlLength: 2000,
        priceError: undefined as string | undefined,
        approvedMintPrice: undefined as
            | undefined
            | {url: string; approvedPrice: ApprovedPrice; displayPrice: number},
        approvedMintPricePromise: undefined as
            | undefined
            | {url: string; approvedPrice: Promise<ApprovedPrice>},
        mintingPromise: undefined as undefined | Promise<number>,
        mintingError: undefined as string | undefined,
        flairKeys: allFlairKeys,
        selectedFlair: 'none' as FlairKey,
        triggerFocus: false,
        currentUser: undefined as NftUser | undefined,
    },
    styles: css`
        form {
            display: flex;
            gap: 8px;
            flex-direction: column;
        }

        ${CoreInput} {
            width: 100%;
            max-width: 100%;
        }

        .description-input {
            height: 160px;
        }

        .sub-input-label {
            font-family: ${monospaceFontVar};
            opacity: 0;
            word-break: break-all;
            width: 100%;
            box-sizing: border-box;
            flex-shrink: 0;
            margin-bottom: 8px;
            padding-left: 4px;
            transition: ${themeEffectTransitionTimeVar};
            color: ${themeForegroundDimColorVar};

            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .warning-label {
            color: ${themeErrorColorVar};
            font-weight: bold;
            word-break: break-all;
            flex-shrink: 1;
            max-width: 30em;
            width: 100%;
            opacity: 0;
            font-family: ${monospaceFontVar};
        }

        .price-warning {
            transition: ${themeEffectTransitionTimeVar};
            opacity: 0;
        }

        .price-number {
            font-family: ${monospaceFontVar};
            gap: 8px;
            position: relative;
        }

        .price-number ${LoadingIndicator} {
            justify-content: flex-end;
            right: 0;
            bottom: 0;
            height: unset;
            width: unset;
        }

        p {
            margin: 0;
            padding: 0;
            text-align: right;
        }

        .show {
            opacity: 1;
        }

        section {
            display: flex;
            flex-direction: column;
        }

        section.preview {
            text-align: right;
            margin-top: 16px;
            justify-content: flex-end;
        }

        .preview .warning-label {
            align-self: flex-end;
        }

        .preview-price-numbers {
            display: flex;
            flex-direction: column;
        }

        .preview-price-numbers > * {
            flex-shrink: 0;
        }

        section.purchase {
            flex-direction: row;
            justify-content: flex-end;
            align-items: center;
            gap: 16px;
        }

        .purchase ${LoadingIndicator} {
            justify-content: flex-end;
            align-self: stretch;
        }

        .purchase-info {
            align-self: stretch;
            position: relative;
            flex-grow: 1;
            justify-content: flex-end;
            display: flex;
        }

        .purchase-info .warning-label {
            display: inline-flex;
            justify-content: flex-end;
            align-items: center;
        }

        ${CoreButton} {
            align-self: flex-end;
        }
        .tcnft-core-button-not-clickable {
            opacity: ${overlayActiveOpacityVar};
        }

        .flair-selector {
            cursor: pointer;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            border: 2px solid transparent;
            border-radius: 8px;
            align-items: center;
            padding: 4px;
            width: min-content;
        }

        .flair-selector > img,
        .flair-selector > div.empty-flair {
            width: 100px;
            height: 100px;
        }

        .flair-selector.selected {
            background-color: ${themeForegroundLightAccentColorVar};
            border-color: ${themeForegroundPrimaryAccentColorVar};
        }

        .flair-options {
            flex-wrap: wrap;
            justify-content: center;
            align-content: flex-start;
            align-items: stretch;
            display: flex;
            margin-top: 2px;
            margin-bottom: calc(1em + 8px);
        }
    `,
    renderCallback: ({props, genericDispatch}) => {
        async function previewNftMinting(urlToMint: string) {
            if (!props.currentUser) {
                throw new Error(`Can't view minting price, not logged in.`);
            }

            if (
                (!props.approvedMintPricePromise ||
                    props.approvedMintPricePromise.url !== urlToMint) &&
                urlToMint
            ) {
                const approvedPricePromise = getMintPrice(
                    props.currentUser.nftActor,
                    standardizeUrl(urlToMint),
                );
                props.approvedMintPricePromise = {
                    url: urlToMint,
                    approvedPrice: approvedPricePromise,
                };
                props.priceError = undefined;
                try {
                    const approvedPrice = await props.approvedMintPricePromise.approvedPrice;
                    const displayPrice = e8sToIcp(approvedPrice.amount.e8s);
                    props.approvedMintPrice = {url: urlToMint, approvedPrice, displayPrice};
                } catch (error: any) {
                    const errorMessage = 'message' in error ? error.message : String(error);
                    console.error(`Failed to load price for minting ${urlToMint}`, errorMessage);
                    props.priceError = errorMessage;
                } finally {
                    props.approvedMintPricePromise = undefined;
                }
            }
        }

        if (!props.triedToUseRouteParamsAlready) {
            const routeMintFlair = props.currentRoute?.search?.[TcnftAppSearchParamKeys.MintFlair];
            if (routeMintFlair && isEnumValue(routeMintFlair, FlairKey)) {
                props.selectedFlair = routeMintFlair;
                props.triedToUseRouteParamsAlready = true;
            }
            const routeMintUrl = props.currentRoute?.search?.[TcnftAppSearchParamKeys.MintUrl];
            if (routeMintUrl) {
                props.inputUrl = routeMintUrl;
                previewNftMinting(props.inputUrl);
                props.triedToUseRouteParamsAlready = true;
            }
        }

        const showDescriptionLength: boolean =
            (props.inputDescription?.length || 0) >= props.maxDescriptionLength * 0.75;
        const showDescriptionLengthWarning: boolean =
            (props.inputDescription?.length || 0) >
            props.maxDescriptionLength - Math.min(10, props.maxDescriptionLength * 0.1);
        const priceMatchesCurrentUrl: boolean =
            !!props.inputUrl &&
            !!props.approvedMintPrice &&
            props.approvedMintPrice.url === props.inputUrl;

        const isPriceLoading: boolean = !!props.approvedMintPricePromise;
        const showPriceWarning: boolean =
            (!priceMatchesCurrentUrl && !!props.approvedMintPrice) || !!props.priceError;

        const canClickMint: boolean =
            !props.mintingPromise && priceMatchesCurrentUrl && !props.urlError;
        const canClickPreview: boolean =
            !props.urlError &&
            !!props.inputUrl &&
            !priceMatchesCurrentUrl &&
            (!props.approvedMintPricePromise ||
                !!(props.inputUrl && props.approvedMintPricePromise.url !== props.inputUrl));

        const displayPrice: string = props.approvedMintPrice
            ? props.phrases.priceWithCurrency(props.approvedMintPrice.displayPrice)
            : props.phrases.noPrice;

        const urlSubLabel = props.urlError
            ? props.phrases.urlError
            : `${props.phrases.mintUrl} ${props.standardizedUrl || ''}`;

        const priceWarning = props.priceError || props.phrases.priceNoMatchUrl;

        return html`
            <form @submit=${(event: SubmitEvent) => {
                // prevent form redirects
                event.preventDefault();
            }}>
                <section>
                    <${CoreInput}
                        @keydown=${(event: KeyboardEvent) => {
                            if (
                                event.key.toLowerCase() === 'enter' &&
                                props.inputUrl &&
                                canClickPreview
                            ) {
                                previewNftMinting(props.inputUrl);
                            }
                        }}
                        ${listen(CoreInput.events.valueChange, (event) => {
                            props.inputUrl = event.detail;
                            props.mintingError = undefined;
                            props.urlError = false;
                            if (props.inputUrl) {
                                try {
                                    props.standardizedUrl = standardizeUrl(event.detail);
                                } catch (error) {
                                    props.standardizedUrl = undefined;
                                    props.urlError = true;
                                }
                            } else {
                                props.standardizedUrl = undefined;
                            }
                        })}
                        @blur=${() => {
                            props.triggerFocus = false;
                        }}
                        ${assign(CoreInput.props.triggerFocus, props.triggerFocus)}
                        ${assign(CoreInput.props.maxLength, props.maxUrlLength)}
                        ${assign(CoreInput.props.value, props.inputUrl)}
                        ${assign(CoreInput.props.autoFocus, !props.inputUrl)}
                        ${assign(CoreInput.props.label, props.phrases.nftUrl)}
                    ></${CoreInput}>
                    <span
                        title=${urlSubLabel}
                        class="sub-input-label ${props.urlError ? 'warning-label' : ''}
                        ${props.standardizedUrl || props.urlError ? 'show' : ''}"
                    >
                        ${urlSubLabel}
                    </span>
                    <span>${props.phrases.nftFlair}</span>
                    <div class="flair-options">
                        ${props.flairKeys.map((flairKey) => {
                            const flairData = getFlairLabelAndUrl(flairKey);
                            return html`
                                <div
                                    @click=${() => {
                                        props.selectedFlair = flairKey;
                                    }}
                                    class="flair-selector ${props.selectedFlair === flairKey
                                        ? 'selected'
                                        : ''}"
                                >
                                    ${flairData.url
                                        ? html`
                                              <img src=${flairData.url} />
                                          `
                                        : html`
                                              <div class="empty-flair"></div>
                                          `}
                                    <span>${flairData.label}</span>
                                </div>
                            `;
                        })}
                    </div>
                    <${CoreInput}
                        class="description-input"
                        ${listen(CoreInput.events.valueChange, (event) => {
                            props.inputDescription = event.detail;
                        })}
                        ${assign(CoreInput.props.value, props.inputDescription)}
                        ${assign(CoreInput.props.label, props.phrases.nftDescription)}
                        ${assign(CoreInput.props.multiline, true)}
                        ${assign(CoreInput.props.maxLength, props.maxDescriptionLength)}
                    ></${CoreInput}>
                    <span
                        class="sub-input-label ${showDescriptionLength ? 'show' : ''}
                        ${showDescriptionLengthWarning ? 'warning-label' : ''}"
                    >
                        ${props.inputDescription?.length || 0} / ${props.maxDescriptionLength}
                    </span>
                    <${CoreButton}
                        @click=${() => {
                            if (props.inputUrl) {
                                previewNftMinting(props.inputUrl);
                            }
                        }}
                        ${assign(CoreButton.props.label, props.phrases.preview)}
                        ${assign(CoreButton.props.clickable, canClickPreview)}
                    ></${CoreButton}>
                </section>
                <section class="preview">
                    <span
                        class="price-warning warning-label ${showPriceWarning ? 'show' : ''}"
                    >
                        ${priceWarning}
                    </span>
                    <div class="preview-price-numbers">
                        ${props.phrases.price}
                        <br>
                        <div class="price-number">
                            <${LoadingIndicator}
                                ${assign(LoadingIndicator.props.isLoading, isPriceLoading)}
                                ${assign(LoadingIndicator.props.withLabel, true)}
                            ${assign(LoadingIndicator.props.size, 16)}
                            ></${LoadingIndicator}>
                            ${displayPrice}
                        </div>
                    </div>
                </section>
                <section class="purchase">
                    <div class="purchase-info">
                        <${LoadingIndicator}
                            ${assign(LoadingIndicator.props.isLoading, !!props.mintingPromise)}
                            ${assign(LoadingIndicator.props.size, 36)}
                        ></${LoadingIndicator}>
                        <span class="warning-label ${props.mintingError ? 'show' : ''}">
                            ${props.phrases.mintingFailed(props.mintingError ?? '')}
                        </span>
                    </div>
                    <${CoreButton}
                        class="tcnft-core-button-accept-theme"
                        @click=${() => {
                            if (!props.currentUser) {
                                throw new Error(`Can't purchase NFT, not logged in.`);
                            }
                            if (props.inputUrl && props.approvedMintPrice) {
                                preventNavigation();
                                props.mintingPromise = mintNft({
                                    url: standardizeUrl(props.inputUrl),
                                    description: props.inputDescription || '',
                                    selectedFlair: props.selectedFlair,
                                    price: props.approvedMintPrice.approvedPrice.amount.e8s,
                                    priceRequestUid: props.approvedMintPrice.approvedPrice.ulid,
                                    ...props.currentUser,
                                });
                                props.mintingPromise
                                    .then(() => {
                                        props.inputUrl = undefined;
                                        props.approvedMintPrice = undefined;
                                        props.inputDescription = undefined;
                                        props.standardizedUrl = undefined;
                                        props.selectedFlair = FlairKey.None;
                                        genericDispatch(new UpdateNftCountEvent());
                                        genericDispatch(new CloseModalsEvent());
                                    })
                                    .catch((error) => {
                                        props.mintingError =
                                            'message' in error ? error.message : String(error);
                                    })
                                    .finally(() => {
                                        enableNavigation();
                                        props.mintingPromise = undefined;
                                    });
                            }
                        }}
                        ${assign(CoreButton.props.label, props.phrases.purchase)}
                        ${assign(CoreButton.props.clickable, canClickMint)}
                    ></${CoreButton}>
                </section>
            </form>
        `;
    },
});
