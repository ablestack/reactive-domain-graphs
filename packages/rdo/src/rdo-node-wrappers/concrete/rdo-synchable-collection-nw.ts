import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncableRDOKeyBasedCollection, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeChange } from '../../types/event-types';
import { RdoKeyCollectionNWBase } from '../base/rdo-key-based-collection-nw-base';

const logger = Logger.make('RdoSyncableCollectionNW');

export class RdoSyncableCollectionNW<S, D> extends RdoKeyCollectionNWBase<S, D> {
  private _value: ISyncableRDOKeyBasedCollection<S, D>;

  constructor({
    value,
    typeInfo,
    key,
    mutableNodeCache,
    wrappedParentRdoNode,
    wrappedSourceNode,
    syncChildNode,
    defaultEqualityComparer,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    value: ISyncableRDOKeyBasedCollection<S, D>;
    typeInfo: NodeTypeInfo;
    key: string | number | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S, D>;
    defaultEqualityComparer: IEqualityComparer;
    syncChildNode: ISyncChildNode;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
    this._value = value;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get isLeafNode() {
    return false;
  }

  public get value() {
    return this._value;
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public elements(): Iterable<D> {
    return this._value.elements();
  }

  public childElementCount(): number {
    return this._value.size;
  }

  //------------------------------
  // RdoIndexCollectionNWBase
  //------------------------------
  protected onAdd = ({ key, newRdo }: { key: string | number; newRdo: any }) => {
    this.value.add({ key, newRdo });
    return true;
  };

  protected onReplace = ({ key, origRdo, newRdo }: { key: string | number; origRdo: any; newRdo: any }) => {
    this.value.replace({ key, origRdo, newRdo });
    return true;
  };

  protected onDelete = ({ key, origRdo }: { key: string | number; origRdo: any }) => {
    this.value.delete({ key, origRdo });
    return true;
  };
}
