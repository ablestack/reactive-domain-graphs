/* eslint-disable @typescript-eslint/interface-name-prefix */

import { IMakeRdo, IRdoInternalNodeWrapper, isIRdoInternalNodeWrapper } from './internal-types';

//--------------------------------------------------------
// RDO COLLECTION - SYNC CUSTOMIZATION INTERFACES
//-------------------------------------------------------

export type MakeCollectionKeyMethod<T> = (item: T) => string | number;

export interface ITryMakeCollectionKey<T> {
  tryMakeCollectionKey: (item: T, index: number) => string | number | undefined;
}

export function isITryMakeCollectionKey(o: any): o is IMakeCollectionKey<any> {
  return o && o.tryMakeCollectionKey;
}
export interface IMakeCollectionKey<T> {
  makeCollectionKey: (item: T, index: number) => string | number;
}

export function isIMakeCollectionKey(o: any): o is IMakeCollectionKey<any> {
  return o && o.makeCollectionKey;
}

export interface IMakeRdoElement<S, D> {
  makeRdoElement(sourceObject: S): D | undefined;
}

export function isIMakeRdoElement(o: any): o is IMakeRdoElement<any, any> {
  return o && o.makeRdoElement;
}

export interface IRdoCollectionNodeWrapper<S, D> extends IRdoInternalNodeWrapper<S, D> {
  elements(): Iterable<D | undefined>;
}

export function isIRdoCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any> {
  return o && o.elements && isIRdoInternalNodeWrapper(o) && isIMakeCollectionKey(o);
}

export interface IRdoKeyBasedCollectionNodeWrapper<S, D> extends IRdoInternalNodeWrapper<S, D> {
  onAdd: NodeAddHandler;
  onReplace: NodeReplaceHandler;
  onDelete: NodeDeleteHandler;
}

export function isIRdoKeyBasedCollectionNodeWrapper(o: any): o is IRdoCollectionNodeWrapper<any, any> {
  return o && o.onAdd && o.onReplace && o.onDelete && isIRdoCollectionNodeWrapper(o);
}

export interface ISyncableKeyBasedCollection<S,D> extends ITryMakeCollectionKey<S> {
  readonly size: number;
  elements(): Iterable<D>;
  add({ index, key, newRdo }: { index?: number; key: string | number; newRdo: any });
  replace({ index, key, origRdo, newRdo }: { index?: number; key: string | number; origRdo: any; newRdo: any });
  delete({ index, key, origRdo }: { index?: number; key: string | number; origRdo: any });
}

export function IsISyncableCollection(o: any): o is ISyncableKeyBasedCollection<any, any> {
  return o && o.size !== undefined && o.elements && o.add && o.replace && o.delete && isITryMakeCollectionKey(o);
}

export interface ISyncableRDOKeyBasedCollection<S, D> extends IMakeRdo<S, D>, ISyncableKeyBasedCollection<S, D> {}

export function IsISyncableRDOCollection(o: any): o is ISyncableRDOKeyBasedCollection<any, any> {
  return o && isIMakeRdoElement(o) && IsISyncableCollection(o);
}

export interface NodeAddHandler {
  ({ index, key, newRdo }: { index?: number; key: string | number; newRdo: any }): boolean;
}

export interface NodeReplaceHandler {
  ({ index, key, origRdo, newRdo }: { index?: number; key: string | number; origRdo: any; newRdo: any }): boolean;
}

export interface NodeDeleteHandler {
  ({ index, key, origRdo }: { index?: number; key: string | number; origRdo: any }): boolean;
}
