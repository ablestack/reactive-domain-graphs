import { Logger } from '../infrastructure/logger';
import {
  IEqualityComparer,
  IGlobalPropertyNameTransformation,
  IRdoNodeWrapper,
  IsIAfterSyncIfNeeded,
  IsIAfterSyncUpdate,
  IsIBeforeSyncIfNeeded,
  IsIBeforeSyncUpdate,
  IsICustomEqualityRDO,
  IsICustomSync,
  IsIHasCustomRdoFieldNames,
  isISourceInternalNodeWrapper,
  ISourceNodeWrapper,
  ISyncChildElement,
  RdoNodeTypeInfo,
} from '../types';
import { RdoInternalNWBase } from './rdo-internal-nw-base';

const logger = Logger.make('RdoObjectNW');

export class RdoObjectNW<S, D> extends RdoInternalNWBase<S, D> {
  private _value: object;
  private _globalNodeOptions: IGlobalPropertyNameTransformation | undefined;
  private _equalityComparer: IEqualityComparer;

  constructor({
    value,
    typeInfo,
    key,
    parent,
    wrappedSourceNode,
    globalNodeOptions,
    defaultEqualityComparer,
    syncChildElement,
  }: {
    value: Record<string, any>;
    typeInfo: RdoNodeTypeInfo;
    key: string | undefined;
    parent: IRdoNodeWrapper<S, D> | undefined;
    wrappedSourceNode: ISourceNodeWrapper<S>;
    globalNodeOptions: IGlobalPropertyNameTransformation | undefined;
    defaultEqualityComparer: IEqualityComparer;
    syncChildElement: ISyncChildElement<S, D>;
  }) {
    super({ typeInfo, key, parent, wrappedSourceNode, syncChildElement });
    this._value = value;
    this._globalNodeOptions = globalNodeOptions;
    this._equalityComparer = IsICustomEqualityRDO(value) ? value.isStateEqual : defaultEqualityComparer;
  }

  //------------------------------
  // IRdoNodeWrapper
  //------------------------------
  public get value() {
    return this._value;
  }

  public childElementCount(): number {
    return 0;
  }

  public smartSync(): boolean {
    let changed = false;
    const sourceNodePath = this.wrappedSourceNode.sourceNodePath;
    const rdo = this.wrappedSourceNode.value;
    const sourceObject = this.wrappedSourceNode.value;
    const lastSourceObject = this.wrappedSourceNode.lastSourceNode;

    // Check if previous source state and new source state are equal
    const isAlreadyInSync = this._equalityComparer(sourceObject, lastSourceObject);

    // Call lifecycle methods if found
    if (IsIBeforeSyncIfNeeded(rdo)) rdo.beforeSyncIfNeeded({ sourceObject, isSyncNeeded: !isAlreadyInSync });

    // Call lifecycle methods if found
    if (IsIBeforeSyncUpdate(rdo)) rdo.beforeSyncUpdate({ sourceObject });

    if (!isAlreadyInSync) {
      // Call lifecycle methods if found
      if (IsIBeforeSyncUpdate(rdo)) rdo.beforeSyncUpdate({ sourceObject });

      // Synchronize
      if (IsICustomSync(rdo)) {
        logger.trace(`synchronizeObjectState - ${sourceNodePath} - custom state synchronizer found. Using to sync`);
        changed = rdo.synchronizeState({ sourceObject, continueSmartSync: this.makeContinueSmartSyncFunction({ originalSourceNodePath: sourceNodePath }) });
      } else {
        logger.trace(`synchronizeObjectState - ${sourceNodePath} - no custom state synchronizer found. Using autoSync`);
        changed = this.sync();
      }

      // Call lifecycle methods if found
      if (IsIAfterSyncUpdate(rdo)) rdo.afterSyncUpdate({ sourceObject });
    } else {
      logger.trace(`synchronizeObjectState - ${sourceNodePath} - already in sync. Skipping`);
    }

    // Call lifecycle methods if found
    if (IsIAfterSyncIfNeeded(rdo)) rdo.afterSyncIfNeeded({ sourceObject, syncAttempted: !isAlreadyInSync, RDOChanged: changed });

    return changed;
  }

  //------------------------------
  // IRdoInternalNodeWrapper
  //------------------------------

  public itemKeys() {
    return Object.keys(this._value);
  }

