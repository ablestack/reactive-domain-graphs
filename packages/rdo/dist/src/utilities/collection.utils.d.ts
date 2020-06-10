import { IMakeRdoCollectionKey } from '..';
declare function isIterable(obj: any): boolean;
export declare const CollectionUtils: {
    Array: {
        getKeys: <T>({ collection, makeCollectionKey }: {
            collection: T[];
            makeCollectionKey: IMakeRdoCollectionKey<T>;
        }) => string[];
        getItem: <T_1>({ collection, makeCollectionKey, key }: {
            collection: T_1[];
            makeCollectionKey: IMakeRdoCollectionKey<T_1>;
            key: string;
        }) => T_1 | undefined;
        insertItem: <T_2>({ collection, key, value }: {
            collection: T_2[];
            key: string;
            value: T_2;
        }) => number;
        updateItem: <T_3>({ collection, makeCollectionKey, value }: {
            collection: T_3[];
            makeCollectionKey: IMakeRdoCollectionKey<T_3>;
            value: T_3;
        }) => void;
        deleteItem: <T_4>({ collection, makeCollectionKey, key }: {
            collection: T_4[];
            makeCollectionKey: IMakeRdoCollectionKey<T_4>;
            key: string;
        }) => boolean;
        clear: <T_5>({ collection }: {
            collection: T_5[];
        }) => T_5[];
    };
    Set: {
        getKeys: <T_6>({ collection, makeCollectionKey }: {
            collection: Set<T_6>;
            makeCollectionKey: IMakeRdoCollectionKey<T_6>;
        }) => string[];
        tryGetItem: <T_7>({ collection, makeCollectionKey, key }: {
            collection: Set<T_7>;
            makeCollectionKey: IMakeRdoCollectionKey<T_7>;
            key: string;
        }) => T_7 | undefined;
        insertItem: <T_8>({ collection, key, value }: {
            collection: Set<T_8>;
            key: string;
            value: T_8;
        }) => void;
        tryUpdateItem: <T_9>({ collection, makeCollectionKey, value }: {
            collection: Set<T_9>;
            makeCollectionKey: IMakeRdoCollectionKey<T_9>;
            value: T_9;
        }) => void;
        tryDeleteItem: <T_10>({ collection, makeCollectionKey, key }: {
            collection: Set<T_10>;
            makeCollectionKey: IMakeRdoCollectionKey<T_10>;
            key: string;
        }) => boolean;
    };
    Record: {
        getKeys: <T_11>({ record }: {
            record: Record<string, TextDecodeOptions>;
        }) => string[];
        tryGetItem: <T_12>({ record, key }: {
            record: Record<string, T_12>;
            key: string;
        }) => T_12;
        insertItem: <T_13>({ record, key, value }: {
            record: Record<string, T_13>;
            key: string;
            value: T_13;
        }) => void;
        tryUpdateItem: <T_14>({ record, key, value }: {
            record: Record<string, T_14>;
            key: string;
            value: T_14;
        }) => void;
        tryDeleteItem: <T_15>({ record, key }: {
            record: Record<string, T_15>;
            key: string;
        }) => boolean;
    };
    isIterable: typeof isIterable;
};
export {};
