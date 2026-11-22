export type StoredFile = {
    readonly key: string;
    readonly content: Uint8Array;
    readonly contentType: string;
};

// Keys start with the coupleId: couple isolation applies to files too (decision 0027).
export abstract class FileStorage {
    abstract store(file: StoredFile): Promise<void>;
    abstract read(key: string): Promise<StoredFile | null>;
    abstract delete(key: string): Promise<void>;
}
