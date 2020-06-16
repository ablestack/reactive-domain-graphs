import { ISourceNodeWrapper, SourceNodeTypeInfo, INodeSyncOptions, IGlobalNameOptions } from '../..';
import { SourceBaseNW } from '../base/source-base-nw';
export declare class SourcePrimitiveNW<S> extends SourceBaseNW<S> implements ISourceNodeWrapper<S> {
    private _value;
    constructor({ value, sourceNodePath, key, typeInfo, lastSourceNode, matchingNodeOptions, globalNodeOptions, }: {
        value: S | null | undefined;
        sourceNodePath: string;
        key: string | undefined;
        typeInfo: SourceNodeTypeInfo;
        lastSourceNode: any;
        matchingNodeOptions: INodeSyncOptions<any, any> | undefined;
        globalNodeOptions: IGlobalNameOptions | undefined;
    });
    get value(): S | null | undefined;
    childElementCount(): number;
}