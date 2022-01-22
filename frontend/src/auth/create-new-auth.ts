import {loadCurrentAuth} from '@frontend/src/auth/load-current-auth';
import {StoicIdentity} from '@frontend/src/auth/stoic-id-shim';
import {NftUser, stoicIdentityToNftUser} from '../data/nft-user';

/**
 * Creates a new stoic login auth. This should only be called after first checking that
 * loadCurrentAuth return undefined, therefore requiring a new login.
 */
export async function createNewAuth(): Promise<NftUser> {
    // just in case, try to load the user's current auth anyway
    const currentStoicAuth = await loadCurrentAuth();
    if (currentStoicAuth) {
        return currentStoicAuth;
    } else {
        const newStoicAuth = await StoicIdentity.connect();
        return stoicIdentityToNftUser(newStoicAuth);
    }
}
