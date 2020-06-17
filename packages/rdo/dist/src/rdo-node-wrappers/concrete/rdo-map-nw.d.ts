import { RdoCollectionNWBase } from '..';
import { IGlobalNodeOptions, INodeSyncOptions, IRdoNodeWrapper, ISourceNodeWrapper, ISyncChildNode, RdoNodeTypeInfo } from '../..';
export declare class RdoMapNW<S, D> extends RdoCollectionNWBase<S, D> {
    private _value;
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, }: {
        value: Map<string, D>;
        typeInfo: RdoNodeTypeInfo;
        key: string | undefined;
        wrappedParentRdoNode: IRdoNodeWrapper<S, D> | undefined;
        wrappedSourceNode: ISourceNodeWrapper<S>;
        syncChildNode: ISyncChildNode<S, D>;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNodeOptions | undefined;
        targetedOptionMatchersArray: Array<INodeSyncOptions<any, any>>;
    });
    get value(): Map<string, D>;
    itemKeys(): IterableIterator<string>;
    getElement(key: string): D | undefined;
    updateElement(key: string, value: D): boolean;
    smartSync(): boolean;
    elements(): Iterable<D>;
    childElementCount(): number;
    insertElement(key: string, value: D): void;
    deleteElement(key: string): boolean;
    clearElements(): boolean;
}
