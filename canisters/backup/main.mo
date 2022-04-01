// Backup NFT canister

import AID "mo:ext/util/AccountIdentifier";
import Array "mo:base/Array";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import ExtCommon "mo:ext/Common";
import ExtCore "mo:ext/Core";
import ExtNonFungible "mo:ext/NonFungible";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import JSON "mo:json/JSON";
import Ledger "../nft/Ledger";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";

actor Backup {
  // Types
  type AccountIdentifier = ExtCore.AccountIdentifier;
  type TokenIndex  = ExtCore.TokenIndex ;
  type Extension = ExtCore.Extension;
  type Metadata = ExtCommon.Metadata;
  public type ApprovedPrice = {
    ulid : Text;
    amount : Ledger.ICP;
  };
  
  // This type must be kept in sync with the type of the same name in backup/main.mo
  public type RawCreatorPost = {
    postLabel : Text;
    content : Text;
    nftRequirement : Nat;
    timestamp: Nat;

    id : Text;
    categoryId : Text;
    creatorId : Text;
  };

  // This type must be kept in sync with the type of the same name in backup/main.mo
  public type RawCreatorCategory = {
    categoryLabel : Text;
    nftRequirement: Nat;
    order: Nat;
    
    id : Text;
    postIds: [Text];
  };

  // This type must be kept in sync with the type of the same name in backup/main.mo
  public type RawCreator = {
    name : Text;
    avatarUrl : Text;
    
    id : Text;
  };

  private let EXTENSIONS : [Extension] = ["@ext/common", "@ext/nonfungible"];
  
  // State variables
  private stable var _registryBackupsState : [[(TokenIndex, AccountIdentifier)]] = [[]];
  private var _registryBackups : List.List<[(TokenIndex, AccountIdentifier)]> = List.fromArray<[(TokenIndex, AccountIdentifier)]>(_registryBackupsState);

  private stable var _tokenMetadataBackupsState : [[(TokenIndex, Metadata)]] = [[]];
  private var _tokenMetadataBackups : List.List<[(TokenIndex, Metadata)]> = List.fromArray<[(TokenIndex, Metadata)]>(_tokenMetadataBackupsState);

  private stable var _urlCountBackupsState : [[(Text, Nat)]] = [[]];
  private var _urlCountMapperBackups : List.List<[(Text, Nat)]> = List.fromArray<[(Text, Nat)]>(_urlCountBackupsState);

  private stable var _pendingOrderBackupState : [[(Principal, ApprovedPrice)]] = [[]]; // (UUID, ApprovedPrice)
  private var _pendingOrderBackups : List.List<[(Principal, ApprovedPrice)]> = List.fromArray<[(Principal, ApprovedPrice)]>(_pendingOrderBackupState);

  private stable var _orderHistoryBackupState : [[(Text, TokenIndex)]] = [[]]; // (BlockId, TokenIndexPurchasedByBlockId)
  private var _orderHistoryBackups : List.List<[(Text, TokenIndex)]> = List.fromArray<[(Text, TokenIndex)]>(_orderHistoryBackupState);

  private stable var _refundsBackupState : [[(Text, Text)]] = [[]]; // (PurchaseTxId, RefundTxId)
  private var _refundsBackups : List.List<[(Text, Text)]> = List.fromArray<[(Text, Text)]>(_refundsBackupState);
  
  private stable var _creatorBackupState : [[(Text, RawCreator)]] = [[]];
  private var _creatorBackups : List.List<[(Text, RawCreator)]> = List.fromArray<[(Text, RawCreator)]>(_creatorBackupState);

  private stable var _creatorPostBackupState : [[(Text, RawCreatorPost)]] = [[]];
  private var _creatorPostBackups : List.List<[(Text, RawCreatorPost)]> = List.fromArray<[(Text, RawCreatorPost)]>(_creatorPostBackupState);

  private stable var _creatorCategoryBackupState : [[(Text, RawCreatorCategory)]] = [[]];
  private var _creatorCategoryBackups : List.List<[(Text, RawCreatorCategory)]> = List.fromArray<[(Text, RawCreatorCategory)]>(_creatorCategoryBackupState);

  private stable let versionsToKeep : Nat = 10;
  
  // State management functions
  system func preupgrade() {
    _registryBackupsState := List.toArray<[(TokenIndex, AccountIdentifier)]>(_registryBackups);
    _tokenMetadataBackupsState := List.toArray<[(TokenIndex, Metadata)]>(_tokenMetadataBackups);
    _urlCountBackupsState := List.toArray<[(Text, Nat)]>(_urlCountMapperBackups);
    _pendingOrderBackupState := List.toArray<[(Principal, ApprovedPrice)]>(_pendingOrderBackups);
    _orderHistoryBackupState := List.toArray<[(Text, TokenIndex)]>(_orderHistoryBackups);
    _refundsBackupState := List.toArray<[(Text, Text)]>(_refundsBackups);
    _creatorBackupState := List.toArray<[(Text, RawCreator)]>(_creatorBackups);
    _creatorPostBackupState := List.toArray<[(Text, RawCreatorPost)]>(_creatorPostBackups);
    _creatorCategoryBackupState := List.toArray<[(Text, RawCreatorCategory)]>(_creatorCategoryBackups);
  };
  system func postupgrade() {
    _registryBackupsState := [];
    _tokenMetadataBackupsState := [];
    _urlCountBackupsState := [];
    _pendingOrderBackupState := [];
    _orderHistoryBackupState := [];
    _refundsBackupState := [];
    _creatorBackupState := [];
    _creatorPostBackupState := [];
    _creatorCategoryBackupState := [];
  };
  
  /**
   * Non-EXT functions
   */

   /**
    * Debug functions
    */
  public query({caller}) func logRegistryBackups() : async () {
    assertIsContentCreator(caller);
    Debug.print(debug_show("_registryBackups", _registryBackups));
    return;
  };
  
  public query({caller}) func logTokenMetadataBackups() : async () {
    assertIsContentCreator(caller);
    Debug.print(debug_show("_tokenMetadataBackups", _registryBackups));
    return;
  };

  public query({caller}) func logUrlCountMapperBackups() : async () {
    assertIsContentCreator(caller);
    Debug.print(debug_show("_urlCountMapperBackups", _registryBackups));
    return;
  };

  public query({caller}) func logPendingOrderBackups() : async () {
    assertIsContentCreator(caller); // do not expose to unauthorized users.  contains price approval guid.
    Debug.print(debug_show("_pendingOrderBackups", _pendingOrderBackups));
    return;
  };

  public query({caller}) func logOrderHistoryBackups() : async () {
    assertIsContentCreator(caller);
    Debug.print(debug_show("_orderHistoryBackups", _orderHistoryBackups));
    return;
  };

  public query({caller}) func logRefundsBackups() : async () {
    assertIsContentCreator(caller);
    Debug.print(debug_show("_refundsBackups", _refundsBackups));
    return;
  };

  public query({caller}) func logCreatorBackups() : async () {
    assertIsContentCreator(caller);
    Debug.print(debug_show("_creatorBackups", _creatorBackups));
    return;
  };

  public query({caller}) func logCreatorPostBackups() : async () {
    assertIsContentCreator(caller);
    Debug.print(debug_show("_creatorPostBackups", _creatorPostBackups));
    return;
  };

  public query({caller}) func logCreatorCategoryBackups() : async () {
    assertIsContentCreator(caller);
    Debug.print(debug_show("_creatorCategoryBackups", _creatorCategoryBackups));
    return;
  };
  
  /**
   * Restoration functions
   */
  
  public shared({caller}) func restoreRegistry(versionsBack : ?Nat) : async ?[(TokenIndex, AccountIdentifier)] {
    assertIsContentCreator(caller);
    
    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_registryBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };
  
  public shared({caller}) func restoreTokens(versionsBack : ?Nat) : async ?[(TokenIndex, Metadata)] {
    assertIsContentCreator(caller);

    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_tokenMetadataBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };

  public shared({caller}) func restoreURLCountMapper(versionsBack : ?Nat) : async ?[(Text, Nat)] {
    assertIsContentCreator(caller);
    
    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_urlCountMapperBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };

  public shared({caller}) func restorePendingOrders(versionsBack : ?Nat) : async ?[(Principal, ApprovedPrice)] {
    assertIsContentCreator(caller);
    
    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_pendingOrderBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };

  public shared({caller}) func restoreOrderHistory(versionsBack : ?Nat) : async ?[(Text, TokenIndex)] {
    assertIsContentCreator(caller);
    
    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_orderHistoryBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };

  public shared({caller}) func restoreRefunds(versionsBack : ?Nat) : async ?[(Text, Text)] {
    assertIsContentCreator(caller);

    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_refundsBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };

  public shared({caller}) func restoreCreators(versionsBack : ?Nat) : async ?[(Text, RawCreator)] {
    assertIsContentCreator(caller);

    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_creatorBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };

  public shared({caller}) func restoreCreatorPosts(versionsBack : ?Nat) : async ?[(Text, RawCreatorPost)] {
    assertIsContentCreator(caller);

    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_creatorPostBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };

  public shared({caller}) func restoreCreatorCategories(versionsBack : ?Nat) : async ?[(Text, RawCreatorCategory)] {
    assertIsContentCreator(caller);

    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_creatorCategoryBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };

  /*
   * Backup functions
   */
  
  public shared({caller}) func backupRegistry(data : [(TokenIndex, AccountIdentifier)]) : async () {
    assertIsContentCreator(caller);

    Debug.print(debug_show("registryToBackUp", data));

    _registryBackups := List.push(data, _registryBackups);    
    _registryBackups := List.split(versionsToKeep, _registryBackups).0;

    return;
  };

  public shared({caller}) func backupTokenMetadata(data : [(TokenIndex, Metadata)]) : async () {
    assertIsContentCreator(caller);

    Debug.print(debug_show("tokensToBackUp", data));
    
    _tokenMetadataBackups := List.push(data, _tokenMetadataBackups);    
    _tokenMetadataBackups := List.split(versionsToKeep, _tokenMetadataBackups).0;

    return;
  };

  public shared({caller}) func backupUrlCountMapper(data : [(Text, Nat)]) : async () {
    assertIsContentCreator(caller);

    Debug.print(debug_show("UrlsToBackUp", data));

    _urlCountMapperBackups := List.push(data, _urlCountMapperBackups);
    _urlCountMapperBackups := List.split(versionsToKeep, _urlCountMapperBackups).0;
    
    return;
  };

  public shared({caller}) func backupPendingOrders(data : [(Principal, ApprovedPrice)]) : async () {
    assertIsContentCreator(caller);

    Debug.print(debug_show("PendingOrdersToBackUp", data));

    _pendingOrderBackups := List.push(data, _pendingOrderBackups);
    _pendingOrderBackups := List.split(versionsToKeep, _pendingOrderBackups).0;
    
    return;
  };

  public shared({caller}) func backupOrderHistory(data : [(Text, TokenIndex)]) : async () {
    assertIsContentCreator(caller);

    Debug.print(debug_show("OrderHistoryToBackUp", data));

    _orderHistoryBackups := List.push(data, _orderHistoryBackups);
    _orderHistoryBackups := List.split(versionsToKeep, _orderHistoryBackups).0;
    
    return;
  };

  public shared({caller}) func backupRefunds(data : [(Text, Text)]) : async () {
    assertIsContentCreator(caller);

    Debug.print(debug_show("RefundsToBackUp", data));

    _refundsBackups := List.push(data, _refundsBackups);
    _refundsBackups := List.split(versionsToKeep, _refundsBackups).0;

    return;
  };

  public shared({caller}) func backupCreators(data : [(Text, RawCreator)]) : async () {
    assertIsContentCreator(caller);

    Debug.print(debug_show("RefundsToBackUp", data));

    _creatorBackups := List.push(data, _creatorBackups);
    _creatorBackups := List.split(versionsToKeep, _creatorBackups).0;

    return;
  };

  public shared({caller}) func backupCreatorPosts(data : [(Text, RawCreatorPost)]) : async () {
    assertIsContentCreator(caller);

    Debug.print(debug_show("RefundsToBackUp", data));

    _creatorPostBackups := List.push(data, _creatorPostBackups);
    _creatorPostBackups := List.split(versionsToKeep, _creatorPostBackups).0;

    return;
  };

  public shared({caller}) func backupCreatorCategories(data : [(Text, RawCreatorCategory)]) : async () {
    assertIsContentCreator(caller);

    Debug.print(debug_show("RefundsToBackUp", data));

    _creatorCategoryBackups:= List.push(data, _creatorCategoryBackups);
    _creatorCategoryBackups := List.split(versionsToKeep, _creatorCategoryBackups).0;

    return;
  };
  public func acceptCycles() : async () {
    let available = Cycles.available();
    let accepted = Cycles.accept(available);
    assert (accepted == available);
  };

  public query func availableCycles() : async Nat {
    return Cycles.balance();
  };

  /* cspell:disable */
  // TODO: fill in adminDfx principal
  private let creatorPrincipal = Principal.fromText("2vxsx-fae");
  // TODO fill in deployed NFT canister principal
  private let nftCanister = Principal.fromText("2vxsx-fae");
  /* cspell:enable */
  private let creatorPrincipals : [Principal] = [
    creatorPrincipal,
    nftCanister,
  ];
  private func internalIsContentCreator(caller : Principal): Bool {
    let foundPrincipal = Array.find(
      creatorPrincipals,
      func (entry : Principal) : Bool {
        return entry == caller;
      }
    );
    let isCreator = switch (foundPrincipal) {
      case (?foundPrincipal) {
        true;
      };
      case (null) {
        false;
      };
    };
    
    Debug.print(debug_show("Is content creator caller:", isCreator, caller));
    
    return isCreator;
  };

  private func assertIsContentCreator(caller: Principal) : () {
    assert(internalIsContentCreator(caller));
  };
};