  public getItem(key: string) {
    return this._value[key];
  }

  public updateItem(key: string, value: any) {
    if (key in this._value) {
      this._value[key] = value;
      return true;
    } else return false;
  }
  //--------------------------------------
  // Private Methods
  //--------------------------------------
  /**
   *
   */
  private sync(): boolean {
    let changed = false;

    if (!isISourceInternalNodeWrapper(this.wrappedSourceNode)) throw new Error(`RDO object node can only be synced with Source object nodes (Path: '${this.wrappedSourceNode.sourceNodePath}'`);

    // Loop properties
    for (const sourceFieldname of this.wrappedSourceNode.itemKeys()) {
      const sourceFieldVal = this.wrappedSourceNode.getItem(sourceFieldname);
      const rdoFieldname = this.getFieldname({ sourceFieldname, sourceFieldVal });

      // Check to see if key exists
      if (!rdoFieldname) {
        logger.trace(`domainFieldname '${rdoFieldname}' not found in RDO. Skipping property`);
        continue;
      }

      changed = this._syncChildElement({
        sourceElementKey: sourceFieldname,
        sourceElementVal: sourceObject[sourceFieldname],
        targetElementKey: rdoFieldname,
        targetElementVal: rdo[rdoFieldname],
      });
    }

    return changed;
  }

  /**
   *
   */
  public getFieldname({ sourceFieldname, sourceFieldVal }: { sourceFieldname: string; sourceFieldVal: string }): string | undefined {
    // Set Destination Prop Key, and if not found, fall back to name with prefix if supplied
    let rdoFieldname: string | undefined;

    //
    // Try IHasCustomRdoFieldNames
    //
    if (!rdoFieldname && IsIHasCustomRdoFieldNames(this._value)) {
      rdoFieldname = this._value.tryGetRdoFieldname({ sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceFieldname, sourceFieldVal });
      // If fieldName not in parent, set to null
      if (rdoFieldname && !(rdoFieldname in this._value)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with IHasCustomRdoFieldNames`);
      }
    }

    //
    // Try _globalNodeOptions
    //
    if (!rdoFieldname && this._globalNodeOptions?.tryGetRdoFieldname) {
      rdoFieldname = this._globalNodeOptions?.tryGetRdoFieldname({ sourceNodePath: this.wrappedSourceNode.sourceNodePath, sourceFieldname, sourceFieldVal });
      // If fieldName not in parent, set to null
      if (rdoFieldname && !(rdoFieldname in this._value)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with _globalNodeOptions.tryGetRdoFieldname`);
      }
    }

    //
    // Try stright match for sourceFieldname
    if (!rdoFieldname) {
      rdoFieldname = sourceFieldname;
      if (rdoFieldname && !(rdoFieldname in this._value)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found - straight match for sourceFieldname`);
      }
    }

    //
    // Try commonRdoFieldnamePostfix
    //
    if (!rdoFieldname && this._globalNodeOptions?.commonRdoFieldnamePostfix) {
      const domainPropKeyWithPostfix = `${sourceFieldname}${this._globalNodeOptions.commonRdoFieldnamePostfix}`;
      rdoFieldname = domainPropKeyWithPostfix;

      // If fieldName not in parent, set to null
      if (rdoFieldname && !(rdoFieldname in this._value)) {
        rdoFieldname = undefined;
      } else {
        logger.trace(`rdoFieldname '${rdoFieldname}' found with commonRdoFieldnamePostfix`);
      }
    }

    return rdoFieldname;
  }

  private makeContinueSmartSyncFunction({
    originalSourceNodePath,
  }: {
    originalSourceNodePath: string;
  }): <S extends Record<string, any>, D extends Record<string, any>>({ sourceNodeSubPath, sourceObject, rdo }: { sourceNodeSubPath: string; sourceObject: S; rdo: D }) => boolean {
    return ({ sourceNodeSubPath: sourceNodeSubpath, sourceObject, rdo }) => {
      if (!sourceNodeSubpath) throw new Error('continueSync sourceNodeSubpath must not be null or empty. continueSync can only be called on child objects');

      const sourceNodePath = `${originalSourceNodePath}.${sourceNodeSubpath}`;
      return this._syncChildElement({ sourceNodePath, sourceObject, rdo });
    };
  }
}
