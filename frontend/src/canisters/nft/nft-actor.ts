import {Actor, ActorSubclass, HttpAgent, HttpAgentOptions} from '@dfinity/agent';
import {InterfaceFactory} from '@dfinity/candid/lib/cjs/idl';
import * as nftCandid from '@frontend/dfx-link/local/canisters/nft/nft.did.js';
import {StoicIdentity} from '@frontend/src/auth/stoic-id-shim';
import {environment} from '@frontend/src/environment/environment';

// idlFactory DOES exist in this import, but it's not in the .d.ts file
const nftIdlFactory = (nftCandid as any).idlFactory as InterfaceFactory;

export type NftActor = ActorSubclass<nftCandid._SERVICE>;

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
