import {Principal} from '@dfinity/principal';
import {StoicIdentity} from '@frontend/src/auth/stoic-id-shim';
import {createLedgerActor, LedgerActor} from '@frontend/src/canisters/ledger';
import {createNftActor, NftActor} from '@frontend/src/canisters/nft-canister';

export type NftUser = {
    /** Used for interactions with canisters. */
    principal: Principal;
    stoicIdentity: StoicIdentity;
    nftActor: NftActor;
    ledgerActor: LedgerActor;
};

export type NftUserWithNftList = NftUser & {
    nftIdList: number[];
};

export const UnloadedUserId = {notLoadedYet: true} as const;
export type UnloadedUserId = typeof UnloadedUserId;

export type MaybeNotLoadedUserId<UserGeneric extends NftUser = NftUser> =
    | UserGeneric
    | UnloadedUserId;

export function isNftUserLoaded<UserGeneric extends NftUser = NftUser>(
    input: MaybeNotLoadedUserId<UserGeneric> | undefined,
): input is UserGeneric {
    return !!input && input !== UnloadedUserId;
}

export async function stoicIdentityToNftUser(stoicIdentity: StoicIdentity): Promise<NftUser> {
    return {
        principal: stoicIdentity.getPrincipal(),
        stoicIdentity: stoicIdentity,
        nftActor: await createNftActor(stoicIdentity),
        ledgerActor: await createLedgerActor(stoicIdentity),
    };
}

export function getDisplayUsername(userId: MaybeNotLoadedUserId | undefined): string {
    if (userId && isNftUserLoaded(userId)) {
        return userId.principal.toString();
    } else {
        return '';
    }
}

export function getUserPrincipal(userId: NftUser): Principal {
    return userId.principal;
}
