"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RdoCollectionNWBase = void 0;
const __1 = require("../..");
const logger_1 = require("../../infrastructure/logger");
const rdo_internal_nw_base_1 = require("./rdo-internal-nw-base");
const logger = logger_1.Logger.make('RdoCollectionNWBase');
class RdoCollectionNWBase extends rdo_internal_nw_base_1.RdoInternalNWBase {
    constructor({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, defaultEqualityComparer, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter, }) {
        super({ typeInfo, key, mutableNodeCache, wrappedParentRdoNode, wrappedSourceNode, syncChildNode, matchingNodeOptions, globalNodeOptions, targetedOptionMatchersArray, eventEmitter });
        this._equalityComparer = defaultEqualityComparer;
    }
    //------------------------------
    // Protected
    //------------------------------
    get equalityComparer() {
        return this._equalityComparer;
    }
    /** */
    handleAddElement({ index, collectionKey, newRdo, newSourceElement, addHandler }) {
        const changed = addHandler({ index, key: collectionKey, nextRdo: newRdo });
        if (changed) {
            // If not primitive, sync so child nodes are hydrated
            if (!__1.NodeTypeUtils.isPrimitive(newRdo))
                this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: collectionKey, sourceNodeItemKey: collectionKey });
            // Publish
            this.eventEmitter.publish('nodeChange', {
                changeType: 'add',
                sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
                sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
                index: index,
                sourceKey: collectionKey,
                rdoKey: collectionKey,
                previousSourceValue: undefined,
                newSourceValue: newSourceElement,
            });
        }
        return changed;
    }
    /** */
    handleReplaceOrUpdate({ replaceHandler, index, collectionKey, lastElementKey, nextElementKey, lastRdo, newSourceElement, previousSourceElement, }) {
        let changed = false;
        const isPrimitive = __1.NodeTypeUtils.isPrimitive(newSourceElement);
        // ---------------------------
        // REPLACE
        // ---------------------------
        // If non-equal primitive with same indexes, just do a replace operation
        if (lastElementKey !== nextElementKey || isPrimitive) {
            const nextRdo = this.makeRdoElement(newSourceElement);
            replaceHandler({ index, key: collectionKey, lastRdo, nextRdo });
            // If not primitive, step into to sync
            if (!isPrimitive) {
                this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: collectionKey, sourceNodeItemKey: collectionKey });
            }
            // Publish
            this.eventEmitter.publish('nodeChange', {
                changeType: 'replace',
                sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
                sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
                index,
                sourceKey: collectionKey,
                rdoKey: collectionKey,
                previousSourceValue: previousSourceElement,
                newSourceValue: newSourceElement,
            });
            return { changed: true, nextRdo };
        }
        else {
            // ---------------------------
            // UPDATE
            // ---------------------------
            // If non-equal non-primitive, step into child and sync
            changed = this.syncChildNode({ wrappedParentRdoNode: this, rdoNodeItemKey: collectionKey, sourceNodeItemKey: collectionKey }) && changed;
            // Publish
            this.eventEmitter.publish('nodeChange', {
                changeType: 'update',
                sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
                sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
                index,
                sourceKey: collectionKey,
                rdoKey: collectionKey,
                previousSourceValue: previousSourceElement,
                newSourceValue: newSourceElement,
            });
            return { changed, nextRdo: this.getRdoNodeItem(collectionKey) };
        }
    }
    /** */
    handleDeleteElement({ deleteHandler, index, collectionKey, rdoToDelete, previousSourceElement }) {
        const changed = deleteHandler({ index, key: collectionKey, lastRdo: rdoToDelete });
        // Publish
        this.eventEmitter.publish('nodeChange', {
            changeType: 'delete',
            sourceNodeTypePath: this.wrappedSourceNode.sourceNodeTypePath,
            sourceNodeInstancePath: this.wrappedSourceNode.sourceNodeInstancePath,
            index: index,
            sourceKey: collectionKey,
            rdoKey: collectionKey,
            previousSourceValue: previousSourceElement,
            newSourceValue: undefined,
        });
        return changed;
    }
}
exports.RdoCollectionNWBase = RdoCollectionNWBase;
//# sourceMappingURL=rdo-collection-nw-base.js.map