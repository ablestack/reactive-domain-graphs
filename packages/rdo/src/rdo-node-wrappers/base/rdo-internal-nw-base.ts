import { Logger } from '../../infrastructure/logger';
import { RdoNWBase } from './rdo-nw-base';
import { IRdoInternalNodeWrapper, ISyncChildNode, NodeTypeInfo, IRdoNodeWrapper, ISourceNodeWrapper, INodeSyncOptions, IGlobalNodeOptions, isIMakeRdo, NodeTypeUtils, IEqualityComparer, IsICustomEqualityRDO } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { NodeChange } from '../../types/event-types';
import { observable } from 'mobx';
import { MutableNodeCache } from '../../infrastructure/mutable-node-cache';

const logger = Logger.make('RdoMapNW');

export abstract class RdoInternalNWBase<S, D> extends RdoNWBase<S, D> implements IRdoInternalNodeWrapper<S, D> {
  private _syncChildNode: ISyncChildNode;

  constructor({
    typeInfo,
    key,
    mutableNodeCache,
    wrappedParentRdoNode,
    wrappedSourceNode,
    syncChildNode,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    typeInfo: NodeTypeInfo;
    key: string | number | undefined;
    mutableNodeCache: MutableNodeCache;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S, D>;
    syncChildNode: ISyncChildNode;
    matchingNodeOptions: INodeSyncOptions<S, D> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<S, D>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
    this._syncChildNode = syncChildNode;
  }

  //------------------------------
  // Protected
  //------------------------------
  protected get syncChildNode(): ISyncChildNode {
    return this._syncChildNode;
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------
  public makeRdoElement(sourceObject: any) {
    let rdo: any = undefined;
    if (this.getNodeOptions()?.makeRdo) {
      rdo = this.getNodeOptions()!.makeRdo!(sourceObject);
      logger.trace(`makeRdoElement - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making RDO from nodeOptions`, sourceObject, rdo);
    }

    if (!rdo && isIMakeRdo(this.value)) {
      rdo = this.value.makeRdo(sourceObject);
      logger.trace(`makeRdoElement - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making RDO from IMakeRdo`, sourceObject, rdo);
    }

    if (!rdo && this.globalNodeOptions?.makeRdo) {
      rdo = this.globalNodeOptions.makeRdo(sourceObject);
      logger.trace(`makeRdoElement - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making RDO from globalNodeOptions`, sourceObject, rdo);
    }

    if (!rdo && NodeTypeUtils.isPrimitive(sourceObject)) {
      rdo = sourceObject;
      logger.trace(`makeRdoElement - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making RDO from primitive`, sourceObject, rdo);
    }

    // Auto-create Rdo object field if autoMakeRdoTypes.collectionElements
    // Note: this creates an observable tree in the exact shape of the source data
    // It is recommended to consistently use autoMakeRdo* OR consistently provide customMakeRdo methods. Blending both can lead to unexpected behavior
    // Keys made here, instantiation takes place in downstream constructors
    if (!rdo && this.globalNodeOptions?.autoMakeRdoTypes?.collectionElements) {
      if (this.globalNodeOptions.autoMakeRdoTypes.as === 'mobx-observable-object-literals') {
        rdo = this.autoInstantiateNodeAsMobxObservables(sourceObject);
      } else {
        this.autoInstantiateNodeAsPlainObjectLiterals(sourceObject);
      }

      logger.trace(`makeRdoElement - sourceNodeTypePath: ${this.wrappedSourceNode.sourceNodeTypePath} - making RDO from autoMakeRdoTypes`, sourceObject, rdo);
    }
    return rdo;
  }

  public abstract getRdoNodeItem(key: string | number);

  //------------------------------
  // Private
  //------------------------------

  // AUTO INSTANTIATE
  // Always return empty objects or collections, as these will get synced downstream

  private autoInstantiateNodeAsMobxObservables(sourceObject: any) {
    const typeInfo = NodeTypeUtils.getNodeType(sourceObject);

    switch (typeInfo.kind) {
      case 'Primitive': {
        return observable.box(sourceObject);
      }
      case 'Collection': {
        return observable(new Array());
      }
      case 'Object': {
        return observable(new Object());
      }
    }
  }

  //
  // Just needs to return empty objects or collections, as these will get synced downstream
  private autoInstantiateNodeAsPlainObjectLiterals(sourceObject: any) {
    const typeInfo = NodeTypeUtils.getNodeType(sourceObject);

    switch (typeInfo.kind) {
      case 'Primitive': {
        return sourceObject;
      }
      case 'Collection': {
        return new Array();
      }
      case 'Object': {
        return new Object();
      }
    }
  }
}
