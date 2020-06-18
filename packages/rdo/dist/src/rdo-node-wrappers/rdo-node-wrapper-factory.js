"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoNodeWrapperFactory = void 0;
const _1 = require(".");
const logger_1 = require("../infrastructure/logger");
const node_type_utils_1 = require("./utils/node-type.utils");
const logger = logger_1.Logger.make('RdoNodeWrapperFactory');
class RdoNodeWrapperFactory {
    constructor({ eventEmitter, syncChildNode, globalNodeOptions, targetedOptionMatchersArray, wrapRdoNode, defaultEqualityComparer, }) {
        this._eventEmitter = eventEmitter;
        this._syncChildNode = syncChildNode;
        this._globalNodeOptions = globalNodeOptions;
        this._wrapRdoNode = wrapRdoNode;
        this._defaultEqualityComparer = defaultEqualityComparer;
        this._targetedOptionMatchersArray = targetedOptionMatchersArray;
    }
    make({ value, key, wrappedParentRdoNode, wrappedSourceNode, matchingNodeOptions, }) {
        if (value === null || value === undefined)
            throw new Error('Rdo value should not be null or undefined');
        const typeInfo = node_type_utils_1.NodeTypeUtils.getNodeType(value);
        switch (typeInfo.builtInType) {
            case '[object Boolean]':
            case '[object Date]':
            case '[object Number]':
            case '[object String]': {
                return new _1.RdoPrimitiveNW({
                    value: value,
                    key,
                    wrappedParentRdoNode,
                    wrappedSourceNode,
                    typeInfo,
                    matchingNodeOptions,
                    globalNodeOptions: this._globalNodeOptions,
                    targetedOptionMatchersArray: this._targetedOptionMatchersArray,
                    eventEmitter: this._eventEmitter,
                });
            }
            case '[object Object]': {
                return new _1.RdoObjectNW({
                    value,
                    key,
                    wrappedParentRdoNode,
                    wrappedSourceNode,
                    typeInfo,
                    defaultEqualityComparer: this._defaultEqualityComparer,
                    syncChildNode: this._syncChildNode,
                    wrapRdoNode: this._wrapRdoNode,
                    matchingNodeOptions,
                    globalNodeOptions: this._globalNodeOptions,
                    targetedOptionMatchersArray: this._targetedOptionMatchersArray,
                    eventEmitter: this._eventEmitter,
                });
            }
            case '[object Array]': {
                return new _1.RdoArrayNW({
                    value: value,
                    typeInfo,
                    key,
                    wrappedParentRdoNode,
                    wrappedSourceNode,
                    syncChildNode: this._syncChildNode,
                    matchingNodeOptions,
                    globalNodeOptions: this._globalNodeOptions,
                    targetedOptionMatchersArray: this._targetedOptionMatchersArray,
                    eventEmitter: this._eventEmitter,
                });
            }
            case '[object Map]': {
                return new _1.RdoMapNW({
                    value: value,
                    typeInfo,
                    key,
                    wrappedParentRdoNode,
                    wrappedSourceNode,
                    syncChildNode: this._syncChildNode,
                    matchingNodeOptions,
                    globalNodeOptions: this._globalNodeOptions,
                    targetedOptionMatchersArray: this._targetedOptionMatchersArray,
                    eventEmitter: this._eventEmitter,
                });
            }
            case '[object Set]': {
                return new _1.RdoSetNW({
                    value: value,
                    typeInfo,
                    key,
                    wrappedParentRdoNode,
                    wrappedSourceNode,
                    syncChildNode: this._syncChildNode,
                    matchingNodeOptions,
                    globalNodeOptions: this._globalNodeOptions,
                    targetedOptionMatchersArray: this._targetedOptionMatchersArray,
                    eventEmitter: this._eventEmitter,
                });
            }
            default: {
                throw new Error(`Unable to make IRdoInternalNodeWrapper for type: ${typeInfo.builtInType}`);
            }
        }
    }
}
exports.RdoNodeWrapperFactory = RdoNodeWrapperFactory;
//# sourceMappingURL=rdo-node-wrapper-factory.js.map