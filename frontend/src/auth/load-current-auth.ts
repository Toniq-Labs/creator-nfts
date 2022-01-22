import {StoicIdentity} from '@frontend/src/auth/stoic-id-shim';
import {NftUser, stoicIdentityToNftUser} from '@frontend/src/data/nft-user';

export async function loadCurrentAuth(): Promise<NftUser | undefined> {
    const stoicIdentity = await StoicIdentity.load(undefined, true);
    if (stoicIdentity) {
        return stoicIdentityToNftUser(stoicIdentity);
    } else {
        return undefined;
    }
}
