"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncableCollection = void 0;
const tslib_1 = require("tslib");
const mobx_1 = require("mobx");
const rdg_1 = require("@ablestack/rdg");
const logger_1 = require("@ablestack/rdg/infrastructure/logger");
const logger = logger_1.Logger.make('SyncableCollection');
class SyncableCollection {
    constructor({ makeDomainNodeKeyFromSourceNode, makeDomainNodeKeyFromDomainNode, makeDomainModel, }) {
        this._array$ = new Array();
        // -----------------------------------
        // IDomainModelFactory
        // -----------------------------------
        this.makeDomainNodeKeyFromSourceNode = (sourceNode) => {
            return this._makeDomainNodeKeyFromSourceNode(sourceNode);
        };
        this.makeDomainNodeKeyFromDomainNode = (domainNode) => {
            return this._makeDomainNodeKeyFromDomainNode(domainNode);
        };
        this.makeDomainModel = (sourceItem) => {
            return this._makeDomainModel(sourceItem);
        };
        // -----------------------------------
        // ISyncableCollection
        // -----------------------------------
        this.getKeys = () => {
            return Array.from(this._map$.keys());
        };
        this.tryGetItemFromTargetCollection = (key) => {
            return this._map$.get(key);
        };
        this.insertItemToTargetCollection = (key, value) => {
            this._map$.set(key, value);
            rdg_1.CollectionUtils.Array.insertItem({ collection: this._array$, key, value });
        };
        this.updateItemInTargetCollection = (key, value) => {
            this._map$.set(key, value);
            rdg_1.CollectionUtils.Array.insertItem({ collection: this._array$, key, value });
        };
        this.tryDeleteItemFromTargetCollection = (key) => {
            this._map$.delete(key);
            rdg_1.CollectionUtils.Array.deleteItem({ collection: this._array$, key, makeKey: this._makeDomainNodeKeyFromDomainNode });
        };
        this.clear = () => {
            this._map$.clear();
            rdg_1.CollectionUtils.Array.clear({ collection: this._array$ });
        };
        this._makeDomainNodeKeyFromSourceNode = makeDomainNodeKeyFromSourceNode;
        this._makeDomainNodeKeyFromDomainNode = makeDomainNodeKeyFromDomainNode;
        this._makeDomainModel = makeDomainModel;
        this._map$ = new Map();
    }
    get size() {
        return this._map$.size;
    }
    get map$() {
        return this._map$;
    }
    get array$() {
        return this._array$;
    }
    [Symbol.iterator]() {
        return this.array$[Symbol.iterator]();
    }
}
tslib_1.__decorate([
    mobx_1.observable.shallow,
    tslib_1.__metadata("design:type", Map)
], SyncableCollection.prototype, "_map$", void 0);
tslib_1.__decorate([
    mobx_1.computed,
    tslib_1.__metadata("design:type", Number),
    tslib_1.__metadata("design:paramtypes", [])
], SyncableCollection.prototype, "size", null);
tslib_1.__decorate([
    mobx_1.computed,
    tslib_1.__metadata("design:type", Map),
    tslib_1.__metadata("design:paramtypes", [])
], SyncableCollection.prototype, "map$", null);
tslib_1.__decorate([
    mobx_1.observable.shallow,
    tslib_1.__metadata("design:type", Object)
], SyncableCollection.prototype, "_array$", void 0);
tslib_1.__decorate([
    mobx_1.computed,
    tslib_1.__metadata("design:type", Array),
    tslib_1.__metadata("design:paramtypes", [])
], SyncableCollection.prototype, "array$", null);
exports.SyncableCollection = SyncableCollection;
//# sourceMappingURL=syncableCollection.js.map