import { RdoCollectionNWBase, RdoWrapperValidationUtils } from '..';
import { IGlobalNameOptions, INodeSyncOptions, IRdoNodeWrapper, isISourceCollectionNodeWrapper, ISourceNodeWrapper, ISyncChildNode, RdoNodeTypeInfo } from '../..';
import { Logger } from '../../infrastructure/logger';
import { CollectionUtils } from '../utils/collection.utils';
import { SyncUtils } from '../utils/sync.utils';

const logger = Logger.make('RdoSetNW');

export class RdoSetNW<S, D> extends RdoCollectionNWBase<S, D> {
  private _value: Set<D>;

  constructor({
    value,
    typeInfo,
    key,
    wrappedParentRdoNode,
    wrappedSourceNode,
    syncChildNode,
    matchingNodeOptions,
    globalNodeOptions,
  }: {
    value: Set<D>;
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    syncChildNode: ISyncChildNode<S, D>;
    matchingNodeOptions: INodeSyncOptions<S, D> | undefined;
    globalNodeOptions: IGlobalNameOptions | undefined;
  }) {
    super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions });
    this._value = value;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get value() {
    return this._value;
  }

  public itemKeys() {
    if (this.childElementCount() === 0) return [];
    return CollectionUtils.Set.getCollectionKeys({ collection: this._value, makeCollectionKey: this.makeCollectionKey });
  }

  public getElement(key: string) {
    if (this.childElementCount() === 0) return undefined;
    return CollectionUtils.Set.getElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey!, key });
  }

  public updateElement(key: string, value: D) {
    if (this.childElementCount() === 0) return false;
    return CollectionUtils.Set.updateElement<D>({ collection: this._value, makeCollectionKey: this.makeCollectionKey, value });
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public smartSync(): boolean {
    if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
      return this.clearElements();
    } else {
      RdoWrapperValidationUtils.nonKeyedCollectionSizeCheck({ sourceNodePath: this.wrappedSourceNode.sourceNodePath, collectionSize: this.childElementCount(), collectionType: this.typeInfo.builtInType });

      if (!isISourceCollectionNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);

      // Execute
      return SyncUtils.synchronizeCollection({ rdo: this, syncChildNode: this._syncChildNode });
    }
  }

  //------------------------------
  // IRdoCollectionNodeWrapper
  //------------------------------
  public elements(): Iterable<D> {
    return this._value.values();
  }

  public childElementCount(): number {
    return this._value.size;
  }

  public insertElement(value: D) {
    const key = this.makeCollectionKey(value);
    CollectionUtils.Set.insertElement({ collection: this._value, key, value });
  }

  public deleteElement(key: string): boolean {
    return CollectionUtils.Set.deleteElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
  }

  public clearElements(): boolean {
    if (this.childElementCount() === 0) return false;
    this._value.clear();
    return true;
  }
}
