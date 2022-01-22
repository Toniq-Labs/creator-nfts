/**
 * This file is copied from
 * https://github.com/sagacards/legends-marketeer/blob/76cb0224068e9fe7f99be2efcd23df77e3e6e161/src/hooks/nns-ledger/generated/nns.did.js
 * which has no license but we received verbal approval to copy pasta it.
 */

export default ({IDL}) => {
    const AccountIdentifier = IDL.Text;
    const Duration = IDL.Record({secs: IDL.Nat64, nanos: IDL.Nat32});
    const ArchiveOptions = IDL.Record({
        max_message_size_bytes: IDL.Opt(IDL.Nat32),
        node_max_memory_size_bytes: IDL.Opt(IDL.Nat32),
        controller_id: IDL.Principal,
    });
    const ICPTs = IDL.Record({e8s: IDL.Nat64});
    const LedgerCanisterInitPayload = IDL.Record({
        send_whitelist: IDL.Vec(IDL.Tuple(IDL.Principal)),
        minting_account: AccountIdentifier,
        transaction_window: IDL.Opt(Duration),
        max_message_size_bytes: IDL.Opt(IDL.Nat32),
        archive_options: IDL.Opt(ArchiveOptions),
        initial_values: IDL.Vec(IDL.Tuple(AccountIdentifier, ICPTs)),
    });
    const AccountBalanceArgs = IDL.Record({account: AccountIdentifier});
    const SubAccount = IDL.Vec(IDL.Nat8);
    const BlockHeight = IDL.Nat64;
    const NotifyCanisterArgs = IDL.Record({
        to_subaccount: IDL.Opt(SubAccount),
        from_subaccount: IDL.Opt(SubAccount),
        to_canister: IDL.Principal,
        max_fee: ICPTs,
        block_height: BlockHeight,
    });
    const Memo = IDL.Nat64;
    const TimeStamp = IDL.Record({timestamp_nanos: IDL.Nat64});
    const SendArgs = IDL.Record({
        to: AccountIdentifier,
        fee: ICPTs,
        memo: Memo,
        from_subaccount: IDL.Opt(SubAccount),
        created_at_time: IDL.Opt(TimeStamp),
        amount: ICPTs,
    });
    return IDL.Service({
        account_balance_dfx: IDL.Func([AccountBalanceArgs], [ICPTs], ['query']),
        notify_dfx: IDL.Func([NotifyCanisterArgs], [], []),
        send_dfx: IDL.Func([SendArgs], [BlockHeight], []),
    });
};
export const init = ({IDL}) => {
    const AccountIdentifier = IDL.Text;
    const Duration = IDL.Record({secs: IDL.Nat64, nanos: IDL.Nat32});
    const ArchiveOptions = IDL.Record({
        max_message_size_bytes: IDL.Opt(IDL.Nat32),
        node_max_memory_size_bytes: IDL.Opt(IDL.Nat32),
        controller_id: IDL.Principal,
    });
    const ICPTs = IDL.Record({e8s: IDL.Nat64});
    const LedgerCanisterInitPayload = IDL.Record({
        send_whitelist: IDL.Vec(IDL.Tuple(IDL.Principal)),
        minting_account: AccountIdentifier,
        transaction_window: IDL.Opt(Duration),
        max_message_size_bytes: IDL.Opt(IDL.Nat32),
        archive_options: IDL.Opt(ArchiveOptions),
        initial_values: IDL.Vec(IDL.Tuple(AccountIdentifier, ICPTs)),
    });
    return [LedgerCanisterInitPayload];
};
