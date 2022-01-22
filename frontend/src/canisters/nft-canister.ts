import {Actor, ActorSubclass, HttpAgent, HttpAgentOptions} from '@dfinity/agent';
import {InterfaceFactory} from '@dfinity/candid/lib/cjs/idl';
import {Principal} from '@dfinity/principal';
import * as nftCanister from '@frontend/dfx-link/local/canisters/nft';
import {ApprovedPrice} from '@frontend/dfx-link/local/canisters/nft/nft.did';
import * as nftCandid from '@frontend/dfx-link/local/canisters/nft/nft.did.js';
import {StoicIdentity} from '@frontend/src/auth/stoic-id-shim';
import {LedgerActor, makeTransfer} from '@frontend/src/canisters/ledger';
import {environment} from '@frontend/src/environment/environment';
import {delayPromise} from '../augments/promise';
import {FlairKey} from '../data/flair-images';
export type {Metadata as NftCanisterMetaData} from '@frontend/dfx-link/local/canisters/nft/nft.did';

export type NftActor = ActorSubclass<nftCandid._SERVICE>;

// idlFactory DOES exist in this import, but it's not in the .d.ts file
const nftIdlFactory = (nftCandid as any).idlFactory as InterfaceFactory;

export async function createNftActor(stoicIdentity: StoicIdentity): Promise<NftActor> {
    const agentOptions: HttpAgentOptions = {
        host: environment.actorHost,
        identity: stoicIdentity,
    };

    const agent = new HttpAgent(agentOptions);

    if (environment.isDev) {
        await agent.fetchRootKey();
    }

    const nftActor = Actor.createActor<nftCandid._SERVICE>(nftIdlFactory, {
        agent,
        canisterId: environment.nftCanisterId,
    });

    return nftActor;
}

/** Metadata for each NFT. Stored in a UTF-8 encoded JSON Blob. */
export type NftMetadata = {
    rawUrl: string;
    standardizedUrl: string;
    snippet: string;
};

export async function getUserNftIds(nftActor: NftActor, principal: Principal): Promise<number[]> {
    try {
        const nftIds = await nftActor.getUserNFTIndexes({
            principal: principal,
        });

        return nftIds;
    } catch (error) {
        console.error('Failed to get User NFT ids.');
        console.error(error);
        return [];
    }
}

function to32bits(num: number) {
    const b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    return Array.from(new Uint8Array(b));
}

// Modified from https://github.com/jorgenbuilder/ext-helpers/blob/main/tokenid.js
/** Generates a NFT identifier from the canister ID and NFT index (such as 10) */
function getNftIdentifier(principal: string, tokenIndex: any): string {
    const padding = window.Buffer.from('\x0Atid');
    const array = new Uint8Array([
        ...padding,
        ...Principal.fromText(principal).toUint8Array(),
        ...to32bits(tokenIndex),
    ]);
    return Principal.fromUint8Array(array).toText();
}

/**
 * Used when not going through the imported TS canister, when a raw URL for the canister is needed
 * (for images)
 */
function getCanisterEndpoint(canisterId: string): string {
    if (environment.isDev) {
        return `//${canisterId}.localhost:8000/`;
    } else {
        return `https://${canisterId}.raw.ic0.app/`;
    }
}

export function getNftImageUrls(tokenIndexes: number[]): string[] {
    const canisterId = nftCanister.canisterId;
    if (!canisterId) {
        throw new Error(`Failed to get NFT image URLs: Canister ID is not defined.`);
    }
    const urls = tokenIndexes.map((tokenIndex) => {
        const tokenIdentifier = getNftIdentifier(canisterId, tokenIndex);
        return `${getCanisterEndpoint(canisterId)}?tokenid=${tokenIdentifier}`;
    });

    return urls;
}

export type MintNftInputs = {
    nftActor: NftActor;
    principal: Principal;
    ledgerActor: LedgerActor;

    url: string;
    description: string;
    selectedFlair: FlairKey;
    price: bigint;
    priceRequestUid: string;
};

// TODO: add creator wallet address
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
    if (!url) {
        throw new Error(`Failed to mint: url is invalid: ${url}`);
    }
    const encoder = new TextEncoder();
    const mintNftData = {rawUrl: url, standardizedUrl: url, selectedFlair, snippet: description};
    const metadataBlob = encoder.encode(JSON.stringify(mintNftData));

    try {
        const blockId = await makeTransfer(ledgerActor, {
            to: creatorWalletAddress,
            amount: price,
        });
        const tokenId = await nftActor.mintNFT({
            to: {principal: principal},
            metadata: [Array.from(metadataBlob)],
            blockId: blockId,
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
