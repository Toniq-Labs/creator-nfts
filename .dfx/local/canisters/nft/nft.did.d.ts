import type { Principal } from '@dfinity/principal';
export type AccountIdentifier = string;
export type AccountIdentifier__1 = string;
export interface ApprovedPrice { 'ulid' : string, 'amount' : ICP }
export type Balance = bigint;
export interface BalanceRequest { 'token' : TokenIdentifier, 'user' : User }
export type BalanceResponse = { 'ok' : Balance } |
  { 'err' : CommonError__1 };
export type Balance__1 = bigint;
export type CommonError = { 'InvalidToken' : TokenIdentifier } |
  { 'Other' : string };
export type CommonError__1 = { 'InvalidToken' : TokenIdentifier } |
  { 'Other' : string };
export interface CreatorNft {
  'acceptCycles' : () => Promise<undefined>,
  'addToRefunds' : (arg_0: bigint, arg_1: bigint) => Promise<boolean>,
  'availableCycles' : () => Promise<bigint>,
  'backupCurrentState' : () => Promise<undefined>,
  'balance' : (arg_0: BalanceRequest) => Promise<BalanceResponse>,
  'bearer' : (arg_0: TokenIdentifier__1) => Promise<Result_2>,
  'extensions' : () => Promise<Array<Extension>>,
  'getAllCreatorDataForCreator' : () => Promise<RawBulkCreatorData>,
  'getAllCreatorDataForUser' : () => Promise<RawUserCreatorData>,
  'getOrderHistory' : () => Promise<Array<[string, TokenIndex]>>,
  'getPriceToMint' : (arg_0: string) => Promise<ApprovedPrice>,
  'getRefunds' : () => Promise<Array<[string, string]>>,
  'getRegistry' : () => Promise<Array<[TokenIndex, AccountIdentifier__1]>>,
  'getTokens' : () => Promise<Array<[TokenIndex, Metadata]>>,
  'getUserNFTCount' : () => Promise<bigint>,
  'getUserNFTIndexes' : () => Promise<Array<TokenIndex>>,
  'grantToSelf' : (arg_0: SelfRequest) => Promise<TokenIndex>,
  'http_request' : (arg_0: HttpRequest) => Promise<HttpResponse>,
  'isContentCreator' : () => Promise<boolean>,
  'metadata' : (arg_0: TokenIdentifier__1) => Promise<Result_1>,
  'mintNFT' : (arg_0: MintPaidRequest) => Promise<TokenIndex>,
  'restoreState' : (arg_0: bigint) => Promise<undefined>,
  'saveAllCreatorData' : (arg_0: RawBulkCreatorData) => Promise<boolean>,
  'shouldRefund' : (arg_0: bigint) => Promise<boolean>,
  'supply' : (arg_0: TokenIdentifier__1) => Promise<Result>,
  'transfer' : (arg_0: TransferRequest) => Promise<TransferResponse>,
  'tryToGetCreatorPostContent' : (arg_0: string) => Promise<[] | [string]>,
  'whoIsCalling' : () => Promise<Principal>,
}
export type Extension = string;
export type HeaderField = [string, string];
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
}
export interface HttpResponse {
  'body' : Array<number>,
  'headers' : Array<HeaderField>,
  'status_code' : number,
}
export interface ICP { 'e8s' : bigint }
export type Memo = Array<number>;
export type Metadata = {
    'fungible' : {
      'decimals' : number,
      'metadata' : [] | [Array<number>],
      'name' : string,
      'symbol' : string,
    }
  } |
  { 'nonfungible' : { 'metadata' : [] | [Array<number>] } };
export interface MintPaidRequest {
  'to' : User,
  'metadata' : [] | [Array<number>],
  'blockId' : bigint,
  'ulid' : string,
  'amount' : ICP,
}
export interface RawBulkCreatorData {
  'categories' : Array<[string, RawCreatorCategory]>,
  'creators' : Array<[string, RawCreator]>,
  'posts' : Array<[string, RawCreatorPost]>,
}
export interface RawCreator {
  'id' : string,
  'name' : string,
  'avatarUrl' : string,
}
export interface RawCreatorCategory {
  'id' : string,
  'postIds' : Array<string>,
  'order' : bigint,
  'nftRequirement' : bigint,
  'categoryLabel' : string,
}
export interface RawCreatorPost {
  'id' : string,
  'categoryId' : string,
  'content' : string,
  'postLabel' : string,
  'creatorId' : string,
  'timestamp' : bigint,
  'nftRequirement' : bigint,
}
export interface RawInitialCreatorPostData {
  'id' : string,
  'categoryId' : string,
  'postLabel' : string,
  'creatorId' : string,
  'timestamp' : bigint,
  'nftRequirement' : bigint,
}
export interface RawUserCreatorData {
  'categories' : Array<[string, RawCreatorCategory]>,
  'creators' : Array<[string, RawCreator]>,
  'posts' : Array<[string, RawInitialCreatorPostData]>,
}
export type Result = { 'ok' : Balance__1 } |
  { 'err' : CommonError };
export type Result_1 = { 'ok' : Metadata } |
  { 'err' : CommonError };
export type Result_2 = { 'ok' : AccountIdentifier__1 } |
  { 'err' : CommonError };
export interface SelfRequest { 'metadata' : [] | [Array<number>] }
export type SubAccount = Array<number>;
export type TokenIdentifier = string;
export type TokenIdentifier__1 = string;
export type TokenIndex = number;
export interface TransferRequest {
  'to' : User,
  'token' : TokenIdentifier,
  'notify' : boolean,
  'from' : User,
  'memo' : Memo,
  'subaccount' : [] | [SubAccount],
  'amount' : Balance,
}
export type TransferResponse = { 'ok' : Balance } |
  {
    'err' : { 'CannotNotify' : AccountIdentifier } |
      { 'InsufficientBalance' : null } |
      { 'InvalidToken' : TokenIdentifier } |
      { 'Rejected' : null } |
      { 'Unauthorized' : AccountIdentifier } |
      { 'Other' : string }
  };
export type User = { 'principal' : Principal } |
  { 'address' : AccountIdentifier };
export interface _SERVICE extends CreatorNft {}
