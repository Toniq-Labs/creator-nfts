import {getNftImageUrls} from '@frontend/src/canisters/nft-canister';
import {NftUserWithNftList} from '@frontend/src/data/nft-user';
import {defineCreatorNftElement} from '@frontend/src/ui/define-element/define-creator-nft-element';
import {TcnftAppFullRoute} from '@frontend/src/ui/routes/app-routes';
import {css, html} from 'element-vir';

export const BrowseNftsModal = defineCreatorNftElement({
    tagName: 'tcnft-browse-nfts-modal',
    props: {
        currentRoute: undefined as TcnftAppFullRoute | undefined,
        currentUser: undefined as NftUserWithNftList | undefined,
    },
    styles: css`
        :host {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            justify-content: center;
        }

        img {
            height: 240px;
            width: auto;
        }
    `,
    renderCallback: ({props}) => {
        const imageUrls = props.currentUser ? getNftImageUrls(props.currentUser?.nftIdList) : [];

        if (!imageUrls.length) {
            return html`
                No minted NFTs yet!
            `;
        }

        return html`
            ${imageUrls.map((imageUrl) => {
                return html`
                    <section>
                        <a target="_blank" rel="noopener noreferrer" href=${imageUrl}>
                            <img src=${imageUrl} />
                        </a>
                    </section>
                `;
            })}
        `;
    },
});
