import { comparers, IEqualityComparer, IGlobalNameOptions, IGraphSynchronizer, IGraphSyncOptions, INodeSyncOptions, InternalNodeKind, IRdoInternalNodeWrapper, IRdoNodeWrapper, isISourceInternalNodeWrapper, SourceNodeWrapperFactory, IWrapRdoNode } from '.';
import { Logger } from './infrastructure/logger';
import { RdoNodeWrapperFactory } from './rdo-node-wrappers/rdo-node-wrapper-factory';

const logger = Logger.make('GraphSynchronizer');

/**
 *
 *
 * @export
 * @class GraphSynchronizer
 */
export class GraphSynchronizer implements IGraphSynchronizer {
  // ------------------------------------------------------------------------------------------------------------------
  // INTERNAL STATE
  // ------------------------------------------------------------------------------------------------------------------
  private _defaultEqualityComparer: IEqualityComparer;
  private _globalNodeOptions: IGlobalNameOptions | undefined;
  private _targetedOptionNodePathsMap: Map<string, INodeSyncOptions<any, any>>;
  private _targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
  private _sourceObjectMap = new Map<string, any>();
  private _sourceNodeInstancePathStack = new Array<string>();
  private _sourceNodePathStack = new Array<string>();
  private _sourceNodeWrapperFactory: SourceNodeWrapperFactory;
  private _rdoNodeWrapperFactory: RdoNodeWrapperFactory;

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE PROPERTIES
  // ------------------------------------------------------------------------------------------------------------------
  private pushSourceNodeInstancePathOntoStack(key: string, sourceNodeKind: InternalNodeKind) {
    logger.trace(`Adding SourceNode to sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} + ${key} (${sourceNodeKind})`);
    this._sourceNodeInstancePathStack.push(key);
    // reset locally cached dependencies
    this._sourceNodeInstancePath = undefined;

    // push to typepath if objectProperty
    if (sourceNodeKind === 'Object') {
      this._sourceNodePathStack.push(key);
      // reset locally cached dependencies
      this._sourceNodePath = undefined;
    }
  }

  private popSourceNodeInstancePathFromStack(sourceNodeKind: InternalNodeKind) {
    const key = this._sourceNodeInstancePathStack.pop();
    logger.trace(`Popping ${key} off sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} (${sourceNodeKind})`);
    // reset locally cached dependencies
    this._sourceNodeInstancePath = undefined;

    // pop from typepath if objectProperty
    if (sourceNodeKind === 'Object') {
      this._sourceNodePathStack.pop();
      // reset locally cached dependencies
      this._sourceNodePath = undefined;
    }
  }

  // sourceNodeInstancePath is used for persisting previous source state
  private _sourceNodeInstancePath: string | undefined;
  private getSourceNodeInstancePath(): string {
    if (!this._sourceNodeInstancePath) this._sourceNodeInstancePath = this._sourceNodeInstancePathStack.join('.');
    return this._sourceNodeInstancePath || '';
  }

  // sourceNodePath is used for configuration generated options. It is essentially the node sourceNodeInstancePath, with the collection keys skipped. It is static, but  not unique per node
  private _sourceNodePath: string | undefined;
  private getSourceNodePath(): string {
    if (!this._sourceNodePath) this._sourceNodePath = this._sourceNodePathStack.join('.');
    return this._sourceNodePath || '';
  }

  private setLastSourceNodeInstancePathValue(value) {
    this._sourceObjectMap.set(this.getSourceNodeInstancePath(), value);
  }

  private getLastSourceNodeInstancePathValue(): any {
    return this._sourceObjectMap.get(this.getSourceNodeInstancePath());
  }

