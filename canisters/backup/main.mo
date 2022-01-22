// Backup NFT canister

import AID "mo:ext/util/AccountIdentifier";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import ExtCommon "mo:ext/Common";
import ExtCore "mo:ext/Core";
import ExtNonFungible "mo:ext/NonFungible";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import JSON "mo:json/JSON";
import Ledger "../nft/Ledger";

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

  private stable let versionsToKeep : Nat = 10;
  
  // State management functions
  system func preupgrade() {
    _registryBackupsState := List.toArray<[(TokenIndex, AccountIdentifier)]>(_registryBackups);
    _tokenMetadataBackupsState := List.toArray<[(TokenIndex, Metadata)]>(_tokenMetadataBackups);
    _urlCountBackupsState := List.toArray<[(Text, Nat)]>(_urlCountMapperBackups);
    _pendingOrderBackupState := List.toArray<[(Principal, ApprovedPrice)]>(_pendingOrderBackups);
    _orderHistoryBackupState := List.toArray<[(Text, TokenIndex)]>(_orderHistoryBackups);
  };
  system func postupgrade() {
    _registryBackupsState := [];
    _tokenMetadataBackupsState := [];
    _urlCountBackupsState := [];
    _pendingOrderBackupState := [];
    _orderHistoryBackupState := [];
  };
  
  /**
   * Non-EXT functions
   */

  /**
   * Debug functions
   */
  public query({caller}) func logRegistryBackups() : async () {
    authorize(caller);
    Debug.print(debug_show("_registryBackups", _registryBackups));
    return;
  };
  
  public query({caller}) func logTokenMetadataBackups() : async () {
    authorize(caller);
    Debug.print(debug_show("_tokenMetadataBackups", _registryBackups));
    return;
  };

  public query({caller}) func logUrlCountMapperBackups() : async () {
    authorize(caller);
    Debug.print(debug_show("_urlCountMapperBackups", _registryBackups));
    return;
  };

  public query({caller}) func logPendingOrderBackups() : async () {
    authorize(caller);
    Debug.print(debug_show("_pendingOrderBackups", _pendingOrderBackups));
    return;
  };

  public query({caller}) func logOrderHistoryBackups() : async () {
    authorize(caller);
    Debug.print(debug_show("_orderHistoryBackups", _orderHistoryBackups));
    return;
  };
  
  /**
   * Restoration functions
   */
  
  public shared({caller}) func restoreRegistry(versionsBack : ?Nat) : async ?[(TokenIndex, AccountIdentifier)] {
    authorize(caller);
    
    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_registryBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };
  
  public shared({caller}) func restoreTokens(versionsBack : ?Nat) : async ?[(TokenIndex, Metadata)] {
    authorize(caller);

    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_tokenMetadataBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };

  public shared({caller}) func restoreURLCountMapper(versionsBack : ?Nat) : async ?[(Text, Nat)] {
    authorize(caller);
    
    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_urlCountMapperBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };

  public shared({caller}) func restorePendingOrders(versionsBack : ?Nat) : async ?[(Principal, ApprovedPrice)] {
    authorize(caller);
    
    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_pendingOrderBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };

  public shared({caller}) func restoreOrderHistory(versionsBack : ?Nat) : async ?[(Text, TokenIndex)] {
    authorize(caller);
    
    let versionsBackOption = Option.get(versionsBack, 0);
    let versionData = List.get(_orderHistoryBackups, versionsBackOption);
    Debug.print(debug_show("Returning restored data:", versionData));

    return versionData;
  };

  /*
   * Backup functions
   */
  
  public shared({caller}) func backupRegistry(data : [(TokenIndex, AccountIdentifier)]) : async () {
    authorize(caller);

    Debug.print(debug_show("registryToBackUp", data));

    _registryBackups := List.push(data, _registryBackups);    
    _registryBackups := List.split(versionsToKeep, _registryBackups).0;

    return;
  };

  public shared({caller}) func backupTokenMetadata(data : [(TokenIndex, Metadata)]) : async () {
    authorize(caller);

    Debug.print(debug_show("tokensToBackUp", data));
    
    _tokenMetadataBackups := List.push(data, _tokenMetadataBackups);    
    _tokenMetadataBackups := List.split(versionsToKeep, _tokenMetadataBackups).0;

    return;
  };

  public shared({caller}) func backupUrlCountMapper(data : [(Text, Nat)]) : async () {
    authorize(caller);

    Debug.print(debug_show("UrlsToBackUp", data));

    _urlCountMapperBackups := List.push(data, _urlCountMapperBackups);
    _urlCountMapperBackups := List.split(versionsToKeep, _urlCountMapperBackups).0;
    
    return;
  };

  public shared({caller}) func backupPendingOrders(data : [(Principal, ApprovedPrice)]) : async () {
    authorize(caller);

    Debug.print(debug_show("PendingOrdersToBackUp", data));

    _pendingOrderBackups := List.push(data, _pendingOrderBackups);
    _pendingOrderBackups := List.split(versionsToKeep, _pendingOrderBackups).0;
    
    return;
  };

  public shared({caller}) func backupOrderHistory(data : [(Text, TokenIndex)]) : async () {
    authorize(caller);

    Debug.print(debug_show("OrderHistoryToBackUp", data));

    _orderHistoryBackups := List.push(data, _orderHistoryBackups);
    _orderHistoryBackups := List.split(versionsToKeep, _orderHistoryBackups).0;
    
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

  private func authorize(caller: Principal) : () {
    /* cspell:disable */
    // TODO: fill in adminDfx principal
    let adminDfx = Principal.fromText("");
    // TODO: fill in deployed NFT canister principal
    let nftCanister = Principal.fromText("");
    let anonymousPrincipal = Principal.fromText("2vxsx-fae");
    /* cspell:enable */
    
    Debug.print("Authorizing caller..");
    Debug.print(debug_show("caller", caller));
    Debug.print(debug_show("authorized:", (caller == nftCanister  or
                                           //caller == anonymousPrincipal or // For debugging. Don't deploy this code uncommented.
                                           caller == adminDfx)));
    assert(caller == nftCanister  or
           //caller == anonymousPrincipal or // For debugging. Don't deploy this code uncommented.
           caller == adminDfx);
  }
};