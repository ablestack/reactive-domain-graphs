"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoArrayNW = void 0;
const __1 = require("..");
const __2 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const collection_utils_1 = require("../utils/collection.utils");
const logger = logger_1.Logger.make('RdoArrayNW');
class RdoArrayNW extends __1.RdoCollectionNWBase {
    constructor({ value, typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        this._value = value;
    }
    //------------------------------
    // IRdoNodeWrapper
    //------------------------------
    get leafNode() {
        return false;
    }
    get value() {
        return this._value;
    }
    itemKeys() {
        if (this.childElementCount() === 0)
            return [];
        return collection_utils_1.CollectionUtils.Array.getCollectionKeys({ collection: this._value, makeCollectionKey: this.makeCollectionKey });
    }
    getItem(key) {
        if (this.childElementCount() === 0)
            return undefined;
        const item = collection_utils_1.CollectionUtils.Array.getElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
        return item;
    }
    updateItem(key, value) {
        if (this.childElementCount() === 0)
            return false;
        return collection_utils_1.CollectionUtils.Array.updateElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, value });
    }
    insertItem(key, value) {
        collection_utils_1.CollectionUtils.Array.insertElement({ collection: this._value, key, value });
    }
    //------------------------------
    // IRdoInternalNodeWrapper
    //------------------------------
    smartSync() {
        if (this.wrappedSourceNode.childElementCount() === 0 && this.childElementCount() > 0) {
            return this.clearElements();
        }
        else {
            __1.RdoWrapperValidationUtils.nonKeyedCollectionSizeCheck({ sourceNodePath: this.wrappedSourceNode.sourceNodePath, collectionSize: this.childElementCount(), collectionType: this.typeInfo.builtInType });
            if (!__2.isISourceCollectionNodeWrapper(this.wrappedSourceNode))
                throw new Error(`RDO collection nodes can only be synced with Source collection nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);
            // Execute
            const changed = super.synchronizeCollection();
            return changed;
        }
    }
    //------------------------------
    // IRdoCollectionNodeWrapper
    //------------------------------
    elements() {
        return this._value;
    }
    childElementCount() {
        return this._value.length;
    }
    deleteElement(key) {
        return collection_utils_1.CollectionUtils.Array.deleteElement({ collection: this._value, makeCollectionKey: this.makeCollectionKey, key });
    }
    clearElements() {
        return collection_utils_1.CollectionUtils.Array.clear({ collection: this._value });
    }
}
exports.RdoArrayNW = RdoArrayNW;
//# sourceMappingURL=rdo-array-nw.js.map