import {Principal} from '@dfinity/principal';
import {ApprovedPrice} from '@frontend/dfx-link/local/canisters/nft/nft.did';
import {delayPromise} from '@frontend/src/augments/promise';
import {LedgerActor, makeTransfer} from '@frontend/src/canisters/ledger';
import {NftActor} from '@frontend/src/canisters/nft/nft-actor';
import {FlairKey} from '@frontend/src/data/flair-images';
import {environment} from '@frontend/src/environment/environment';

export type MintNftMetadata = {
    url: string;
    description: string;
    selectedFlair: FlairKey;
};

export type MintNftInputs = {
    nftActor: NftActor;
    principal: Principal;
    ledgerActor: LedgerActor;

    price: bigint;
    priceRequestUid: string;
} & MintNftMetadata;

function createNftMetadata({url, description, selectedFlair}: MintNftMetadata): [number[]] {
    if (!url) {
        throw new Error(`Failed to mint: url is invalid: ${url}`);
    }
    const encoder = new TextEncoder();
    const mintNftData = {rawUrl: url, standardizedUrl: url, selectedFlair, snippet: description};
    const metadataBlob = encoder.encode(JSON.stringify(mintNftData));

    return [Array.from(metadataBlob)];
}

export async function giveSelfNft(nftActor: NftActor, metadata: MintNftMetadata): Promise<number> {
    try {
        const tokenId = await nftActor.grantToSelf({
            metadata: createNftMetadata(metadata),
        });

        return tokenId;
    } catch (error) {
        console.error(`Failed to grant NFT to self:`, error);
        throw error;
    }
}

// TODO: fill in creator wallet address
const creatorWalletAddress = '';
export async function mintNft({
    url,
    description,
    selectedFlair,
    price,
    priceRequestUid,
    nftActor,
    principal,
    ledgerActor,
}: MintNftInputs): Promise<number> {
    const metadata = createNftMetadata({url, selectedFlair, description});

    try {
        const blockId = await makeTransfer(ledgerActor, {
            to: creatorWalletAddress,
            amount: price,
        });
        const tokenId = await nftActor.mintNFT({
            to: {principal: principal},
            metadata,
            blockId,
            amount: {e8s: price},
            ulid: priceRequestUid,
        });

        return tokenId;
    } catch (error) {
        console.error(`Failed to mint:`, error);
        throw error;
    }
}

export async function getMintPrice(nftActor: NftActor, url: string): Promise<ApprovedPrice> {
    if (environment.isDev) {
        // dev canisters not working at the moment
        await delayPromise(3000);
        return {ulid: 'unknown', amount: {e8s: BigInt(1000000)}};
    }
    const approvedPrice = await nftActor.getPriceToMint(url);

    return approvedPrice;
}
