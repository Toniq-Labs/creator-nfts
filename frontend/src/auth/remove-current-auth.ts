import {StoicIdentity} from '@frontend/src/auth/stoic-id-shim';

export function removeCurrentAuth() {
    StoicIdentity.disconnect();
}
