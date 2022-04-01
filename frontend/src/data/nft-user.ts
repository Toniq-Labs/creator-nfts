import {Principal} from '@dfinity/principal';
import {StoicIdentity} from '@frontend/src/auth/stoic-id-shim';
import {createLedgerActor, LedgerActor} from '@frontend/src/canisters/ledger';
import {createNftActor, NftActor} from '@frontend/src/canisters/nft/nft-actor';
import {getUserNftIds, isContentCreator} from '@frontend/src/canisters/nft/user-data';

export type NftUser = {
    /** Used for interactions with canisters. */
    principal: Principal;
    stoicIdentity: StoicIdentity;
    nftActor: NftActor;
    ledgerActor: LedgerActor;
    nftIdList: number[];
    isContentCreator: boolean;
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
    const nftActor = await createNftActor(stoicIdentity);
    const principal = stoicIdentity.getPrincipal();

    const nftUser: NftUser = {
        principal,
        stoicIdentity,
        nftActor,
        ledgerActor: await createLedgerActor(stoicIdentity),
        nftIdList: await getUserNftIds(nftActor),
        isContentCreator: await isContentCreator(nftActor),
    };

    return nftUser;
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
