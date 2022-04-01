import {removeCurrentAuth} from '@frontend/src/auth/remove-current-auth';
import {StoicIdentity} from '@frontend/src/auth/stoic-id-shim';
import {NftUser, stoicIdentityToNftUser} from '@frontend/src/data/nft-user';
import {readLocalStorageValue} from '@frontend/src/local-storage/local-storage';
import {StaticLocalStorageKey} from '../local-storage/local-storage-keys';

export async function loadCurrentAuth(): Promise<NftUser | undefined> {
    // if no Stoic Identity is stored in local storage, we instantly know that there's no need to
    // connect to Stoic.
    if (!readLocalStorageValue(StaticLocalStorageKey.stoicIdentity)) {
        return undefined;
    }
    const stoicIdentity = await StoicIdentity.load(undefined, true);
    if (stoicIdentity) {
        return stoicIdentityToNftUser(stoicIdentity);
    } else {
        return undefined;
    }
}

export async function tryToLoadAuthWithRetires() {
    try {
        return loadCurrentAuth();
    } catch (error) {
        removeCurrentAuth();
        throw error;
    }
}
