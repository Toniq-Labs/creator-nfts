import {Principal} from '@dfinity/principal';
import * as nftCanister from '@frontend/dfx-link/local/canisters/nft';
import {environment} from '@frontend/src/environment/environment';

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

// Modified from https://github.com/jorgenbuilder/ext-helpers/blob/main/tokenid.js
// cSpell:ignore ld7jw-dikor-uwiaa-aaaaa-aaaaa-iaqca-aaaaa-q
/**
 * Generates a NFT identifier (such as ld7jw-dikor-uwiaa-aaaaa-aaaaa-iaqca-aaaaa-q) from the
 * canister ID and NFT index (such as 10)
 */
function getNftIdentifier(principal: string, tokenIndex: any): string {
    const padding = window.Buffer.from('\x0Atid');
    const array = new Uint8Array([
        ...padding,
        ...Principal.fromText(principal).toUint8Array(),
        ...to32bits(tokenIndex),
    ]);
    return Principal.fromUint8Array(array).toText();
}

function to32bits(num: number) {
    const b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    return Array.from(new Uint8Array(b));
}
