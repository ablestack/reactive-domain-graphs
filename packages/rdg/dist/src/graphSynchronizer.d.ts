import { IGraphSynchronizer, IGraphSyncOptions } from '.';
/**
 *
 *
 * @export
 * @class GraphSynchronizer
 */
export declare class GraphSynchronizer implements IGraphSynchronizer {
    private _defaultEqualityComparer;
    private _globalNodeOptions;
    private _targetedOptionNodePathsMap;
    private _targetedOptionMatchersArray;
    private _sourceObjectMap;
    private _sourceNodeInstancePathStack;
    private _sourceNodePathStack;
    private pushSourceNodeInstancePathOntoStack;
    private popSourceNodeInstancePathFromStack;
    private _sourceNodeInstancePath;
    private getSourceNodeInstancePath;
    private _sourceNodePath;
    private getSourceNodePath;
    private setLastSourceNodeInstancePathValue;
    private getLastSourceNodeInstancePathValue;
    constructor(options?: IGraphSyncOptions);
    /**
     *
     */
    private trySynchronizeObject;
    /**
     *
     */
    private getSourceNodeType;
    /**
     *
     */
    private getDomainNodeType;
    /**
     *
     */
    private trySynchronizeNode;
    /** */
    private trySynchronizeNode_TypeSpecificProcessing;
    /**
     *
     */
    private synchronizeSourceArray;
    /** */
    private tryGetDomainCollectionProcessingMethods;
    /** */
    private getMatchingOptionsForNode;
    /** */
    private getMatchingOptionsForCollectionNode;
    /** */
    private tryMakeAutoKeyMaker;
    /** */
    private getCollectionElementType;
    /**
     *
     */
    private trySynchronizeObjectState;
    /**
     *
     */
    private synchronizeISyncableCollection;
    /**
     *
     */
    private synchronizeDomainMap;
    /**
     *
     */
    private synchronizeDomainSet;
    /**
     *
     */
    private synchronizeDomainArray;
    /**
     *
     */
    smartSync<S extends Record<string, any>, D extends Record<string, any>>({ rootSourceNode, rootDomainNode }: {
        rootSourceNode: S;
        rootDomainNode: D;
    }): void;
    /**
     *
     *
     * @memberof GraphSynchronizer
     * @description clears the previously tracked data
     */
    clearTrackedData(): void;
}