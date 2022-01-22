import {Actor, ActorSubclass, HttpAgent, HttpAgentOptions} from '@dfinity/agent';
import {StoicIdentity} from '@frontend/src/auth/stoic-id-shim';
import {actorHostConfig, environment} from '@frontend/src/environment/environment';
import idlFactory from './nns.did.js';

/** Non-exhaustive typing. */
type NotTypedLedgerApi = {
    send_dfx: Function;
    notifyDfx: Function;
    account_balance_dfx: Function;
};
export type LedgerActor = ActorSubclass<NotTypedLedgerApi>;

export async function createLedgerActor(stoicIdentity: StoicIdentity): Promise<LedgerActor> {
    const agentOptions: HttpAgentOptions = {
        // we don't have a dev version of the ledger canister
        host: actorHostConfig.prod,
        identity: stoicIdentity,
    };

    const agent = new HttpAgent(agentOptions);

    const ledgerActor = Actor.createActor<NotTypedLedgerApi>(idlFactory, {
        agent,
        canisterId: environment.ledgerId,
    });
    return ledgerActor;
}

export async function makeTransfer(
    ledgerActor: LedgerActor,
    arg: {
        /** Id of wallet to send the ICP to */
        to: string;
        /**
         * Transfer amount in e8s
         *
         * 1 = 0.00000001 ICP
         */
        amount: bigint;
        opts?: {
            fee?: number;
            memo?: number;
            from_subaccount?: number;
            created_at_time?: {
                timestamp_nanos: number;
            };
        };
    },
): Promise<bigint> {
    try {
        const block: any = await ledgerActor.send_dfx({
            to: arg.to,
            fee: {e8s: arg?.opts?.fee ? BigInt(arg?.opts?.fee) : BigInt(10_000)},
            memo: arg?.opts?.memo ? BigInt(arg?.opts?.memo) : BigInt(0),
            amount: {e8s: BigInt(arg.amount)},
            from_subaccount: [],
            created_at_time: [],
        });

        if (typeof block === 'bigint') {
            return block;
        } else if (typeof block.height === 'number') {
            return BigInt(block.height as number);
        } else if (typeof block.height === 'bigint') {
            return block.height as bigint;
        } else {
            console.dir(block);
            throw new Error(`Invalid block returned: ${block}`);
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}
