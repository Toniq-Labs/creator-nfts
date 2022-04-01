export const idlFactory = ({ IDL }) => {
  const TokenIdentifier = IDL.Text;
  const AccountIdentifier = IDL.Text;
  const User = IDL.Variant({
    'principal' : IDL.Principal,
    'address' : AccountIdentifier,
  });
  const BalanceRequest = IDL.Record({
    'token' : TokenIdentifier,
    'user' : User,
  });
  const Balance = IDL.Nat;
  const CommonError__1 = IDL.Variant({
    'InvalidToken' : TokenIdentifier,
    'Other' : IDL.Text,
  });
  const BalanceResponse = IDL.Variant({
    'ok' : Balance,
    'err' : CommonError__1,
  });
  const TokenIdentifier__1 = IDL.Text;
  const AccountIdentifier__1 = IDL.Text;
  const CommonError = IDL.Variant({
    'InvalidToken' : TokenIdentifier,
    'Other' : IDL.Text,
  });
  const Result_2 = IDL.Variant({
    'ok' : AccountIdentifier__1,
    'err' : CommonError,
  });
  const Extension = IDL.Text;
  const RawCreatorCategory = IDL.Record({
    'id' : IDL.Text,
    'postIds' : IDL.Vec(IDL.Text),
    'order' : IDL.Nat,
    'nftRequirement' : IDL.Nat,
    'categoryLabel' : IDL.Text,
  });
  const RawCreator = IDL.Record({
    'id' : IDL.Text,
    'name' : IDL.Text,
    'avatarUrl' : IDL.Text,
  });
  const RawCreatorPost = IDL.Record({
    'id' : IDL.Text,
    'categoryId' : IDL.Text,
    'content' : IDL.Text,
    'postLabel' : IDL.Text,
    'creatorId' : IDL.Text,
    'timestamp' : IDL.Nat,
    'nftRequirement' : IDL.Nat,
  });
  const RawBulkCreatorData = IDL.Record({
    'categories' : IDL.Vec(IDL.Tuple(IDL.Text, RawCreatorCategory)),
    'creators' : IDL.Vec(IDL.Tuple(IDL.Text, RawCreator)),
    'posts' : IDL.Vec(IDL.Tuple(IDL.Text, RawCreatorPost)),
  });
  const RawInitialCreatorPostData = IDL.Record({
    'id' : IDL.Text,
    'categoryId' : IDL.Text,
    'postLabel' : IDL.Text,
    'creatorId' : IDL.Text,
    'timestamp' : IDL.Nat,
    'nftRequirement' : IDL.Nat,
  });
  const RawUserCreatorData = IDL.Record({
    'categories' : IDL.Vec(IDL.Tuple(IDL.Text, RawCreatorCategory)),
    'creators' : IDL.Vec(IDL.Tuple(IDL.Text, RawCreator)),
    'posts' : IDL.Vec(IDL.Tuple(IDL.Text, RawInitialCreatorPostData)),
  });
  const TokenIndex = IDL.Nat32;
  const ICP = IDL.Record({ 'e8s' : IDL.Nat64 });
  const ApprovedPrice = IDL.Record({ 'ulid' : IDL.Text, 'amount' : ICP });
  const Metadata = IDL.Variant({
    'fungible' : IDL.Record({
      'decimals' : IDL.Nat8,
      'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
      'name' : IDL.Text,
      'symbol' : IDL.Text,
    }),
    'nonfungible' : IDL.Record({ 'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)) }),
  });
  const SelfRequest = IDL.Record({ 'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)) });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'status_code' : IDL.Nat16,
  });
  const Result_1 = IDL.Variant({ 'ok' : Metadata, 'err' : CommonError });
  const MintPaidRequest = IDL.Record({
    'to' : User,
    'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'blockId' : IDL.Nat64,
    'ulid' : IDL.Text,
    'amount' : ICP,
  });
  const Balance__1 = IDL.Nat;
  const Result = IDL.Variant({ 'ok' : Balance__1, 'err' : CommonError });
  const Memo = IDL.Vec(IDL.Nat8);
  const SubAccount = IDL.Vec(IDL.Nat8);
  const TransferRequest = IDL.Record({
    'to' : User,
    'token' : TokenIdentifier,
    'notify' : IDL.Bool,
    'from' : User,
    'memo' : Memo,
    'subaccount' : IDL.Opt(SubAccount),
    'amount' : Balance,
  });
  const TransferResponse = IDL.Variant({
    'ok' : Balance,
    'err' : IDL.Variant({
      'CannotNotify' : AccountIdentifier,
      'InsufficientBalance' : IDL.Null,
      'InvalidToken' : TokenIdentifier,
      'Rejected' : IDL.Null,
      'Unauthorized' : AccountIdentifier,
      'Other' : IDL.Text,
    }),
  });
  const CreatorNft = IDL.Service({
    'acceptCycles' : IDL.Func([], [], []),
    'addToRefunds' : IDL.Func([IDL.Nat64, IDL.Nat64], [IDL.Bool], []),
    'availableCycles' : IDL.Func([], [IDL.Nat], ['query']),
    'backupCurrentState' : IDL.Func([], [], []),
    'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
    'bearer' : IDL.Func([TokenIdentifier__1], [Result_2], ['query']),
    'extensions' : IDL.Func([], [IDL.Vec(Extension)], ['query']),
    'getAllCreatorDataForCreator' : IDL.Func(
        [],
        [RawBulkCreatorData],
        ['query'],
      ),
    'getAllCreatorDataForUser' : IDL.Func([], [RawUserCreatorData], ['query']),
    'getOrderHistory' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, TokenIndex))],
        ['query'],
      ),
    'getPriceToMint' : IDL.Func([IDL.Text], [ApprovedPrice], []),
    'getRefunds' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
        ['query'],
      ),
    'getRegistry' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, AccountIdentifier__1))],
        ['query'],
      ),
    'getTokens' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(TokenIndex, Metadata))],
        ['query'],
      ),
    'getUserNFTCount' : IDL.Func([], [IDL.Nat], ['query']),
    'getUserNFTIndexes' : IDL.Func([], [IDL.Vec(TokenIndex)], ['query']),
    'grantToSelf' : IDL.Func([SelfRequest], [TokenIndex], []),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'isContentCreator' : IDL.Func([], [IDL.Bool], ['query']),
    'metadata' : IDL.Func([TokenIdentifier__1], [Result_1], ['query']),
    'mintNFT' : IDL.Func([MintPaidRequest], [TokenIndex], []),
    'restoreState' : IDL.Func([IDL.Nat], [], []),
    'saveAllCreatorData' : IDL.Func([RawBulkCreatorData], [IDL.Bool], []),
    'shouldRefund' : IDL.Func([IDL.Nat64], [IDL.Bool], []),
    'supply' : IDL.Func([TokenIdentifier__1], [Result], ['query']),
    'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
    'tryToGetCreatorPostContent' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Text)],
        ['query'],
      ),
    'whoIsCalling' : IDL.Func([], [IDL.Principal], ['query']),
  });
  return CreatorNft;
};
export const init = ({ IDL }) => { return []; };
