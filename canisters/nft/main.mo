// NFT canister
// Much of this code is adapted from https://github.com/Toniq-Labs/extendable-token/blob/main/examples/erc721.mo

// 3rd Party Imports
import AID "mo:ext/util/AccountIdentifier";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import ExtCommon "mo:ext/Common";
import ExtCore "mo:ext/Core";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import JSON "mo:json/JSON";
import LFSR "mo:rand/LFSR";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import SourceUlid "mo:ulid/Source";
import Text "mo:base/Text";
import TokenIdentifier "mo:ext/Core";
import ULID "mo:ulid/ULID";
import XorShift "mo:rand/XorShift";

// Module imports
import Backup "canister:backup";
import HttpHelper "http";
import Ledger "Ledger";
import LedgerC "LedgerCandid";
import TokenImage "tokenImage";

shared ({caller = owner}) actor class CreatorNft() = this {
  
  // Types
  type AccountIdentifier = ExtCore.AccountIdentifier;
  type Balance = ExtCore.Balance;
  type Block = LedgerC.Block;
  type BalanceResponse = ExtCore.BalanceResponse;
  type BalanceRequest = ExtCore.BalanceRequest;
  type CommonError = ExtCore.CommonError;
  type Extension = ExtCore.Extension;
  type Metadata = ExtCommon.Metadata;
  type SubAccount = ExtCore.SubAccount;
  type TokenIdentifier = ExtCore.TokenIdentifier;
  type TokenIndex  = ExtCore.TokenIndex ;
  type TransferRequest = ExtCore.TransferRequest;
  type TransferResponse = ExtCore.TransferResponse;
  type User = ExtCore.User;
  type ULID = ULID.ULID;
  public type MintPaidRequest = {
    to : ExtCore.User;
    metadata : ?Blob;
    amount : Ledger.ICP; // amount : e8s == 100_000_000 is equivalent to 1ICP
    blockId : Nat64;
    ulid : Text;
  };
  public type ApprovedPrice = {
    ulid : Text;
    amount : Ledger.ICP;
  };
  public type Keys = {
    path : Text;
    page : Text;
  };
  
  private let EXTENSIONS : [Extension] = ["@ext/common", "@ext/nonfungible"];

  /*cspell:disable*/
  // TODO: add deployed ledger canister princpal here:
  private let ledgerC : LedgerC.Interface = actor("");
  // TODO: add creator wallet address here.
  // this is the address that receive minting payments
  private let creatorWalletAddress : Text = "";
  /*cspell:enable*/
  
  private let rr = XorShift.toReader(XorShift.XorShift64(null));

  // State variables
  private stable var _registryState : [(TokenIndex, AccountIdentifier)] = []; // (TokenIndex, OwnerOfNFT)
  private var _registry : HashMap.HashMap<TokenIndex, AccountIdentifier> = HashMap.fromIter(_registryState.vals(), 0, ExtCore.TokenIndex.equal, ExtCore.TokenIndex.hash);
  
  private stable var _tokenMetadataState : [(TokenIndex, Metadata)] = []; // (TokenIndex, NFTcontent)
  private var _tokenMetadata : HashMap.HashMap<TokenIndex, Metadata> = HashMap.fromIter(_tokenMetadataState.vals(), 0, ExtCore.TokenIndex.equal, ExtCore.TokenIndex.hash);
  
  private stable var _urlCountState : [(Text, Nat)] = []; // (URL, Count)
  private var _urlCountMapper : HashMap.HashMap<Text, Nat> = HashMap.fromIter(_urlCountState.vals(), 0, Text.equal, Text.hash);
  
  private stable var _pendingOrdersState : [(Principal, ApprovedPrice)] = []; // (ULID, ApprovedPrice)
  private var _pendingOrders : HashMap.HashMap<Principal, ApprovedPrice> = HashMap.fromIter(_pendingOrdersState.vals(), 0, Principal.equal, Principal.hash);

  private stable var _orderHistoryState : [(Text, TokenIndex)] = []; // (BlockId, TokenIndexPurchasedByBlockId)
  private var _orderHistory : HashMap.HashMap<Text, TokenIndex> = HashMap.fromIter(_orderHistoryState.vals(), 0, Text.equal, Text.hash);

  private stable var _supply : Balance = 0;
  private stable var _nextTokenId : TokenIndex = 0;


  // State management functions
  system func preupgrade() {
    _registryState := Iter.toArray(_registry.entries());
    _tokenMetadataState := Iter.toArray(_tokenMetadata.entries());
    _urlCountState := Iter.toArray(_urlCountMapper.entries());
    _orderHistoryState := Iter.toArray(_orderHistory.entries());
    _pendingOrdersState := Iter.toArray(_pendingOrders.entries());
  };
  system func postupgrade() {
    _registryState := [];
    _tokenMetadataState := [];
    _urlCountState := [];
    _orderHistoryState := [];
    _pendingOrdersState := [];
  };

  /**
   * @ext/Core
   * Implements extensions, balance, transfer
   */

  // Returns the list of extensions this canister implements from the EXT standard
  public query func extensions() : async [Extension] {
    EXTENSIONS;
  };
  
  // Returns whether a given user owns the token with the given ID (for NFT, balance is either 0 or 1)
  public query func balance(request : BalanceRequest) : async BalanceResponse {
    if (ExtCore.TokenIdentifier.isPrincipal(request.token, Principal.fromActor(this)) == false) {
      return #err(#InvalidToken(request.token));
    };
    let token = ExtCore.TokenIdentifier.getIndex(request.token);
    let aid = ExtCore.User.toAID(request.user);
    switch (_registry.get(token)) {
      case (?token_owner) {
        if (AID.equal(aid, token_owner) == true) {
          return #ok(1);
        } else {					
          return #ok(0);
        };
      };
      case (_) {
        return #err(#InvalidToken(request.token));
      };
    };
  };

  // Transfers a token to a new owner. Must be called by the current token owner.
  public shared({caller}) func transfer(request: TransferRequest) : async TransferResponse {
    Debug.print("Attempting NFT Transfer");

    if (request.amount != 1) {
      return #err(#Other("Only logical transfer amount for an NFT is 1, got" # Nat.toText(request.amount) # "."));
    };
    if (ExtCore.TokenIdentifier.isPrincipal(request.token, Principal.fromActor(this)) == false) {
      return #err(#InvalidToken(request.token));
    };
    let token = ExtCore.TokenIdentifier.getIndex(request.token);
    
    switch (_registry.get(token)) {
      case (?token_owner) {
        let owner = ExtCore.User.toAID(request.from);
        if(AID.equal(owner, token_owner) == false) {
          return #err(#Unauthorized(owner));
        };
        let receiver = ExtCore.User.toAID(request.to);
        _registry.put(token, receiver);
        return #ok(request.amount);
      };
      case (_) {
        return #err(#InvalidToken(request.token));
      };
    };
  };


  /**
   * @ext/Common
   * Implements metadata, supply
   */

  // Returns metadata for a given token.
  public query func metadata(token : TokenIdentifier) : async Result.Result<Metadata, CommonError> {
    if (ExtCore.TokenIdentifier.isPrincipal(token, Principal.fromActor(this)) == false) {
      return #err(#InvalidToken(token));
    };
    let tokenind = ExtCore.TokenIdentifier.getIndex(token);
    switch (_tokenMetadata.get(tokenind)) {
      case (?token_metadata) {
        return #ok(token_metadata);
      };
      case (_) {
        return #err(#InvalidToken(token));
      };
    };
  };

  // Returns the number of NFTs that have been minted. (Token parameter is not used)
  public query func supply(token : TokenIdentifier) : async Result.Result<Balance, CommonError> {
    #ok(_supply);
  };


  /**
   * @ext/NonFungible
   * Implements bearer, mintNFT
   */

  // Returns the owner of a given token. Part of NonFungible extension.
  public query func bearer(token : TokenIdentifier) : async Result.Result<AccountIdentifier, CommonError> {
    if (ExtCore.TokenIdentifier.isPrincipal(token, Principal.fromActor(this)) == false) {
      return #err(#InvalidToken(token));
    };
    let tokenind = ExtCore.TokenIdentifier.getIndex(token);
    switch (_registry.get(tokenind)) {
      case (?token_owner) {
        return #ok(token_owner);
      };
      case (_) {
        return #err(#InvalidToken(token));
      };
    };
  };

  // Mints a new NFT.
  // Returns the token ID of the newly-minted NFT.
  public shared({caller}) func mintNFT(request : MintPaidRequest) : async TokenIndex {
    //authorize(caller); // Uncomment if we need to freeze minting
    await validateTransaction(caller, request.ulid, request.blockId, request.amount); // validate block exists on ledger, transfer was sent to creator's AId, and has not been recorded to our orderHistory

    let receiver = ExtCore.User.toAID(request.to);
    let token = _nextTokenId;

    // Inject borderId into the metadata
    // figure out more robust JSON manipulation
    assert(request.metadata != null);
    var metadataText : Text = Option.unwrap(Text.decodeUtf8(Option.unwrap(request.metadata)));
    metadataText := Text.trimEnd(metadataText, #char '}');
    metadataText #= ",\"borderId\":\"" # getTokenBorderId(token) # "\"}";

    let md : Metadata = #nonfungible({
      metadata = ?Text.encodeUtf8(metadataText);
    }); 
    _orderHistory.put(Nat64.toText(request.blockId), token);
    switch(_pendingOrders.remove(caller)){ case(_){}; }; // PendingOrder has been used.
    _registry.put(token, receiver);
    _tokenMetadata.put(token, md);
    let (standardizedUrl : Text, snippet : Text, borderId : Text, selectedFlair : Text) = getMetaDataElements(md);
    
    let urlCount : Nat = Option.get(_urlCountMapper.get(standardizedUrl), 0) + 1;
    _urlCountMapper.put(standardizedUrl, urlCount);
    
    _supply += 1;
    _nextTokenId += 1;
    token;
  };
  
  /**
   * Non-EXT functions
   */

  /*
   * ICP Transfer Validation
   */
  private func getBlock(blockId : Nat64) : async (Block) {
    let block = await ledgerC.block(blockId);
    switch (block) {
        case (#Err(_)) {
            assert(false);
            loop {};
        };
        case (#Ok(r)) {
            switch (r) {
                case (#Err(_)) {
                    assert(false);
                    loop {};
                };
                case (#Ok(b)) {
                    return b;
                };
            };
        };
    };
  };

  private func validateTransaction(caller : Principal, ulid : Text, blockId : Nat64, amount : Ledger.ICP) : async () {
    let block = await getBlock(blockId);
    let transfer = block.transaction.transfer;

    switch(_pendingOrders.get(caller)) {
      case (?approvedPrice) { // Caller has pendingOrder
        assert(approvedPrice.ulid == ulid);
        assert(approvedPrice.amount == amount);
      };
      case (_) { // No matching caller in pendingOrders
        assert(false);
      };
    };

    switch(transfer){
      case (#Send(t)) {
        assert(t.to == creatorWalletAddress); // confirm money went to creator's AccountId
        assert(t.amount == amount) // confirm amount paid
      };
      case (_) { // Fail if someone sends us a Mint or Burn transfer
        assert(false);
      };
    };

    switch(_orderHistory.get(Nat64.toText(blockId))) {
      case (?blockExists) {
        assert(false); // Fail if block exists in _orderHistory
      };
      case (_) {
        assert(true); // Pass if this is an unclaimed transaction
      };
    };
  };


  /**
   * Backup/Restore functions
   */
  
  public shared({caller}) func backupCurrentState() : async () {
    authorize(caller);
    await Backup.backupRegistry(await getRegistry());
    await Backup.backupTokenMetadata(await getTokens());
    await Backup.backupUrlCountMapper(await getUrlCountMapper());
    await Backup.backupPendingOrders(await getPendingOrders());
    await Backup.backupOrderHistory(await getOrderHistory());

    return;
  };

  public shared({caller}) func restoreState(versionsBack : Nat) : async () {
    authorize(caller);
    _registry := HashMap.fromIter(Option.get((await Backup.restoreRegistry(?versionsBack)), []).vals(), 0, ExtCore.TokenIndex.equal, ExtCore.TokenIndex.hash);
    _tokenMetadata := HashMap.fromIter(Option.get((await Backup.restoreTokens(?versionsBack)), []).vals(), 0, ExtCore.TokenIndex.equal, ExtCore.TokenIndex.hash);
    _urlCountMapper := HashMap.fromIter(Option.get((await Backup.restoreURLCountMapper(?versionsBack)), []).vals(), 0, Text.equal, Text.hash);
    _pendingOrders := HashMap.fromIter(Option.get((await Backup.restorePendingOrders(?versionsBack)), []).vals(), 0, Principal.equal, Principal.hash);
    _orderHistory := HashMap.fromIter(Option.get((await Backup.restoreOrderHistory(?versionsBack)), []).vals(), 0, Text.equal, Text.hash);

    return;
  };

  /**
   * Other functions
   */
  public query({caller}) func whoIsCalling() : async Principal {
    return caller;
  };

  public query func getRegistry() : async [(TokenIndex, AccountIdentifier)] {
    Iter.toArray(_registry.entries());
  };

  // Used by Stoic Wallet to import NFTs into user's wallet.
  public query func getTokens() : async [(TokenIndex, Metadata)] {
    Iter.toArray(_tokenMetadata.entries());
  };

  private func getUrlCountMapper() : async [(Text, Nat)] {
    Iter.toArray(_urlCountMapper.entries());
  };

  private func getPendingOrders() : async [(Principal, ApprovedPrice)] {
    Iter.toArray(_pendingOrders.entries());
  };

  public query func getOrderHistory() : async [(Text, TokenIndex)] {
    Iter.toArray(_orderHistory.entries());
  };

  public query func http_request(req: HttpHelper.HttpRequest): async (HttpHelper.HttpResponse) {
    let path = HttpHelper.removeQuery(req.url);

    if (path == "/") {
      // we should improve this extremely brittle query param processing. This relies on tokenId being the last query param.
      if (Text.contains(req.url, #text "tokenid=")) {

        let tokenIdentifierText = Option.get(List.last(Iter.toList(Text.split(req.url, #char '='))), "");

        if (ExtCore.TokenIdentifier.isPrincipal(tokenIdentifierText, Principal.fromActor(this)) == false) {
          return {
            body = Text.encodeUtf8("Invalid token " # tokenIdentifierText);
            headers = [];
            status_code = 404;
            streaming_strategy = null;
          };
        };

        let tokenIndex = ExtCore.TokenIdentifier.getIndex(tokenIdentifierText);
        let tokenMetadata : ExtCommon.Metadata = Option.get(_tokenMetadata.get(tokenIndex), #nonfungible({ metadata = null }));
        
        let (standardizedUrl : Text, snippet : Text, borderId : Text, selectedFlair : Text) = getMetaDataElements(tokenMetadata);

        let svgString = TokenImage.getSvgString(standardizedUrl, snippet, borderId, selectedFlair);
    
        return {
            body = Text.encodeUtf8(svgString);
            headers = [("content-type", "image/svg+xml")];
            status_code = 200;
            streaming_strategy = null;
        };

      };
        return {
            body = Text.encodeUtf8("Creator NFTs!");
            headers = [];
            status_code = 200;
            streaming_strategy = null;
        };
    };

    if (path == "/metrics") {
        return {
            body = Text.encodeUtf8("Metrics page :"  # path);
            headers = [];
            status_code = 200;
            streaming_strategy = null;
        };
    };

    return {
        body = Text.encodeUtf8("404 Not found :" # path);
        headers = [];
        status_code = 404;
        streaming_strategy = null;
    };
  };
  
  // Internal cycle management - good general case
  public func acceptCycles() : async () {
    let available = Cycles.available();
    let accepted = Cycles.accept(available);
    assert (accepted == available);
  };
  public query func availableCycles() : async Nat {
    return Cycles.balance();
  };

  public shared({caller}) func getPriceToMint(urlToMint : Text) : async ApprovedPrice {
    let urlCount : Nat = Option.get(_urlCountMapper.get(urlToMint), 0);
    // 1.00 ICP == 100_000_000 e8s
    // 0.30 ICP ==  30_000_000 e8s  // PRODUCTION
    // 0.02 ICP ==   2_000_000 e8s  // TEST
    let initialPrice : Ledger.ICP = { e8s = 30_000_000 };
    var cost : Nat64 = initialPrice.e8s;

    for(j in Iter.range(1, urlCount)) {
      cost *= 2;
    };
    Debug.print(debug_show("Cost", cost));
    Debug.print(debug_show("For URL:", urlToMint));

    let ulidMaker = SourceUlid.Source(rr, 0);
    let ulid = ULID.toText(ulidMaker.new());
    
    _pendingOrders.put(caller, { ulid = ulid; amount = { e8s = cost };}); // save caller and their ulid-stamped approved cost
    
    Debug.print(debug_show("ULID:", ulid));
    let response : ApprovedPrice = {
      amount = { e8s = cost };
      ulid = ulid;
    };
    return response;
  };
 
  public query func getUserNFTCount(user : User) : async Nat {
    let size = internalGetUserNFTCount(user);
    Debug.print(debug_show("currentUserNFTCount", size));
    return size;
  };
  
  public query func getUserNFTIndexes(user: User) : async [TokenIndex] {
      return List.toArray(internalGetUserNFTIndexes(user));
  };
  
  private func internalGetUserNFTCount(user : User) : Nat {
    let registry = Iter.toList(_registry.entries());

    let accountIdentifier = ExtCore.User.toAID(user);

    let currentUserNFTs : List.List<TokenIndex> = internalGetUserNFTIndexes(user);
    let size = List.size(currentUserNFTs);
    
    return size;
  };
  
  private func internalGetUserNFTIndexes(user : User) : List.List<TokenIndex> {
    let registry = Iter.toList(_registry.entries());
    
    let accountIdentifier = ExtCore.User.toAID(user);
    
    let currentUserNFTs : List.List<TokenIndex> =
        List.mapFilter(
            registry,
            func((tokenIndex, tokenAccountIdentifier): (TokenIndex, AccountIdentifier)) : ?TokenIndex {
                if (tokenAccountIdentifier == accountIdentifier) {
                    return ?tokenIndex;
                } else {
                    return null;
                };
            }
        );
    
    return currentUserNFTs;
  };

  private func getTokenBorderId(tokenIndex : TokenIndex) : Text {
    // Pseudo-random number generator for border selection
    let lfsrFeed = LFSR.LFSR8(null);
    // Number is Nat8, ranging 0–255
    let (randomNumber, _) = lfsrFeed.next();

    // This approximates an even distribution between borders
    if (randomNumber < 64) return "1";
    if (randomNumber < 128) return "2";
    if (randomNumber < 192) return "3";
    "4";
  };

  private func getMetaDataElements(tokenMetadata : ExtCommon.Metadata) : (Text, Text, Text, Text) {
    let metadataBlob = switch(tokenMetadata) {
      case (#fungible fungible) fungible.metadata;
      case (#nonfungible nonfungible) nonfungible.metadata;
    };

    let defaultText = "{\"rawUrl\":\"\", \"standardizedUrl\":\"\", \"snippet\":\"\"}";
    let metadataJsonTextOption = Option.map(metadataBlob, Text.decodeUtf8);
    let metadataJsonText = Option.get(Option.get(metadataJsonTextOption, ?(defaultText)), defaultText);

    let parser = JSON.Parser();
    let parsedMetadata: ?JSON.JSON = parser.parse(metadataJsonText);

    let standardizedUrl = getJsonTextAtKey(parsedMetadata, "standardizedUrl");
    let snippet = getJsonTextAtKey(parsedMetadata, "snippet");
    let borderId = getJsonTextAtKey(parsedMetadata, "borderId");
    let selectedFlair = getJsonTextAtKey(parsedMetadata, "selectedFlair");
    Debug.print(debug_show("StandardizedURL:",standardizedUrl));
    Debug.print(debug_show("Snippet:",snippet));
    Debug.print(debug_show("borderId:", borderId));
    Debug.print(debug_show("selectedFlair:", selectedFlair));

    return (standardizedUrl, snippet, borderId, selectedFlair);
  };

  // Gets a Text value from a JSON object with a given key. Returns "" if JSON or key are invalid.
  private func getJsonTextAtKey(json: ?JSON.JSON, key: Text) : Text {
    switch (json) {
        case (null) "";
        case (?v) {
            switch (v) {
                case (#Object(v)) {
                    switch (v.get(key)) {
                        case(? v) {
                            switch (v) {
                                case (#String(v)) v;
                                case (_) "";
                            };
                        };
                        case (_) "";
                    };
                };
                case (_) "";
            }
        };
    };
  };

  private func authorize(caller: Principal) : () {
    /*cspell:disable*/
    // TODO: add admin principal
    let adminDfx = Principal.fromText("");
    let anonymousPrincipal = Principal.fromText("2vxsx-fae");
    /*cspell:enable*/

    Debug.print("Authorizing caller..");
    Debug.print(debug_show("caller", caller));
    Debug.print(debug_show("authorized:", (caller == adminDfx or
                                           //caller == anonymousPrincipal or // For debugging. Don't deploy this code uncommented.
                                           caller == owner)));
    assert(caller == adminDfx or
           //caller == anonymousPrincipal or // For debugging. Don't deploy this code uncommented.
           caller == owner);
  }
}