  // ------------------------------------------------------------------------------------------------------------------
  // CONSTRUCTOR
  // ------------------------------------------------------------------------------------------------------------------
  constructor(options?: IGraphSyncOptions) {
    this._defaultEqualityComparer = options?.customEqualityComparer || comparers.apollo;
    this._globalNodeOptions = options?.globalNodeOptions;
    this._targetedOptionNodePathsMap = new Map<string, INodeSyncOptions<any, any>>();
    this._targetedOptionMatchersArray = new Array<INodeSyncOptions<any, any>>();

    if (options?.targetedNodeOptions) {
      options?.targetedNodeOptions.forEach((targetedNodeOptionsItem) => {
        if (targetedNodeOptionsItem.sourceNodeMatcher.nodePath) this._targetedOptionNodePathsMap.set(targetedNodeOptionsItem.sourceNodeMatcher.nodePath, targetedNodeOptionsItem);
        this._targetedOptionMatchersArray.push(targetedNodeOptionsItem);
      });
    }

    this._sourceNodeWrapperFactory = new SourceNodeWrapperFactory({ globalNodeOptions: this._globalNodeOptions });
    this._rdoNodeWrapperFactory = new RdoNodeWrapperFactory({
      syncChildNode: this.syncChildNode,
      globalNodeOptions: this._globalNodeOptions,
      wrapRdoNode: this.wrapRdoNode,
      defaultEqualityComparer: this._defaultEqualityComparer,
    });
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PUBLIC METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /**
   *
   */
  public smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootRdo }: { rootSourceNode: S; rootRdo: D }) {
    if (!rootSourceNode || !rootRdo) {
      logger.warn('smartSync - sourceObject or RDO was null. Exiting', { rootSourceNode, rootRdo });
      return;
    }

    logger.trace('smartSync - sync traversal of object tree starting at root', { rootSourceNode, rootRdo });

    const wrappedRdoNode = this.wrapRdoNode({ sourceNodePath: '', rdoNode: rootRdo, sourceNode: rootSourceNode });
    wrappedRdoNode.smartSync();

    logger.trace('smartSync - object tree sync traversal completed', { rootSourceNode, rootRdo });
  }

  /**
   *
   *
   * @memberof GraphSynchronizer
   * @description clears the previously tracked data
   */
  public clearTrackedData() {
    this._sourceObjectMap.clear();
  }

  // ------------------------------------------------------------------------------------------------------------------
  // PRIVATE METHODS
  // ------------------------------------------------------------------------------------------------------------------

  /**
   *
   */
  private wrapRdoNode: IWrapRdoNode = ({ sourceNodePath, sourceNode, sourceNodeItemKey, rdoNode, rdoNodeItemKey, wrappedParentRdoNode }) => {
    const matchingNodeOptions = this._targetedOptionNodePathsMap.get(sourceNodePath);

    const wrappedSourceNode = this._sourceNodeWrapperFactory.make({ sourceNodePath, value: sourceNode, key: sourceNodeItemKey, lastSourceNode: this.getLastSourceNodeInstancePathValue(), matchingNodeOptions });
    const wrappedRdoNode = this._rdoNodeWrapperFactory.make({ value: rdoNode, key: rdoNodeItemKey, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions });

    return wrappedRdoNode;
  };

  /**
   *
   */
  private syncChildNode({ parentRdoNode, rdoNodeItemKey, sourceNodeItemKey }: { parentRdoNode: IRdoInternalNodeWrapper<any, any>; rdoNodeItemKey: string; sourceNodeItemKey: string }): boolean {
    logger.trace(`stepIntoChildNodeAndSync (${rdoNodeItemKey}) - enter`);
    let changed = false;
    const parentSourceNode = parentRdoNode.wrappedSourceNode;

    // Validate
    if (!isISourceInternalNodeWrapper(parentSourceNode)) throw new Error(`(${this.getSourceNodeInstancePath()}) Can not step Node in path. Expected Internal Node but found Leaf Node`);
    const rdoNode = parentRdoNode.getElement(rdoNodeItemKey);
    if (!rdoNode === undefined) {
      logger.trace(`Could not find child rdoNode with key ${rdoNodeItemKey} in path ${this.getSourceNodeInstancePath()}`);
      return false;
    }

    const sourceNode = parentSourceNode.getItem(sourceNodeItemKey);
    if (!sourceNode === undefined) {
      logger.trace(`Could not find child sourceNode with key ${sourceNodeItemKey} in path ${this.getSourceNodeInstancePath()}`);
      return false;
    }

    // Node traversal tracking - step-in
    this.pushSourceNodeInstancePathOntoStack(sourceNodeItemKey, parentSourceNode.typeInfo.kind as InternalNodeKind);

    // Wrap Node
    const wrappedRdoNode = this.wrapRdoNode({ sourceNodePath: this.getSourceNodePath(), sourceNode, rdoNode, wrappedParentRdoNode: parentRdoNode, rdoNodeItemKey, sourceNodeItemKey });

    // Test to see if node should be ignored, if not, synchronize
    if (wrappedRdoNode.ignore) {
      logger.trace(`stepIntoChildNodeAndSync (${rdoNodeItemKey}) - ignore node`);
      return false;
    } else {
      changed = wrappedRdoNode.smartSync();
    }

    // Node traversal tracking - step-out
    this.setLastSourceNodeInstancePathValue(parentSourceNode.value);
    this.popSourceNodeInstancePathFromStack(parentSourceNode.typeInfo.kind as InternalNodeKind);

    return changed;
  }
}