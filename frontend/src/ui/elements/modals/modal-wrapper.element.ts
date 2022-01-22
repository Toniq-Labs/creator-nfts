import {NftUserWithNftList} from '@frontend/src/data/nft-user';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {BrowseNftsModal} from '@frontend/src/ui/elements/modals/browse-nfts.modal.element';
import {MintModal} from '@frontend/src/ui/elements/modals/mint.modal.element';
import {CloseModalsEvent} from '@frontend/src/ui/global-events/close-modals';
import {TcnftAppFullRoute} from '@frontend/src/ui/routes/app-routes';
import {ModalName} from '@frontend/src/ui/routes/modal-logic';
import {
    overlayActiveOpacityVar,
    overlayCoveringOpacityVar,
    overlayHoverOpacityVar,
    symbolFontVar,
    themeBackgroundColorVar,
    themeForegroundColorVar,
    themeInteractionTransitionTimeVar,
} from '@frontend/src/ui/styles/theme-vars';
import {modalZ} from '@frontend/src/ui/styles/z-index';
import {assign, css, defineElementEvent, html, listen, onDomCreated} from 'element-vir';
import {getCurrentModalKey} from '../../routes/modal-logic';

export const ModalWrapper = defineCreatorNftElement({
    tagName: 'tcnft-modal-wrapper',
    props: {
        currentRoute: undefined as TcnftAppFullRoute | undefined,
        phrases: {
            modalLabels: {
                [ModalName.Mint]: 'Mint',
                [ModalName.BrowseNft]: 'Your minted NFTs',
            },
        },
        currentUser: undefined as NftUserWithNftList | undefined,
    },
    events: {
        modalShown: defineElementEvent<ModalName | undefined>(),
    },
    styles: css`
        .fill-screen {
            z-index: ${modalZ};
            position: fixed;
            inset: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            /*
                backdrop-filter does not work in Firefox so we can't rely on it fully to fade the
                background. That's why the .background also exists with a transparent color overlay.
            */
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            opacity: 1;
            transition: opacity ${themeInteractionTransitionTimeVar} ease-in-out;
        }

        .fill-screen.hidden {
            animation: hideAnimation 0s linear forwards;
            animation-delay: ${themeInteractionTransitionTimeVar};
            opacity: 0;
        }

        @keyframes hideAnimation {
            0% {
            }
            99% {
            }
            100% {
                z-index: -1;
            }
        }

        .fill-screen.hidden .modal-border {
            display: none;
        }

        header {
            display: flex;
            position: sticky;
            top: 0;
            background-color: ${themeBackgroundColorVar};
            border-bottom: 1px solid ${themeForegroundColorVar};
        }

        .modal-border {
            border: 2px solid ${themeForegroundColorVar};
            background-color: ${themeBackgroundColorVar};
            border-radius: 16px;
            box-sizing: border-box;
            max-height: calc(100% - 16px);
            max-width: calc(100% - 16px);
            position: relative;
            z-index: ${modalZ - 1};
            overflow-y: auto;
            margin: 8px;
        }

        .modal-wrapper {
            padding: 24px 40px 32px;
        }

        h1 {
            font-size: 2.5em;
            padding: 12px 24px;
            margin: 0;
            top: 0;
            flex-grow: 1;
            flex-wrap: wrap;
        }

        .background {
            position: absolute;
            inset: 0;
            z-index: 1;
            opacity: ${overlayCoveringOpacityVar};
            background-color: ${themeBackgroundColorVar};
        }

        .close-x {
            user-select: none;
            -webkit-user-select: none;
            font-family: ${symbolFontVar};
            justify-content: center;
            flex-grow: 0;
            flex-shrink: 0;
            align-items: center;
            position: relative;
            top: 8px;
            right: 8px;
            height: 30px;
            width: 30px;
            font-size: 28px;
            border-radius: 50%;
            overflow: hidden;
            cursor: pointer;
        }

        .close-x span {
            display: inline-block;
            text-align: center;
            width: 100%;
            vertical-align: top;
            line-height: 28px;
            z-index: 2;
            padding-left: 0.5px;
            margin-top: -1px;
        }

        .close-x > .overlay {
            inset: 0;
            height: 100%;
            width: 100%;
            position: absolute;
            transition: opacity ${themeInteractionTransitionTimeVar};
            background-color: ${themeForegroundColorVar};
            border-radius: inherit;
            opacity: 0;
            z-index: 1;
            overflow: hidden;
        }

        .close-x:hover > .overlay {
            opacity: ${overlayHoverOpacityVar};
        }
        .close-x:active > .overlay {
            opacity: ${overlayActiveOpacityVar};
        }
    `,
    renderCallback: ({props, dispatch, events}) => {
        function clearModals() {
            dispatch(new events.modalShown(undefined));
        }

        const modalToShow = getCurrentModalKey(props.currentRoute);

        if (modalToShow) {
            dispatch(new events.modalShown(modalToShow));
        }

        return html`
            <section
                ${onDomCreated(() => {
                    document.body.addEventListener('keydown', (event) => {
                        if (
                            getCurrentModalKey(props.currentRoute) &&
                            event.key.toLowerCase() === 'escape'
                        ) {
                            clearModals();
                        }
                    });
                })}
                class="fill-screen ${modalToShow ? '' : 'hidden'}"
                ${listen(CloseModalsEvent, () => clearModals())}
            >
                <div class="modal-border">
                    <header>
                        <h1>
                            ${modalToShow ? props.phrases.modalLabels[modalToShow] : ''}
                        </h1>
                        <div
                            class="close-x"
                            @click=${() => {
                                clearModals();
                            }}
                        >
                            <span>×</span>
                            <div class="overlay"></div>
                        </div>
                    </header>
                    <div class="modal-wrapper">
                        <!-- 
                            All modals are instantiated but hidden so that they can maintain their
                            state in case a user closes one on accident.
                        -->
                        <${MintModal}
                            style=${modalToShow === ModalName.Mint ? '' : 'display: none;'}
                            ${assign(MintModal.props.currentRoute, props.currentRoute)}
                            ${assign(MintModal.props.triggerFocus, modalToShow === ModalName.Mint)}
                            ${assign(MintModal.props.currentUser, props.currentUser)}
                        ></${MintModal}>
                        <${BrowseNftsModal}
                            style=${modalToShow === ModalName.BrowseNft ? '' : 'display: none;'}
                            ${assign(BrowseNftsModal.props.currentRoute, props.currentRoute)}
                            ${assign(BrowseNftsModal.props.currentUser, props.currentUser)}
                        ></${BrowseNftsModal}>
                    </div>
                </div>
                <div
                    class="background"
                    @click=${() => {
                        clearModals();
                    }}
                ></div>
            </section>`;
    },
});
