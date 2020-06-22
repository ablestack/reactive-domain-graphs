import _ from 'lodash';
import { config, IGlobalNodeOptions, INodeSyncOptions, IRdoCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, NodeTypeInfo } from '../..';
import { EventEmitter } from '../../infrastructure/event-emitter';
import { Logger } from '../../infrastructure/logger';
import { IRdoInternalNodeWrapper, isIMakeCollectionKeyFromRdoElement, isISourceCollectionNodeWrapper } from '../../types';
import { NodeChange } from '../../types/event-types';
import { NodeTypeUtils } from '../utils/node-type.utils';
import { RdoInternalNWBase } from './rdo-internal-nw-base';

const logger = Logger.make('RdoCollectionNWBase');

export abstract class RdoCollectionNWBase<K extends string | number, S, D> extends RdoInternalNWBase<K, S, D> implements IRdoCollectionNodeWrapper<K, S, D> {
  constructor({
    typeInfo,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    syncChildNode,
    matchingNodeOptions,
    globalNodeOptions,
    targetedOptionMatchersArray,
    eventEmitter,
  }: {
    typeInfo: NodeTypeInfo;
    key: K | undefined;
    wrappedParentRdoNode: IRdoInternalNodeWrapper<K, S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<K, S, D>;
    syncChildNode: ISyncChildNode;
    matchingNodeOptions: INodeSyncOptions<any, any, any> | undefined;
    globalNodeOptions: IGlobalNodeOptions | undefined;
    targetedOptionMatchersArray: Array<INodeSyncOptions<any, any, any>>;
    eventEmitter: EventEmitter<NodeChange>;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
  }

  //------------------------------
  // Protected
  //------------------------------
  protected synchronizeCollection() {
    const syncChildNode = this._syncChildNode;

    let changed = false;
    const sourceKeys = new Array<K>();
    let targetCollectionInitiallyEmpty = this.childElementCount() === 0;

    if (this.wrappedSourceNode.childElementCount() > 0) {
      if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error('Can only sync Rdo collection types with Rdo source types');
      const sourceCollection = this.wrappedSourceNode.elements();

      for (const sourceItem of sourceCollection) {
        if (sourceItem === null || sourceItem === undefined) continue;
        // Make key

        const key = this.wrappedSourceNode.makeCollectionKey(sourceItem);
        if (!key) throw Error(`this.wrappedSourceNode.makeKey produced null or undefined. It must be defined when sourceCollection.length > 0`);

        // Track keys so can be used in target item removal later
        sourceKeys.push(key);

        // Get or create target item
        let targetItem: D | null | undefined = undefined;
        if (this.childElementCount() > 0) {
          targetItem = this.getItem(key);
        }

        // If no target item, Make
        if (targetItem === null || targetItem === undefined) {
          if (!this.makeRdoElement) throw Error(`sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - this.makeItem wan null or undefined. It must be defined when targetItem collection not empty`);
          targetItem = this.makeRdoElement(sourceItem);
          if (!targetItem) {
            throw Error(`sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - this.makeRdoElement produced null or undefined`);
          }
          this.insertItem(key, targetItem);
          changed = true;
          this.eventEmitter.publish('nodeChange', { changeType: 'create', sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceKey: key, rdoKey: key, oldSourceValue: undefined, newSourceValue: sourceItem });
        }

        // Update directly if Leaf node
        // Or else step into child and sync
        if (!sourceItem || NodeTypeUtils.isPrimitive(sourceItem)) {
          logger.trace(`Skipping child sync. Item '${key}' in collection is undefined, null, or Primitive`, sourceItem);
        } else {
          logger.trace(`Syncing item '${key}' in collection`, sourceItem);
          changed = syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemValue: targetItem, rdoNodeItemKey: key, sourceNodeItemKey: key }) && changed;
        }
      }
    }

    // short-cutting this check when initial collection was empty.
    // This id a performance optimization and also (indirectly)
    // allows for auto collection methods based on target item types
    if (!targetCollectionInitiallyEmpty) {
      if (!this.itemKeys) throw Error(`getTargetCollectionKeys wan null or undefined. It must be defined when targetCollection.length > 0`);
      if (!this.deleteElement) throw Error(`tryDeleteItemFromTargetCollection wan null or undefined. It must be defined when targetCollection.length > 0`);
      // If destination item missing from source - remove from destination
      const targetCollectionKeys = Array.from<K>(this.itemKeys());
      const targetCollectionKeysInDestinationOnly = _.difference(targetCollectionKeys, sourceKeys);
      if (targetCollectionKeysInDestinationOnly.length > 0) {
        targetCollectionKeysInDestinationOnly.forEach((key) => {
          const deletedItem = this.deleteElement(key);
          this.eventEmitter.publish('nodeChange', { changeType: 'delete', sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceKey: key, rdoKey: key, oldSourceValue: deletedItem, newSourceValue: undefined });
        });
        changed = true;
      }
    }

    return changed;
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  // private _childElementSourceNodeKind: ChildElementsNodeKind | undefined = undefined;
  // public get childElementsNodeKind(): ChildElementsNodeKind {
  //   if (!this._childElementSourceNodeKind) {
  //     // Try and get element type from source collection
  //     const firstElement = this.elements()[Symbol.iterator]().next().value;
  //     if (firstElement) {
  //       this._childElementSourceNodeKind = NodeTypeUtils.getNodeType(firstElement).kind;
  //     } else this._childElementSourceNodeKind = null;
  //   }
  //   return this._childElementSourceNodeKind;
  // }

  public makeCollectionKey = (item: D) => {
    // Use IMakeCollectionKey provided on options if available
    if (this.getNodeOptions()?.makeRdoCollectionKey?.fromRdoElement) {
      const key = this.getNodeOptions()!.makeRdoCollectionKey!.fromRdoElement(item);
      logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from nodeOptions: ${key}`);
      return key;
    }

    if (isIMakeCollectionKeyFromRdoElement(this.value)) {
      const key = this.value.makeCollectionKeyFromRdoElement(item);
      logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from IMakeCollectionKeyFromRdoElement: ${key}`);
      return key;
    }

    // If primitive, the item is the key
    if (NodeTypeUtils.isPrimitive(item)) {
      const key = item;
      logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from Primitive value: ${key}`);
      return key;
    }

    // Look for idKey
    if (config.defaultIdKey in item) {
      const key = item[config.defaultIdKey];
      logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from defaultIdKey: ${key}`);
      return key;
    }

    // Look for idKey with common postfix
    if (this.globalNodeOptions?.commonRdoFieldnamePostfix) {
      const defaultIdKeyWithPostfix = `${config.defaultIdKey}${this.globalNodeOptions.commonRdoFieldnamePostfix}`;
      if (defaultIdKeyWithPostfix in item) {
        const key = item[defaultIdKeyWithPostfix];
        logger.trace(`makeCollectionKey - sourceNodePath: ${this.wrappedSourceNode.sourceNodePath} - making key from defaultIdKeyWithPostfix: ${key}`);
        return key;
      }
    }

    throw new Error(`Path: ${this.wrappedSourceNode.sourceNodePath} - could not find makeKeyFromRdoElement implementation either via config or interface. See documentation for details`);
  };

  public abstract elements(): Iterable<D>;
  public abstract childElementCount();
  public abstract clearElements();
  public abstract insertItem(key: K, value: D);
  public abstract deleteElement(key: K): D | undefined;
}
