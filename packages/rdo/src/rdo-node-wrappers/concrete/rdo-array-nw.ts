import { IEqualityComparer, IGlobalNodeOptions, INodeSyncOptions, IRdoInternalNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';
import { NodeChange } from '../../types/event-types';
import { RdoIndexCollectionNWBase } from '../base/rdo-index-collection-nw-base';

const logger = Logger.make('RdoArrayNW');

export class RdoArrayNW<S, D> extends RdoIndexCollectionNWBase<string, S, D> {
  private _value: Array<D>;

  constructor({
    value,
    typeInfo,
    key,
    mutableNodeCache,
    wrappedParentRdoNode,
    wrappedSourceNode,
    defaultEqualityComparer,
    syncChildNode,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    value: Array<D>;
    typeInfo: NodeTypeInfo;
    key: string | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<string, S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<string, S, D>;
    defaultEqualityComparer: IEqualityComparer;
    syncChildNode: ISyncChildNode;
    matchingNodeOptions: INodeSyncOptions<string, S, D> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
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
  // IRdoInternalNodeWrapper
  //------------------------------
  public getItem(key: string) {
    //this.getNodeInstanceCache()
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public elements(): Iterable<D> {
    return this._value;
  }

  public childElementCount(): number {
    return this._value.length;
  }

  //------------------------------
  // RdoIndexCollectionNWBase
  //------------------------------
  protected onNewIndex = ({ index, key, rdo }: { index: number; key: string; rdo: any }) => {
    this.value.splice(index, 0, rdo);
    return true;
  };

  protected onReplaceIndex = ({ index, key, rdo }: { index: number; key: string; rdo: any }) => {
    this.value.splice(index, 1, rdo);
    return true;
  };

  protected onDeleteIndex = ({ index, key, rdo }: { index: number; key: string; rdo: any }) => {
    this.value.splice(index, 1);
    return true;
  };
}
