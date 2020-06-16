import { SourceNodeTypeInfo, ISourceCollectionNodeWrapper, INodeSyncOptions, IGlobalNameOptions, NodeKind, config } from '../..';
import { CollectionUtils } from '../../rdo-node-wrappers/utils/collection.utils';
import { SourceBaseNW } from '../base/source-base-nw';
import { NodeTypeUtils } from '../../rdo-node-wrappers/utils/node-type.utils';
import { isIMakeCollectionKeyFromSourceElement } from '../../types';

export class SourceArrayNW<S> extends SourceBaseNW<S> implements ISourceCollectionNodeWrapper<S> {
  private _value: Array<S>;

  constructor({
    value,
    sourceNodePath,
    key,
    typeInfo,
    lastSourceNode,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    value: Array<S>;
    sourceNodePath: string;
    key: string | undefined;
    typeInfo: SourceNodeTypeInfo;
    lastSourceNode: any;
    matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
    globalNodeOptions: IGlobalNameOptions | undefined;
  }) {
    super({ sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions });
    this._value = value;
  }

  //------------------------------
  // ISourceNodeWrapper
  //------------------------------

  public get value() {
    return this._value;
  }

  public childElementCount(): number {
    return this._value.length;
  }

  //------------------------------
  // ISourceInternalNodeWrapper
  //------------------------------

  public nodeKeys() {
    return CollectionUtils.Array.getCollectionKeys({ collection: this._value, makeCollectionKey: this.makeCollectionKey });
  }

  public getItem(key: string) {
    return CollectionUtils.Array.getElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
  }

  public getNode(): any {
    return this._value;
  }

  //------------------------------
  // ISourceCollectionNodeWrapper
  //------------------------------

  // private _childElementsNodeKind: ChildElementsNodeKind | undefined;
  // public get ChildElementsNodeKind(): ChildElementsNodeKind {
  //   if (this._childElementsNodeKind === undefined) {
  //     const firstElement = this.elements()[Symbol.iterator]().next().value;
  //     if (firstElement) {
  //       this._childElementsNodeKind = NodeTypeUtils.getSourceNodeType(firstElement).kind;
  //     } else this._childElementsNodeKind = null;
  //   }
  //   return this._childElementsNodeKind;
  // }

  public makeCollectionKey(item: S) {
    // Use IMakeCollectionKey provided on options if available
    if (this.matchingNodeOptions?.makeRdoCollectionKey?.fromSourceElement) {
      return this.matchingNodeOptions.makeRdoCollectionKey.fromSourceElement(item);
    }

    if (isIMakeCollectionKeyFromSourceElement(this.wrappedRdoNode)) {
      return this.wrappedRdoNode.value.makeKeyFromSourceElement(item);
    }

    // If primitive, the item is the key
    if (NodeTypeUtils.isPrimitive(item)) {
      return String(item);
    }

    // Last option - look for idKey
    if (item[config.defaultIdKey]) {
      return item[config.defaultIdKey];
    }

    return undefined;
  }

  public elements(): Iterable<S> {
    return this._value;
  }
}
