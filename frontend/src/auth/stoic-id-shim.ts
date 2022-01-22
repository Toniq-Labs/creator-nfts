import {SignIdentity} from '@dfinity/agent';
// @ts-ignore
import {StoicIdentity as StoicInput} from 'ic-stoic-identity';

export const StoicIdentity = StoicInput;
/** These types are not exhaustive but they provide the necessary methods that we use here. */
export type StoicIdentity = SignIdentity & {
    connect(): Promise<StoicIdentity>;
    load(): Promise<StoicIdentity | undefined>;
    disconnect(): Promise<void>;
};
